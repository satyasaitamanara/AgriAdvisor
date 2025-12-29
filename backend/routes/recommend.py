# recommend.py
from flask import Blueprint, request, jsonify
from models import db, Recommendation
from flask_jwt_extended import jwt_required, get_jwt_identity
import joblib
import numpy as np
from config import Config

rec_bp = Blueprint('recommend', __name__)

# Load the trained model and label encoder
try:
    saved_data = joblib.load(Config.ML_MODEL_PATH)
    pipeline = saved_data["pipeline"]
    le = saved_data["label_encoder"]
    features = saved_data["features"]
    print("Model loaded successfully with features:", features)
except Exception as e:
    print(f"Error loading model: {str(e)}")
    pipeline = None
    le = None

# Additional crop information for enhanced recommendations
crop_info = {
    "rice": {
        "description": "Rice is a staple food for over half the world's population.",
        "season": "Kharif",
        "water_requirements": "High",
        "soil_type": "Clayey loam",
        "image": "🌾",
        "growth_period": "90-120 days"
    },
    "wheat": {
        "description": "Wheat is one of the most important cereal crops globally.",
        "season": "Rabi",
        "water_requirements": "Moderate",
        "soil_type": "Well-drained loamy soil",
        "image": "🌾",
        "growth_period": "110-130 days"
    },
    "maize": {
        "description": "Maize is a versatile crop used for food, feed, and industrial products.",
        "season": "Kharif",
        "water_requirements": "Moderate",
        "soil_type": "Well-drained soil",
        "image": "🌽",
        "growth_period": "90-100 days"
    },
    # Add more crops as needed
}

@rec_bp.route('/crop', methods=['POST'])
@jwt_required()
def recommend_crop():
    try:
        farmer_id = get_jwt_identity()
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['n', 'p', 'k', 'ph', 'temperature', 'humidity', 'rainfall']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        # Prepare features for model prediction in correct order
        feature_values = [
            data['n'], data['p'], data['k'], data['temperature'], 
            data['humidity'], data['ph'], data['rainfall']
        ]
        
        features_array = np.array([feature_values])
        
        # Get prediction
        if pipeline and le:
            prediction_idx = pipeline.predict(features_array)[0]
            predicted_crop = le.inverse_transform([prediction_idx])[0]
            
            # Get probabilities if available
            if hasattr(pipeline, 'predict_proba'):
                probabilities = pipeline.predict_proba(features_array)[0]
                confidence = float(probabilities[prediction_idx])
            else:
                confidence = 0.8
        else:
            # Fallback logic if model not available
            predicted_crop = "wheat"
            confidence = 0.7
        
        # Calculate additional information
        land_size = float(data.get('land_size', 1))
        season = data.get('season', 'kharif')
        
        # Simple yield estimation based on parameters (placeholder logic)
        base_yield = 2.5  # tons/acre
        # Adjust based on soil nutrients
        nutrient_factor = min(1.0, (float(data['n']) / 100 + float(data['p']) / 50 + float(data['k']) / 150) / 3)
        # Adjust based on rainfall
        rainfall_factor = 0.8 + (min(300, float(data['rainfall'])) / 1000)
        
        estimated_yield = round(base_yield * nutrient_factor * rainfall_factor, 2)
        
        # Simple profit estimation (placeholder)
        crop_prices = {
            "rice": 1800, "wheat": 1600, "maize": 1400, 
            "cotton": 5000, "sugarcane": 2800
        }
        price_per_ton = crop_prices.get(predicted_crop.lower(), 1500)
        estimated_profit = round(estimated_yield * price_per_ton * land_size, 2)
        
        # Sustainability score (placeholder logic)
        sustainability_score = min(100, int(
            30 +  # Base
            (min(7.5, float(data['ph'])) / 7.5 * 20) +  # pH factor
            (min(80, float(data['humidity'])) / 80 * 20) +  # Humidity factor
            (min(200, float(data['rainfall'])) / 200 * 30)  # Rainfall factor
        ))
        
        # Get additional crop information
        crop_details = crop_info.get(predicted_crop.lower(), {
            "description": "A suitable crop for your conditions.",
            "season": "Varies",
            "water_requirements": "Moderate",
            "soil_type": "Various",
            "image": "🌱",
            "growth_period": "90-120 days"
        })
        
        # Prepare result
        result = {
            "recommended_crop": predicted_crop,
            "confidence": confidence,
            "estimated_yield": f"{estimated_yield} tons/acre",
            "estimated_profit": f"₹{estimated_profit}",
            "sustainability_score": f"{sustainability_score}%",
            "crop_details": crop_details,
            "input_parameters": data
        }
        
        # Save to database
        recommendation = Recommendation(
            farmer_id=farmer_id,
            input_json=data,
            recommended_json=result
        )
        db.session.add(recommendation)
        db.session.commit()
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@rec_bp.route('/history', methods=['GET'])
@jwt_required()
def get_recommendation_history():
    try:
        farmer_id = get_jwt_identity()
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 5, type=int)
        
        recommendations = Recommendation.query.filter_by(
            farmer_id=farmer_id
        ).order_by(
            Recommendation.created_at.desc()
        ).paginate(page=page, per_page=per_page, error_out=False)
        
        result = {
            'recommendations': [rec.to_dict() for rec in recommendations.items],
            'total': recommendations.total,
            'pages': recommendations.pages,
            'current_page': page
        }
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
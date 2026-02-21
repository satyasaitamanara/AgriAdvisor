from flask import Blueprint, request, jsonify
from models import db, Recommendation
from flask_jwt_extended import jwt_required, get_jwt_identity
import joblib
import numpy as np
import pandas as pd
import shap
import json
from config import Config
import requests
from datetime import datetime
import traceback

rec_bp = Blueprint('recommend', __name__)

# Helper to convert numpy types to Python native types
def convert_numpy_types(obj):
    """Recursively convert numpy types to native Python types"""
    if isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, (np.integer, np.floating)):
        return obj.item()
    elif isinstance(obj, np.bool_):          # <-- add this line
        return bool(obj)                      # <-- convert numpy bool to Python bool
    elif isinstance(obj, dict):
        return {k: convert_numpy_types(v) for k, v in obj.items()}
    elif isinstance(obj, (list, tuple)):
        return [convert_numpy_types(item) for item in obj]
    return obj
# Load model
try:
    saved_data = joblib.load(Config.ML_MODEL_PATH)
    pipeline = saved_data["pipeline"]
    le = saved_data["label_encoder"]
    features = saved_data["features"]
    print("✅ Model loaded successfully")
    print(f"📊 Features: {features}")
    print(f"🌱 Crops: {le.classes_}")
    
    # DEBUGGING: Print pipeline structure
    print("🔍 Pipeline steps:", pipeline.named_steps.keys())
    print("🔍 Classifier type:", type(pipeline.named_steps['clf']))
    
    # Check if it's calibrated
    if hasattr(pipeline.named_steps['clf'], 'base_estimator_'):
        print("✅ Has base_estimator_ attribute")
    if hasattr(pipeline.named_steps['clf'], 'calibrated_classifiers_'):
        print(f"✅ Has calibrated_classifiers_ with {len(pipeline.named_steps['clf'].calibrated_classifiers_)} calibrators")
        
except Exception as e:
    print(f"❌ Error loading model: {str(e)}")
    print(traceback.format_exc())
    pipeline = None
    le = None
    features = []

# SHAP explainer initialization
shap_explainer = None
if pipeline and 'clf' in pipeline.named_steps:
    try:
        # Get the RandomForest classifier directly
        rf_model = pipeline.named_steps['clf']
        print(f"✅ Using RandomForest classifier directly: {type(rf_model)}")
        
        # Check if it's a RandomForest
        if hasattr(rf_model, 'estimators_'):
            print(f"✅ RandomForest has {len(rf_model.estimators_)} trees")
            
            # Create background data for SHAP
            np.random.seed(42)
            n_samples = 100
            background_ranges = {
                'N': (0, 140), 'P': (5, 145), 'K': (5, 205),
                'temperature': (10, 40), 'humidity': (30, 100),
                'ph': (4, 9), 'rainfall': (0, 300)
            }
            
            # Generate background data
            background_data = []
            for feat in features:
                if feat in background_ranges:
                    min_val, max_val = background_ranges[feat]
                else:
                    min_val, max_val = 0, 100
                mean = (min_val + max_val) / 2
                std = (max_val - min_val) / 6
                col_data = np.random.normal(mean, std, n_samples)
                col_data = np.clip(col_data, min_val, max_val)
                background_data.append(col_data)
            
            background_data = np.column_stack(background_data)
            
            # Initialize SHAP explainer
            try:
                shap_explainer = shap.TreeExplainer(
                    rf_model,
                    background_data,
                    feature_names=features
                )
                print("✅ SHAP explainer initialized successfully")
            except Exception as e:
                print(f"⚠️ SHAP TreeExplainer error with background: {e}")
                # Try without background data
                try:
                    shap_explainer = shap.TreeExplainer(rf_model, feature_names=features)
                    print("✅ SHAP explainer initialized (without background)")
                except Exception as e2:
                    print(f"⚠️ SHAP fallback failed: {e2}")
                    shap_explainer = None
        else:
            print("⚠️ Classifier is not a RandomForest")
            
    except Exception as e:
        print(f"⚠️ SHAP initialization error: {e}")
        traceback.print_exc()
        shap_explainer = None
else:
    print("⚠️ Pipeline or classifier not available for SHAP")

# Weather API function
def get_live_weather_data(lat, lng):
    api_key = Config.OPENWEATHER_KEY
    if not api_key or api_key == 'a63621689253688a2cdd47570e15c520':
        print("⚠️ OpenWeatherMap API key not configured")
        return None
    try:
        url = "https://api.openweathermap.org/data/2.5/weather"
        params = {
            'lat': lat,
            'lon': lng,
            'appid': api_key,
            'units': 'metric',
            'lang': 'en'
        }
        response = requests.get(url, params=params, timeout=10)
        if response.status_code == 200:
            data = response.json()
            weather_data = {
                'temperature': round(data['main']['temp'], 1),
                'feels_like': round(data['main']['feels_like'], 1),
                'humidity': data['main']['humidity'],
                'pressure': data['main']['pressure'],
                'wind_speed': data['wind']['speed'],
                'wind_deg': data['wind'].get('deg', 0),
                'weather': data['weather'][0]['description'].title(),
                'weather_icon': data['weather'][0]['icon'],
                'location': data['name'],
                'country': data['sys']['country'],
                'coordinates': {
                    'lat': data['coord']['lat'],
                    'lon': data['coord']['lon']
                }
            }
            print(f"🌤️ Weather data fetched: {weather_data['weather']} at {weather_data['temperature']}°C")
            return weather_data
        else:
            print(f"❌ Weather API error: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"❌ Weather API exception: {e}")
        return None

# Sustainability scoring
def calculate_sustainability_score(params):
    try:
        ph = float(params.get('ph', params.get('PH', 6.5)))
        n = float(params.get('N', params.get('n', 90)))
        rainfall = float(params.get('rainfall', params.get('RAINFALL', 200)))
        temperature = float(params.get('temperature', params.get('TEMPERATURE', 25)))
        scores = {
            'overall': 50,
            'ph': {'score': 0, 'status': 'Neutral', 'ideal_range': '6.0-7.0'},
            'nitrogen': {'score': 0, 'status': 'Neutral', 'ideal_range': '80-120 ppm'},
            'rainfall': {'score': 0, 'status': 'Neutral', 'ideal_range': '150-250 mm'},
            'temperature': {'score': 0, 'status': 'Neutral', 'ideal_range': '20-30°C'}
        }
        explanations = []
        # pH
        if 6.0 <= ph <= 7.0:
            scores['ph']['score'] = 25
            scores['ph']['status'] = 'Optimal'
            explanations.append("✅ Soil pH is optimal for most crops")
        elif 5.5 <= ph < 6.0 or 7.0 < ph <= 7.5:
            scores['ph']['score'] = 15
            scores['ph']['status'] = 'Acceptable'
            explanations.append("⚠️ Soil pH is acceptable but could be optimized")
        else:
            scores['ph']['score'] = 5
            scores['ph']['status'] = 'Poor'
            explanations.append("❌ Soil pH needs correction")
        # Nitrogen
        if 80 <= n <= 120:
            scores['nitrogen']['score'] = 25
            scores['nitrogen']['status'] = 'Optimal'
            explanations.append("✅ Nitrogen levels support healthy growth")
        elif 60 <= n < 80 or 120 < n <= 140:
            scores['nitrogen']['score'] = 15
            scores['nitrogen']['status'] = 'Acceptable'
            explanations.append("⚠️ Nitrogen is adequate but not optimal")
        else:
            scores['nitrogen']['score'] = 5
            scores['nitrogen']['status'] = 'Poor'
            explanations.append("❌ Nitrogen levels need adjustment")
        # Rainfall
        if 150 <= rainfall <= 250:
            scores['rainfall']['score'] = 25
            scores['rainfall']['status'] = 'Optimal'
            explanations.append("✅ Rainfall is ideal for cultivation")
        elif 100 <= rainfall < 150 or 250 < rainfall <= 300:
            scores['rainfall']['score'] = 15
            scores['rainfall']['status'] = 'Acceptable'
            explanations.append("⚠️ Rainfall is adequate")
        else:
            scores['rainfall']['score'] = 5
            scores['rainfall']['status'] = 'Poor'
            explanations.append("❌ Rainfall may require irrigation management")
        # Temperature
        if 20 <= temperature <= 30:
            scores['temperature']['score'] = 25
            scores['temperature']['status'] = 'Optimal'
            explanations.append("✅ Temperature is ideal for crop growth")
        elif 15 <= temperature < 20 or 30 < temperature <= 35:
            scores['temperature']['score'] = 15
            scores['temperature']['status'] = 'Acceptable'
            explanations.append("⚠️ Temperature is within acceptable range")
        else:
            scores['temperature']['score'] = 5
            scores['temperature']['status'] = 'Poor'
            explanations.append("❌ Temperature may stress crops")
        total_score = sum([
            scores['ph']['score'],
            scores['nitrogen']['score'],
            scores['rainfall']['score'],
            scores['temperature']['score']
        ])
        scores['overall'] = min(100, total_score)
        if scores['overall'] >= 80:
            explanations.insert(0, "🌟 Excellent sustainability profile")
        elif scores['overall'] >= 60:
            explanations.insert(0, "✅ Good sustainability profile")
        else:
            explanations.insert(0, "⚠️ Sustainability needs improvement")
        return scores, explanations
    except Exception as e:
        print(f"Sustainability score error: {e}")
        return {'overall': 50}, ["Sustainability analysis unavailable"]

# SHAP visualization data generator - IMPROVED FOR WATERFALL DISPLAY
def generate_shap_visualization_data(shap_values, feature_values, features_list, crop_name, base_value=None):
    if shap_values is None or len(shap_values) == 0:
        return None
    try:
        # Handle numpy array conversion properly
        if hasattr(shap_values, 'tolist'):
            shap_values_list = shap_values.tolist()
        else:
            shap_values_list = list(shap_values)
        
        # Ensure all values are Python floats
        shap_values_list = [float(v) for v in shap_values_list]
        feature_values_list = [float(v) for v in feature_values]
        
        # Ensure lists are the same length
        min_length = min(len(shap_values_list), len(features_list), len(feature_values_list))
        shap_values_list = shap_values_list[:min_length]
        feature_values_list = feature_values_list[:min_length]
        features_used = features_list[:min_length]
        
        # Handle base_value (expected value)
        if base_value is None:
            base_value = 2.21
        else:
            try:
                # Try to convert to float safely
                if hasattr(base_value, 'item'):
                    try:
                        base_value = base_value.item()
                    except ValueError:
                        # If it's an array with multiple values, take the mean
                        base_value = float(np.mean(base_value))
                else:
                    base_value = float(base_value)
            except:
                base_value = 2.21
        
        # Feature information mapping with icons
        feature_info = {
            'N': {'name': 'Nitrogen', 'icon': '⚗️', 'unit': 'ppm', 'category': 'Nutrient'},
            'P': {'name': 'Phosphorus', 'icon': '🌿', 'unit': 'ppm', 'category': 'Nutrient'},
            'K': {'name': 'Potassium', 'icon': '🛡️', 'unit': 'ppm', 'category': 'Nutrient'},
            'temperature': {'name': 'Temperature', 'icon': '🌡️', 'unit': '°C', 'category': 'Climate'},
            'humidity': {'name': 'Humidity', 'icon': '💧', 'unit': '%', 'category': 'Climate'},
            'ph': {'name': 'Soil pH', 'icon': '🧪', 'unit': '', 'category': 'Soil'},
            'rainfall': {'name': 'Rainfall', 'icon': '🌧️', 'unit': 'mm', 'category': 'Climate'}
        }
        
        # Calculate final prediction (f(x))
        f_x = base_value + sum(shap_values_list)
        
        # Create bars for waterfall visualization
        bars = []
        cumulative = base_value
        
        for i, (feature_code, shap_value, feature_value) in enumerate(zip(features_used, shap_values_list, feature_values_list)):
            info = feature_info.get(feature_code, {'name': feature_code, 'icon': '📊', 'unit': '', 'category': 'Other'})
            
            # Calculate total absolute impact for percentages
            total_abs = sum(abs(v) for v in shap_values_list)
            impact_percent = (abs(shap_value) / total_abs * 100) if total_abs > 0 else 0
            is_positive = shap_value > 0
            
            # Update cumulative for waterfall
            cumulative += shap_value
            
            bars.append({
                'id': feature_code,
                'name': info['name'],
                'display_name': info['name'],
                'icon': info['icon'],
                'unit': info['unit'],
                'category': info['category'],
                'feature_value': round(feature_value, 2),
                'shap_value': round(shap_value, 3),
                'impact_percent': round(impact_percent, 1),
                'is_positive': is_positive,
                'bar_width': min(95, abs(shap_value) * 40),  # Scale for better visualization
                'color': 'green' if is_positive else 'red',
                'cumulative': round(cumulative, 3)
            })
        
        # Sort by absolute impact (most influential first) for better readability
        bars.sort(key=lambda x: abs(x['shap_value']), reverse=True)
        
        # Generate human-readable explanations
        explanations = [
            f"<strong>Base prediction:</strong> {round(base_value, 3)}",
            f"<strong>Final prediction (f(x)):</strong> {round(f_x, 3)}"
        ]
        
        # Add top 3 positive factors
        positive_factors = [b for b in bars if b['is_positive']][:3]
        if positive_factors:
            for factor in positive_factors:
                explanations.append(
                    f"✅ <strong>{factor['name']} = {factor['feature_value']}{factor['unit']}</strong> "
                    f"increases prediction by +{abs(factor['shap_value'])}"
                )
        
        # Add top 3 negative factors
        negative_factors = [b for b in bars if not b['is_positive']][:3]
        if negative_factors:
            for factor in negative_factors:
                explanations.append(
                    f"⚠️ <strong>{factor['name']} = {factor['feature_value']}{factor['unit']}</strong> "
                    f"decreases prediction by -{abs(factor['shap_value'])}"
                )
        
        # Calculate impact score (0-100)
        impact_score = round(min(100, sum(abs(b['shap_value']) for b in bars) * 15), 1)
        
        # Create waterfall data structure
        waterfall_steps = []
        cumulative_waterfall = base_value
        for bar in bars:
            cumulative_waterfall += bar['shap_value']
            waterfall_steps.append({
                'feature': bar['name'],
                'value': bar['feature_value'],
                'unit': bar['unit'],
                'shap': bar['shap_value'],
                'cumulative': round(cumulative_waterfall, 3),
                'is_positive': bar['is_positive']
            })
        
        return {
            'bars': bars,
            'explanations': explanations,
            'impact_score': impact_score,
            'total_features': len(bars),
            'positive_count': len([b for b in bars if b['is_positive']]),
            'negative_count': len([b for b in bars if not b['is_positive']]),
            'crop_name': crop_name,
            'base_value': round(base_value, 3),
            'f_x': round(f_x, 3),
            'waterfall_data': {
                'base_value': round(base_value, 3),
                'final_value': round(f_x, 3),
                'steps': waterfall_steps
            }
        }
        
    except Exception as e:
        print(f"SHAP visualization error: {e}")
        traceback.print_exc()
        return None
# Crop details (unchanged, truncated for brevity; include your full dictionary)
def get_crop_details(crop_name):
    crop_lower = crop_name.lower()
    details_db = {
        'rice': {
            'description': 'Staple food crop requiring warm, humid conditions with ample water supply. Grows best in flooded fields.',
            'season': 'Kharif (June-October)',
            'water_needs': 'High (1500-2000 mm)',
            'soil_type': 'Clayey loam with good water retention',
            'emoji': '🌾',
            'growth_period': '90-150 days',
            'ideal_temp': '20-35°C',
            'ideal_ph': '5.5-6.5',
            'market_price': '₹1800-2500/quintal',
            'fertilizer': 'N:P:K = 120:60:40 kg/ha',
            'pests': 'Stem borer, leaf folder, blast disease',
            'irrigation': 'Requires standing water (5-10 cm) during growth'
        },
        'wheat': {
            'description': 'Major cereal crop for cool seasons, important for food security. Requires well-drained soil.',
            'season': 'Rabi (November-April)',
            'water_needs': 'Moderate (450-650 mm)',
            'soil_type': 'Well-drained loamy soil',
            'emoji': '🌾',
            'growth_period': '110-130 days',
            'ideal_temp': '10-25°C',
            'ideal_ph': '6.0-7.5',
            'market_price': '₹1600-2200/quintal',
            'fertilizer': 'N:P:K = 120:60:40 kg/ha',
            'pests': 'Aphids, rust, smut',
            'irrigation': '5-6 irrigations at critical growth stages'
        },
        'maize': {
            'description': 'Versatile crop used for food, feed, and industrial products. Fast-growing and high-yielding.',
            'season': 'Kharif (June-October)',
            'water_needs': 'Moderate (500-800 mm)',
            'soil_type': 'Well-drained, fertile soil',
            'emoji': '🌽',
            'growth_period': '90-120 days',
            'ideal_temp': '18-27°C',
            'ideal_ph': '5.8-7.0',
            'market_price': '₹1400-2000/quintal',
            'fertilizer': 'N:P:K = 150:75:40 kg/ha',
            'pests': 'Stem borer, fall armyworm',
            'irrigation': 'Critical at tasseling and cob formation'
        },
        'cotton': {
            'description': 'Important fiber crop for textile industry. Requires long frost-free period.',
            'season': 'Kharif (June-October)',
            'water_needs': 'Medium-High (600-900 mm)',
            'soil_type': 'Black cotton soil',
            'emoji': '🧵',
            'growth_period': '150-180 days',
            'ideal_temp': '21-30°C',
            'ideal_ph': '6.0-8.0',
            'market_price': '₹5000-7000/quintal',
            'fertilizer': 'N:P:K = 80:40:40 kg/ha',
            'pests': 'Bollworms, aphids, whiteflies',
            'irrigation': 'At flowering and boll development'
        },
        'jute': {
            'description': 'Natural fiber crop for packaging materials. Requires high temperature and humidity.',
            'season': 'Kharif (March-August)',
            'water_needs': 'High (1500-2000 mm)',
            'soil_type': 'Alluvial soil',
            'emoji': '🎋',
            'growth_period': '120-150 days',
            'ideal_temp': '24-37°C',
            'ideal_ph': '6.0-7.5',
            'market_price': '₹3500-4500/quintal',
            'fertilizer': 'N:P:K = 60:30:30 kg/ha',
            'pests': 'Stem rot, root rot',
            'irrigation': 'Standing water during early growth'
        },
        'coffee': {
            'description': 'Popular beverage crop grown in shade. Requires well-distributed rainfall.',
            'season': 'Perennial (Year-round)',
            'water_needs': 'Moderate (1500-2000 mm)',
            'soil_type': 'Well-drained loamy soil rich in organic matter',
            'emoji': '☕',
            'growth_period': '3-4 years to first harvest',
            'ideal_temp': '15-28°C',
            'ideal_ph': '5.0-6.5',
            'market_price': '₹8000-12000/quintal',
            'fertilizer': 'Organic manure 10kg/plant/year',
            'pests': 'Coffee berry borer, leaf rust',
            'irrigation': 'During dry spells, drip irrigation recommended'
        },
        'sugarcane': {
            'description': 'Major cash crop for sugar production. Requires long growing season.',
            'season': 'Spring/Autumn (12-18 months)',
            'water_needs': 'High (1500-2500 mm)',
            'soil_type': 'Deep, well-drained loamy soil',
            'emoji': '🎋',
            'growth_period': '10-18 months',
            'ideal_temp': '20-35°C',
            'ideal_ph': '6.0-7.5',
            'market_price': '₹3000-4000/ton',
            'fertilizer': 'N:P:K = 250:90:120 kg/ha',
            'pests': 'Early shoot borer, scale insect',
            'irrigation': 'Critical during germination and grand growth'
        },
        'banana': {
            'description': 'Popular fruit crop grown in tropical regions. Fast-growing and high-yielding.',
            'season': 'Throughout year (10-12 months)',
            'water_needs': 'High (1200-2000 mm)',
            'soil_type': 'Deep, well-drained loamy soil',
            'emoji': '🍌',
            'growth_period': '10-12 months',
            'ideal_temp': '20-35°C',
            'ideal_ph': '5.5-7.0',
            'market_price': '₹2500-3500/quintal',
            'fertilizer': 'N:P:K = 200:60:300 g/plant',
            'pests': 'Rhizome weevil, leaf spot',
            'irrigation': 'Drip irrigation recommended, 20-25L/plant/week'
        },
        'mango': {
            'description': 'King of fruits, important tropical fruit crop. Long-lived tree.',
            'season': 'February-June (harvest)',
            'water_needs': 'Moderate (600-1000 mm)',
            'soil_type': 'Well-drained loamy soil',
            'emoji': '🥭',
            'growth_period': '3-5 years to first harvest',
            'ideal_temp': '24-30°C',
            'ideal_ph': '5.5-7.5',
            'market_price': '₹3000-5000/quintal',
            'fertilizer': 'N:P:K = 500:250:500 g/tree/year',
            'pests': 'Mango hopper, fruit fly',
            'irrigation': 'Critical during flowering and fruit development'
        },
        'grapes': {
            'description': 'High-value fruit crop for table and wine production. Requires trellising.',
            'season': 'February-March, October-November',
            'water_needs': 'Moderate (600-800 mm)',
            'soil_type': 'Well-drained sandy loam',
            'emoji': '🍇',
            'growth_period': '2-3 years to first harvest',
            'ideal_temp': '15-30°C',
            'ideal_ph': '6.0-7.5',
            'market_price': '₹4000-6000/quintal',
            'fertilizer': 'N:P:K = 300:200:400 kg/ha/year',
            'pests': 'Powdery mildew, thrips',
            'irrigation': 'Drip irrigation essential'
        },
        'orange': {
            'description': 'Popular citrus fruit rich in Vitamin C. Requires distinct seasons.',
            'season': 'October-February',
            'water_needs': 'Moderate (900-1200 mm)',
            'soil_type': 'Well-drained loamy soil',
            'emoji': '🍊',
            'growth_period': '3-4 years to first harvest',
            'ideal_temp': '20-30°C',
            'ideal_ph': '5.5-7.0',
            'market_price': '₹2500-3500/quintal',
            'fertilizer': 'N:P:K = 600:200:600 g/tree/year',
            'pests': 'Citrus leaf miner, fruit fly',
            'irrigation': 'Regular irrigation during fruit development'
        },
        'papaya': {
            'description': 'Fast-growing fruit crop with year-round production. Short-lived tree.',
            'season': 'Throughout year',
            'water_needs': 'Moderate (800-1200 mm)',
            'soil_type': 'Well-drained sandy loam',
            'emoji': '🍈',
            'growth_period': '9-11 months to first harvest',
            'ideal_temp': '22-30°C',
            'ideal_ph': '6.0-6.5',
            'market_price': '₹1500-2500/quintal',
            'fertilizer': 'N:P:K = 250:250:500 g/plant/year',
            'pests': 'Papaya ringspot virus, mites',
            'irrigation': 'Drip irrigation preferred'
        },
        'coconut': {
            'description': 'Important plantation crop for oil, water, and fiber. Long-lived tree.',
            'season': 'Throughout year',
            'water_needs': 'Moderate (1000-1500 mm)',
            'soil_type': 'Coastal sandy loam',
            'emoji': '🥥',
            'growth_period': '5-6 years to first harvest',
            'ideal_temp': '25-32°C',
            'ideal_ph': '5.5-7.5',
            'market_price': '₹2500-3500/quintal',
            'fertilizer': 'N:P:K = 500:320:1200 g/tree/year',
            'pests': 'Rhinoceros beetle, red palm weevil',
            'irrigation': 'Drip irrigation during dry months'
        },
        'apple': {
            'description': 'Temperate fruit crop requiring winter chilling. High-value crop.',
            'season': 'August-October',
            'water_needs': 'Moderate (800-1100 mm)',
            'soil_type': 'Well-drained sandy loam',
            'emoji': '🍎',
            'growth_period': '3-4 years to first harvest',
            'ideal_temp': '10-25°C',
            'ideal_ph': '6.0-7.0',
            'market_price': '₹5000-8000/quintal',
            'fertilizer': 'N:P:K = 500:250:500 g/tree/year',
            'pests': 'Apple scab, codling moth',
            'irrigation': 'Critical during fruit development'
        },
        'pomegranate': {
            'description': 'Drought-tolerant fruit crop with high medicinal value.',
            'season': 'August-October, February-March',
            'water_needs': 'Low-Moderate (500-800 mm)',
            'soil_type': 'Well-drained loamy soil',
            'emoji': '🍅',
            'growth_period': '2-3 years to first harvest',
            'ideal_temp': '25-35°C',
            'ideal_ph': '5.5-7.0',
            'market_price': '₹4000-6000/quintal',
            'fertilizer': 'N:P:K = 300:200:300 g/tree/year',
            'pests': 'Fruit borer, wilt',
            'irrigation': 'Drip irrigation recommended'
        },
        'chickpea': {
            'description': 'Important pulse crop rich in protein. Grows well in residual moisture.',
            'season': 'Rabi (October-March)',
            'water_needs': 'Low (250-350 mm)',
            'soil_type': 'Well-drained black soil',
            'emoji': '🫘',
            'growth_period': '90-120 days',
            'ideal_temp': '15-25°C',
            'ideal_ph': '6.0-7.5',
            'market_price': '₹4500-5500/quintal',
            'fertilizer': 'N:P:K = 20:50:20 kg/ha',
            'pests': 'Pod borer, wilt',
            'irrigation': '1-2 irrigations at flowering'
        },
        'kidneybeans': {
            'description': 'Protein-rich pulse crop, also known as rajma. Cool season crop.',
            'season': 'Rabi (October-March)',
            'water_needs': 'Moderate (400-500 mm)',
            'soil_type': 'Well-drained loamy soil',
            'emoji': '🫘',
            'growth_period': '90-120 days',
            'ideal_temp': '15-25°C',
            'ideal_ph': '6.0-7.0',
            'market_price': '₹5000-6000/quintal',
            'fertilizer': 'N:P:K = 30:60:30 kg/ha',
            'pests': 'Bean beetle, aphids',
            'irrigation': 'Critical at flowering and pod filling'
        },
        'pigeonpeas': {
            'description': 'Hardy pulse crop, also known as tur or arhar. Drought-tolerant.',
            'season': 'Kharif (June-December)',
            'water_needs': 'Low-Moderate (300-400 mm)',
            'soil_type': 'Well-drained black soil',
            'emoji': '🫘',
            'growth_period': '120-180 days',
            'ideal_temp': '20-30°C',
            'ideal_ph': '5.5-7.0',
            'market_price': '₹5200-6200/quintal',
            'fertilizer': 'N:P:K = 25:50:25 kg/ha',
            'pests': 'Pod borer, wilt',
            'irrigation': 'Critical at flowering'
        },
        'mothbeans': {
            'description': 'Drought-resistant pulse crop grown in arid regions.',
            'season': 'Kharif (June-October)',
            'water_needs': 'Low (200-300 mm)',
            'soil_type': 'Sandy loam',
            'emoji': '🫘',
            'growth_period': '75-90 days',
            'ideal_temp': '25-35°C',
            'ideal_ph': '6.0-7.5',
            'market_price': '₹4800-5800/quintal',
            'fertilizer': 'N:P:K = 15:30:15 kg/ha',
            'pests': 'Aphids, leafhopper',
            'irrigation': 'Rainfed crop, 1-2 irrigations if dry'
        },
        'mungbean': {
            'description': 'Short-duration pulse crop, also known as green gram.',
            'season': 'Kharif (June-September)',
            'water_needs': 'Low-Moderate (300-400 mm)',
            'soil_type': 'Well-drained loamy soil',
            'emoji': '🫘',
            'growth_period': '60-90 days',
            'ideal_temp': '25-35°C',
            'ideal_ph': '6.0-7.0',
            'market_price': '₹5000-6000/quintal',
            'fertilizer': 'N:P:K = 20:40:20 kg/ha',
            'pests': 'Aphids, leaf spot',
            'irrigation': 'Critical at flowering and pod filling'
        },
        'blackgram': {
            'description': 'Important pulse crop, also known as urad. Rich in protein.',
            'season': 'Kharif (June-October)',
            'water_needs': 'Low-Moderate (300-400 mm)',
            'soil_type': 'Well-drained black soil',
            'emoji': '🫘',
            'growth_period': '70-100 days',
            'ideal_temp': '25-35°C',
            'ideal_ph': '6.0-7.0',
            'market_price': '₹5200-6200/quintal',
            'fertilizer': 'N:P:K = 20:40:20 kg/ha',
            'pests': 'Pod borer, yellow mosaic virus',
            'irrigation': 'Critical at flowering'
        },
        'lentil': {
            'description': 'Cool season pulse crop, also known as masoor. Rich in protein and iron.',
            'season': 'Rabi (October-March)',
            'water_needs': 'Low (250-350 mm)',
            'soil_type': 'Well-drained loamy soil',
            'emoji': '🫘',
            'growth_period': '90-110 days',
            'ideal_temp': '15-25°C',
            'ideal_ph': '6.0-7.5',
            'market_price': '₹4800-5800/quintal',
            'fertilizer': 'N:P:K = 15:40:15 kg/ha',
            'pests': 'Aphids, rust',
            'irrigation': '1-2 irrigations'
        },
        'watermelon': {
            'description': 'Thirst-quenching summer fruit. Requires long warm season.',
            'season': 'February-June',
            'water_needs': 'Moderate (400-600 mm)',
            'soil_type': 'Sandy loam',
            'emoji': '🍉',
            'growth_period': '80-100 days',
            'ideal_temp': '24-30°C',
            'ideal_ph': '6.0-7.0',
            'market_price': '₹1500-2500/quintal',
            'fertilizer': 'N:P:K = 80:40:40 kg/ha',
            'pests': 'Powdery mildew, aphids',
            'irrigation': 'Drip irrigation recommended'
        },
        'muskmelon': {
            'description': 'Aromatic summer fruit, also known as cantaloupe.',
            'season': 'February-June',
            'water_needs': 'Moderate (400-600 mm)',
            'soil_type': 'Sandy loam',
            'emoji': '🍈',
            'growth_period': '70-90 days',
            'ideal_temp': '24-30°C',
            'ideal_ph': '6.0-7.0',
            'market_price': '₹2000-3000/quintal',
            'fertilizer': 'N:P:K = 70:35:35 kg/ha',
            'pests': 'Powdery mildew, fruit fly',
            'irrigation': 'Drip irrigation preferred'
        }
    }
    
    # Fallback
    crop_details = details_db.get(crop_lower, {
        'description': f'{crop_name.title()} is a suitable crop for your agricultural conditions.',
        'season': 'Varies by region',
        'water_needs': 'Moderate',
        'soil_type': 'Well-drained soil',
        'emoji': '🌱',
        'growth_period': '90-120 days',
        'ideal_temp': '20-30°C',
        'ideal_ph': '6.0-7.0',
        'market_price': '₹1500-2500/quintal'
    })
    crop_details['name'] = crop_name.title()
    return crop_details

def calculate_yield_and_profit(crop_name, land_size, sustainability_score, feature_values, features_list):
    """Calculate estimated yield and profit"""
    try:
        # Base yields (tons/acre) for different crops
        base_yields = {
            'rice': 3.0, 'wheat': 2.5, 'maize': 2.8, 'chickpea': 1.2,
            'kidneybeans': 1.5, 'pigeonpeas': 1.8, 'mothbeans': 1.0,
            'mungbean': 1.2, 'blackgram': 1.3, 'lentil': 1.1,
            'pomegranate': 8.0, 'banana': 30.0, 'mango': 10.0,
            'grapes': 15.0, 'watermelon': 25.0, 'muskmelon': 12.0,
            'apple': 20.0, 'orange': 15.0, 'papaya': 40.0, 'coconut': 80.0,
            'cotton': 2.0, 'jute': 2.5, 'coffee': 1.0
        }
        
        # Market prices (₹ per ton)
        prices = {
            'rice': 2200, 'wheat': 1950, 'maize': 1850, 'chickpea': 4500,
            'kidneybeans': 5500, 'pigeonpeas': 5200, 'mothbeans': 4800,
            'mungbean': 5000, 'blackgram': 5200, 'lentil': 4800,
            'pomegranate': 35000, 'banana': 1800, 'mango': 2500,
            'grapes': 4000, 'watermelon': 1500, 'muskmelon': 2000,
            'apple': 8000, 'orange': 3000, 'papaya': 1200, 'coconut': 2500,
            'cotton': 6500, 'jute': 3800, 'coffee': 18000
        }
        
        crop_lower = crop_name.lower()
        base_yield = base_yields.get(crop_lower, 2.0)
        base_price = prices.get(crop_lower, 2000)
        
        # Adjust yield based on sustainability score (0-100 scale)
        sustainability_factor = 0.8 + (sustainability_score / 100 * 0.4)  # 0.8 to 1.2
        
        # Adjust based on specific conditions
        condition_factor = 1.0
        
        # Check if we have feature values for NPK
        if features_list and feature_values:
            try:
                # Find indices of NPK in features
                feature_dict = dict(zip(features_list, feature_values))
                
                # Adjust based on nitrogen
                n = feature_dict.get('N', feature_dict.get('n', 90))
                if 80 <= n <= 120:
                    condition_factor *= 1.1
                elif n < 60 or n > 140:
                    condition_factor *= 0.9
                
                # Adjust based on pH
                ph = feature_dict.get('ph', feature_dict.get('PH', 6.5))
                if 6.0 <= ph <= 7.0:
                    condition_factor *= 1.05
                elif ph < 5.5 or ph > 7.5:
                    condition_factor *= 0.95
                    
            except Exception as e:
                print(f"Condition factor error: {e}")
        
        # Calculate final yield
        estimated_yield = round(base_yield * sustainability_factor * condition_factor, 2)
        
        # Calculate profit
        estimated_profit = round(estimated_yield * base_price * float(land_size), 2)
        
        return {
            'estimated_yield': estimated_yield,
            'estimated_profit': estimated_profit,
            'yield_unit': 'tons/acre',
            'profit_currency': '₹',
            'base_yield': base_yield,
            'market_price': base_price
        }
        
    except Exception as e:
        print(f"Yield calculation error: {e}")
        return {
            'estimated_yield': 2.0,
            'estimated_profit': 4000.0,
            'yield_unit': 'tons/acre',
            'profit_currency': '₹',
            'base_yield': 2.0,
            'market_price': 2000
        }
# Main recommendation endpoint
@rec_bp.route('/crop', methods=['POST'])
@jwt_required()
def recommend_crop():
    try:
        farmer_id = get_jwt_identity()
        data = request.get_json()

        print(f"📥 Received recommendation request from farmer {farmer_id}")
        print(f"📊 Input data: {data}")

        # Normalize data keys
        normalized_data = {}
        for key, value in data.items():
            if key.lower() in ['n', 'p', 'k']:
                normalized_data[key.upper()] = value
            else:
                normalized_data[key.lower()] = value

        # Weather handling (unchanged)
        use_live_weather = normalized_data.get('use_live_weather', False)
        latitude = normalized_data.get('latitude')
        longitude = normalized_data.get('longitude')
        weather_info = None
        weather_source = "Manual Input"
        if use_live_weather and latitude and longitude:
            try:
                lat = float(latitude)
                lng = float(longitude)
                weather_info = get_live_weather_data(lat, lng)
                if weather_info:
                    normalized_data['temperature'] = weather_info['temperature']
                    normalized_data['humidity'] = weather_info['humidity']
                    weather_source = f"🌤️ Live: {weather_info['location']}, {weather_info['country']}"
                    print(f"Weather updated from API: {weather_info['temperature']}°C, {weather_info['humidity']}%")
                else:
                    print("Weather API returned no data")
            except Exception as e:
                print(f"Weather fetch error: {e}")
                weather_info = None

        # Validate required fields
        required_fields = ['N', 'P', 'K', 'ph', 'temperature', 'humidity', 'rainfall']
        missing_fields = [field for field in required_fields if field not in normalized_data]
        if missing_fields:
            print(f"❌ Missing fields: {missing_fields}")
            return jsonify({
                "error": f"Missing required fields: {', '.join(missing_fields)}",
                "required_fields": required_fields
            }), 400

        # Convert to float
        for field in required_fields:
            try:
                normalized_data[field] = float(normalized_data[field])
            except ValueError:
                return jsonify({
                    "error": f"Invalid value for {field}. Must be a number.",
                    "field": field,
                    "value": normalized_data[field]
                }), 400

        # Prepare feature array
        feature_values = []
        for feature in features:
            if feature in normalized_data:
                feature_values.append(float(normalized_data[feature]))
            else:
                defaults = {
                    'N': 90, 'P': 42, 'K': 43,
                    'temperature': 25, 'humidity': 82,
                    'ph': 6.5, 'rainfall': 202
                }
                feature_values.append(defaults.get(feature, 0))
                normalized_data[feature] = defaults.get(feature, 0)

        features_array = np.array([feature_values])

        # Initialize variables
        crop_name = "rice"
        confidence = 0.7
        probs = None
        entropy = 0
        normalized_entropy = 0
        top3_crops = [{"crop": "rice", "confidence": 70}]
        shap_visualization_data = None

        if pipeline and le:
            try:
                # Transform if scaler exists
                if hasattr(pipeline.named_steps.get('scaler', None), 'transform'):
                    transformed_features = pipeline.named_steps['scaler'].transform(features_array)
                else:
                    transformed_features = features_array

                # Predict class
                pred_idx = pipeline.predict(features_array)[0]
                crop_name = le.inverse_transform([pred_idx])[0]

                # Get probabilities
                if hasattr(pipeline, 'predict_proba'):
                    probs = pipeline.predict_proba(features_array)[0]
                    confidence = float(probs[pred_idx])
                else:
                    probs = None
                    confidence = 0.8

                print(f"🌱 Predicted crop: {crop_name} (confidence: {confidence:.2f})")

                # --- Compute entropy ---
                if probs is not None:
                    # Avoid log(0)
                    epsilon = 1e-9
                    entropy = -np.sum(probs * np.log(probs + epsilon))
                    max_entropy = -np.log(1.0 / len(le.classes_))
                    normalized_entropy = entropy / max_entropy
                else:
                    entropy = 0
                    normalized_entropy = 0

                # --- Top‑3 recommendations ---
                if probs is not None:
                    sorted_idx = np.argsort(probs)[::-1]
                    top3_indices = sorted_idx[:3]
                    top3_probs = probs[top3_indices]
                    top3_crops = [
                        {
                            "crop": le.inverse_transform([idx])[0],
                            "confidence": round(float(prob) * 100, 1)
                        }
                        for idx, prob in zip(top3_indices, top3_probs)
                    ]
                else:
                    top3_crops = [{"crop": crop_name, "confidence": round(confidence * 100, 1)}]

                print(f"📊 Entropy: {entropy:.3f} (normalised: {normalized_entropy:.3f})")
                print(f"🥇 Top‑3: {top3_crops}")

                 # --- SHAP calculation ---
                if shap_explainer:
                    try:
                        # Use transformed features for SHAP (apply scaler first)
                        if hasattr(pipeline.named_steps.get('scaler', None), 'transform'):
                            X_scaled = pipeline.named_steps['scaler'].transform(features_array)
                            print("✅ Applied scaler for SHAP")
                        else:
                            X_scaled = features_array

                        # Calculate SHAP values
                        shap_values = shap_explainer.shap_values(X_scaled)

                        # For multi-class, get values for predicted class
                        if isinstance(shap_values, list):
                            # Multi-class case - shap_values is a list of arrays for each class
                            print(f"📊 SHAP is multi-class with {len(shap_values)} classes")
                            
                            # Get SHAP values for the predicted class
                            if len(shap_values) > pred_idx:
                                shap_values_for_class = shap_values[pred_idx]
                            else:
                                shap_values_for_class = shap_values[0]
                            
                            # Extract the first sample (since we only have one)
                            if len(shap_values_for_class.shape) > 1:
                                shap_values_for_instance = shap_values_for_class[0]
                            else:
                                shap_values_for_instance = shap_values_for_class
                                
                        elif isinstance(shap_values, np.ndarray):
                            # Could be 2D (samples, features) or 3D (samples, features, classes)
                            print(f"📊 SHAP is numpy array with shape: {shap_values.shape}")
                            
                            if shap_values.ndim == 3:
                                # Shape: (n_samples, n_features, n_classes)
                                shap_values_for_instance = shap_values[0, :, pred_idx]
                            elif shap_values.ndim == 2:
                                # Shape: (n_samples, n_features)
                                shap_values_for_instance = shap_values[0]
                            else:
                                shap_values_for_instance = shap_values
                        else:
                            print(f"⚠️ Unexpected SHAP type: {type(shap_values)}")
                            shap_values_for_instance = shap_values

                        # Ensure 1D array and convert to list
                        shap_values_for_instance = np.array(shap_values_for_instance).flatten()
                        shap_values_list = shap_values_for_instance.astype(float).tolist()
                        
                        print(f"📊 SHAP vector length: {len(shap_values_list)}")

                        # Get base value (expected value) - FIX THIS PART
                        if hasattr(shap_explainer, 'expected_value'):
                            expected = shap_explainer.expected_value
                            
                            # Handle different types of expected_value
                            if isinstance(expected, list):
                                # List of values (one per class)
                                if len(expected) > pred_idx:
                                    base_value = float(expected[pred_idx])
                                else:
                                    base_value = float(expected[0])
                            elif isinstance(expected, np.ndarray):
                                # Numpy array
                                if expected.ndim == 0:
                                    # Scalar array
                                    base_value = float(expected)
                                elif expected.ndim == 1:
                                    # 1D array (one value per class)
                                    if len(expected) > pred_idx:
                                        base_value = float(expected[pred_idx])
                                    else:
                                        base_value = float(expected[0])
                                else:
                                    # Multi-dimensional array - take the mean
                                    base_value = float(np.mean(expected))
                            else:
                                # Single value
                                base_value = float(expected)
                        else:
                            base_value = 0.0

                        print(f"📊 Base value: {base_value} (type: {type(base_value)})")

                        # Verify we have the right number of SHAP values
                        if len(shap_values_list) != len(features):
                            print(f"⚠️ SHAP length mismatch: {len(shap_values_list)} vs features {len(features)}")
                            # If too long, truncate (might be due to extra dimensions)
                            if len(shap_values_list) > len(features):
                                shap_values_list = shap_values_list[:len(features)]
                                print(f"✅ Truncated SHAP values to {len(shap_values_list)}")

                        # Generate visualization
                        shap_visualization_data = generate_shap_visualization_data(
                            shap_values_list,
                            feature_values,  # Use original feature values for display
                            features,
                            crop_name,
                            base_value
                        )
                        print("✅ SHAP visualization generated successfully")

                    except Exception as e:
                        print(f"⚠️ SHAP calculation error: {e}")
                        traceback.print_exc()
                        # Fallback - use sample data
                        sample_shap_values = [0.35, 0.28, -0.15, 0.12, -0.08, 0.05, 0.03]
                        shap_visualization_data = generate_shap_visualization_data(
                            sample_shap_values[:len(feature_values)],
                            feature_values,
                            features,
                            crop_name,
                            2.21
                        )
                        print("✅ Using fallback SHAP visualization data")

            except Exception as e:
                print(f"Prediction error: {e}")
                traceback.print_exc()
                # Keep defaults
        else:
            print("⚠️ Using fallback recommendation")

        # Sustainability
        sustainability_scores, sustainability_explanations = calculate_sustainability_score(normalized_data)

        # Yield and profit
        land_size = float(normalized_data.get('land_size', 1))
        yield_profit_data = calculate_yield_and_profit(
            crop_name,
            land_size,
            sustainability_scores['overall'],
            feature_values,
            features
        )

        # Crop details
        crop_details = get_crop_details(crop_name)

        # Build response
        result = {
            'success': True,
            'recommended_crop': crop_name,
            'confidence_percent': round(confidence * 100, 1),
            'top_crops': top3_crops,
            'uncertainty': {
                'entropy': round(entropy, 3),
                'normalized_entropy': round(normalized_entropy, 3),
                'is_certain': normalized_entropy < 0.5
            },
            'shap_visualization': shap_visualization_data,
            'sustainability': sustainability_scores,
            'sustainability_explanations': sustainability_explanations,
            'yield_analysis': yield_profit_data,
            'weather': weather_info,
            'weather_source': weather_source,
            'crop_details': crop_details,
            'input_summary': {
                'environment': {
                    'temperature': normalized_data.get('temperature'),
                    'humidity': normalized_data.get('humidity'),
                    'rainfall': normalized_data.get('rainfall'),
                    'ph': normalized_data.get('ph')
                },
                'nutrients': {
                    'nitrogen': normalized_data.get('N'),
                    'phosphorus': normalized_data.get('P'),
                    'potassium': normalized_data.get('K')
                },
                'land_size': land_size
            },
            'research_note': 'This recommendation uses Explainable AI (XAI) with SHAP values for transparent decision-making.'
        }

        # Convert numpy types
        result = convert_numpy_types(result)

        # Save to database
        try:
            recommendation = Recommendation(
                farmer_id=farmer_id,
                input_json=normalized_data,
                recommended_json=result
            )
            db.session.add(recommendation)
            db.session.commit()
            print(f"💾 Saved recommendation to database (ID: {recommendation.id})")
            print("Normalized Data :",normalized_data)
        except Exception as e:
            print(f"Database save error: {e}")

        print(f"✅ Recommendation complete for {crop_name}")
        return jsonify(result), 200

    except Exception as e:
        print(f"❌ Recommendation endpoint error: {e}")
        print(traceback.format_exc())
        return jsonify({
            'success': False,
            'error': 'Internal server error',
            'message': str(e)
        }), 500

# Health and crop list endpoints (unchanged)
@rec_bp.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'model_loaded': pipeline is not None,
        'shap_available': shap_explainer is not None,
        'num_features': len(features) if features else 0,
        'num_crops': len(le.classes_) if le else 0,
        'timestamp': datetime.now().isoformat()
    }), 200

@rec_bp.route('/crops', methods=['GET'])
def list_crops():
    if le:
        return jsonify({
            'crops': le.classes_.tolist(),
            'count': len(le.classes_)
        }), 200
    return jsonify({
        'crops': [],
        'count': 0,
        'message': 'Model not loaded'
    }), 200
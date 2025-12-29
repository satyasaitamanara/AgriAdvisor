from flask import Blueprint, request, jsonify
from models import db, Farmer
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
import re

auth_bp = Blueprint('auth', __name__)

def validate_phone(phone):
    """Validate phone number format"""
    pattern = r'^\+?[1-9]\d{1,14}$'  # E.164 format
    return re.match(pattern, phone) is not None

@auth_bp.route('/signup', methods=['POST'])
def signup():
    try:
        # Get JSON data from request
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'phone', 'password']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        # Validate phone number format
        if not validate_phone(data['phone']):
            return jsonify({"error": "Invalid phone number format"}), 400
        
        # Check if phone already exists
        if Farmer.query.filter_by(phone=data['phone']).first():
            return jsonify({"error": "Phone number already registered"}), 400
        
        # Create new farmer
        farmer = Farmer(
            name=data['name'],
            phone=data['phone'],
            village=data.get('village'),
            district=data.get('district'),
            state=data.get('state'),
            lat=data.get('lat'),
            lng=data.get('lng'),
            land_size=data.get('land_size', 0.0),
            soil_type=data.get('soil_type')
        )
        
        # Set password (hash it)
        farmer.set_password(data['password'])
        
        db.session.add(farmer)
        db.session.commit()
        
        # Create access token
        access_token = create_access_token(identity=str(farmer.id))
        
        return jsonify({
            "message": "Farmer created successfully",
            "access_token": access_token,
            "farmer": {
                "id": farmer.id,
                "name": farmer.name,
                "phone": farmer.phone
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"Signup error: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        # Validate required fields
        if 'phone' not in data or 'password' not in data:
            return jsonify({"error": "Phone and password are required"}), 400
        
        # Find farmer by phone
        farmer = Farmer.query.filter_by(phone=data['phone']).first()
        
        if not farmer or not farmer.check_password(data['password']):
            return jsonify({"error": "Invalid phone or password"}), 401
        
        # Create access token
        access_token = create_access_token(identity=str(farmer.id))
        
        return jsonify({
            "access_token": access_token,
            "farmer": {
                "id": farmer.id,
                "name": farmer.name,
                "phone": farmer.phone
            }
        }), 200
        
    except Exception as e:
        print(f"Login error: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_me():
    try:
        farmer_id = get_jwt_identity()
        farmer = Farmer.query.get(farmer_id)
        
        if not farmer:
            return jsonify({"error": "Farmer not found"}), 404
        
        return jsonify({
            "id": farmer.id,
            "name": farmer.name,
            "phone": farmer.phone,
            "village": farmer.village,
            "district": farmer.district,
            "state": farmer.state,
            "lat": farmer.lat,
            "lng": farmer.lng,
            "land_size": float(farmer.land_size) if farmer.land_size else 0.0,
            "soil_type": farmer.soil_type
        }), 200
        
    except Exception as e:
        print(f"Get me error: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500
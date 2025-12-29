from flask import Blueprint, request, jsonify
from models import db, Farmer, Recommendation, PestReport
from flask_jwt_extended import jwt_required, get_jwt_identity
from functools import wraps

admin_bp = Blueprint('admin', __name__)

# Admin required decorator
def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # In a real implementation, you would check if the current user is an admin
        # For this demo, we're using a simple check
        identity = get_jwt_identity()
        # Placeholder admin check - you would implement proper admin verification
        if identity != "admin":
            return jsonify({"error": "Admin access required"}), 403
        return f(*args, **kwargs)
    return decorated_function

@admin_bp.route('/farmers', methods=['GET'])
@jwt_required()
@admin_required
def get_all_farmers():  # Changed function name to avoid conflict
    try:
        farmers = Farmer.query.all()
        result = []
        for farmer in farmers:
            result.append({
                "id": farmer.id,
                "name": farmer.name,
                "phone": farmer.phone,
                "village": farmer.village,
                "district": farmer.district,
                "state": farmer.state,
                "joined_at": farmer.created_at.isoformat()
            })
        
        return jsonify({"farmers": result}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@admin_bp.route('/stats', methods=['GET'])
@jwt_required()
@admin_required
def get_admin_stats():  # Changed function name to avoid conflict
    try:
        total_farmers = Farmer.query.count()
        total_recommendations = Recommendation.query.count()
        total_pest_reports = PestReport.query.count()
        
        return jsonify({
            "total_farmers": total_farmers,
            "total_recommendations": total_recommendations,
            "total_pest_reports": total_pest_reports
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
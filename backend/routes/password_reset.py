from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
import uuid
from werkzeug.security import generate_password_hash
from models import db, Farmer
from services.email_service import send_reset_email
from config import Config

password_reset_bp = Blueprint("password_reset", __name__)

# -------------------------------
# Forgot Password
# -------------------------------
@password_reset_bp.route("/forgot-password", methods=["POST"])
def forgot_password():
    phone_or_email = request.json.get("email")

    user = Farmer.query.filter_by(email=phone_or_email).first()

    if not user:
        return jsonify({"message": "User not found"}), 404

    token = str(uuid.uuid4())
    user.reset_token = token
    user.reset_token_expiry = datetime.utcnow() + timedelta(minutes=15)

    db.session.commit()

    reset_link = f"{Config.FRONTEND_RESET_URL}/reset-password?token={token}"
    send_reset_email(phone_or_email, reset_link)

    return jsonify({"message": "Reset link sent successfully"}), 200


# -------------------------------
# Reset Password
# -------------------------------
@password_reset_bp.route("/reset-password", methods=["POST"])
def reset_password():
    token = request.json.get("token")
    new_password = request.json.get("password")

    if not token or not new_password:
        return jsonify({"message": "Token and password required"}), 400

    user = Farmer.query.filter(
        Farmer.reset_token == token,
        Farmer.reset_token_expiry > datetime.utcnow()
    ).first()

    if not user:
        return jsonify({"message": "Invalid or expired token"}), 400

    # Directly hash password (no method dependency)
    user.password_hash = generate_password_hash(new_password)
    user.reset_token = None
    user.reset_token_expiry = None

    db.session.commit()

    return jsonify({"message": "Password reset successful"}), 200

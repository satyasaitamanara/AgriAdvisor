from flask import Flask, jsonify
from config import Config
from models import db
from flask_jwt_extended import JWTManager
from flask_cors import CORS
import os

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Initialize extensions
    db.init_app(app)
    jwt = JWTManager(app)
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    # Create upload directory if it doesn't exist
    if hasattr(app.config, "UPLOAD_FOLDER"):
        os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    # Register blueprints
    from routes.auth import auth_bp
    from routes.recommend import rec_bp
    from routes.pest import pest_bp
    from routes.weather import weather_bp
    from routes.market import market_bp
    from routes.admin import admin_bp
    from routes.chatbot import chatbot_bp
    from routes.history import history_bp  # Add this line
    
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(rec_bp, url_prefix="/api/recommend")
    app.register_blueprint(pest_bp, url_prefix="/api/pest")
    app.register_blueprint(weather_bp, url_prefix="/api/weather")
    app.register_blueprint(market_bp, url_prefix="/api/market")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")
    app.register_blueprint(chatbot_bp, url_prefix="/api/chatbot") 
    app.register_blueprint(history_bp, url_prefix="/api/history") # Add this line
    
    # Root test route
    @app.route("/")
    def index():
        return jsonify({
            "status": "ok", 
            "message": "Agri Advisor API running",
            "endpoints": {
                "chatbot": "/api/chatbot/chat",
                "health": "/api/chatbot/health"
            }
        })
    
    return app

if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=5000, debug=True)
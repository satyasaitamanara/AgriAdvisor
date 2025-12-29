from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

db = SQLAlchemy()

class Farmer(db.Model):
    __tablename__ = 'farmers'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128), nullable=False)
    phone = db.Column(db.String(20), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    village = db.Column(db.String(255))
    district = db.Column(db.String(255))
    state = db.Column(db.String(255))
    lat = db.Column(db.Float)
    lng = db.Column(db.Float)
    land_size = db.Column(db.Numeric(8, 2), default=0.0)
    soil_type = db.Column(db.String(64))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    recommendations = db.relationship('Recommendation', backref='farmer', lazy=True)
    soil_tests = db.relationship('SoilTest', backref='farmer', lazy=True)
    pest_reports = db.relationship('PestReport', backref='farmer', lazy=True)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Admin(db.Model):
    __tablename__ = 'admins'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(32), default='superadmin')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Recommendation(db.Model):
    __tablename__ = 'recommendations'
    
    id = db.Column(db.Integer, primary_key=True)
    farmer_id = db.Column(db.Integer, db.ForeignKey('farmers.id'), nullable=False)
    input_json = db.Column(db.JSON, nullable=False)
    recommended_json = db.Column(db.JSON, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class SoilTest(db.Model):
    __tablename__ = 'soil_tests'
    
    id = db.Column(db.Integer, primary_key=True)
    farmer_id = db.Column(db.Integer, db.ForeignKey('farmers.id'), nullable=False)
    ph = db.Column(db.Numeric(4, 2))
    n = db.Column(db.Integer)
    p = db.Column(db.Integer)
    k = db.Column(db.Integer)
    moisture = db.Column(db.Numeric(5, 2))
    test_date = db.Column(db.Date)
    notes = db.Column(db.Text)

class PestReport(db.Model):
    __tablename__ = 'pest_reports'
    
    id = db.Column(db.Integer, primary_key=True)
    farmer_id = db.Column(db.Integer, db.ForeignKey('farmers.id'), nullable=False)
    image_path = db.Column(db.String(512))
    predicted_label = db.Column(db.String(128))
    confidence = db.Column(db.Numeric(5, 2))
    advisory_json = db.Column(db.JSON)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
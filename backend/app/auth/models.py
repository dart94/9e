from datetime import datetime
from ..extensions import db

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    is_verified = db.Column(db.Boolean, default=False, nullable=False)
    google_id = db.Column(db.String(200), unique=True, nullable=True)
    auth_provider = db.Column(db.String(50), default='email', nullable=False)

    pregnancies = db.relationship('PregnancyData', backref='user', lazy=True)
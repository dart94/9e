from datetime import datetime, timedelta
from flask_login import UserMixin
from flask_sqlalchemy import SQLAlchemy
from . import db

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    is_verified = db.Column(db.Boolean, default=False, nullable=False)
    google_id = db.Column(db.String(200), unique=True, nullable=True)
    auth_provider = db.Column(db.String(50), default='email', nullable=False)
    is_admin = db.Column(db.Boolean, default=False, nullable=False)

class PregnancyData(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    week = db.Column(db.Integer, nullable=False)
    weight = db.Column(db.Float, nullable=True)
    symptoms = db.Column(db.String(500), nullable=True)
    notes = db.Column(db.String(500), nullable=True)
    last_period_date = db.Column(db.Date, nullable=False)
    due_date = db.Column(db.Date, nullable=True)  # Nueva columna para la fecha de parto
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def __init__(self, user_id, last_period_date, **kwargs):
        super().__init__(user_id=user_id, last_period_date=last_period_date, **kwargs)
        self.due_date = last_period_date + timedelta(days=280)  # Calcula la fecha de parto

    @property
    def calculate_week(self):
        """
        Calcula la semana actual del embarazo basado en la última fecha del período.
        """
        if self.last_period_date:
            today = datetime.utcnow().date()
            delta = today - self.last_period_date
            return max(1, delta.days // 7)  # Semanas completas desde la última menstruación
        return None

    @property
    def is_postpartum(self):
        """
        Devuelve True si la fecha actual es posterior a la fecha de parto.
        """
        if self.due_date:
            return datetime.utcnow().date() > self.due_date
        return False

# Fetal Development
class FetalDevelopment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    week = db.Column(db.Integer, unique=True, nullable=False)
    description = db.Column(db.Text, nullable=False)
    size = db.Column(db.String(50), nullable=False)
    weight = db.Column(db.String(50), nullable=False)
    comparison = db.Column(db.String(100), nullable=False)
    symptoms = db.Column(db.Text, nullable=True)
    advice = db.Column(db.Text, nullable=True)

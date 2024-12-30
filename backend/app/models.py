from datetime import datetime, timedelta
from . import db

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)


class PregnancyData(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    week = db.Column(db.Integer, nullable=False)
    weight = db.Column(db.Float, nullable=True)
    symptoms = db.Column(db.String(500), nullable=True)
    notes = db.Column(db.String(500), nullable=True)
    last_period_date = db.Column(db.Date, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
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
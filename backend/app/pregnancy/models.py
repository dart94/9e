from datetime import datetime
from ..extensions import db

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
        if self.last_period_date:
            today = datetime.utcnow().date()
            delta = today - self.last_period_date
            return max(1, delta.days // 7)
        return None
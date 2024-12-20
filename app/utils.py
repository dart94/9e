from datetime import datetime, timezone

def calculate_week_and_progress(last_period_date):
    """
    Calcula la semana actual del embarazo y el porcentaje de progreso.
    """
    if not last_period_date:
        return None, 0  # Semana 0, progreso 0%
    
    today = datetime.now(timezone.utc).date()
    days_since_period = (today - last_period_date).days
    current_week = max(1, days_since_period // 7)
    progress_percentage = (current_week / 40) * 100
    return current_week, progress_percentage

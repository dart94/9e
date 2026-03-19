from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime

from . import pregnancy_bp
from ..extensions import db
from .models import PregnancyData
from ..api.fetal_development_api import FetalDevelopmentData

fetal_data = FetalDevelopmentData()


def week_to_month(week):
    if week <= 4:   return 1
    elif week <= 8:  return 2
    elif week <= 12: return 3
    elif week <= 16: return 4
    elif week <= 20: return 5
    elif week <= 24: return 6
    elif week <= 28: return 7
    elif week <= 32: return 8
    else:            return 9


@pregnancy_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def get_dashboard():
    user_id = get_jwt_identity()

    last_record = PregnancyData.query.filter_by(user_id=user_id).order_by(PregnancyData.id.desc()).first()
    if not last_record or not last_record.last_period_date:
        return jsonify({"error": "No hay datos de embarazo registrados"}), 404

    today = datetime.now().date()
    days_since_period = (today - last_record.last_period_date).days
    current_week = max(1, days_since_period // 7)
    week_info = fetal_data.get_week_info(current_week)

    return jsonify({
        "current_week": current_week,
        "progress_percentage": (current_week / 40) * 100,
        "month": week_to_month(current_week),
        "week_info": week_info,
        "last_record": {
            "id": last_record.id,
            "weight": last_record.weight,
            "symptoms": last_record.symptoms,
            "notes": last_record.notes,
            "last_period_date": last_record.last_period_date.strftime('%Y-%m-%d'),
        },
    }), 200


@pregnancy_bp.route('/embarazos', methods=['GET'])
@jwt_required()
def get_registros():
    user_id = get_jwt_identity()
    registros = PregnancyData.query.filter_by(user_id=user_id).all()
    return jsonify([
        {
            "id": r.id,
            "week": r.week,
            "weight": r.weight,
            "symptoms": r.symptoms,
            "notes": r.notes,
            "last_period_date": r.last_period_date.strftime('%Y-%m-%d') if r.last_period_date else None
        }
        for r in registros
    ]), 200


@pregnancy_bp.route('/embarazos', methods=['POST'])
@jwt_required()
def crear_registro():
    user_id = get_jwt_identity()
    data = request.get_json()

    if not data or not data.get('last_period_date') or not data.get('weight'):
        return jsonify({"error": "Faltan campos obligatorios: 'last_period_date' y 'weight'"}), 400

    try:
        last_period_date = datetime.strptime(data['last_period_date'], '%Y-%m-%d').date()
    except ValueError:
        return jsonify({"error": "El formato de la fecha debe ser YYYY-MM-DD"}), 400

    today = datetime.utcnow().date()
    week = data.get('week') or max(1, (today - last_period_date).days // 7)

    nuevo = PregnancyData(
        user_id=user_id,
        last_period_date=last_period_date,
        weight=float(data['weight']),
        symptoms=data.get('symptoms'),
        notes=data.get('notes'),
        week=week,
    )
    try:
        db.session.add(nuevo)
        db.session.commit()
        return jsonify({"message": "Registro añadido correctamente"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Error al guardar: {str(e)}"}), 500


@pregnancy_bp.route('/embarazos/<int:id>', methods=['DELETE'])
@jwt_required()
def eliminar_registro(id):
    registro = PregnancyData.query.get(id)
    if not registro:
        return jsonify({"error": "Registro no encontrado"}), 404
    try:
        db.session.delete(registro)
        db.session.commit()
        return jsonify({"message": "Registro eliminado correctamente"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Error al eliminar: {str(e)}"}), 500
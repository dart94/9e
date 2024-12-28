from flask import Blueprint, jsonify
from .resources.fetal_development import FetalDevelopmentData

# Blueprint para la API
fetal_api = Blueprint('fetal_development_api', __name__)

# Instancia del recurso
fetal_data = FetalDevelopmentData()

# Endpoint para obtener todas las semanas
@fetal_api.route('/fetal-development', methods=['GET'])
def get_all_fetal_development():
    data = fetal_data.get_all_weeks()
    if not data:
        return jsonify({"error": "No hay datos disponibles."}), 404
    return jsonify(data), 200

# Endpoint para obtener información de una semana específica
@fetal_api.route('/fetal-development/<int:week>', methods=['GET'])
def get_fetal_development(week):
    week_info = fetal_data.get_week_info(week)
    if not week_info:
        return jsonify({"error": "Datos no disponibles para esta semana"}), 404
    return jsonify(week_info), 200

from flask import Blueprint, jsonify, request
import json

# Blueprint para la API
fetal_api = Blueprint('fetal_development_api', __name__)

class FetalDevelopmentData:
    def __init__(self, json_file_path="app/api/fetal_development_data.json"):
        try:
            with open(json_file_path, "r", encoding="utf-8") as file:
                self.development_data = json.load(file)
        except FileNotFoundError:
            print(f"Error: No se encontró el archivo {json_file_path}")
            self.development_data = {}
        except json.JSONDecodeError:
            print(f"Error: El archivo {json_file_path} tiene un formato JSON inválido.")
            self.development_data = {}

    def get_week_info(self, week):
        """Obtiene la información para una semana específica"""
        if not self.development_data:
            return None
        available_weeks = sorted(int(key) for key in self.development_data.keys())
        closest_week = min(available_weeks, key=lambda x: abs(x - week))
        return self.development_data.get(str(closest_week))

fetal_data = FetalDevelopmentData()

# Endpoint para obtener información de una semana específica
@fetal_api.route('/fetal-development/<int:week>', methods=['GET'])
def get_fetal_development(week):
    week_info = fetal_data.get_week_info(week)
    if not week_info:
        return jsonify({"error": "Datos no disponibles para esta semana"}), 404
    return jsonify(week_info), 200

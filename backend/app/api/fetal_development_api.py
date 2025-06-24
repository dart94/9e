import os
import json
from flask import Blueprint, jsonify, request
from datetime import datetime

# Blueprint para la API
fetal_api = Blueprint('fetal_development_api', __name__)

class FetalDevelopmentData:
    def __init__(self, json_file_path=None):
        # Construye la ruta dinámica desde el directorio actual del archivo
        if json_file_path is None:
            json_file_path = os.path.join(
                os.path.dirname(__file__), 
                "fetal_development_data.json"
            )
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





@fetal_api.route('/fetal-development', methods=['GET'])
def get_fetal_development():
    birth_date_str = request.args.get('birth_date')
    if not birth_date_str:
        return jsonify({"error": "Debe proporcionar birth_date en formato YYYY-MM-DD"}), 400

    try:
        birth_date = datetime.strptime(birth_date_str, "%Y-%m-%d").date()
    except ValueError:
        return jsonify({"error": "Formato de birth_date inválido. Use YYYY-MM-DD"}), 400

    today = datetime.utcnow().date()
    delta_days = (today - birth_date).days

    if delta_days < 0:
        return jsonify({"error": "birth_date no puede ser una fecha futura"}), 400

    weeks_passed = delta_days // 7

    json_path = os.path.join(os.path.dirname(__file__), "fetal_development_data.json")
    try:
        with open(json_path, "r", encoding="utf-8") as f:
            data = json.load(f)
    except Exception as e:
        return jsonify({"error": f"No se pudo leer el archivo JSON: {str(e)}"}), 500

    semanas = sorted([int(k) for k in data.keys()])
    selected_week = None
    for semana in semanas:
        if semana <= weeks_passed:
            selected_week = semana
        else:
            break

    if selected_week is None:
        return jsonify({"error": "No hay datos para la semana calculada"}), 404

    result = data[str(selected_week)]
    result["semanas_transcurridas"] = weeks_passed

    return jsonify(result)
import os
import json
import logging
from flask import Blueprint, jsonify, request, session
from datetime import datetime
from flask_jwt_extended import jwt_required
from ..models import IsBorn, User
from .. import db

# Configuración del logger para este módulo
logger = logging.getLogger(__name__)

# Crear el Blueprint para la API de posparto
posparto_api = Blueprint('posparto_api', __name__)

class PospartoData:
    """
    Clase para manejar la carga y consulta de datos de posparto a partir de un archivo JSON.

    Atributos:
        development_data (dict): Diccionario con los datos cargados desde el archivo JSON.
    """

    def __init__(self, json_file_path=None):
        """
        Inicializa la instancia de PospartoData cargando los datos desde un archivo JSON.

        Args:
            json_file_path (str, optional): Ruta del archivo JSON. Si no se proporciona,
                se utilizará el archivo 'posparto.json' ubicado en el mismo directorio.
        """
        if json_file_path is None:
            json_file_path = os.path.join(os.path.dirname(__file__), "posparto.json")
        try:
            with open(json_file_path, "r", encoding="utf-8") as file:
                self.development_data = json.load(file)
                logger.info("Archivo JSON cargado exitosamente: %s", self.development_data)
        except FileNotFoundError:
            logger.error("Error: No se encontró el archivo %s", json_file_path)
            self.development_data = {}
        except json.JSONDecodeError:
            logger.error("Error: El archivo %s tiene un formato JSON inválido.", json_file_path)
            self.development_data = {}

    def get_week_info(self, week):
        """
        Obtiene la información para una semana específica a partir de la lista de datos.

        Se busca una coincidencia exacta en la propiedad 'semana'. Si no se encuentra,
        se retorna la información de la semana más cercana.

        Args:
            week (int): Número de la semana solicitada.

        Returns:
            dict or None: Diccionario con la información de la semana encontrada, o None si no se encuentra.
        """
        posparto_list = self.development_data.get("posparto", [])
        if not posparto_list:
            logger.warning("No se encontraron datos en el archivo JSON.")
            return None

        # Buscar coincidencia exacta
        for entry in posparto_list:
            if entry.get("semana") == week:
                logger.info("Datos encontrados para la semana %s: %s", week, entry)
                return entry

        # Si no hay coincidencia exacta, buscar la semana más cercana
        available_weeks = [entry.get("semana") for entry in posparto_list if "semana" in entry]
        if available_weeks:
            closest_week = min(available_weeks, key=lambda x: abs(x - week))
            logger.info("No se encontró la semana exacta %s. Se retornará la semana %s", week, closest_week)
            for entry in posparto_list:
                if entry.get("semana") == closest_week:
                    return entry

        return None

# Instancia de datos de posparto
posparto_data = PospartoData()

@posparto_api.route('/posparto/<int:week>', methods=['GET'])
def get_posparto_info(week):
    """
    Endpoint para obtener la información de posparto para una semana específica.

    Args:
        week (int): Número de la semana solicitada.

    Returns:
        Response: JSON con la información de la semana o un error 404 si no se encuentra.
    """
    week_info = posparto_data.get_week_info(week)
    if not week_info:
        return jsonify({"error": "Datos no disponibles para esta semana"}), 404
    return jsonify(week_info), 200

# Endpoint para registrar un nuevo registro de posparto
@posparto_api.route("/is-born", methods=['POST'])
@jwt_required()
def api_is_born():
    try:
        data = request.get_json()
        if not data or not all(key in data for key in ("birth_date", "weight")):
            return jsonify({"error": "Datos incompletos"}), 400

        # Validar fecha de nacimiento
        try:
            birth_date = datetime.strptime(data['birth_date'], '%Y-%m-%d').date()
        except ValueError:
            return jsonify({"error": "La fecha de nacimiento no es válida"}), 400

        # Validar peso (debe ser un número positivo)
        try:
            weight = float(data['weight'])
            if weight <= 0:
                return jsonify({"error": "El peso no puede ser negativo"}), 400
        except (ValueError, TypeError):
            return jsonify({"error": "El peso debe ser un número válido"}), 400

        # Crear nuevo registro
        nuevo_registro = IsBorn(
            user_id=session.get('user_id'),  # Se obtiene del JWT
            birth_date=birth_date,
            weight=weight,
            notes=data.get('notes', ''),
        )

        try:
            db.session.add(nuevo_registro)
            db.session.commit()
            return jsonify({"message": "Registro de nacimiento guardado con éxito"}), 201
        except Exception as e:
            db.session.rollback()
            print(f"Error al guardar el registro: {str(e)}")
            return jsonify({"error": "Error al guardar el registro"}), 500

    except Exception as e:
        print(f"Error al guardar el registro: {str(e)}")
        return jsonify({"error": "Error al guardar el registro"}), 500
    

# Endpoint para obtener información de posparto basada en la fecha de nacimiento
@posparto_api.route('/is-born', methods=['GET'])
def get_posparto_info_by_week():
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

    # Leer el archivo JSON
    json_path = os.path.join(os.path.dirname(__file__), "posparto.json")
    try:
        with open(json_path, "r", encoding="utf-8") as f:
            full_data = json.load(f)
            data = full_data.get("posparto", [])
    except Exception as e:
        return jsonify({"error": f"No se pudo leer el archivo JSON: {str(e)}"}), 500

    # Buscar la entrada de semana más cercana (sin pasarse)
    selected_entry = None
    for entry in sorted(data, key=lambda x: x['semana']):
        if entry["semana"] <= weeks_passed:
            selected_entry = entry
        else:
            break

    if not selected_entry:
        return jsonify({"error": "No hay datos para la semana calculada"}), 404

    # Añadir semanas transcurridas
    selected_entry["semanas_transcurridas"] = weeks_passed

    return jsonify(selected_entry),200


# Endpoint para obtener información de posparto basada en el ID del usuario
@posparto_api.route('/is-born/user/<int:user_id>', methods=['GET'])
def get_posparto_info_by_user(user_id):
    # Buscar usuario en la BD
    record = IsBorn.query.filter_by(user_id=user_id).first()
    if not record:
        return jsonify({"error": "Registro de nacimiento no encontrado para ese usuario"}), 404

    if not hasattr(record, 'birth_date') or not record.birth_date:
        return jsonify({"error": "El usuario no tiene fecha de nacimiento registrada"}), 400

    birth_date = record.birth_date
    today = datetime.utcnow().date()
    delta_days = (today - birth_date).days

    if delta_days < 0:
        return jsonify({"error": "birth_date no puede ser una fecha futura"}), 400

    weeks_passed = delta_days // 7

    # Leer el JSON de posparto.json
    json_path = os.path.join(os.path.dirname(__file__), "posparto.json")
    try:
        with open(json_path, "r", encoding="utf-8") as f:
            full_data = json.load(f)
            data = full_data.get("posparto", [])
    except Exception as e:
        return jsonify({"error": f"No se pudo leer el archivo JSON: {str(e)}"}), 500

    # Filtrar semanas válidas (menores o iguales a weeks_passed)
    semanas_validas = [item for item in data if item.get("semana", 0) <= weeks_passed]


    if not semanas_validas:
        return jsonify({"error": "No hay datos disponibles para la semana calculada"}), 404

    # Seleccionar la semana más cercana (mayor valor menor o igual a weeks_passed)
    selected_week_data = max(semanas_validas, key=lambda x: x.get("semana", 0))

    # Agregar info extra
    selected_week_data["semanas_transcurridas"] = weeks_passed


    return jsonify(selected_week_data)


# Endpoint para obtener toda la información de posparto (todas las semanas)
@posparto_api.route('/all-weeks', methods=['GET'])
def get_all_posparto_weeks():
    # Leer el JSON de posparto.json
    json_path = os.path.join(os.path.dirname(__file__), "posparto.json")
    try:
        with open(json_path, "r", encoding="utf-8") as f:
            full_data = json.load(f)
            data = full_data.get("posparto", [])
    except Exception as e:
        return jsonify({"error": f"No se pudo leer el archivo JSON: {str(e)}"}), 500
    
    if not data:
        return jsonify({"error": "No hay datos de posparto disponibles"}), 404
    
    # Ordenar por semana para asegurar orden correcto
    data_sorted = sorted(data, key=lambda x: x.get("semana", 0))
    
    return jsonify({
        "total_semanas": len(data_sorted),
        "posparto": data_sorted
    })


@posparto_api.route('/is-born/userborn/<int:user_id>', methods=['GET'])
def check_user_exists(user_id):
    user = IsBorn.query.get(user_id)
    if not user:
        return jsonify({"exists": False}), 404
    return jsonify({"exists": True}), 200
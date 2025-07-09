# backend/app/notifications/fcm.py

import os
import json
import requests
from flask import Blueprint, request, jsonify
from google.oauth2 import service_account
from google.auth.transport.requests import Request as GoogleRequest
from dotenv import load_dotenv
from flask_jwt_extended import jwt_required, get_jwt_identity
from .. import db
from ..models import User



load_dotenv()

fcm = Blueprint('fcm', __name__)  # ✅ Agregado
notifications_bp = Blueprint('notifications', __name__)  # ✅ Agregado

# Leer la ruta al archivo de credenciales
service_account_info = json.loads(os.getenv('SERVICE_ACCOUNT_CREDENTIALS_JSON'))

credentials = service_account.Credentials.from_service_account_info(
    service_account_info,
    scopes=['https://www.googleapis.com/auth/firebase.messaging']
)

project_id = credentials.project_id
fcm_url = f"https://fcm.googleapis.com/v1/projects/{project_id}/messages:send"

def get_access_token():
    auth_req = GoogleRequest()
    credentials.refresh(auth_req)
    return credentials.token

def send_pushnotification(fcm_token, title, body):
    access_token = get_access_token()
    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json'
    }
    payload = {
        "message": {
            "token": fcm_token,
            "notification": {
                "title": title,
                "body": body
            }
        }
    }
    response = requests.post(fcm_url, data=json.dumps(payload), headers=headers)
    return response.json(), response.status_code

@fcm.route('/send_pushnotification', methods=['POST'])
def send_notification():
    data = request.json
    fcm_token = data.get("token")
    title = data.get("title", "Notificación")
    body = data.get("body", "Mensaje de prueba")

    if not fcm_token:
        return jsonify({"error": "Falta el token de FCM"}), 400
    
    result, status = send_pushnotification(fcm_token, title, body)
    return jsonify({"result": result}), status


@notifications_bp.route('/save_push_token', methods=['POST'])
@jwt_required()
def save_push_token():
    user_id = get_jwt_identity()
    data = request.get_json()
    token = data.get('token')

    if not token:
        return jsonify({'error': 'Token no proporcionado'}), 400

    # Guarda en la base de datos (ejemplo simple)
    # Aquí asumes que tienes un modelo User con una columna push_token
    from ..models import User
    from .. import db
    user = User.query.get(user_id)
    if user:
        user.push_token = token
        db.session.commit()
        return jsonify({'message': 'Token guardado correctamente'})
    else:
        return jsonify({'error': 'Usuario no encontrado'}), 404
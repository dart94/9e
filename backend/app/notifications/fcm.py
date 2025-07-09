# backend/app/notifications/fcm.py

import os
import json
import requests
from flask import Blueprint, request, jsonify
from google.oauth2 import service_account
from google.auth.transport.requests import Request as GoogleRequest
from dotenv import load_dotenv

load_dotenv()

fcm = Blueprint('fcm', __name__)  # ✅ Agregado

# Leer la ruta al archivo de credenciales
SERVICE_ACCOUNT_FILE = os.getenv('SERVICE_ACCOUNT_CREDENTIALS')

# Leer las credenciales del archivo JSON
credentials = service_account.Credentials.from_service_account_file(
    SERVICE_ACCOUNT_FILE,
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

@fcm.route('/send_pushnotification', methods=['POST'])  # URL completa: /api/send_pushnotification
def send_notification():
    data = request.json
    fcm_token = data.get("token")
    title = data.get("title", "Notificación")
    body = data.get("body", "Mensaje de prueba")

    if not fcm_token:
        return jsonify({"error": "Falta el token de FCM"}), 400
    
    result, status = send_pushnotification(fcm_token, title, body)
    return jsonify({"result": result}), status

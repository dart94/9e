from flask import request, jsonify, current_app, render_template, redirect
from flask_jwt_extended import (
    create_access_token, create_refresh_token,
    jwt_required, get_jwt_identity, get_jwt
)
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired
from werkzeug.security import generate_password_hash
from datetime import timedelta
from google.oauth2 import id_token
import requests
import uuid
import os
from urllib.parse import urlencode

from . import auth_bp
from ..extensions import db, bcrypt, mail
from .models import User, TokenBlocklist
from flask_mail import Message

GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID')
GOOGLE_CLIENT_SECRET = os.getenv('GOOGLE_CLIENT_SECRET')
REDIRECT_URI = "https://9e-production.up.railway.app/auth/callback"

def get_base_url():
    return os.getenv('BASE_URL', 'http://192.168.13.38:5000')


# --- Helpers de email ---

def send_reset_email(to_email, reset_url):
    msg = Message('Restablecimiento de Contraseña', recipients=[to_email])
    msg.body = f'''Para restablecer su contraseña, haga clic en el siguiente enlace:
{reset_url}
Este enlace es válido por 1 hora.'''
    mail.send(msg)


def send_confirmation_email(to_email, confirm_url):
    try:
        msg = Message(
            subject="Confirma tu cuenta en Embrace",
            recipients=[to_email],
            body=f"Por favor confirma tu cuenta:\n\n{confirm_url}",
            html=f'<p>Por favor confirma tu cuenta haciendo clic en: <a href="{confirm_url}">Confirmar Cuenta</a></p>'
        )
        mail.send(msg)
    except Exception as e:
        current_app.logger.error(f"Error enviando correo: {str(e)}")
        


# --- Endpoints ---

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data or not all(k in data for k in ("username", "email", "password")):
        return jsonify({"error": "Datos incompletos"}), 400

    if User.query.filter_by(email=data['email']).first():
        return jsonify({"error": "El correo ya está registrado"}), 400

    hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    new_user = User(
        username=data['username'],
        email=data['email'],
        password=hashed_password,
        is_verified=False
    )
    try:
        db.session.add(new_user)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Error al registrar usuario: {str(e)}"}), 500

    try:
        serializer = current_app.extensions['email_confirm_serializer']
        token = serializer.dumps(new_user.email, salt='email-confirm-salt')
        confirm_url = f"{get_base_url()}/api/auth/confirm_email/{token}"
        send_confirmation_email(new_user.email, confirm_url)
        return jsonify({"message": "Usuario registrado. Revisa tu correo para confirmar la cuenta."}), 201
    except Exception as e:
        return jsonify({"error": f"Error al enviar correo: {str(e)}"}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({"error": "Faltan credenciales"}), 400

    user = User.query.filter_by(email=data['email']).first()
    if not user or not bcrypt.check_password_hash(user.password, data['password']):
        return jsonify({"error": "Correo o contraseña incorrectos"}), 401

    if not user.is_verified:
        return jsonify({"error": "Debes confirmar tu correo antes de iniciar sesión."}), 403

    access_token = create_access_token(identity=str(user.id), expires_delta=timedelta(days=1))
    refresh_token = create_refresh_token(identity=str(user.id))
    return jsonify({
        "message": "Inicio de sesión exitoso.",
        "id": user.id,
        "username": user.username,
        "token": access_token,
        "refresh_token": refresh_token
    }), 200


@auth_bp.route('/confirm_email/<token>', methods=['GET'])
def confirm_email(token):
    serializer = URLSafeTimedSerializer(current_app.config['SECRET_KEY'])
    try:
        email = serializer.loads(token, salt='email-confirm-salt', max_age=3600)
    except SignatureExpired:
        return render_template('confirmation_error.html', message="El enlace ha expirado.")
    except BadSignature:
        return render_template('confirmation_error.html', message="El enlace es inválido.")

    user = User.query.filter_by(email=email).first()
    if not user:
        return render_template('confirmation_error.html', message="Usuario no encontrado.")
    if user.is_verified:
        return render_template('confirmation_success.html', message="Tu cuenta ya fue confirmada.")

    user.is_verified = True
    try:
        db.session.commit()
        return redirect("embrace://confirm?status=success")
    except Exception:
        db.session.rollback()
        return render_template('confirmation_error.html', message="Error al confirmar la cuenta.")


@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json()
    email = data.get('email')
    if not email:
        return jsonify({'message': 'El correo es obligatorio'}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'message': 'No se encontró una cuenta con ese correo.'}), 404

    # BUG CORREGIDO: era 'serializer', ahora es 'password_reset_serializer'
    serializer = current_app.extensions['password_reset_serializer']
    token = serializer.dumps(user.email, salt='password-reset-salt')
    reset_url = f"{get_base_url()}/api/auth/reset_password/{token}"
    send_reset_email(user.email, reset_url)
    return jsonify({'message': 'Se ha enviado un enlace de recuperación a tu correo.'}), 200


@auth_bp.route('/reset_password/<token>', methods=['POST'])
def reset_password(token):
    # BUG CORREGIDO: era 'serializer', ahora es 'password_reset_serializer'
    serializer = current_app.extensions['password_reset_serializer']
    try:
        email = serializer.loads(token, salt='password-reset-salt', max_age=3600)
    except Exception:
        return jsonify({"error": "El enlace ha expirado o es inválido."}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": "Usuario no encontrado."}), 404

    data = request.get_json()
    new_password = data.get('password')
    if not new_password:
        return jsonify({"error": "La nueva contraseña es obligatoria."}), 400

    user.password = bcrypt.generate_password_hash(new_password).decode('utf-8')
    db.session.commit()
    return jsonify({"message": "Contraseña actualizada con éxito."}), 200


@auth_bp.route('/google', methods=['POST'])
def google_login():
    code = request.json.get('code')
    if not code:
        return jsonify({"error": "No authorization code provided"}), 400

    token_url = "https://oauth2.googleapis.com/token"
    data = {
        "client_id": GOOGLE_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "code": code,
        "grant_type": "authorization_code",
        "redirect_uri": REDIRECT_URI
    }

    try:
        response = requests.post(token_url, data=data)
        response.raise_for_status()
        token_info = response.json()

        if "access_token" not in token_info:
            return jsonify({"error": "Failed to retrieve access token"}), 400

        user_info = requests.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {token_info['access_token']}"}
        ).json()

        base_username = user_info.get('name', '').lower().replace(' ', '_')
        username = base_username
        counter = 1
        while User.query.filter_by(username=username).first():
            username = f"{base_username}_{counter}"
            counter += 1

        user = User.query.filter(
            (User.email == user_info['email']) | (User.google_id == user_info.get('sub'))
        ).first()

        if not user:
            user = User(
                username=username,
                email=user_info['email'],
                password=generate_password_hash(str(uuid.uuid4())),
                is_verified=True,
                google_id=user_info.get('sub'),
                auth_provider='google'
            )
            db.session.add(user)
            db.session.commit()
        else:
            if not user.is_verified:
                user.is_verified = True
                if not user.google_id:
                    user.google_id = user_info.get('sub')
                    user.auth_provider = 'google'
                db.session.commit()

        access_token = create_access_token(identity=str(user.id))
        refresh_token = create_refresh_token(identity=str(user.id))
        return jsonify({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "token": access_token,
            "refresh_token": refresh_token
        }), 200

    except requests.exceptions.RequestException as e:
        return jsonify({"error": "Request to Google API failed", "details": str(e)}), 500
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Unexpected error", "details": str(e)}), 500


@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    jti = get_jwt()["jti"]
    try:
        db.session.add(TokenBlocklist(jti=jti))
        db.session.commit()
    except Exception:
        db.session.rollback()
        return jsonify({"error": "Error al cerrar sesión"}), 500
    return jsonify({"message": "Sesión cerrada exitosamente."}), 200


@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    identity = get_jwt_identity()
    access_token = create_access_token(identity=identity)
    return jsonify({"token": access_token}), 200
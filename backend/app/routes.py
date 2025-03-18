from flask import Blueprint, render_template, redirect, url_for, flash, session, jsonify, request, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_sqlalchemy import SQLAlchemy
from functools import wraps
from datetime import datetime, timezone, timedelta  # Importación correcta
from .forms import RegistrationForm, PregnancyDataForm, LoginForm, EditProfileForm, ResetPasswordRequestForm, ResetPasswordForm
from .models import User, PregnancyData
from . import db, bcrypt, mail
from .api.fetal_development_api import FetalDevelopmentData
from .api.posparto_api import PospartoData
from flask_mail import Message
from flask_jwt_extended import create_access_token
from datetime import timedelta
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired
from google.oauth2 import id_token
from werkzeug.security import generate_password_hash
import requests
import os
from urllib.parse import urlencode
import uuid
from flask_login import login_user
from urllib.parse import urlparse
import jwt


# Blueprints
fetal_api = Blueprint('fetal_development_api', __name__)
posparto_api = Blueprint('posparto_api', __name__)
routes = Blueprint('routes', __name__)
delete_account = Blueprint('delete_account', __name__)

# Configurar el serializador para generar tokens seguro
def get_serializer():
    return current_app.extensions.get('delete_account_serializer')

# Función decoradora para verificar JWT
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Obtener token del header Authorization
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
        
        if not token:
            # Fallback al método antiguo si no hay token
            user_id = session.get('user_id') or request.args.get('user_id')
            if not user_id:
                return jsonify({'error': 'Token de autenticación no proporcionado'}), 401
            return f(user_id=user_id, *args, **kwargs)
        
        try:
            # Decodificar el token (ajusta con tu SECRET_KEY)
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            user_id = data['user_id']
        except:
            return jsonify({'error': 'Token inválido o expirado'}), 401
            
        # Pasar el user_id a la función original
        return f(user_id=user_id, *args, **kwargs)
            
    return decorated



# Instancia de datos fetales
fetal_data = FetalDevelopmentData()
posparto_data = PospartoData()

#variables de google
GOOGLE_CLIENT_ID=os.getenv('GOOGLE_CLIENT_ID')
GOOGLE_CLIENT_SECRET=os.getenv('GOOGLE_CLIENT_SECRET')
REDIRECT_URI = "https://9e-production.up.railway.app/auth/callback"

# Decorador para verificar sesión del usuario
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not session.get('user_id'):
            flash('Debe iniciar sesión para acceder a esta página.', 'danger')
            return redirect(url_for('routes.login'))
        return f(*args, **kwargs)
    return decorated_function

def create_serializers(app):
    app.extensions['email_confirm_serializer'] = URLSafeTimedSerializer(app.config['SECRET_KEY'])
    app.extensions['password_reset_serializer'] = URLSafeTimedSerializer(app.config['SECRET_KEY'])
# Index
@routes.route('/')
def index():
    form = LoginForm()
    if 'user_id' in session:
        # Redirigir al dashboard si el usuario ya inició sesión
        return redirect(url_for('routes.dashboard'))
    return render_template('index.html', form=form)

# Dashboard
@routes.route('/dashboard')
@login_required
def dashboard():
    user_id = session.get('user_id')
    last_record = PregnancyData.query.filter_by(user_id=user_id).order_by(PregnancyData.id.desc()).first()

    current_week = None
    progress_percentage = 0
    week_info = None
    image_path = None

    if last_record and last_record.last_period_date:
        today = datetime.now().date()
        days_since_period = (today - last_record.last_period_date).days
        current_week = max(1, days_since_period // 7)
        progress_percentage = (current_week / 40) * 100

        # Determinar la imagen
        month = week_to_month(current_week)
        image_path = f"/static/images/development/month{month}.png"

        # Obtener datos de la API fetal
        week_info = fetal_data.get_week_info(current_week)

    return render_template(
        'dashboard.html',
        last_record=last_record,
        current_week=current_week,
        progress_percentage=progress_percentage,
        week_info=week_info,
        image_path=image_path
    )

# Login
@routes.route('/login', methods=['GET', 'POST'])
def login():
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(email=form.email.data).first()
        if user and bcrypt.check_password_hash(user.password, form.password.data):
            session['user_id'] = user.id
            session['username'] = user.username
            flash('Inicio de sesión exitoso.', 'success')

            # Obtener la URL previa de `next`
            next_page = request.args.get('next')

            # Validar que `next_page` sea una ruta interna y no una URL absoluta
            if next_page:
                parsed_url = urlparse(next_page)
                if parsed_url.netloc == "":  # Asegura que no sea una URL absoluta
                    return redirect(next_page)

            return redirect(url_for('routes.dashboard'))
        else:
            flash('Correo o contraseña incorrectos.', 'danger')

    return render_template('login.html', form=form)

# Registro de Usuario
@routes.route('/registro', methods=['GET', 'POST'])
def register():
    form = RegistrationForm()
    if form.validate_on_submit():
        hashed_password = bcrypt.generate_password_hash(form.password.data).decode('utf-8')
        new_user = User(
            username=form.username.data,
            email=form.email.data,
            password=hashed_password
        )
        try:
            db.session.add(new_user)
            db.session.commit()
            flash('Cuenta creada con éxito.', 'success')
            return redirect(url_for('routes.login'))
        except Exception as e:
            db.session.rollback()
            flash(f'Error al guardar el usuario: {str(e)}', 'danger')

    return render_template('registro.html', form=form)

# Registro de datos de embarazo
@routes.route('/embarazo/nuevo', methods=['GET', 'POST'])
@login_required
def nuevo_registro_embarazo():
    form = PregnancyDataForm()
    user_id = session.get('user_id')

    # Consulta el último registro de embarazo del usuario
    last_record = PregnancyData.query.filter_by(user_id=user_id).order_by(PregnancyData.id.desc()).first()

    # Prellenar el formulario con la fecha del último período si existe
    if last_record and last_record.last_period_date:
        form.last_period_date.data = last_record.last_period_date

    if form.validate_on_submit():
        # Calcular la semana automáticamente
        today = datetime.utcnow().date()
        days_since_period = (today - form.last_period_date.data).days
        calculated_week = max(1, days_since_period // 7)

        nuevo_dato = PregnancyData(
            user_id=user_id,
            week=calculated_week,
            weight=form.weight.data,
            symptoms=form.symptoms.data,
            notes=form.notes.data,
            last_period_date=form.last_period_date.data
        )
        try:
            db.session.add(nuevo_dato)
            db.session.commit()
            flash('Registro de embarazo guardado con éxito.', 'success')
            return redirect(url_for('routes.ver_registros_embarazo'))
        except Exception as e:
            db.session.rollback()
            flash(f'Error al guardar el registro: {str(e)}', 'danger')

    return render_template('nuevo_embarazo.html', form=form)

# Ver registros de embarazo
@routes.route('/embarazo', methods=['GET'])
@login_required
def ver_registros_embarazo():
    user_id = session.get('user_id')
    registros = PregnancyData.query.filter_by(user_id=user_id).all()
    return render_template('ver_embarazo.html', registros=registros)

# Perfil de usuario
@routes.route('/mi-perfil')
@login_required
def mi_perfil():
    user_id = session.get('user_id')
    user = User.query.get(user_id)

    last_record = PregnancyData.query.filter_by(user_id=user_id).order_by(PregnancyData.id.desc()).first()
    current_week = None
    week_info = None

    if last_record and last_record.last_period_date:
        today = datetime.now().date()
        days_since_period = (today - last_record.last_period_date).days
        current_week = max(1, days_since_period // 7)
        progress_percentage = (current_week / 40) * 100
    else:
        progress_percentage = 0  # Asegúrate de definir un valor por defecto

    return render_template(
        'mi_perfil.html',
        user=user,
        last_record=last_record,
        current_week=current_week,
        week_info=week_info
    )

# Editar perfil
@routes.route('/editar-perfil', methods=['GET', 'POST'])
@login_required
def editar_perfil():
    user_id = session.get('user_id')
    user = User.query.get(user_id)
    if not user:
        flash('Usuario no encontrado.', 'danger')
        return redirect(url_for('routes.login'))

    form = EditProfileForm(obj=user)

    if form.validate_on_submit():
        user.username = form.username.data
        user.email = form.email.data
        try:
            db.session.commit()
            flash('Perfil actualizado con éxito.', 'success')
            return redirect(url_for('routes.mi_perfil'))
        except:
            db.session.rollback()
            flash('Error al actualizar el perfil.', 'danger')

    return render_template('editar_perfil.html', form=form, user=user)

# API: Obtener desarrollo fetal
@fetal_api.route('/fetal-development/<int:week>', methods=['GET'])
def get_fetal_development(week):
    week_info = fetal_data.get_week_info(week)
    if not week_info:
        return jsonify({"error": "Datos no disponibles para esta semana"}), 404
    return jsonify(week_info), 200


# mes segun semana
def week_to_month(week):
    if week <= 4:
        return 1
    elif week <= 8:
        return 2
    elif week <= 12:
        return 3
    elif week <= 16:
        return 4
    elif week <= 20:
        return 5
    elif week <= 24:
        return 6
    elif week <= 28:
        return 7
    elif week <= 32:
        return 8
    else:
        return 9


# Logout
@routes.route('/logout')
def logout():
    session.clear()  # Limpia toda la sesión
    flash('Has cerrado sesión correctamente.', 'success')
    return redirect(url_for('routes.index'))  # Redirige al inicio

# Solicitar restablecimiento de contraseña
@routes.route('/reset_password', methods=['GET', 'POST'])
def reset_password_request():
    form = ResetPasswordRequestForm()
    if form.validate_on_submit():
        user = User.query.filter_by(email=form.email.data).first()
        if user:
            # Generar token de recuperación
            serializer = current_app.extensions['password_reset_serializer']
            token = serializer.dumps(user.email, salt='password-reset-salt')
            reset_url = url_for('routes.reset_password', token=token, _external=True)
            print(f'URL generada: {reset_url}')
            send_reset_email(user.email, reset_url)

            # Agregar mensaje para SweetAlert2
            flash('Se ha enviado un enlace de recuperación a su correo.', 'success')
        else:
            # Agregar mensaje de error para SweetAlert2
            flash('No se encontró una cuenta con ese correo.', 'danger')
        return redirect(url_for('routes.reset_password_request'))
    return render_template('reset_password.html', form=form)

# Página para restablecer contraseña
@routes.route('/reset_password/<token>', methods=['GET', 'POST'])
def reset_password(token):
    try:
        serializer = current_app.extensions['password_reset_serializer']  # Asegurar que se usa el serializer correcto
        email = serializer.loads(token, salt='password-reset-salt', max_age=3600)
    except Exception:
        flash('El enlace de recuperación ha expirado o es inválido.', 'danger')
        return redirect(url_for('routes.reset_password_request'))  # Asegurar que esta ruta es correcta

    user = User.query.filter_by(email=email).first_or_404()
    form = ResetPasswordForm()

    if form.validate_on_submit():
        user.password = bcrypt.generate_password_hash(form.password.data).decode('utf-8')
        db.session.commit()
        flash('Tu contraseña ha sido actualizada con éxito.', 'success')
        return redirect(url_for('routes.login'))

    return render_template('reset_password_form.html', form=form)

# Enviar correo de recuperación
def send_reset_email(to_email, reset_url):
    msg = Message('Restablecimiento de Contraseña', recipients=[to_email])
    msg.body = f'''
    Para restablecer su contraseña, haga clic en el siguiente enlace:
    {reset_url}

    Este enlace es válido por 1 hora.
    '''
    mail.send(msg)

#confirmar correo
def send_confirmation_email(to_email, confirm_url):
    try:
        msg = Message(
            subject="Confirma tu cuenta en Embrace",
            recipients=[to_email],
            body=f"Hola,\n\nPor favor confirma tu cuenta haciendo clic en el siguiente enlace:\n\n{confirm_url}\n\nSi no solicitaste esto, ignora este correo.",
            html=f"""
                <p>Hola,</p>
                <p>Por favor confirma tu cuenta haciendo clic en el siguiente enlace:</p>
                <p><a href="{confirm_url}">Confirmar Cuenta</a></p>
                <p>Si no solicitaste esto, ignora este correo.</p>
            """
        )
        mail.send(msg)
    except Exception as e:
        current_app.logger.error(f"Error enviando correo de confirmación: {str(e)}")
        raise
 

# Solicitar eliminación de cuenta
@delete_account.route('/solicitar-eliminacion', methods=['GET', 'POST'])
def solicitar_eliminacion():
    if request.method == 'GET':
        # Mostrar formulario para solicitar eliminación
        return render_template('solicitar_eliminacion.html')
    
    # Para solicitudes POST desde el formulario
    email = request.form.get('email')
    
    user = User.query.filter_by(email=email).first()
    if not user:
        flash("Usuario no encontrado.", "error")
        return redirect(url_for('delete_account.solicitar_eliminacion'))
    
    serializer = get_serializer()
    if not serializer:
        flash("Error interno del servidor", "error")
        return redirect(url_for('delete_account.solicitar_eliminacion'))
            
    # Generar token de verificación
    token = serializer.dumps(email, salt='delete-account')
    confirm_url = url_for('delete_account.confirmar_eliminacion', token=token, _external=True)
   
    # Enviar correo de confirmación
    msg = Message("Confirmar eliminación de cuenta", sender=os.getenv("MAIL_DEFAULT_SENDER"), recipients=[email])
    msg.body = f"Hola {user.username},\n\nHaz clic en el siguiente enlace para confirmar la eliminación de tu cuenta:\n{confirm_url}\n\nSi no solicitaste esto, ignora este mensaje."
    mail.send(msg)
   
    flash("Se ha enviado un correo de confirmación a tu dirección de email.", "success")
    return redirect(url_for('routes.index'))

# Confirmar eliminación de cuenta
@delete_account.route('/confirmar-eliminacion/<token>', methods=['GET'])
def confirmar_eliminacion(token):
    serializer = get_serializer()
    if not serializer:
        return render_template('error.html', error="Error interno del servidor"), 500
    
    try:
        email = serializer.loads(token, salt='delete-account', max_age=3600)
    except SignatureExpired:
        return render_template('error.html', error="El enlace ha expirado."), 400
    except BadSignature:
        return render_template('error.html', error="El enlace es inválido."), 400
    
    user = User.query.filter_by(email=email).first()
    if not user:
        return render_template('error.html', error="Usuario no encontrado."), 404
    
    db.session.delete(user)
    db.session.commit()
   
    return render_template('cuenta_eliminada.html', message="Cuenta eliminada con éxito.")

# Ruta para la página sin token
@delete_account.route('/confirmar-eliminacion', methods=['GET'])
def confirmar_eliminacion_sin_token():
    return render_template('error.html', error="Se requiere un token válido para eliminar la cuenta."), 400


#Endpoints para la API
#API olvido de contraseña
@routes.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json()  # Obtener datos JSON enviados desde el frontend
    email = data.get('email')

    if not email:
        return jsonify({'message': 'El correo es obligatorio'}), 400

    user = User.query.filter_by(email=email).first()
    if user:
        # Generar token de recuperación
        serializer = current_app.extensions['password_reset_serializer']
        token = serializer.dumps(user.email, salt='password-reset-salt')
        reset_url = url_for('routes.reset_password', token=token, _external=True)
        send_reset_email(user.email, reset_url)

        return jsonify({'message': 'Se ha enviado un enlace de recuperación a tu correo.'}), 200
    else:
        return jsonify({'message': 'No se encontró una cuenta con ese correo.'}), 404

# API: Registrar usuario
@routes.route('/register2', methods=['POST'])
def register_user():
    data = request.get_json()
    if not data or not all(key in data for key in ("username", "email", "password")):
        return jsonify({"error": "Datos incompletos"}), 400

    # Verificar si el correo ya está registrado
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
        print(f"Error en el registro: {str(e)}") 
        return jsonify({"error": "No se pudo registrar el usuario. Intenta más tarde."}), 500

    try:
        serializer = current_app.extensions['email_confirm_serializer'] 
        token = serializer.dumps(new_user.email, salt='email-confirm-salt')       
        confirm_url = url_for('routes.confirm_email', token=token, _external=True)
        send_confirmation_email(new_user.email, confirm_url)

        return jsonify({"message": "Usuario registrado exitosamente. Revisa tu correo para confirmar la cuenta."}), 201
    except Exception as e:
        print(f"Error al enviar correo: {str(e)}")  # No mostrar este error al usuario
        return jsonify({"error": "Registro exitoso, pero hubo un problema enviando el correo. Contacta al soporte."}), 500

#Endpoint para confirmar
@routes.route('/confirm_email/<token>', methods=['GET'])
def confirm_email(token):
    serializer = URLSafeTimedSerializer(current_app.config['SECRET_KEY'])
    try:
        email = serializer.loads(token, salt='email-confirm-salt', max_age=3600)
    except SignatureExpired:
        # Token expirado
        return render_template('confirmation_error.html', message="El enlace de confirmación ha expirado.")
    except BadSignature:
        # Token inválido
        return render_template('confirmation_error.html', message="El enlace de confirmación es inválido.")

    user = User.query.filter_by(email=email).first()
    if not user:
        return render_template('confirmation_error.html', message="Usuario no encontrado.")

    if user.is_verified:
        return render_template('confirmation_success.html', message="Tu cuenta ya ha sido confirmada.")

    user.is_verified = True
    try:
        db.session.commit()
        # Redirigir a la aplicación móvil mediante Deep Linking
        return redirect(f"embrace://confirm?status=success")
    except Exception as e:
        db.session.rollback()
        return render_template('confirmation_error.html', message="Ocurrió un error al confirmar tu cuenta.")
        
# API: Obtener datos del dashboard
@routes.route('/api/dashboard', methods=['GET'])
@jwt_required()
def get_dashboard_data():
    try:
        user_id = get_jwt_identity()  # Obtiene el user_id del JWT
        print(f"🔹 User ID desde JWT en dashboard: {user_id}")  # Depuración

        if not user_id:
            return jsonify({"error": "Token inválido o expirado"}), 401

        # Obtener el último registro de embarazo del usuario
        last_record = PregnancyData.query.filter_by(user_id=user_id).order_by(PregnancyData.id.desc()).first()

        if not last_record or not last_record.last_period_date:
            return jsonify({"error": "No hay datos de embarazo registrados"}), 404

        # Calcula la semana actual
        today = datetime.now().date()
        days_since_period = (today - last_record.last_period_date).days
        current_week = max(1, days_since_period // 7)

        # Obtiene los datos fetales para la semana actual
        week_info = fetal_data.get_week_info(current_week)

        if not week_info:
            return jsonify({"error": "Datos fetales no disponibles para esta semana"}), 404

        month = week_to_month(current_week)

        return jsonify({
            "current_week": current_week,
            "progress_percentage": (current_week / 40) * 100,
            "month": month,
            "week_info": week_info,
            "last_record": {
                "id": last_record.id,
                "weight": last_record.weight,
                "symptoms": last_record.symptoms,
                "notes": last_record.notes,
                "last_period_date": last_record.last_period_date.strftime('%Y-%m-%d'),
            },
        }), 200

    except Exception as e:
        print(f"🔴 Error en /api/dashboard: {str(e)}")  # Depuración
        return jsonify({"error": "Error interno del servidor"}), 500

@routes.route('/api/mi-perfil', methods=['GET'])
@jwt_required()
def api_mi_perfil():
    try:
        user_id = get_jwt_identity()  # Obtiene el user_id desde el token
        print(f"🔹 User ID desde JWT: {user_id}")  # Depuración

        if not user_id:
            return jsonify({"error": "Token inválido o expirado"}), 401

        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "Usuario no encontrado"}), 404

        last_record = PregnancyData.query.filter_by(user_id=user_id).order_by(PregnancyData.id.desc()).first()
        print(f"🔹 Último registro encontrado: {last_record}")  # Depuración

        current_week = None
        progress_percentage = 0

        if last_record and last_record.last_period_date:
            today = datetime.now().date()
            days_since_start = (today - last_record.last_period_date).days
            current_week = max(1, min(days_since_start // 7, 40))
            progress_percentage = (current_week / 40) * 100

        return jsonify({
            "username": user.username,
            "email": user.email,
            "current_week": current_week,
            "progress_percentage": progress_percentage,
            "last_record": {
                "perdiod_date": last_record.last_period_date.strftime("%Y-%m-%d") if last_record else None,
                "week": last_record.week if last_record else None,
                "weight": last_record.weight if last_record else None,
                "symptoms": last_record.symptoms if last_record else None,
                "notes": last_record.notes if last_record else None,
            }
        }), 200

    except Exception as e:
        print(f"🔴 Error en /api/mi-perfil: {str(e)}")  # Depuración
        return jsonify({"error": "Internal server error"}), 500


# API: Editar perfil    
@routes.route('/api/editar-perfil', methods=['POST'])
@login_required
def api_editar_perfil():
    user_id = session.get('user_id')
    user = User.query.get(user_id)

    if not user:
        return jsonify({"error": "Usuario no encontrado"}), 404

    data = request.get_json()
    user.username = data.get('username', user.username)
    user.email = data.get('email', user.email)

    try:
        db.session.commit()
        return jsonify({"message": "Perfil actualizado con éxito"}), 200
    except:
        db.session.rollback()
        return jsonify({"error": "Error al actualizar el perfil"}), 500
    
# Login
@routes.route('/login2', methods=['GET', 'POST'])
def login2():
    form = LoginForm()
    if request.method == 'POST':
        data = request.get_json()  # Obtener datos JSON del cliente
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({"error": "Faltan credenciales"}), 400
            
        user = User.query.filter_by(email=email).first()
        
        if user and bcrypt.check_password_hash(user.password, password):
            # Confirmar que el usuario está verificado
            if not user.is_verified:
                return jsonify({"error": "Debes confirmar tu correo antes de iniciar sesión."}), 403

            # Crear el token JWT
            expires = timedelta(days=1)  # Token válido por 1 día
            access_token = create_access_token(identity=str(user.id), expires_delta=expires)
            
            # Datos de sesión
            session['user_id'] = user.id
            session['username'] = user.username
            
            return jsonify({
                "message": "Inicio de sesión exitoso.",
                "id": user.id,
                "username": user.username,
                "token": access_token
            }), 200
        else:
            return jsonify({"error": "Correo o contraseña incorrectos"}), 401

    return render_template('index.html', form=form)

# API para manejar datos de embarazo
@routes.route('/api/embarazos', methods=['GET', 'POST'])
@jwt_required()
def manejar_registros_embarazo():
    try:
        user_id = get_jwt_identity()  # Obtiene el user_id del JWT
        print(f"🔹 User ID desde JWT en embarazos: {user_id}")  # Depuración

        if request.method == 'GET':
            # Obtener registros del usuario autenticado, ordenados por fecha del último período (descendente)
            registros = PregnancyData.query.filter_by(user_id=user_id).order_by(PregnancyData.last_period_date.desc()).all()

            registros_serializados = [
                {
                    "id": r.id,
                    "week": r.calculate_week(),  # Llamar al método si es necesario
                    "weight": r.weight,
                    "symptoms": r.symptoms,
                    "notes": r.notes,
                    "is_postpartum": r.is_postpartum,
                    "last_period_date": r.last_period_date.strftime('%Y-%m-%d') if r.last_period_date else "",
                    "due_date": r.due_date.strftime('%Y-%m-%d') if r.due_date else "",
                }
                for r in registros
            ]
            return jsonify(registros_serializados), 200

        elif request.method == 'POST':
            try:
                data = request.get_json()

                # Validación de campos obligatorios
                required_fields = ['last_period_date', 'weight']
                missing_fields = [field for field in required_fields if field not in data]
                if missing_fields:
                    return jsonify({"error": f"Faltan campos obligatorios: {', '.join(missing_fields)}"}), 400

                # Validar fecha del último período
                try:
                    last_period_date = datetime.strptime(data['last_period_date'], '%Y-%m-%d').date()
                except ValueError:
                    return jsonify({"error": "El formato de la fecha debe ser YYYY-MM-DD"}), 400

                # Validar weight (debe ser un número positivo)
                try:
                    weight = float(data['weight'])
                    if weight <= 0:
                        return jsonify({"error": "'weight' debe ser un número positivo"}), 400
                except (ValueError, TypeError):
                    return jsonify({"error": "'weight' debe ser un número válido"}), 400

                # Determinar fecha de parto (opcional, se calcula si no se envía)
                due_date = data.get('due_date')
                if due_date:
                    try:
                        due_date = datetime.strptime(due_date, '%Y-%m-%d').date()
                    except ValueError:
                        return jsonify({"error": "El formato de la fecha de parto debe ser YYYY-MM-DD"}), 400
                else:
                    due_date = last_period_date + timedelta(days=280)  # Calcula la fecha de parto estimada

                # Calcular la semana de embarazo automáticamente
                today = datetime.utcnow().date()
                delta = today - last_period_date
                week = max(1, delta.days // 7)  # Al menos 1 semana

                # Crear nuevo registro
                nuevo_registro = PregnancyData(
                    user_id=user_id,  # Se obtiene del JWT
                    last_period_date=last_period_date,
                    due_date=due_date,
                    weight=weight,
                    symptoms=data.get('symptoms', ''),
                    notes=data.get('notes', ''),
                    week=week
                )

                # Guardar en la base de datos
                db.session.add(nuevo_registro)
                db.session.commit()
                return jsonify({"message": "Registro de embarazo añadido correctamente"}), 201

            except Exception as e:
                db.session.rollback()
                print(f"🔴 Error en /api/embarazos: {str(e)}")  # Para depuración
                return jsonify({"error": "Error interno del servidor"}), 500

    except Exception as e:
        print(f"🔴 Error general en /api/embarazos: {str(e)}")  # Para depuración
        return jsonify({"error": "Error interno del servidor"}), 500

#Eliminar registro de embarazo
@routes.route('/api/embarazos/<int:id>', methods=['DELETE'])
@jwt_required()
def eliminar_registro_embarazo(id):
    try:
        # Buscar el registro por ID único
        registro = PregnancyData.query.get(id)

        if not registro:
            return jsonify({"error": "Registro no encontrado"}), 404

        # Eliminar el registro de la base de datos
        db.session.delete(registro)
        db.session.commit()

        return jsonify({"message": "Registro eliminado correctamente"}), 200

    except Exception as e:
        # Manejo de excepciones y rollback
        db.session.rollback()
        return jsonify({"error": f"Error al eliminar el registro: {str(e)}"}), 500



@routes.route("/auth/callback")
def auth_callback():
    code = request.args.get("code")
    print(f"Authorization Code: {code}")
    print(f"Received redirect_uri: {request.args.get('redirect_uri')}")  # Imprime el código recibido para verificar que es correcto

    if not code:
        return jsonify({"error": "No authorization code provided"}), 400

    # Intercambiar el código por un token de acceso
    token_url = "https://oauth2.googleapis.com/token"
    data = {
        "client_id": GOOGLE_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "code": code,
        "grant_type": "authorization_code",
        "redirect_uri": REDIRECT_URI 
    }

    print(f"Request data: {data}") 

    print(f"Data being sent to Google: {data}")  # Imprime los datos enviados a Google

    try:
        response = requests.post(token_url, data=data)
        response.raise_for_status()  # Si la respuesta no es 2xx, se lanza una excepción
        token_info = response.json()

        print(f"Google response: {token_info}")  # Imprime la respuesta de Google

        if "access_token" not in token_info:
            print(f"Error: {token_info}")  # Si no se recibe el token, imprime el error
            return jsonify({"error": "Failed to retrieve access token", "details": token_info}), 400

        # Obtener información del usuario
        user_info_url = "https://www.googleapis.com/oauth2/v2/userinfo"
        headers = {"Authorization": f"Bearer {token_info['access_token']}"}
        user_info = requests.get(user_info_url, headers=headers).json()

        return jsonify({"user": user_info})

    except requests.exceptions.RequestException as e:
        print(f"Error during the request: {e}")  # Imprime el error si la solicitud falla
        return jsonify({"error": "Request to Google API failed", "details": str(e)}), 500


# Autenticación con Google
@routes.route("/auth/google")
def auth_google():
    # Redirige a Google OAuth para obtener el código
    google_oauth_url = "https://accounts.google.com/o/oauth2/v2/auth"
    params = {
        'client_id': GOOGLE_CLIENT_ID,
        'redirect_uri': 'https://9e-production.up.railway.app/auth/callback',  
        'response_type': 'code',
        'scope': 'openid profile email',
        'access_type': 'offline'
    }
    return redirect(f"{google_oauth_url}?{urlencode(params)}")

@routes.route("/auth/google", methods=['POST'])
def handle_google_login():
    token = request.json.get('token')
    if not token:
        return jsonify({"error": "No token provided"}), 400
   
    try:
        print(f"token recibido: {token}")
        user_info_url = "https://www.googleapis.com/oauth2/v2/userinfo"
        headers = {"Authorization": f"Bearer {token}"}
        user_info = requests.get(user_info_url, headers=headers).json()
        print(f"Google response: {user_info}")
        
        # Primero buscar por google_id que es único
        user = User.query.filter_by(google_id=user_info.get('id')).first()
        print(f"Búsqueda por google_id: {user}")
        
        if not user:
            # Si no se encuentra por google_id, buscar por email
            user = User.query.filter_by(email=user_info['email']).first()
            print(f"Búsqueda por email: {user}")
        
        if not user:
            # Crear nuevo usuario si no existe
            base_username = user_info.get('name', '').lower().replace(' ', '')
            username = base_username
            counter = 1
            
            while User.query.filter_by(username=username).first():
                username = f"{base_username}_{counter}"
                counter += 1
            
            user = User(
                username=username,
                email=user_info['email'],
                password=generate_password_hash(str(uuid.uuid4())),
                is_verified=True,
                google_id=user_info.get('id'),  # Cambiado de 'sub' a 'id'
                auth_provider='google'
            )
            try:
                db.session.add(user)
                db.session.commit()
                print(f"Nuevo usuario creado: {user.id} - {user.email}")
            except Exception as e:
                db.session.rollback()
                print(f"Error al crear usuario: {str(e)}")
                return jsonify({"error": "Error creating user", "details": str(e)}), 500
        else:
            # Actualizar información del usuario existente
            if not user.google_id:
                user.google_id = user_info.get('id')
                user.auth_provider = 'google'
            user.is_verified = True
            try:
                db.session.commit()
                print(f"Usuario actualizado: {user.id} - {user.email}")
            except Exception as e:
                db.session.rollback()
                print(f"Error al actualizar usuario: {str(e)}")
                return jsonify({"error": "Error updating user", "details": str(e)}), 500
        
        # Generar token de acceso JWT
        access_token = create_access_token(identity=str(user.id))
        
        response_data = {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "token": access_token
        }
        print(f"Respuesta final: {response_data}")
        return jsonify(response_data)
   
    except requests.exceptions.RequestException as e:
        print(f"Error en request a Google: {str(e)}")
        return jsonify({"error": "Request to Google API failed", "details": str(e)}), 500
    except Exception as e:
        print(f"Error inesperado: {str(e)}")
        return jsonify({"error": "Unexpected error", "details": str(e)}), 500
    finally:
        db.session.remove()
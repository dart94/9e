from flask import Blueprint, render_template, redirect, url_for, flash, session, jsonify, request, current_app
from functools import wraps
from datetime import datetime, timezone, timedelta  # Importación correcta
from .forms import RegistrationForm, PregnancyDataForm, LoginForm, EditProfileForm, ResetPasswordRequestForm, ResetPasswordForm
from .models import User, PregnancyData
from . import db, bcrypt, mail
from .api.fetal_development_api import FetalDevelopmentData
from flask_mail import Message
from flask_jwt_extended import create_access_token
from datetime import timedelta
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired


# Blueprints
fetal_api = Blueprint('fetal_development_api', __name__)
routes = Blueprint('routes', __name__)

# Instancia de datos fetales
fetal_data = FetalDevelopmentData()

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
        email = current_app.extensions['serializer'].loads(token, salt='password-reset-salt', max_age=3600)
    except Exception:
        flash('El enlace de recuperación ha expirado o es inválido.', 'danger')
        return redirect(url_for('routes.reset_password_request'))

    user = User.query.filter_by(email=email).first_or_404()
    form = ResetPasswordForm()

    if form.validate_on_submit():
        # Actualizar contraseña
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
        serializer = current_app.extensions['serializer']
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
    
    # Importante: is_confirmed=False por defecto
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
        confirm_url = url_for('routes.confirm_email', token=token, _external=True)
        # Enviar el correo de confirmación
        send_confirmation_email(new_user.email, confirm_url)

        return jsonify({"message": "Usuario registrado exitosamente. Revisa tu correo para confirmar la cuenta."}), 201
    except Exception as e:
        return jsonify({"error": f"Error al enviar correo de confirmación: {str(e)}"}), 500

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
def get_dashboard_data():
    user_id = session.get('user_id') or request.args.get('user_id')
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

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

# API: Obtener registros del perfil
@routes.route('/api/mi-perfil', methods=['GET'])
def api_mi_perfil():
    user_id = request.args.get('user_id')
    user = User.query.get(user_id)

    if not user:
        return jsonify({"error": "Usuario no encontrado"}), 404

    last_record = PregnancyData.query.filter_by(user_id=user_id).order_by(PregnancyData.id.desc()).first()
    current_week = None
    progress_percentage = 0

    if last_record and last_record.last_period_date:
        today = datetime.now().date()
        days_since_period = (today - last_record.last_period_date).days
        current_week = max(1, days_since_period // 7)
        progress_percentage = (current_week / 40) * 100

    return jsonify({
        "username": user.username,
        "email": user.email,
        "current_week": current_week,
        "progress_percentage": progress_percentage,
        "last_record": {
            "weight": last_record.weight if last_record else None,
            "symptoms": last_record.symptoms if last_record else None,
            "notes": last_record.notes if last_record else None,
        }
    }), 200
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
            #confirmar usuario:
            if not user.is_verified:
                return jsonify({"error": "Debes confirmar tu correo antes de iniciar sesión."}), 403
            # Crear token JWT
            expires = timedelta(days=1)  # Token válido por 1 día
            access_token = create_access_token(
                identity=user.id,
                expires_delta=expires
            )
            
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
            
    # Para solicitudes GET, renderizar el formulario de inicio de sesión
    return render_template('index.html', form=form)


@routes.route('/api/embarazos', methods=['GET', 'POST', 'DELETE'])
def manejar_registros_embarazo():
    if request.method == 'GET':
        # Obtener user_id de los parámetros de la URL
        user_id = session.get('user_id') or request.args.get('user_id')  # Cambiar a `request.args`
        if not user_id:
            return jsonify({"error": "Usuario no autenticado"}), 401

        # Lógica para manejar el GET
        registros = PregnancyData.query.filter_by(user_id=user_id).all()
        if not registros:
            return jsonify([])  # Devuelve una lista vacía si no hay registros

        registros_serializados = [
            {
                "week": r.week,
                "weight": r.weight,
                "symptoms": r.symptoms,
                "notes": r.notes,
                "last_period_date": r.last_period_date.strftime('%Y-%m-%d') if r.last_period_date else None
            }
            for r in registros
        ]
        return jsonify(registros_serializados), 200

    elif request.method == 'POST':
    # Obtén los datos del cuerpo de la solicitud
        data = request.get_json()

        # Validación de campos obligatorios
        if not data or not data.get('last_period_date') or not data.get('weight') or not data.get('user_id'):
            return jsonify({"error": "Faltan campos obligatorios: 'user_id', 'last_period_date', y 'weight'"}), 400

        try:
            last_period_date = datetime.strptime(data.get('last_period_date'), '%Y-%m-%d').date()
        except ValueError:
            return jsonify({"error": "El formato de la fecha debe ser YYYY-MM-DD"}), 400

        # Extraer user_id
        user_id = data.get('user_id')
        # Convertir a número entero si es necesario
        try:
            user_id = int(user_id)
        except (ValueError, TypeError):
            return jsonify({"error": "'user_id' debe ser un número entero"}), 400

        # Calcula la semana si no se proporciona
        week = data.get('week')
        if not week:
            # Utiliza la lógica para calcular la semana basada en last_period_date
            today = datetime.utcnow().date()
            delta = today - last_period_date
            week = max(1, delta.days // 7)  # Al menos 1 semana

        # Crea un nuevo registro de embarazo
        nuevo_registro = PregnancyData(
            user_id=user_id,
            last_period_date=last_period_date,
            weight=float(data.get('weight')),
            symptoms=data.get('symptoms'),
            notes=data.get('notes'),
            week=week,
        )

        try:
            # Guarda el nuevo registro en la base de datos
            db.session.add(nuevo_registro)
            db.session.commit()
            return jsonify({"message": "Registro de embarazo añadido correctamente"}), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": f"Error al guardar en la base de datos: {str(e)}"}), 500
    elif request.method == 'DELETE':
        # Obtener parámetros de la solicitud
        user_id = request.args.get('user_id')
        week = request.args.get('week')

        if not user_id or not week:
            return jsonify({"error": "Faltan los parámetros 'user_id' y 'week'"}), 400

        try:
            # Buscar el registro por `user_id` y `week`
            registro = PregnancyData.query.filter_by(user_id=user_id, week=week).first()

            if not registro:
                return jsonify({"error": "Registro no encontrado"}), 404

            # Eliminar el registro de la base de datos
            db.session.delete(registro)
            db.session.commit()
            return jsonify({"message": "Registro eliminado correctamente"}), 200

        except Exception as e:
            db.session.rollback()
            return jsonify({"error": f"Error al eliminar el registro: {str(e)}"}), 500
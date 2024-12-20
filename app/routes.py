from flask import Blueprint, render_template, redirect, url_for, flash, session, jsonify, request
from functools import wraps
from datetime import datetime, timezone  # Importación correcta
from .forms import RegistrationForm, PregnancyDataForm, LoginForm, EditProfileForm
from .models import User, PregnancyData
from . import db, bcrypt
from app.api.fetal_development_api import FetalDevelopmentData

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

# Index
@routes.route('/')
def index():
    return render_template('index.html')

# Dashboard
@routes.route('/dashboard')
@login_required
def dashboard():
    user_id = session.get('user_id')
    last_record = PregnancyData.query.filter_by(user_id=user_id).order_by(PregnancyData.id.desc()).first()

    current_week = None
    progress_percentage = 0
    week_info = None

    if last_record and last_record.last_period_date:
        today = datetime.now().date()
        days_since_period = (today - last_record.last_period_date).days
        current_week = max(1, days_since_period // 7)
        progress_percentage = (current_week / 40) * 100
        week_info = fetal_data.get_week_info(current_week)

    return render_template(
        'dashboard.html',
        last_record=last_record,
        current_week=current_week,
        progress_percentage=progress_percentage,
        week_info=week_info
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
        week_info = fetal_data.get_week_info(current_week)

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

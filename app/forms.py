from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField, IntegerField, FloatField
from wtforms.validators import DataRequired, Length, Email, EqualTo, NumberRange, Optional
from wtforms import DateField



# Formularios para la página de registro
class RegistrationForm(FlaskForm):
    username = StringField('Nombre de Usuario', validators=[
        DataRequired(), Length(min=4, max=25)
    ])
    email = StringField('Correo Electrónico', validators=[
        DataRequired(), Email()
    ])
    password = PasswordField('Contraseña', validators=[
        DataRequired(), Length(min=6)
    ])
    confirm_password = PasswordField('Confirmar Contraseña', validators=[
        DataRequired(), EqualTo('password', message='Las contraseñas deben coincidir')
    ])
    submit = SubmitField('Registrarse')

# Formularios para la página de inicio de sesión
class LoginForm(FlaskForm):
    email = StringField('Correo Electrónico', validators=[DataRequired(), Email()])
    password = PasswordField('Contraseña', validators=[DataRequired()])
    submit = SubmitField('Iniciar Sesión')

# Formulario para editar perfil
class EditProfileForm(FlaskForm):
    username = StringField('Nombre de Usuario', validators=[DataRequired(), Length(min=4, max=25)])
    email = StringField('Correo Electrónico', validators=[DataRequired(), Email()])
    submit = SubmitField('Actualizar Perfil')

# Formulario para registrar datos de embarazo
class PregnancyDataForm(FlaskForm):
    last_period_date = DateField('Fecha del Último Período (FUM)', format='%Y-%m-%d', validators=[
        DataRequired(message="Este campo es obligatorio")
    ])
    weight = FloatField('Peso (kg)', validators=[Optional()])
    symptoms = StringField('Síntomas', validators=[Optional()])
    notes = StringField('Notas', validators=[Optional()])
    submit = SubmitField('Guardar Información')

from flask_admin import Admin
from flask_admin.contrib.sqla import ModelView
from flask_admin import BaseView, expose
from flask import redirect, url_for
from .models import db, User, PregnancyData, FetalDevelopment

admin = Admin(name="Panel Admin", template_mode="bootstrap3")

# Protege el panel para que solo usuarios autenticados puedan acceder
class SecureModelView(ModelView):
    def is_accessible(self):
        # Aquí podrías validar si el usuario está autenticado (modifícalo según tu lógica de autenticación)
        return True  # Cambia esto a una validación real
    
    def inaccessible_callback(self, name, **kwargs):
        return redirect(url_for('login'))  # Redirige a la página de login si no tiene acceso

# Agregar modelos al panel de administración
admin.add_view(SecureModelView(User, db.session))
admin.add_view(SecureModelView(PregnancyData, db.session))
admin.add_view(SecureModelView(FetalDevelopment, db.session))

def init_admin(app):
    admin.init_app(app)

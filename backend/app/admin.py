from flask_admin import Admin, AdminIndexView
from flask_admin.contrib.sqla import ModelView
from flask import redirect, url_for, flash
from flask_login import current_user
from .models import User, PregnancyData, FetalDevelopment 
from . import db 
from flask import request

class SecureAdminIndexView(AdminIndexView):
    def is_accessible(self):
        return current_user.is_authenticated and current_user.is_admin

    def inaccessible_callback(self, name, **kwargs):
        flash('Por favor inicia sesión con una cuenta de administrador.', 'error')
        return redirect(url_for('routes.login', next=request.url))

class SecureModelView(ModelView):
    def is_accessible(self):
        return current_user.is_authenticated and current_user.is_admin

    def inaccessible_callback(self, name, **kwargs):
        flash('No tienes permisos para acceder a esta área.', 'error')
        return redirect(url_for('routes.login', next=request.url))

# Crear instancia de Admin con la vista segura
admin = Admin(
    name="Panel Admin",
    template_mode="bootstrap3",
    index_view=SecureAdminIndexView()
)

def init_admin(app):
    admin.init_app(app)
    # Registrar las vistas
    admin.add_view(SecureModelView(User, db.session))
    admin.add_view(SecureModelView(PregnancyData, db.session))
    admin.add_view(SecureModelView(FetalDevelopment, db.session))
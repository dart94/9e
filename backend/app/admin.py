from flask_admin import Admin
from flask_admin.contrib.sqla import ModelView
from flask import redirect, url_for
from flask_login import current_user
from .models import db, User, PregnancyData, FetalDevelopment

admin = Admin(name="Panel Admin", template_mode="bootstrap3")

# Protege el panel para que solo usuarios autenticados y con permisos de admin puedan acceder
class SecureModelView(ModelView):
    def is_accessible(self):
        return current_user.is_authenticated and getattr(current_user, "is_admin", False)

    def inaccessible_callback(self, name, **kwargs):
        return redirect(url_for('login'))  # Redirige al login si no tiene acceso

# Agregar modelos al panel de administración
admin.add_view(SecureModelView(User, db.session))
admin.add_view(SecureModelView(PregnancyData, db.session))
admin.add_view(SecureModelView(FetalDevelopment, db.session))

def init_admin(app):
    admin.init_app(app)

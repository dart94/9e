from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_bcrypt import Bcrypt
from flask_mail import Mail
from dotenv import load_dotenv
from itsdangerous import URLSafeTimedSerializer
import os
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_admin import Admin
from flask_admin.contrib.sqla import ModelView
from flask_login import LoginManager

# Inicializar extensiones
db = SQLAlchemy()
migrate = Migrate()
bcrypt = Bcrypt()
mail = Mail()
admin = Admin(name='Admin Panel', template_mode='bootstrap4')
login_manager = LoginManager()  

def create_app():
    load_dotenv()
    app = Flask(__name__)
    app.config.from_object('config.Config')
   
    # Aplicar CORS
    CORS(app, origins=["http://localhost:8081", "https://9e-production.up.railway.app"])
    
    # Inicializar todas las extensiones
    db.init_app(app)
    migrate.init_app(app, db)
    bcrypt.init_app(app)
    mail.init_app(app)
    jwt = JWTManager(app)
    login_manager.init_app(app)
    login_manager.login_view = 'routes.login'
    
    @login_manager.user_loader
    def load_user(user_id):
        from .models import User
        return User.query.get(int(user_id))
    
    # Importar modelos
    from .models import User, PregnancyData, FetalDevelopment
    
    # Configurar Flask-Admin
    from .admin import SecureModelView, init_admin
    init_admin(app)
    
    # Inicializar serializers
    email_confirm_serializer = URLSafeTimedSerializer(app.config['SECRET_KEY'])
    password_reset_serializer = URLSafeTimedSerializer(app.config['SECRET_KEY'])
    
    app.extensions['email_confirm_serializer'] = email_confirm_serializer
    app.extensions['password_reset_serializer'] = password_reset_serializer
    
    # Registrar blueprints
    from .routes import routes
    from .api.fetal_development_api import fetal_api
    app.register_blueprint(routes)
    app.register_blueprint(fetal_api, url_prefix='/api')
    
    # Manejo de errores
    @app.errorhandler(404)
    def not_found_error(error):
        return {"error": "Resource not found"}, 404
        
    @app.errorhandler(500)
    def internal_error(error):
        return {"error": "Internal server error"}, 500
        
    return app
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_bcrypt import Bcrypt
from flask_mail import Mail
from dotenv import load_dotenv
from itsdangerous import URLSafeTimedSerializer
import os
from .api.fetal_development_api import fetal_api
from flask_cors import CORS
from flask_jwt_extended import JWTManager

# Inicializar extensiones
db = SQLAlchemy()
migrate = Migrate()
bcrypt = Bcrypt()
mail = Mail()


def create_app():
    # Cargar variables desde .env
    load_dotenv()

    # Inicializar Flask
    app = Flask(__name__)
    app.config.from_object('config.Config')

    # Aplicar CORS después de inicializar `app`
    CORS(app, supports_credentials=True, origins=['http://localhost:8081'])

    # Configurar Flask-Mail desde variables de entorno
    app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER')
    app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT'))
    app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
    app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
    app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS') == 'True'
    app.config['MAIL_USE_SSL'] = os.getenv('MAIL_USE_SSL') == 'True'
    app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_DEFAULT_SENDER')

    # Inicializar extensiones
    db.init_app(app)
    migrate.init_app(app, db)
    bcrypt.init_app(app)
    mail.init_app(app)
    jwt = JWTManager(app)

    # Inicializar URLSafeTimedSerializer
    serializer = URLSafeTimedSerializer(app.config['SECRET_KEY'])
    app.extensions['serializer'] = serializer

    # Registrar blueprints
    from .routes import routes
    app.register_blueprint(routes)
    app.register_blueprint(fetal_api, url_prefix='/api')  # Registra fetal_api con prefijo '/api'

    # Manejo de errores globales
    @app.errorhandler(404)
    def not_found_error(error):
        return {"error": "Resource not found"}, 404

    @app.errorhandler(500)
    def internal_error(error):
        return {"error": "Internal server error"}, 500

    return app

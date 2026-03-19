from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from itsdangerous import URLSafeTimedSerializer
from dotenv import load_dotenv
from config import Config
from .extensions import db, migrate, bcrypt, mail  # <-- importa desde extensions
from .api.fetal_development_api import fetal_api

def create_app(config_class=Config):
    load_dotenv()
    app = Flask(__name__)
    app.config.from_object(config_class)

    db.init_app(app)
    migrate.init_app(app, db)
    bcrypt.init_app(app)
    mail.init_app(app)
    jwt = JWTManager(app)
    CORS(app, origins=app.config['CORS_ORIGINS'])

    app.extensions['email_confirm_serializer'] = URLSafeTimedSerializer(app.config['SECRET_KEY'])
    app.extensions['password_reset_serializer'] = URLSafeTimedSerializer(app.config['SECRET_KEY'])

    from .routes import routes
    app.register_blueprint(routes)
    app.register_blueprint(fetal_api, url_prefix='/api')

    @app.errorhandler(404)
    def not_found_error(error):
        return {"error": "Resource not found"}, 404

    @app.errorhandler(500)
    def internal_error(error):
        return {"error": "Internal server error"}, 500

    return app
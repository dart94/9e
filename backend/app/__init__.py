from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from itsdangerous import URLSafeTimedSerializer
from dotenv import load_dotenv
from config import Config
from .extensions import db, migrate, bcrypt, mail
from .api.fetal_development_api import fetal_api

def create_app(config_class=Config):
    load_dotenv()
    app = Flask(__name__)
    app.config.from_object(config_class)

    db.init_app(app)
    migrate.init_app(app, db)
    bcrypt.init_app(app)
    mail.init_app(app)
    JWTManager(app)
    CORS(app, origins=app.config['CORS_ORIGINS'])

    app.extensions['email_confirm_serializer'] = URLSafeTimedSerializer(app.config['SECRET_KEY'])
    app.extensions['password_reset_serializer'] = URLSafeTimedSerializer(app.config['SECRET_KEY'])

    from .auth import auth_bp
    from .pregnancy import pregnancy_bp
    from .user import user_bp
    from .auth.models import User
    from .pregnancy.models import PregnancyData
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(pregnancy_bp, url_prefix='/api/pregnancy')
    app.register_blueprint(user_bp, url_prefix='/api/user')
    app.register_blueprint(fetal_api, url_prefix='/api')

    @app.errorhandler(404)
    def not_found_error(error):
        return {"error": "Resource not found"}, 404

    @app.errorhandler(500)
    def internal_error(error):
        return {"error": "Internal server error"}, 500

    return app
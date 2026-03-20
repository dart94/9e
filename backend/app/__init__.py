from flask import Flask, Blueprint, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from itsdangerous import URLSafeTimedSerializer
from dotenv import load_dotenv
from config import Config
from .extensions import db, migrate, bcrypt, mail
from .api.fetal_development_api import fetal_api

legacy_bp = Blueprint('legacy', __name__)

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
    app.register_blueprint(legacy_bp)

    @app.errorhandler(404)
    def not_found_error(error):
        return {"error": "Resource not found"}, 404

    @app.errorhandler(500)
    def internal_error(error):
        return {"error": "Internal server error"}, 500

    return app


@legacy_bp.route('/login2', methods=['POST'])
def login2():
    from .auth.routes import login
    return login()


@legacy_bp.route('/register2', methods=['POST'])
def register2():
    from .auth.routes import register
    return register()
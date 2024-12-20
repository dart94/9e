from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_bcrypt import Bcrypt
from app.api.fetal_development_api import fetal_api

db = SQLAlchemy()
migrate = Migrate()
bcrypt = Bcrypt()

def create_app():
    app = Flask(__name__)
    app.config.from_object('config.Config')

    # Inicializar extensiones
    db.init_app(app)
    migrate.init_app(app, db)
    bcrypt.init_app(app)

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

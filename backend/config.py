import os
from dotenv import load_dotenv

# Cargar variables de entorno desde .env
load_dotenv()

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'default_secret_key')

    # Selección de base de datos según entorno
    SQLALCHEMY_DATABASE_URI = os.getenv(
        'DATABASE_URL',  # URL de la base de datos definida en Render
        os.getenv('EXTERNAL_DATABASE_URL', 'sqlite:///default.db')  # Fallback para desarrollo local
    )

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Configuración del correo
    MAIL_SERVER = os.getenv('MAIL_SERVER', 'localhost')
    MAIL_PORT = int(os.getenv('MAIL_PORT', 25))
    MAIL_USERNAME = os.getenv('MAIL_USERNAME', None)
    MAIL_PASSWORD = os.getenv('MAIL_PASSWORD', None)
    MAIL_USE_TLS = os.getenv('MAIL_USE_TLS', 'False').lower() in ['true', '1', 't']
    MAIL_USE_SSL = os.getenv('MAIL_USE_SSL', 'False').lower() in ['true', '1', 't']
    MAIL_DEFAULT_SENDER = os.getenv('MAIL_DEFAULT_SENDER', 'no-reply@example.com')

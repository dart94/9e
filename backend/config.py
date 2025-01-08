import os
from dotenv import load_dotenv

#cargar variables de entorno
load_dotenv()

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'default_secret_key')

    # Usar la URL correcta según el entorno
    SQLALCHEMY_DATABASE_URI = os.getenv(
        'INTERNAL_DATABASE_URL' if os.getenv('FLASK_ENV') == 'production' else 'EXTERNAL_DATABASE_URL'
    )

    SQLALCHEMY_TRACK_MODIFICATIONS = False
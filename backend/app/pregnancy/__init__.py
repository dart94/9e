from flask import Blueprint

pregnancy_bp = Blueprint('pregnancy', __name__)

from . import routes
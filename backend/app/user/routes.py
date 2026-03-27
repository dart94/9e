from flask import request, jsonify, render_template
from flask_jwt_extended import jwt_required, get_jwt_identity

from . import user_bp
from ..extensions import db, bcrypt
from ..auth.models import User
from ..pregnancy.models import PregnancyData

from datetime import datetime


@user_bp.route('/perfil', methods=['GET'])
@jwt_required()
def get_perfil():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "Usuario no encontrado"}), 404

    last_record = PregnancyData.query.filter_by(user_id=user_id).order_by(PregnancyData.id.desc()).first()
    current_week = None
    progress_percentage = 0

    if last_record and last_record.last_period_date:
        today = datetime.now().date()
        days_since_period = (today - last_record.last_period_date).days
        current_week = max(1, days_since_period // 7)
        progress_percentage = (current_week / 40) * 100

    return jsonify({
        "username": user.username,
        "email": user.email,
        "current_week": current_week,
        "progress_percentage": progress_percentage,
        "last_record": {
            "weight": last_record.weight if last_record else None,
            "symptoms": last_record.symptoms if last_record else None,
            "notes": last_record.notes if last_record else None,
        }
    }), 200


@user_bp.route('/perfil', methods=['PUT'])
@jwt_required()
def editar_perfil():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "Usuario no encontrado"}), 404

    data = request.get_json()
    user.username = data.get('username', user.username)
    user.email = data.get('email', user.email)

    try:
        db.session.commit()
        return jsonify({"message": "Perfil actualizado con éxito"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Error al actualizar: {str(e)}"}), 500


@user_bp.route('/account', methods=['DELETE'])
@jwt_required()
def delete_account():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "Usuario no encontrado"}), 404

    try:
        PregnancyData.query.filter_by(user_id=user_id).delete()
        db.session.delete(user)
        db.session.commit()
        return jsonify({"message": "Cuenta eliminada correctamente"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Error al eliminar la cuenta: {str(e)}"}), 500


@user_bp.route('/eliminar-cuenta', methods=['GET'])
def delete_account_page():
    return render_template('delete_account.html')


@user_bp.route('/eliminar-cuenta', methods=['POST'])
def delete_account_web():
    email = request.form.get('email', '').strip()
    password = request.form.get('password', '').strip()

    if not email or not password:
        return render_template('delete_account.html', error="Completa todos los campos.")

    user = User.query.filter_by(email=email).first()
    if not user or not bcrypt.check_password_hash(user.password, password):
        return render_template('delete_account.html', error="Correo o contraseña incorrectos.")

    try:
        PregnancyData.query.filter_by(user_id=user.id).delete()
        db.session.delete(user)
        db.session.commit()
        return render_template('delete_account.html', success=True)
    except Exception as e:
        db.session.rollback()
        return render_template('delete_account.html', error=f"Error al eliminar la cuenta: {str(e)}")
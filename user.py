from flask import Blueprint, request, jsonify
from src.models.user import db, User
import json

user_bp = Blueprint('user', __name__)

@user_bp.route('/register', methods=['POST'])
def register_user():
    """Endpoint para registrar um novo usuário."""
    data = request.json
    
    if not data or 'username' not in data or 'email' not in data:
        return jsonify({'error': 'Dados incompletos. Nome de usuário e email são obrigatórios.'}), 400
    
    # Verificar se o usuário já existe
    existing_user = User.query.filter_by(username=data['username']).first()
    if existing_user:
        return jsonify({'error': 'Nome de usuário já existe.'}), 400
    
    # Verificar se o email já existe
    existing_email = User.query.filter_by(email=data['email']).first()
    if existing_email:
        return jsonify({'error': 'Email já está em uso.'}), 400
    
    # Criar novo usuário
    new_user = User(
        username=data['username'],
        email=data['email']
    )
    
    try:
        db.session.add(new_user)
        db.session.commit()
        return jsonify({
            'message': 'Usuário registrado com sucesso',
            'user': new_user.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro ao registrar usuário: {str(e)}'}), 500

@user_bp.route('/<int:user_id>', methods=['GET'])
def get_user(user_id):
    """Endpoint para obter detalhes de um usuário específico."""
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'Usuário não encontrado.'}), 404
    
    return jsonify(user.to_dict()), 200

@user_bp.route('/login', methods=['POST'])
def login_user():
    """Endpoint para login de usuário (simplificado)."""
    data = request.json
    
    if not data or 'username' not in data:
        return jsonify({'error': 'Nome de usuário é obrigatório.'}), 400
    
    user = User.query.filter_by(username=data['username']).first()
    if not user:
        return jsonify({'error': 'Usuário não encontrado.'}), 404
    
    return jsonify({
        'message': 'Login realizado com sucesso',
        'user': user.to_dict()
    }), 200

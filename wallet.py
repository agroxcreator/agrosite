from flask import Blueprint, request, jsonify
from src.models.user import db, User
from src.models.wallet import Wallet
import json
from datetime import datetime

wallet_bp = Blueprint('wallet', __name__)

@wallet_bp.route('/connect', methods=['POST'])
def connect_wallet():
    """Endpoint para conectar carteira do usuário."""
    data = request.json
    
    if not data or 'address' not in data or 'wallet_type' not in data or 'user_id' not in data:
        return jsonify({'error': 'Dados incompletos. Endereço, tipo de carteira e ID do usuário são obrigatórios.'}), 400
    
    # Verificar se o usuário existe
    user = User.query.get(data['user_id'])
    if not user:
        return jsonify({'error': 'Usuário não encontrado.'}), 404
    
    # Verificar se a carteira já está conectada
    existing_wallet = Wallet.query.filter_by(address=data['address']).first()
    if existing_wallet:
        # Atualizar a última atividade
        existing_wallet.last_active = datetime.utcnow()
        db.session.commit()
        return jsonify({'message': 'Carteira já conectada', 'wallet': existing_wallet.to_dict()}), 200
    
    # Criar nova conexão de carteira
    new_wallet = Wallet(
        user_id=data['user_id'],
        address=data['address'],
        wallet_type=data['wallet_type']
    )
    
    try:
        db.session.add(new_wallet)
        db.session.commit()
        return jsonify({
            'message': 'Carteira conectada com sucesso',
            'wallet': new_wallet.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro ao conectar carteira: {str(e)}'}), 500

@wallet_bp.route('/disconnect', methods=['POST'])
def disconnect_wallet():
    """Endpoint para desconectar carteira do usuário."""
    data = request.json
    
    if not data or 'address' not in data:
        return jsonify({'error': 'Endereço da carteira é obrigatório.'}), 400
    
    wallet = Wallet.query.filter_by(address=data['address']).first()
    if not wallet:
        return jsonify({'error': 'Carteira não encontrada.'}), 404
    
    try:
        db.session.delete(wallet)
        db.session.commit()
        return jsonify({'message': 'Carteira desconectada com sucesso'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro ao desconectar carteira: {str(e)}'}), 500

@wallet_bp.route('/user/<int:user_id>', methods=['GET'])
def get_user_wallets(user_id):
    """Endpoint para obter todas as carteiras de um usuário."""
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'Usuário não encontrado.'}), 404
    
    wallets = Wallet.query.filter_by(user_id=user_id).all()
    return jsonify({
        'wallets': [wallet.to_dict() for wallet in wallets]
    }), 200

@wallet_bp.route('/balance/<address>', methods=['GET'])
def get_wallet_balance(address):
    """Endpoint para obter o saldo AGROX de uma carteira."""
    wallet = Wallet.query.filter_by(address=address).first()
    if not wallet:
        return jsonify({'error': 'Carteira não encontrada.'}), 404
    
    return jsonify({
        'address': wallet.address,
        'balance_agrox': wallet.balance_agrox
    }), 200

@wallet_bp.route('/balance/update', methods=['POST'])
def update_wallet_balance():
    """Endpoint para atualizar o saldo AGROX de uma carteira."""
    data = request.json
    
    if not data or 'address' not in data or 'balance' not in data:
        return jsonify({'error': 'Endereço da carteira e saldo são obrigatórios.'}), 400
    
    wallet = Wallet.query.filter_by(address=data['address']).first()
    if not wallet:
        return jsonify({'error': 'Carteira não encontrada.'}), 404
    
    try:
        wallet.balance_agrox = data['balance']
        wallet.last_active = datetime.utcnow()
        db.session.commit()
        return jsonify({
            'message': 'Saldo atualizado com sucesso',
            'address': wallet.address,
            'balance_agrox': wallet.balance_agrox
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro ao atualizar saldo: {str(e)}'}), 500

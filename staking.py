from flask import Blueprint, request, jsonify
from src.models.user import db, User
from src.models.token import TokenStaking
import json
from datetime import datetime, timedelta

staking_bp = Blueprint('staking', __name__)

@staking_bp.route('/lock', methods=['POST'])
def lock_tokens():
    """Endpoint para fazer staking de tokens AGROX."""
    data = request.json
    
    if not data or 'user_id' not in data or 'amount' not in data or 'apy_type' not in data or 'duration_days' not in data:
        return jsonify({'error': 'Dados incompletos. ID do usuário, quantidade, tipo de APY e duração são obrigatórios.'}), 400
    
    # Verificar se o usuário existe
    user = User.query.get(data['user_id'])
    if not user:
        return jsonify({'error': 'Usuário não encontrado.'}), 404
    
    # Verificar se o tipo de APY é válido
    valid_apy_types = ['SUGARCANE', 'COFFEE', 'SOY', 'LIVESTOCK', 'BASKET']
    if data['apy_type'] not in valid_apy_types:
        return jsonify({'error': f'Tipo de APY inválido. Use um dos seguintes: {", ".join(valid_apy_types)}'}), 400
    
    # Calcular data de término
    end_date = datetime.utcnow() + timedelta(days=data['duration_days'])
    
    # Criar novo staking
    new_staking = TokenStaking(
        user_id=data['user_id'],
        amount=data['amount'],
        apy_type=data['apy_type'],
        end_date=end_date
    )
    
    try:
        db.session.add(new_staking)
        db.session.commit()
        return jsonify({
            'message': 'Staking realizado com sucesso',
            'staking_id': new_staking.id,
            'start_date': new_staking.start_date.isoformat(),
            'end_date': new_staking.end_date.isoformat()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro ao realizar staking: {str(e)}'}), 500

@staking_bp.route('/unlock/<int:staking_id>', methods=['POST'])
def unlock_tokens(staking_id):
    """Endpoint para desbloquear tokens em staking."""
    staking = TokenStaking.query.get(staking_id)
    if not staking:
        return jsonify({'error': 'Staking não encontrado.'}), 404
    
    if not staking.is_active:
        return jsonify({'error': 'Este staking já foi encerrado.'}), 400
    
    # Verificar se o período mínimo foi cumprido
    current_time = datetime.utcnow()
    if current_time < staking.end_date:
        return jsonify({'error': 'Período mínimo de staking não foi cumprido.'}), 400
    
    try:
        # Calcular recompensas (simulado)
        apy_rates = {
            'SUGARCANE': 0.12,  # 12% ao ano
            'COFFEE': 0.15,     # 15% ao ano
            'SOY': 0.18,        # 18% ao ano
            'LIVESTOCK': 0.14,  # 14% ao ano
            'BASKET': 0.16      # 16% ao ano
        }
        
        # Calcular dias em staking
        days_staked = (current_time - staking.start_date).days
        
        # Calcular recompensa proporcional ao período
        annual_rate = apy_rates.get(staking.apy_type, 0.10)
        rewards = staking.amount * annual_rate * (days_staked / 365)
        
        # Atualizar staking
        staking.is_active = False
        staking.rewards_earned = rewards
        db.session.commit()
        
        return jsonify({
            'message': 'Tokens desbloqueados com sucesso',
            'staking_id': staking.id,
            'amount': staking.amount,
            'rewards_earned': staking.rewards_earned,
            'total_return': staking.amount + staking.rewards_earned
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro ao desbloquear tokens: {str(e)}'}), 500

@staking_bp.route('/user/<int:user_id>', methods=['GET'])
def get_user_stakings(user_id):
    """Endpoint para obter todos os stakings de um usuário."""
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'Usuário não encontrado.'}), 404
    
    stakings = TokenStaking.query.filter_by(user_id=user_id).all()
    
    result = []
    for staking in stakings:
        # Calcular APY atual
        apy_rates = {
            'SUGARCANE': 0.12,
            'COFFEE': 0.15,
            'SOY': 0.18,
            'LIVESTOCK': 0.14,
            'BASKET': 0.16
        }
        
        staking_data = {
            'id': staking.id,
            'amount': staking.amount,
            'apy_type': staking.apy_type,
            'apy_rate': apy_rates.get(staking.apy_type, 0.10),
            'start_date': staking.start_date.isoformat(),
            'end_date': staking.end_date.isoformat(),
            'is_active': staking.is_active,
            'rewards_earned': staking.rewards_earned
        }
        
        # Se ativo, calcular recompensas projetadas
        if staking.is_active:
            current_time = datetime.utcnow()
            days_staked = (current_time - staking.start_date).days
            annual_rate = apy_rates.get(staking.apy_type, 0.10)
            current_rewards = staking.amount * annual_rate * (days_staked / 365)
            
            total_days = (staking.end_date - staking.start_date).days
            projected_rewards = staking.amount * annual_rate * (total_days / 365)
            
            staking_data['current_rewards'] = current_rewards
            staking_data['projected_rewards'] = projected_rewards
        
        result.append(staking_data)
    
    return jsonify({
        'stakings': result
    }), 200

@staking_bp.route('/apy/rates', methods=['GET'])
def get_apy_rates():
    """Endpoint para obter as taxas de APY atuais."""
    # Simulação de taxas de APY baseadas em dados de commodities
    apy_rates = {
        'SUGARCANE': 0.12,  # 12% ao ano
        'COFFEE': 0.15,     # 15% ao ano
        'SOY': 0.18,        # 18% ao ano
        'LIVESTOCK': 0.14,  # 14% ao ano
        'BASKET': 0.16      # 16% ao ano
    }
    
    return jsonify({
        'apy_rates': apy_rates,
        'last_updated': datetime.utcnow().isoformat()
    }), 200

@staking_bp.route('/calculator', methods=['POST'])
def calculate_returns():
    """Endpoint para calcular retornos projetados de staking."""
    data = request.json
    
    if not data or 'amount' not in data or 'apy_type' not in data or 'duration_days' not in data:
        return jsonify({'error': 'Dados incompletos. Quantidade, tipo de APY e duração são obrigatórios.'}), 400
    
    # Verificar se o tipo de APY é válido
    valid_apy_types = ['SUGARCANE', 'COFFEE', 'SOY', 'LIVESTOCK', 'BASKET']
    if data['apy_type'] not in valid_apy_types:
        return jsonify({'error': f'Tipo de APY inválido. Use um dos seguintes: {", ".join(valid_apy_types)}'}), 400
    
    # Obter taxa de APY
    apy_rates = {
        'SUGARCANE': 0.12,
        'COFFEE': 0.15,
        'SOY': 0.18,
        'LIVESTOCK': 0.14,
        'BASKET': 0.16
    }
    
    annual_rate = apy_rates.get(data['apy_type'], 0.10)
    
    # Calcular retorno projetado
    amount = data['amount']
    duration_days = data['duration_days']
    
    projected_rewards = amount * annual_rate * (duration_days / 365)
    total_return = amount + projected_rewards
    
    return jsonify({
        'initial_amount': amount,
        'apy_type': data['apy_type'],
        'apy_rate': annual_rate,
        'duration_days': duration_days,
        'projected_rewards': projected_rewards,
        'total_return': total_return
    }), 200

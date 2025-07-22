from flask import Blueprint, request, jsonify
from src.models.user import db, User
from src.models.token import Token
import json
from datetime import datetime
import os
import uuid

token_bp = Blueprint('token', __name__)

@token_bp.route('/create', methods=['POST'])
def create_token():
    """Endpoint para criar um novo token agrícola."""
    data = request.json
    
    required_fields = ['creator_id', 'name', 'symbol', 'type', 'initial_supply', 
                      'farm_location', 'country']
    
    # Verificar campos obrigatórios
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Campo obrigatório ausente: {field}'}), 400
    
    # Verificar se o usuário existe
    user = User.query.get(data['creator_id'])
    if not user:
        return jsonify({'error': 'Usuário criador não encontrado.'}), 404
    
    # Verificar se o símbolo já existe
    existing_token = Token.query.filter_by(symbol=data['symbol']).first()
    if existing_token:
        return jsonify({'error': 'Símbolo de token já existe. Escolha outro símbolo.'}), 400
    
    # Criar novo token
    new_token = Token(
        creator_id=data['creator_id'],
        name=data['name'],
        symbol=data['symbol'],
        type=data['type'],
        initial_supply=data['initial_supply'],
        current_supply=data['initial_supply'],
        farm_location=data['farm_location'],
        country=data['country'],
        farm_size=data.get('farm_size'),
        social_networks=json.dumps(data.get('social_networks', {})),
        token_image=data.get('token_image', ''),
        farm_images=json.dumps(data.get('farm_images', [])),
        price=data.get('price', 0.0),
        market_cap=data.get('price', 0.0) * data['initial_supply']
    )
    
    try:
        # Consumir tokens AGROX para criação (simulado)
        # Aqui seria implementada a lógica de consumo de tokens AGROX
        
        db.session.add(new_token)
        db.session.commit()
        return jsonify({
            'message': 'Token criado com sucesso',
            'token': new_token.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro ao criar token: {str(e)}'}), 500

@token_bp.route('/<int:token_id>', methods=['GET'])
def get_token(token_id):
    """Endpoint para obter detalhes de um token específico."""
    token = Token.query.get(token_id)
    if not token:
        return jsonify({'error': 'Token não encontrado.'}), 404
    
    return jsonify(token.to_dict()), 200

@token_bp.route('/list', methods=['GET'])
def list_tokens():
    """Endpoint para listar todos os tokens."""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    token_type = request.args.get('type')
    country = request.args.get('country')
    
    query = Token.query
    
    # Filtrar por tipo
    if token_type:
        query = query.filter_by(type=token_type)
    
    # Filtrar por país
    if country:
        query = query.filter_by(country=country)
    
    # Ordenar por market cap (padrão)
    sort_by = request.args.get('sort_by', 'market_cap')
    sort_order = request.args.get('sort_order', 'desc')
    
    if sort_by == 'market_cap':
        query = query.order_by(Token.market_cap.desc() if sort_order == 'desc' else Token.market_cap.asc())
    elif sort_by == 'price_change':
        query = query.order_by(Token.price_change_24h.desc() if sort_order == 'desc' else Token.price_change_24h.asc())
    elif sort_by == 'created_at':
        query = query.order_by(Token.created_at.desc() if sort_order == 'desc' else Token.created_at.asc())
    
    # Paginação
    tokens_paginated = query.paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        'tokens': [token.to_dict() for token in tokens_paginated.items],
        'total': tokens_paginated.total,
        'pages': tokens_paginated.pages,
        'current_page': page
    }), 200

@token_bp.route('/upload/image', methods=['POST'])
def upload_token_image():
    """Endpoint para fazer upload de imagens de token ou fazenda."""
    if 'image' not in request.files:
        return jsonify({'error': 'Nenhuma imagem enviada.'}), 400
    
    image_file = request.files['image']
    image_type = request.form.get('type', 'token')  # token ou farm
    
    if image_file.filename == '':
        return jsonify({'error': 'Nome de arquivo vazio.'}), 400
    
    # Gerar nome de arquivo único
    filename = f"{uuid.uuid4()}_{image_file.filename}"
    
    # Definir diretório de upload
    upload_dir = os.path.join('src', 'static', 'uploads', image_type)
    os.makedirs(upload_dir, exist_ok=True)
    
    # Salvar arquivo
    file_path = os.path.join(upload_dir, filename)
    image_file.save(file_path)
    
    # Retornar caminho relativo para o frontend
    relative_path = f"/uploads/{image_type}/{filename}"
    
    return jsonify({
        'message': 'Imagem enviada com sucesso',
        'path': relative_path
    }), 200

@token_bp.route('/leaderboard', methods=['GET'])
def get_leaderboard():
    """Endpoint para obter o leaderboard de tokens."""
    category = request.args.get('category', 'market_cap')
    limit = request.args.get('limit', 10, type=int)
    
    if category == 'market_cap':
        tokens = Token.query.order_by(Token.market_cap.desc()).limit(limit).all()
    elif category == 'winners':
        tokens = Token.query.order_by(Token.price_change_24h.desc()).limit(limit).all()
    else:
        return jsonify({'error': 'Categoria inválida. Use "market_cap" ou "winners".'}), 400
    
    return jsonify({
        'category': category,
        'tokens': [token.to_dict() for token in tokens]
    }), 200

@token_bp.route('/types', methods=['GET'])
def get_token_types():
    """Endpoint para obter todos os tipos de tokens disponíveis."""
    types = db.session.query(Token.type).distinct().all()
    return jsonify({
        'types': [t[0] for t in types]
    }), 200

@token_bp.route('/countries', methods=['GET'])
def get_token_countries():
    """Endpoint para obter todos os países com tokens."""
    countries = db.session.query(Token.country).distinct().all()
    return jsonify({
        'countries': [c[0] for c in countries]
    }), 200

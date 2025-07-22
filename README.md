# Documentação da Aplicação AGROX Token

## Visão Geral

A aplicação AGROX Token é uma plataforma de tokenização agrícola que permite que agricultores e produtores rurais criem seus próprios tokens para atrair investidores. A plataforma utiliza tecnologia blockchain para conectar investidores a produtores agrícolas, oferecendo também funcionalidades de staking com rendimentos baseados em diferentes commodities agrícolas.

## Funcionalidades Principais

### 1. Conexão de Carteira
- Suporte para múltiplas carteiras (MetaMask, WalletConnect, Trust Wallet, Binance Wallet)
- Autenticação segura e gerenciamento de sessão
- Visualização de saldo de tokens AGROX

### 2. Criação de Tokens Agrícolas
- Interface intuitiva para criação de tokens personalizados
- Campos para informações detalhadas sobre a produção agrícola
- Upload de imagens do token e da fazenda/produção
- Consumo de tokens AGROX para criação de novos tokens

### 3. Leaderboard
- Visualização dos tokens por Market Cap
- Visualização dos maiores ganhadores (variação de preço)
- Filtros por tipo de commodity e país
- Indicadores visuais com ícones de commodities e bandeiras de países

### 4. Staking de Tokens AGROX
- Opções de staking baseadas em diferentes commodities agrícolas
- Taxas de APY diferenciadas por tipo de commodity
- Calculadora de rendimento projetado
- Cesta de diversidade com distribuição igualitária entre commodities

### 5. Visual Futurista
- Design moderno com tema de plantação de soja
- Efeitos de gradiente e animações sutis
- Interface responsiva para desktop e dispositivos móveis
- Ícones personalizados para cada tipo de commodity

## Arquitetura Técnica

### Backend (Flask)
- API RESTful para todas as operações
- Modelos de dados para usuários, carteiras, tokens e staking
- Integração com banco de dados MySQL
- Endpoints para criação, listagem e filtragem de tokens

### Frontend
- HTML5, CSS3 e JavaScript moderno
- Design responsivo com Bootstrap 5
- Integração com bibliotecas de ícones e bandeiras
- Animações e efeitos visuais para melhor experiência do usuário

## Como Executar a Aplicação

1. Certifique-se de ter Python 3.x e pip instalados
2. Instale as dependências:
   ```
   pip install flask flask-sqlalchemy pymysql
   ```
3. Navegue até o diretório do projeto:
   ```
   cd agrox_token
   ```
4. Execute a aplicação:
   ```
   python -m src.main
   ```
5. Acesse a aplicação em seu navegador:
   ```
   http://localhost:5000
   ```

## Estrutura de Diretórios

```
agrox_token/
├── src/
│   ├── models/       # Modelos de dados
│   ├── routes/       # Rotas da API
│   ├── static/       # Arquivos estáticos (CSS, JS, imagens)
│   │   ├── css/
│   │   ├── js/
│   │   └── images/
│   └── main.py       # Ponto de entrada da aplicação
├── venv/             # Ambiente virtual Python
└── requirements.txt  # Dependências do projeto
```

## Expansões Futuras

- Integração com dados reais da Bolsa de Chicago
- Implementação de WebSockets para atualizações em tempo real
- Suporte para mais commodities agrícolas
- Integração com blockchain real para transações de tokens
- Dashboard administrativo para gerenciamento da plataforma

## Notas Importantes

- Esta é uma versão de demonstração com dados simulados
- Em um ambiente de produção, seria necessário implementar medidas adicionais de segurança
- A integração com blockchain real exigiria contratos inteligentes adicionais

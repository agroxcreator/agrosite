// Constantes e configurações
const API_BASE_URL = '/api';
const WALLET_TYPES = {
    metamask: 'MetaMask',
    walletconnect: 'WalletConnect',
    trustwallet: 'Trust Wallet',
    binance: 'Binance Wallet'
};

// Estado da aplicação
const appState = {
    user: null,
    wallet: null,
    tokens: [],
    leaderboard: {
        marketcap: [],
        winners: []
    },
    apyRates: {},
    countries: [],
    tokenTypes: []
};

// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    setupEventListeners();
});

// Função de inicialização
async function initApp() {
    // Verificar se há uma sessão de usuário ativa
    checkUserSession();
    
    // Carregar dados iniciais
    await Promise.all([
        fetchLeaderboard('market_cap'),
        fetchLeaderboard('winners'),
        fetchApyRates(),
        fetchCountries(),
        fetchTokenTypes()
    ]);
    
    // Inicializar calculadora de APY
    initApyCalculator();
    
    // Adicionar animações e efeitos visuais
    addVisualEffects();
}

// Configurar event listeners
function setupEventListeners() {
    // Botão de conexão de carteira
    const connectWalletBtn = document.getElementById('connect-wallet-btn');
    if (connectWalletBtn) {
        connectWalletBtn.addEventListener('click', openWalletModal);
    }
    
    // Opções de carteira no modal
    const walletOptions = document.querySelectorAll('.wallet-option');
    walletOptions.forEach(option => {
        option.addEventListener('click', () => {
            const walletType = option.getAttribute('data-wallet');
            connectWallet(walletType);
        });
    });
    
    // Formulário de criação de token
    const tokenCreationForm = document.getElementById('token-creation-form');
    if (tokenCreationForm) {
        tokenCreationForm.addEventListener('submit', handleTokenCreation);
    }
    
    // Preview de imagem do token
    const tokenImageInput = document.getElementById('token-image');
    if (tokenImageInput) {
        tokenImageInput.addEventListener('change', previewTokenImage);
    }
    
    // Preview de imagens da fazenda
    const farmImagesInput = document.getElementById('farm-images');
    if (farmImagesInput) {
        farmImagesInput.addEventListener('change', previewFarmImages);
    }
    
    // Filtros do leaderboard
    const tokenTypeFilter = document.getElementById('token-type-filter');
    const countryFilter = document.getElementById('country-filter');
    
    if (tokenTypeFilter) {
        tokenTypeFilter.addEventListener('change', () => {
            filterLeaderboard();
        });
    }
    
    if (countryFilter) {
        countryFilter.addEventListener('change', () => {
            filterLeaderboard();
        });
    }
    
    // Calculadora de APY
    const calculateApyBtn = document.getElementById('calculate-apy');
    if (calculateApyBtn) {
        calculateApyBtn.addEventListener('click', calculateApy);
    }
    
    // Slider de duração
    const stakingDuration = document.getElementById('staking-duration');
    const durationValue = document.getElementById('duration-value');
    
    if (stakingDuration && durationValue) {
        stakingDuration.addEventListener('input', () => {
            durationValue.textContent = `${stakingDuration.value} dias`;
        });
    }
    
    // Botões de staking
    const stakingButtons = document.querySelectorAll('.staking-option-card button');
    stakingButtons.forEach(button => {
        button.addEventListener('click', openStakingModal);
    });
    
    // Botão de staking após cálculo
    const stakeNowBtn = document.getElementById('stake-now');
    if (stakeNowBtn) {
        stakeNowBtn.addEventListener('click', handleStaking);
    }
}

// Verificar sessão de usuário
function checkUserSession() {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
        appState.user = JSON.parse(storedUser);
        updateUserInterface();
    }
}

// Abrir modal de conexão de carteira
function openWalletModal() {
    const walletModal = new bootstrap.Modal(document.getElementById('walletModal'));
    walletModal.show();
}

// Conectar carteira (simulado)
async function connectWallet(walletType) {
    try {
        // Simulação de conexão de carteira
        console.log(`Conectando carteira ${WALLET_TYPES[walletType]}...`);
        
        // Simular endereço de carteira
        const walletAddress = `0x${Math.random().toString(16).substring(2, 14)}...${Math.random().toString(16).substring(2, 6)}`;
        
        // Criar usuário se não existir
        if (!appState.user) {
            const username = `user_${Math.random().toString(36).substring(2, 8)}`;
            const email = `${username}@example.com`;
            
            const userData = {
                username,
                email
            };
            
            // Registrar usuário
            const response = await fetch(`${API_BASE_URL}/user/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });
            
            const data = await response.json();
            
            if (response.ok) {
                appState.user = data.user;
                localStorage.setItem('user', JSON.stringify(data.user));
            } else {
                throw new Error(data.error || 'Erro ao registrar usuário');
            }
        }
        
        // Conectar carteira ao usuário
        const walletData = {
            user_id: appState.user.id,
            address: walletAddress,
            wallet_type: walletType
        };
        
        const response = await fetch(`${API_BASE_URL}/wallet/connect`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(walletData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            appState.wallet = data.wallet;
            updateWalletInterface();
            
            // Fechar modal
            const walletModal = bootstrap.Modal.getInstance(document.getElementById('walletModal'));
            if (walletModal) {
                walletModal.hide();
            }
            
            // Mostrar notificação de sucesso
            showNotification('Carteira conectada com sucesso!', 'success');
        } else {
            throw new Error(data.error || 'Erro ao conectar carteira');
        }
    } catch (error) {
        console.error('Erro ao conectar carteira:', error);
        showNotification(`Erro ao conectar carteira: ${error.message}`, 'danger');
    }
}

// Atualizar interface do usuário
function updateUserInterface() {
    if (appState.user) {
        // Implementar lógica para atualizar a interface com dados do usuário
        console.log('Usuário logado:', appState.user);
    }
}

// Atualizar interface da carteira
function updateWalletInterface() {
    if (appState.wallet) {
        // Esconder botão de conexão
        const connectWalletBtn = document.getElementById('connect-wallet-btn');
        const walletInfo = document.getElementById('wallet-info');
        const walletAddress = document.getElementById('wallet-address');
        const walletBalance = document.getElementById('wallet-balance');
        
        if (connectWalletBtn && walletInfo && walletAddress && walletBalance) {
            connectWalletBtn.classList.add('d-none');
            walletInfo.classList.remove('d-none');
            
            // Mostrar endereço abreviado
            walletAddress.textContent = appState.wallet.address;
            
            // Mostrar saldo
            walletBalance.textContent = `${appState.wallet.balance_agrox || 1000} AGROX`;
        }
    }
}

// Buscar leaderboard
async function fetchLeaderboard(category) {
    try {
        const response = await fetch(`${API_BASE_URL}/token/leaderboard?category=${category}`);
        
        if (!response.ok) {
            throw new Error('Erro ao buscar leaderboard');
        }
        
        const data = await response.json();
        
        if (category === 'market_cap') {
            appState.leaderboard.marketcap = data.tokens || [];
            updateLeaderboardTable('marketcap');
        } else if (category === 'winners') {
            appState.leaderboard.winners = data.tokens || [];
            updateLeaderboardTable('winners');
        }
    } catch (error) {
        console.error(`Erro ao buscar leaderboard (${category}):`, error);
        // Usar dados de exemplo para demonstração
        useDemoLeaderboardData(category);
    }
}

// Usar dados de exemplo para o leaderboard
function useDemoLeaderboardData(category) {
    const demoData = [
        {
            id: 1,
            name: 'Fazenda Verde Soja',
            symbol: 'FVSOJA',
            type: 'SOYBEAN',
            country: 'BR',
            price: 1.25,
            price_change_24h: 5.2,
            market_cap: 1250000,
            token_image: '/images/token-placeholder.png'
        },
        {
            id: 2,
            name: 'Café Montanhas',
            symbol: 'CAFEMT',
            type: 'COFFEE',
            country: 'BR',
            price: 0.85,
            price_change_24h: -1.8,
            market_cap: 850000,
            token_image: '/images/token-placeholder.png'
        },
        {
            id: 3,
            name: 'Cana Dourada',
            symbol: 'CANAD',
            type: 'SUGARCANE',
            country: 'BR',
            price: 0.45,
            price_change_24h: 12.5,
            market_cap: 450000,
            token_image: '/images/token-placeholder.png'
        },
        {
            id: 4,
            name: 'Gado Premium',
            symbol: 'GADOP',
            type: 'LIVESTOCK',
            country: 'AR',
            price: 0.75,
            price_change_24h: 8.3,
            market_cap: 750000,
            token_image: '/images/token-placeholder.png'
        }
    ];
    
    if (category === 'market_cap') {
        // Ordenar por market cap
        appState.leaderboard.marketcap = [...demoData].sort((a, b) => b.market_cap - a.market_cap);
        updateLeaderboardTable('marketcap');
    } else if (category === 'winners') {
        // Ordenar por variação 24h
        appState.leaderboard.winners = [...demoData].sort((a, b) => b.price_change_24h - a.price_change_24h);
        updateLeaderboardTable('winners');
    }
}

// Atualizar tabela do leaderboard
function updateLeaderboardTable(tableId) {
    const tableElement = document.getElementById(`${tableId}-table`);
    if (!tableElement) return;
    
    const tokens = tableId === 'marketcap' ? appState.leaderboard.marketcap : appState.leaderboard.winners;
    
    if (!tokens || tokens.length === 0) {
        tableElement.innerHTML = `<tr><td colspan="7" class="text-center">Nenhum token encontrado</td></tr>`;
        return;
    }
    
    let html = '';
    
    tokens.forEach((token, index) => {
        const commodityIcon = getCommodityIcon(token.type);
        const countryFlag = getCountryFlag(token.country);
        const priceChangeClass = token.price_change_24h >= 0 ? 'text-success' : 'text-danger';
        const priceChangeSign = token.price_change_24h >= 0 ? '+' : '';
        
        html += `
            <tr class="token-row">
                <td>${index + 1}</td>
                <td>
                    <div class="d-flex align-items-center">
                        <img src="${token.token_image || '/images/token-placeholder.png'}" alt="${token.name}" class="token-icon me-2">
                        <div>
                            <div class="fw-bold">${token.name}</div>
                            <div class="text-muted">${token.symbol}</div>
                        </div>
                    </div>
                </td>
                <td>
                    <div class="d-flex align-items-center">
                        <img src="${commodityIcon}" alt="${token.type}" class="commodity-icon me-2">
                        <span>${getCommodityName(token.type)}</span>
                    </div>
                </td>
                <td>${countryFlag} ${getCountryName(token.country)}</td>
                <td>$${token.price.toFixed(2)}</td>
                <td class="${priceChangeClass}">${priceChangeSign}${token.price_change_24h.toFixed(1)}%</td>
                <td>$${formatNumber(token.market_cap)}</td>
            </tr>
        `;
    });
    
    tableElement.innerHTML = html;
}

// Filtrar leaderboard
function filterLeaderboard() {
    const tokenTypeFilter = document.getElementById('token-type-filter');
    const countryFilter = document.getElementById('country-filter');
    
    const tokenType = tokenTypeFilter ? tokenTypeFilter.value : '';
    const country = countryFilter ? countryFilter.value : '';
    
    // Filtrar marketcap
    const filteredMarketcap = appState.leaderboard.marketcap.filter(token => {
        return (tokenType === '' || token.type === tokenType) && 
               (country === '' || token.country === country);
    });
    
    // Filtrar winners
    const filteredWinners = appState.leaderboard.winners.filter(token => {
        return (tokenType === '' || token.type === tokenType) && 
               (country === '' || token.country === country);
    });
    
    // Atualizar tabelas
    const marketcapTable = document.getElementById('marketcap-table');
    const winnersTable = document.getElementById('winners-table');
    
    if (marketcapTable) {
        let html = '';
        
        if (filteredMarketcap.length === 0) {
            html = `<tr><td colspan="7" class="text-center">Nenhum token encontrado com os filtros selecionados</td></tr>`;
        } else {
            filteredMarketcap.forEach((token, index) => {
                const commodityIcon = getCommodityIcon(token.type);
                const countryFlag = getCountryFlag(token.country);
                const priceChangeClass = token.price_change_24h >= 0 ? 'text-success' : 'text-danger';
                const priceChangeSign = token.price_change_24h >= 0 ? '+' : '';
                
                html += `
                    <tr class="token-row">
                        <td>${index + 1}</td>
                        <td>
                            <div class="d-flex align-items-center">
                                <img src="${token.token_image || '/images/token-placeholder.png'}" alt="${token.name}" class="token-icon me-2">
                                <div>
                                    <div class="fw-bold">${token.name}</div>
                                    <div class="text-muted">${token.symbol}</div>
                                </div>
                            </div>
                        </td>
                        <td>
                            <div class="d-flex align-items-center">
                                <img src="${commodityIcon}" alt="${token.type}" class="commodity-icon me-2">
                                <span>${getCommodityName(token.type)}</span>
                            </div>
                        </td>
                        <td>${countryFlag} ${getCountryName(token.country)}</td>
                        <td>$${token.price.toFixed(2)}</td>
                        <td class="${priceChangeClass}">${priceChangeSign}${token.price_change_24h.toFixed(1)}%</td>
                        <td>$${formatNumber(token.market_cap)}</td>
                    </tr>
                `;
            });
        }
        
        marketcapTable.innerHTML = html;
    }
    
    if (winnersTable) {
        let html = '';
        
        if (filteredWinners.length === 0) {
            html = `<tr><td colspan="7" class="text-center">Nenhum token encontrado com os filtros selecionados</td></tr>`;
        } else {
            filteredWinners.forEach((token, index) => {
                const commodityIcon = getCommodityIcon(token.type);
                const countryFlag = getCountryFlag(token.country);
                const priceChangeClass = token.price_change_24h >= 0 ? 'text-success' : 'text-danger';
                const priceChangeSign = token.price_change_24h >= 0 ? '+' : '';
                
                html += `
                    <tr class="token-row">
                        <td>${index + 1}</td>
                        <td>
                            <div class="d-flex align-items-center">
                                <img src="${token.token_image || '/images/token-placeholder.png'}" alt="${token.name}" class="token-icon me-2">
                                <div>
                                    <div class="fw-bold">${token.name}</div>
                                    <div class="text-muted">${token.symbol}</div>
                                </div>
                            </div>
                        </td>
                        <td>
                            <div class="d-flex align-items-center">
                                <img src="${commodityIcon}" alt="${token.type}" class="commodity-icon me-2">
                                <span>${getCommodityName(token.type)}</span>
                            </div>
                        </td>
                        <td>${countryFlag} ${getCountryName(token.country)}</td>
                        <td>$${token.price.toFixed(2)}</td>
                        <td class="${priceChangeClass}">${priceChangeSign}${token.price_change_24h.toFixed(1)}%</td>
                        <td>$${formatNumber(token.market_cap)}</td>
                    </tr>
                `;
            });
        }
        
        winnersTable.innerHTML = html;
    }
}

// Buscar taxas de APY
async function fetchApyRates() {
    try {
        const response = await fetch(`${API_BASE_URL}/staking/apy/rates`);
        
        if (!response.ok) {
            throw new Error('Erro ao buscar taxas de APY');
        }
        
        const data = await response.json();
        appState.apyRates = data.apy_rates || {};
        
        // Atualizar interface com as taxas
        updateApyRatesInterface();
    } catch (error) {
        console.error('Erro ao buscar taxas de APY:', error);
        // Usar dados de exemplo
        appState.apyRates = {
            'SUGARCANE': 0.12,
            'COFFEE': 0.15,
            'SOY': 0.18,
            'LIVESTOCK': 0.14,
            'BASKET': 0.16
        };
        
        // Atualizar interface com as taxas
        updateApyRatesInterface();
    }
}

// Atualizar interface com taxas de APY
function updateApyRatesInterface() {
    // Atualizar valores de APY nas opções de staking
    const stakingOptions = document.querySelectorAll('.staking-option-card');
    
    stakingOptions.forEach(option => {
        const titleElement = option.querySelector('h5');
        const apyValueElement = option.querySelector('.apy-value');
        
        if (titleElement && apyValueElement) {
            const title = titleElement.textContent.trim();
            let apyType = '';
            
            // Mapear título para tipo de APY
            if (title === 'Cana-de-açúcar') apyType = 'SUGARCANE';
            else if (title === 'Café') apyType = 'COFFEE';
            else if (title === 'Soja') apyType = 'SOY';
            else if (title === 'Pecuária') apyType = 'LIVESTOCK';
            else if (title === 'Cesta de Diversidade') apyType = 'BASKET';
            
            if (apyType && appState.apyRates[apyType]) {
                apyValueElement.textContent = `${(appState.apyRates[apyType] * 100).toFixed(0)}%`;
            }
        }
    });
    
    // Atualizar opções no select da calculadora
    const stakingTypeSelect = document.getElementById('staking-type');
    
    if (stakingTypeSelect) {
        const options = stakingTypeSelect.querySelectorAll('option');
        
        options.forEach(option => {
            const value = option.value;
            
            if (value && appState.apyRates[value]) {
                option.textContent = `${getCommodityName(value)} (${(appState.apyRates[value] * 100).toFixed(0)}% APY)`;
            }
        });
    }
}

// Inicializar calculadora de APY
function initApyCalculator() {
    const stakingDuration = document.getElementById('staking-duration');
    const durationValue = document.getElementById('duration-value');
    
    if (stakingDuration && durationValue) {
        durationValue.textContent = `${stakingDuration.value} dias`;
    }
}

// Calcular APY
function calculateApy() {
    const stakingAmount = document.getElementById('staking-amount');
    const stakingType = document.getElementById('staking-type');
    const stakingDuration = document.getElementById('staking-duration');
    const apyResults = document.getElementById('apy-results');
    
    if (!stakingAmount || !stakingType || !stakingDuration || !apyResults) {
        return;
    }
    
    const amount = parseFloat(stakingAmount.value);
    const type = stakingType.value;
    const duration = parseInt(stakingDuration.value);
    
    if (isNaN(amount) || amount <= 0) {
        showNotification('Por favor, insira uma quantidade válida', 'warning');
        return;
    }
    
    // Obter taxa de APY
    const apyRate = appState.apyRates[type] || 0.10;
    
    // Calcular rendimento
    const projectedYield = amount * apyRate * (duration / 365);
    const totalReturn = amount + projectedYield;
    
    // Atualizar interface
    const initialInvestment = document.getElementById('initial-investment');
    const apyRateElement = document.getElementById('apy-rate');
    const durationElement = document.getElementById('duration');
    const projectedYieldElement = document.getElementById('projected-yield');
    const totalReturnElement = document.getElementById('total-return');
    
    if (initialInvestment && apyRateElement && durationElement && projectedYieldElement && totalReturnElement) {
        initialInvestment.textContent = `${amount.toFixed(2)} AGROX`;
        apyRateElement.textContent = `${(apyRate * 100).toFixed(0)}%`;
        durationElement.textContent = `${duration} dias`;
        projectedYieldElement.textContent = `${projectedYield.toFixed(2)} AGROX`;
        totalReturnElement.textContent = `${totalReturn.toFixed(2)} AGROX`;
        
        // Mostrar resultados
        apyResults.classList.remove('d-none');
    }
}

// Abrir modal de staking
function openStakingModal() {
    // Implementar lógica para abrir modal de staking
    console.log('Abrindo modal de staking...');
}

// Realizar staking
async function handleStaking() {
    if (!appState.user || !appState.wallet) {
        showNotification('Conecte sua carteira para fazer staking', 'warning');
        return;
    }
    
    const stakingAmount = document.getElementById('staking-amount');
    const stakingType = document.getElementById('staking-type');
    const stakingDuration = document.getElementById('staking-duration');
    
    if (!stakingAmount || !stakingType || !stakingDuration) {
        return;
    }
    
    const amount = parseFloat(stakingAmount.value);
    const type = stakingType.value;
    const duration = parseInt(stakingDuration.value);
    
    if (isNaN(amount) || amount <= 0) {
        showNotification('Por favor, insira uma quantidade válida', 'warning');
        return;
    }
    
    try {
        const stakingData = {
            user_id: appState.user.id,
            amount: amount,
            apy_type: type,
            duration_days: duration
        };
        
        const response = await fetch(`${API_BASE_URL}/staking/lock`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(stakingData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showNotification('Staking realizado com sucesso!', 'success');
            
            // Esconder resultados
            const apyResults = document.getElementById('apy-results');
            if (apyResults) {
                apyResults.classList.add('d-none');
            }
            
            // Limpar formulário
            stakingAmount.value = '';
        } else {
            throw new Error(data.error || 'Erro ao realizar staking');
        }
    } catch (error) {
        console.error('Erro ao realizar staking:', error);
        showNotification(`Erro ao realizar staking: ${error.message}`, 'danger');
    }
}

// Criar token
async function handleTokenCreation(event) {
    event.preventDefault();
    
    if (!appState.user || !appState.wallet) {
        showNotification('Conecte sua carteira para criar um token', 'warning');
        return;
    }
    
    // Obter dados do formulário
    const tokenName = document.getElementById('token-name').value;
    const tokenSymbol = document.getElementById('token-symbol').value;
    const tokenType = document.getElementById('token-type').value;
    const initialSupply = document.getElementById('initial-supply').value;
    const farmLocation = document.getElementById('farm-location').value;
    const farmCountry = document.getElementById('farm-country').value;
    const farmSize = document.getElementById('farm-size').value;
    const socialInstagram = document.getElementById('social-instagram').value;
    const socialWebsite = document.getElementById('social-website').value;
    
    // Validar campos obrigatórios
    if (!tokenName || !tokenSymbol || !tokenType || !initialSupply || !farmLocation || !farmCountry) {
        showNotification('Preencha todos os campos obrigatórios', 'warning');
        return;
    }
    
    // Preparar dados do token
    const tokenData = {
        creator_id: appState.user.id,
        name: tokenName,
        symbol: tokenSymbol,
        type: tokenType,
        initial_supply: parseInt(initialSupply),
        farm_location: farmLocation,
        country: farmCountry,
        farm_size: farmSize ? parseFloat(farmSize) : null,
        social_networks: {
            instagram: socialInstagram,
            website: socialWebsite
        },
        price: 0.01, // Preço inicial simulado
        token_image: '/images/token-placeholder.png', // Imagem padrão
        farm_images: [] // Imagens da fazenda
    };
    
    try {
        // Upload de imagem do token
        const tokenImageInput = document.getElementById('token-image');
        if (tokenImageInput && tokenImageInput.files.length > 0) {
            const tokenImagePath = await uploadImage(tokenImageInput.files[0], 'token');
            if (tokenImagePath) {
                tokenData.token_image = tokenImagePath;
            }
        }
        
        // Upload de imagens da fazenda
        const farmImagesInput = document.getElementById('farm-images');
        if (farmImagesInput && farmImagesInput.files.length > 0) {
            const farmImagePaths = [];
            
            for (let i = 0; i < farmImagesInput.files.length; i++) {
                const farmImagePath = await uploadImage(farmImagesInput.files[i], 'farm');
                if (farmImagePath) {
                    farmImagePaths.push(farmImagePath);
                }
            }
            
            if (farmImagePaths.length > 0) {
                tokenData.farm_images = farmImagePaths;
            }
        }
        
        // Criar token
        const response = await fetch(`${API_BASE_URL}/token/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(tokenData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showNotification('Token criado com sucesso!', 'success');
            
            // Limpar formulário
            document.getElementById('token-creation-form').reset();
            
            // Atualizar leaderboard
            fetchLeaderboard('market_cap');
            fetchLeaderboard('winners');
            
            // Redirecionar para leaderboard
            window.location.href = '#leaderboard';
        } else {
            throw new Error(data.error || 'Erro ao criar token');
        }
    } catch (error) {
        console.error('Erro ao criar token:', error);
        showNotification(`Erro ao criar token: ${error.message}`, 'danger');
    }
}

// Upload de imagem
async function uploadImage(file, type) {
    try {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('type', type);
        
        const response = await fetch(`${API_BASE_URL}/token/upload/image`, {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (response.ok) {
            return data.path;
        } else {
            throw new Error(data.error || 'Erro ao fazer upload de imagem');
        }
    } catch (error) {
        console.error('Erro ao fazer upload de imagem:', error);
        return null;
    }
}

// Preview de imagem do token
function previewTokenImage(event) {
    const file = event.target.files[0];
    const preview = document.getElementById('token-image-preview');
    
    if (file && preview) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            preview.src = e.target.result;
        };
        
        reader.readAsDataURL(file);
    }
}

// Preview de imagens da fazenda
function previewFarmImages(event) {
    const files = event.target.files;
    const previewContainer = document.querySelector('.farm-images-preview');
    
    if (files && previewContainer) {
        // Limpar previews existentes
        previewContainer.innerHTML = '';
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const reader = new FileReader();
            
            reader.onload = function(e) {
                const previewDiv = document.createElement('div');
                previewDiv.className = 'farm-image-placeholder';
                
                const img = document.createElement('img');
                img.src = e.target.result;
                img.className = 'img-fluid rounded';
                img.alt = 'Farm Preview';
                
                previewDiv.appendChild(img);
                previewContainer.appendChild(previewDiv);
            };
            
            reader.readAsDataURL(file);
        }
    }
}

// Buscar países
async function fetchCountries() {
    try {
        const response = await fetch(`${API_BASE_URL}/token/countries`);
        
        if (!response.ok) {
            throw new Error('Erro ao buscar países');
        }
        
        const data = await response.json();
        appState.countries = data.countries || [];
        
        // Atualizar select de países
        updateCountriesSelect();
    } catch (error) {
        console.error('Erro ao buscar países:', error);
        // Usar dados de exemplo
        appState.countries = ['BR', 'AR', 'US', 'CA', 'AU', 'IN', 'CN'];
        
        // Atualizar select de países
        updateCountriesSelect();
    }
}

// Atualizar select de países
function updateCountriesSelect() {
    const countryFilter = document.getElementById('country-filter');
    const farmCountry = document.getElementById('farm-country');
    
    if (countryFilter && appState.countries.length > 0) {
        let html = '<option value="">Todos os Países</option>';
        
        appState.countries.forEach(country => {
            html += `<option value="${country}">${getCountryFlag(country)} ${getCountryName(country)}</option>`;
        });
        
        countryFilter.innerHTML = html;
    }
    
    // Não atualizar o select de países do formulário de criação de token
    // pois já está preenchido com os países mais comuns
}

// Buscar tipos de tokens
async function fetchTokenTypes() {
    try {
        const response = await fetch(`${API_BASE_URL}/token/types`);
        
        if (!response.ok) {
            throw new Error('Erro ao buscar tipos de tokens');
        }
        
        const data = await response.json();
        appState.tokenTypes = data.types || [];
        
        // Atualizar select de tipos
        updateTokenTypesSelect();
    } catch (error) {
        console.error('Erro ao buscar tipos de tokens:', error);
        // Usar dados de exemplo
        appState.tokenTypes = ['SOYBEAN', 'CORN', 'SUGARCANE', 'COFFEE', 'LIVESTOCK', 'COTTON', 'RICE', 'WHEAT', 'COCOA', 'RUBBER'];
        
        // Atualizar select de tipos
        updateTokenTypesSelect();
    }
}

// Atualizar select de tipos de tokens
function updateTokenTypesSelect() {
    const tokenTypeFilter = document.getElementById('token-type-filter');
    
    if (tokenTypeFilter && appState.tokenTypes.length > 0) {
        let html = '<option value="">Todos os Tipos</option>';
        
        appState.tokenTypes.forEach(type => {
            html += `<option value="${type}">${getCommodityName(type)}</option>`;
        });
        
        tokenTypeFilter.innerHTML = html;
    }
    
    // Não atualizar o select de tipos do formulário de criação de token
    // pois já está preenchido com os tipos mais comuns
}

// Obter ícone de commodity
function getCommodityIcon(type) {
    const icons = {
        'SOYBEAN': '/images/commodities/soybean.svg',
        'CORN': '/images/commodities/corn.svg',
        'SUGARCANE': '/images/commodities/sugarcane.svg',
        'COFFEE': '/images/commodities/coffee.svg',
        'LIVESTOCK': '/images/commodities/livestock.svg',
        'COTTON': '/images/commodities/cotton.svg',
        'RICE': '/images/commodities/rice.svg',
        'WHEAT': '/images/commodities/wheat.svg',
        'COCOA': '/images/commodities/cocoa.svg',
        'RUBBER': '/images/commodities/rubber.svg'
    };
    
    return icons[type] || '/images/commodities/default.svg';
}

// Obter nome de commodity
function getCommodityName(type) {
    const names = {
        'SOYBEAN': 'Soja',
        'CORN': 'Milho',
        'SUGARCANE': 'Cana-de-açúcar',
        'COFFEE': 'Café',
        'LIVESTOCK': 'Pecuária',
        'COTTON': 'Algodão',
        'RICE': 'Arroz',
        'WHEAT': 'Trigo',
        'COCOA': 'Cacau',
        'RUBBER': 'Borracha',
        'BASKET': 'Cesta de Diversidade'
    };
    
    return names[type] || type;
}

// Obter bandeira de país
function getCountryFlag(countryCode) {
    return `<span class="flag-icon flag-icon-${countryCode.toLowerCase()} me-1"></span>`;
}

// Obter nome de país
function getCountryName(countryCode) {
    const names = {
        'BR': 'Brasil',
        'AR': 'Argentina',
        'US': 'Estados Unidos',
        'CA': 'Canadá',
        'AU': 'Austrália',
        'IN': 'Índia',
        'CN': 'China'
    };
    
    return names[countryCode] || countryCode;
}

// Formatar número
function formatNumber(number) {
    if (number >= 1000000) {
        return (number / 1000000).toFixed(2) + 'M';
    } else if (number >= 1000) {
        return (number / 1000).toFixed(2) + 'K';
    } else {
        return number.toFixed(2);
    }
}

// Mostrar notificação
function showNotification(message, type) {
    // Criar elemento de notificação
    const notification = document.createElement('div');
    notification.className = `toast align-items-center text-white bg-${type} border-0`;
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', 'assertive');
    notification.setAttribute('aria-atomic', 'true');
    
    notification.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;
    
    // Adicionar ao container de notificações
    let toastContainer = document.querySelector('.toast-container');
    
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        document.body.appendChild(toastContainer);
    }
    
    toastContainer.appendChild(notification);
    
    // Inicializar toast
    const toast = new bootstrap.Toast(notification, {
        autohide: true,
        delay: 5000
    });
    
    toast.show();
}

// Adicionar efeitos visuais
function addVisualEffects() {
    // Adicionar classe fade-in aos elementos
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        section.classList.add('fade-in');
    });
    
    // Adicionar efeito de hover aos cards
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px)';
            card.style.boxShadow = '0 15px 30px rgba(0, 0, 0, 0.3)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
            card.style.boxShadow = '';
        });
    });
}

// Sistema de Gerenciamento de Dados - LookEasy E-commerce
// Utiliza LocalStorage para simular persistência de dados

class DatabaseManager {
    constructor() {
        this.initializeDatabase();
    }

    // Inicializa o banco de dados com dados padrão
    initializeDatabase() {
        if (!localStorage.getItem('lookEasyUsers')) {
            this.createDefaultUsers();
        }
        if (!localStorage.getItem('lookEasyProducts')) {
            this.createDefaultProducts();
        }
        if (!localStorage.getItem('lookEasySettings')) {
            this.createDefaultSettings();
        }
        if (!localStorage.getItem('lookEasyOrders')) {
            this.createDefaultOrders();
        }
    }

    // Cria usuários padrão
    createDefaultUsers() {
        const defaultUsers = [
            {
                id: 1,
                nome: "Administrador",
                email: "admin@lookeasy.com",
                senha: this.hashPassword("admin123"),
                role: "admin",
                dataCriacao: new Date().toISOString(),
                ativo: true
            },
            {
                id: 2,
                nome: "Cliente Teste",
                email: "cliente@lookeasy.com",
                senha: this.hashPassword("cliente123"),
                role: "cliente",
                dataCriacao: new Date().toISOString(),
                ativo: true
            }
        ];

        localStorage.setItem('lookEasyUsers', JSON.stringify(defaultUsers));
    }

    // Cria produtos padrão
    createDefaultProducts() {
        const defaultProducts = [
            {
                id: 1,
                nome: "Camiseta Premium",
                categoria: "feminino",
                preco: 89.90,
                imagem: "https://placehold.co/200x250/E5E7EB/1F2937?text=Camiseta+Premium",
                estoque: 50,
                tamanhos: ["P", "M", "G"],
                cores: ["Preto", "Branco", "Azul"],
                descricao: "Camiseta premium de algodão com design moderno",
                ativo: true,
                dataCadastro: new Date().toISOString()
            },
            {
                id: 2,
                nome: "Calça Jeans",
                categoria: "feminino",
                preco: 159.90,
                imagem: "https://placehold.co/200x250/E5E7EB/1F2937?text=Calça+Jeans",
                estoque: 30,
                tamanhos: ["36", "38", "40", "42"],
                cores: ["Azul Escuro", "Azul Claro"],
                descricao: "Calça jeans skinny de alta qualidade",
                ativo: true,
                dataCadastro: new Date().toISOString()
            },
            {
                id: 3,
                nome: "Moleton Street",
                categoria: "masculino",
                preco: 199.90,
                imagem: "https://placehold.co/200x250/E5E7EB/1F2937?text=Moleton+Street",
                estoque: 0,
                tamanhos: ["P", "M", "G", "GG"],
                cores: ["Cinza", "Preto", "Azul"],
                descricao: "Moleton confortável ideal para o inverno",
                ativo: true,
                dataCadastro: new Date().toISOString()
            },
            {
                id: 4,
                nome: "Vestido Summer",
                categoria: "feminino",
                preco: 129.90,
                imagem: "https://placehold.co/200x250/E5E7EB/1F2937?text=Vestido+Summer",
                estoque: 20,
                tamanhos: ["P", "M", "G"],
                cores: ["Floral", "Laranja", "Azul"],
                descricao: "Vestido leve perfeito para o verão",
                ativo: true,
                dataCadastro: new Date().toISOString()
            },
            {
                id: 5,
                nome: "Bermuda Sport",
                categoria: "masculino",
                preco: 79.90,
                imagem: "https://placehold.co/200x250/E5E7EB/1F2937?text=Bermuda+Sport",
                estoque: 40,
                tamanhos: ["P", "M", "G", "GG"],
                cores: ["Preto", "Azul", "Cinza"],
                descricao: "Bermuda esportiva confortável para atividades físicas",
                ativo: true,
                dataCadastro: new Date().toISOString()
            },
            {
                id: 6,
                nome: "Jaqueta Leve",
                categoria: "acessorios",
                preco: 249.90,
                imagem: "https://placehold.co/200x250/E5E7EB/1F2937?text=Jaqueta+Leve",
                estoque: 3,
                tamanhos: ["P", "M", "G"],
                cores: ["Preto", "Cinza", "Azul Marinho"],
                descricao: "Jaqueta leve ideal para meia estação",
                ativo: true,
                dataCadastro: new Date().toISOString()
            },
            {
                id: 7,
                nome: "Vestido Floral Elegante",
                categoria: "feminino",
                preco: 189.90,
                imagem: "https://placehold.co/300x400/FFB6C1/333333?text=Vestido+Floral",
                descricao: "Vestido estampado floral, perfeito para ocasiões especiais",
                tamanhos: ["P", "M", "G"],
                cores: ["Floral Multicolorido", "Azul Claro", "Rosa Suave"],
                estoque: 12
            },
            {
                id: 8,
                nome: "Vestido Promoção Especial",
                categoria: "feminino",
                preco: 129.90,
                imagem: "https://placehold.co/300x400/FF69B4/FFFFFF?text=Vestido+Promo",
                descricao: "Vestido em promoção por tempo limitado",
                tamanhos: ["P", "M", "G"],
                cores: ["Preto", "Vermelho"],
                estoque: 8
            },
            {
                id: 9,
                nome: "Blusa Esgotada",
                categoria: "feminino",
                preco: 99.90,
                imagem: "https://placehold.co/300x400/DDA0DD/333333?text=Blusa+Esgotada",
                descricao: "Blusa elegante temporariamente indisponível",
                tamanhos: ["P", "M"],
                cores: ["Branco", "Preto"],
                estoque: 0
            },
            {
                id: 10,
                nome: "Camisa Social Masculina",
                categoria: "masculino",
                preco: 149.90,
                imagem: "https://placehold.co/300x400/4169E1/FFFFFF?text=Camisa+Social",
                descricao: "Camisa social elegante para eventos formais",
                tamanhos: ["P", "M", "G", "GG"],
                cores: ["Branco", "Azul Marinho", "Preto"],
                estoque: 15
            },
            {
                id: 11,
                nome: "Tênis Esportivo",
                categoria: "outros",
                preco: 299.90,
                imagem: "https://placehold.co/300x400/28a745/FFFFFF?text=Tênis+Sport",
                descricao: "Tênis confortável para corrida e caminhada",
                tamanhos: ["38", "39", "40", "41", "42"],
                cores: ["Preto", "Branco", "Azul"],
                estoque: 2
            },
            {
                id: 12,
                nome: "Óculos de Sol Elegante",
                categoria: "acessorios",
                preco: 199.90,
                imagem: "https://placehold.co/300x400/9370DB/FFFFFF?text=Óculos+Sol",
                descricao: "Óculos de sol com proteção UV e design moderno",
                tamanhos: ["Único"],
                cores: ["Preto", "Marrom", "Prata"],
                estoque: 25
            }
        ];

        localStorage.setItem('lookEasyProducts', JSON.stringify(defaultProducts));
    }

    // Cria configurações padrão
    createDefaultSettings() {
        const defaultSettings = {
            empresa: {
                nome: "LookEasy",
                email: "contato@lookeasy.com",
                telefone: "(11) 9999-9999",
                endereco: "São Paulo, SP"
            },
            sistema: {
                versao: "1.0.0",
                modoManutencao: false,
                estoqueMinimo: 5
            }
        };

        localStorage.setItem('lookEasySettings', JSON.stringify(defaultSettings));
    }

    // Cria pedidos padrão
    createDefaultOrders() {
        const defaultOrders = [
            {
                id: 1,
                userId: 2, // Cliente Teste
                nomeCliente: "Cliente Teste",
                emailCliente: "cliente@lookeasy.com",
                itens: [
                    {
                        productId: 1,
                        nome: "Camiseta Premium",
                        preco: 89.90,
                        quantidade: 1,
                        tamanho: "M",
                        cor: "Preto",
                        imagem: "https://placehold.co/200x250/E5E7EB/1F2937?text=Camiseta+Premium"
                    }
                ],
                total: 89.90,
                status: "entregue",
                dataPedido: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 dias atrás
                dataAtualizacao: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
            }
        ];

        localStorage.setItem('lookEasyOrders', JSON.stringify(defaultOrders));
    }

    // Sistema de Hash simples para senhas (em produção usar bcrypt)
    hashPassword(senha) {
        let hash = 0;
        for (let i = 0; i < senha.length; i++) {
            const char = senha.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString();
    }

    // ===== MÉTODOS DE USUÁRIOS =====

    // Verificar se email já existe
    emailExists(email) {
        const users = this.getUsers();
        return users.some(user => user.email === email && user.ativo);
    }

    // Obter todos os usuários
    getUsers() {
        const users = localStorage.getItem('lookEasyUsers');
        return users ? JSON.parse(users) : [];
    }

    // Obter usuário por ID
    getUserById(id) {
        const users = this.getUsers();
        return users.find(user => user.id === parseInt(id));
    }

    // Obter usuário por email
    getUserByEmail(email) {
        const users = this.getUsers();
        return users.find(user => user.email === email && user.ativo);
    }

    // Criar novo usuário
    createUser(userData) {
        const users = this.getUsers();
        const newUser = {
            id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
            ...userData,
            senha: this.hashPassword(userData.senha),
            dataCriacao: new Date().toISOString(),
            ativo: true
        };

        users.push(newUser);
        localStorage.setItem('lookEasyUsers', JSON.stringify(users));
        return newUser;
    }

    // Atualizar usuário
    updateUser(id, userData) {
        const users = this.getUsers();
        const index = users.findIndex(user => user.id === parseInt(id));

        if (index !== -1) {
            users[index] = { ...users[index], ...userData };
            if (userData.senha) {
                users[index].senha = this.hashPassword(userData.senha);
            }
            localStorage.setItem('lookEasyUsers', JSON.stringify(users));
            return users[index];
        }
        return null;
    }

    // Inativar usuário
    inactivateUser(id) {
        return this.updateUser(id, { ativo: false });
    }

    // ===== MÉTODOS DE AUTENTICAÇÃO =====

    // Autenticar usuário
    authenticate(email, senha) {
        const user = this.getUserByEmail(email);
        if (user && user.senha === this.hashPassword(senha)) {
            return user;
        }
        return null;
    }

    // Salvar sessão do usuário
    saveSession(user) {
        const session = {
            user: {
                id: user.id,
                nome: user.nome,
                email: user.email,
                role: user.role
            },
            loginTime: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 horas
        };

        localStorage.setItem('lookEasySession', JSON.stringify(session));
        return session;
    }

    // Obter sessão atual
    getCurrentSession() {
        const session = localStorage.getItem('lookEasySession');
        if (session) {
            const sessionData = JSON.parse(session);
            const now = new Date();
            const expiresAt = new Date(sessionData.expiresAt);

            if (now < expiresAt) {
                return sessionData;
            } else {
                this.clearSession();
            }
        }
        return null;
    }

    // Limpar sessão
    clearSession() {
        localStorage.removeItem('lookEasySession');
    }

    // Verificar se usuário está logado
    isLoggedIn() {
        return this.getCurrentSession() !== null;
    }

    // Verificar se usuário é administrador
    isAdmin() {
        const session = this.getCurrentSession();
        return session && session.user.role === 'admin';
    }

    // ===== MÉTODOS DE PRODUTOS =====

    // Obter todos os produtos
    getProducts() {
        const products = localStorage.getItem('lookEasyProducts');
        return products ? JSON.parse(products) : [];
    }

    // Obter produto por ID
    getProductById(id) {
        const products = this.getProducts();
        return products.find(product => product.id === parseInt(id));
    }

    // Obter produtos por categoria
    getProductsByCategory(categoria) {
        const products = this.getProducts();
        return products.filter(product => product.categoria === categoria && product.ativo);
    }

    // Filtrar produtos
    filterProducts(filters = {}) {
        let products = this.getProducts().filter(product => product.ativo);

        if (filters.categoria && filters.categoria !== 'todos') {
            products = products.filter(p => p.categoria === filters.categoria);
        }

        if (filters.genero) {
            products = products.filter(p =>
                p.categoria === filters.genero ||
                (filters.genero === 'outros' && !['feminino', 'masculino'].includes(p.categoria))
            );
        }

        if (filters.precoMin) {
            products = products.filter(p => p.preco >= filters.precoMin);
        }

        if (filters.precoMax) {
            products = products.filter(p => p.preco <= filters.precoMax);
        }

        if (filters.tamanho) {
            products = products.filter(p => p.tamanhos.includes(filters.tamanho));
        }

        if (filters.cor) {
            products = products.filter(p => p.cores.includes(filters.cor));
        }

        if (filters.busca) {
            const busca = filters.busca.toLowerCase();
            products = products.filter(p =>
                p.nome.toLowerCase().includes(busca) ||
                p.descricao.toLowerCase().includes(busca)
            );
        }

        return products;
    }

    // Criar novo produto
    createProduct(productData) {
        const products = this.getProducts();
        const newProduct = {
            id: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1,
            ...productData,
            dataCadastro: new Date().toISOString(),
            ativo: true
        };

        products.push(newProduct);
        localStorage.setItem('lookEasyProducts', JSON.stringify(products));
        return newProduct;
    }

    // Atualizar produto
    updateProduct(id, productData) {
        const products = this.getProducts();
        const index = products.findIndex(product => product.id === parseInt(id));

        if (index !== -1) {
            products[index] = { ...products[index], ...productData };
            localStorage.setItem('lookEasyProducts', JSON.stringify(products));
            return products[index];
        }
        return null;
    }

    // Remover produto (inativar)
    removeProduct(id) {
        return this.updateProduct(id, { ativo: false });
    }

    // Atualizar estoque
    updateStock(id, quantidade) {
        const product = this.getProductById(id);
        if (product) {
            return this.updateProduct(id, { estoque: Math.max(0, quantidade) });
        }
        return null;
    }

    // Diminuir estoque
    decreaseStock(id, quantidade = 1) {
        const product = this.getProductById(id);
        if (product && product.estoque >= quantidade) {
            return this.updateProduct(id, { estoque: product.estoque - quantidade });
        }
        return null;
    }

    // ===== MÉTODOS DE CARRINHO =====

    // Obter carrinho do usuário
    getCart() {
        const cart = localStorage.getItem('lookEasyCart');
        return cart ? JSON.parse(cart) : [];
    }

    // Adicionar item ao carrinho
    addToCart(productId, quantidade = 1, tamanho = null, cor = null) {
        const cart = this.getCart();
        const product = this.getProductById(productId);

        if (!product || product.estoque < quantidade) {
            return { success: false, message: "Produto indisponível ou sem estoque suficiente" };
        }

        const existingItem = cart.find(item =>
            item.productId === productId &&
            item.tamanho === tamanho &&
            item.cor === cor
        );

        if (existingItem) {
            const newQuantity = existingItem.quantidade + quantidade;
            if (product.estoque < newQuantity) {
                return { success: false, message: "Estoque insuficiente" };
            }
            existingItem.quantidade = newQuantity;
        } else {
            cart.push({
                id: Date.now(),
                productId,
                nome: product.nome,
                preco: product.preco,
                imagem: product.imagem,
                quantidade,
                tamanho,
                cor,
                addedAt: new Date().toISOString()
            });
        }

        localStorage.setItem('lookEasyCart', JSON.stringify(cart));
        return { success: true, message: "Produto adicionado ao carrinho" };
    }

    // Remover item do carrinho
    removeFromCart(itemId) {
        const cart = this.getCart();
        const updatedCart = cart.filter(item => item.id !== itemId);
        localStorage.setItem('lookEasyCart', JSON.stringify(updatedCart));
        return updatedCart;
    }

    // Atualizar quantidade do item
    updateCartItemQuantity(itemId, quantidade) {
        const cart = this.getCart();
        const item = cart.find(item => item.id === itemId);

        if (item) {
            const product = this.getProductById(item.productId);
            if (product && product.estoque >= quantidade && quantidade > 0) {
                item.quantidade = quantidade;
                localStorage.setItem('lookEasyCart', JSON.stringify(cart));
                return { success: true };
            } else {
                return { success: false, message: "Quantidade indisponível em estoque" };
            }
        }

        return { success: false, message: "Item não encontrado" };
    }

    // Limpar carrinho
    clearCart() {
        localStorage.setItem('lookEasyCart', JSON.stringify([]));
    }

    // Calcular total do carrinho
    calculateCartTotal() {
        const cart = this.getCart();
        return cart.reduce((total, item) => total + (item.preco * item.quantidade), 0);
    }

    // Obter número de itens no carrinho
    getCartItemCount() {
        const cart = this.getCart();
        return cart.reduce((total, item) => total + item.quantidade, 0);
    }

    // ===== MÉTODOS DE PEDIDOS =====

    // Obter todos os pedidos
    getOrders() {
        const orders = localStorage.getItem('lookEasyOrders');
        return orders ? JSON.parse(orders) : [];
    }

    // Obter pedido por ID
    getOrderById(id) {
        const orders = this.getOrders();
        return orders.find(order => order.id === parseInt(id));
    }

    // Obter pedidos por usuário
    getOrdersByUser(userId) {
        const orders = this.getOrders();
        return orders.filter(order => order.userId === parseInt(userId))
            .sort((a, b) => new Date(b.dataPedido) - new Date(a.dataPedido));
    }

    // Criar novo pedido
    createOrder(userId, cart, total) {
        const orders = this.getOrders();
        const user = this.getUserById(userId);

        if (!user || cart.length === 0) {
            return { success: false, message: "Dados inválidos para criar pedido" };
        }

        const newOrder = {
            id: orders.length > 0 ? Math.max(...orders.map(o => o.id)) + 1 : 1,
            userId: userId,
            nomeCliente: user.nome,
            emailCliente: user.email,
            itens: cart.map(item => ({
                productId: item.productId,
                nome: item.nome,
                preco: item.preco,
                quantidade: item.quantidade,
                tamanho: item.tamanho,
                cor: item.cor,
                imagem: item.imagem
            })),
            total: total,
            status: "pendente", // pendente, processando, enviado, entregue, cancelado
            dataPedido: new Date().toISOString(),
            dataAtualizacao: new Date().toISOString()
        };

        orders.push(newOrder);
        localStorage.setItem('lookEasyOrders', JSON.stringify(orders));

        return { success: true, order: newOrder };
    }

    // Atualizar status do pedido
    updateOrderStatus(orderId, newStatus) {
        const orders = this.getOrders();
        const index = orders.findIndex(order => order.id === parseInt(orderId));

        if (index !== -1) {
            orders[index].status = newStatus;
            orders[index].dataAtualizacao = new Date().toISOString();
            localStorage.setItem('lookEasyOrders', JSON.stringify(orders));
            return { success: true, order: orders[index] };
        }

        return { success: false, message: "Pedido não encontrado" };
    }

    // Cancelar pedido
    cancelOrder(orderId) {
        return this.updateOrderStatus(orderId, "cancelado");
    }

    // ===== MÉTODOS DE CONFIGURAÇÕES =====

    // Obter configurações
    getSettings() {
        const settings = localStorage.getItem('lookEasySettings');
        return settings ? JSON.parse(settings) : {};
    }

    // Atualizar configurações
    updateSettings(settingsData) {
        const currentSettings = this.getSettings();
        const updatedSettings = { ...currentSettings, ...settingsData };
        localStorage.setItem('lookEasySettings', JSON.stringify(updatedSettings));
        return updatedSettings;
    }

    // ===== MÉTODOS UTILITÁRIOS =====

    // Limpar todos os dados (apenas para desenvolvimento)
    clearAllData() {
        localStorage.removeItem('lookEasyUsers');
        localStorage.removeItem('lookEasyProducts');
        localStorage.removeItem('lookEasyCart');
        localStorage.removeItem('lookEasySession');
        localStorage.removeItem('lookEasySettings');
        this.initializeDatabase();
    }

    // Exportar dados (backup)
    exportData() {
        return {
            users: this.getUsers(),
            products: this.getProducts(),
            settings: this.getSettings(),
            exportDate: new Date().toISOString()
        };
    }

    // Importar dados
    importData(data) {
        if (data.users) {
            localStorage.setItem('lookEasyUsers', JSON.stringify(data.users));
        }
        if (data.products) {
            localStorage.setItem('lookEasyProducts', JSON.stringify(data.products));
        }
        if (data.settings) {
            localStorage.setItem('lookEasySettings', JSON.stringify(data.settings));
        }
    }
}

// Instância global do banco de dados
const db = new DatabaseManager();

// Para debug - tornar disponível no console
window.db = db;

// Sistema de Autenticação - LookEasy E-commerce
// Responsável pelo gerenciamento de login, registro e sessões

class AuthManager {
    constructor() {
        this.redirectUrl = 'index.html';
        this.adminRedirectUrl = 'admin/dashboard.html';
    }

    // ===== VALIDAÇÕES =====
    
    // Validar email
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Validar senha
    validatePassword(senha) {
        return senha && senha.length >= 6;
    }

    // Validar nome
    validateName(nome) {
        return nome && nome.trim().length >= 3;
    }

    // Validar formulário de registro
    validateRegisterForm(data) {
        const errors = [];

        if (!this.validateName(data.nome)) {
            errors.push('Nome deve ter pelo menos 3 caracteres');
        }

        if (!this.validateEmail(data.email)) {
            errors.push('Email inválido');
        }

        if (!this.validatePassword(data.senha)) {
            errors.push('Senha deve ter pelo menos 6 caracteres');
        }

        if (data.senha !== data.confirmarSenha) {
            errors.push('Senhas não coincidem');
        }

        if (!data.termos) {
            errors.push('Aceite os termos de uso');
        }

        return errors;
    }

    // Validar formulário de login
    validateLoginForm(email, senha) {
        const errors = [];

        if (!this.validateEmail(email)) {
            errors.push('Email inválido');
        }

        if (!senha) {
            errors.push('Senha é obrigatória');
        }

        return errors;
    }

    // ===== AUTENTICAÇÃO =====
    
    // Realizar login
    async login(email, senha, manterConectado = false) {
        try {
            // Validar dados
            const validationErrors = this.validateLoginForm(email, senha);
            if (validationErrors.length > 0) {
                return { success: false, errors: validationErrors };
            }

            // Autenticar usuário
            const user = db.authenticate(email, senha);
            if (!user) {
                return { success: false, errors: ['Email ou senha incorretos'] };
            }

            // Verificar se usuário está ativo
            if (!user.ativo) {
                return { success: false, errors: ['Conta desativada'] };
            }

            // Salvar sessão
            const session = db.saveSession(user);
            
            // Redirecionar conforme o role
            const redirectUrl = user.role === 'admin' ? this.adminRedirectUrl : this.redirectUrl;
            
            return { 
                success: true, 
                user: session.user,
                redirectUrl 
            };

        } catch (error) {
            console.error('Erro no login:', error);
            return { success: false, errors: ['Erro ao realizar login'] };
        }
    }

    // Realizar registro
    async register(userData) {
        try {
            // Validar dados
            const validationErrors = this.validateRegisterForm(userData);
            if (validationErrors.length > 0) {
                return { success: false, errors: validationErrors };
            }

            // Verificar se email já existe
            if (db.emailExists(userData.email)) {
                return { success: false, errors: ['Email já cadastrado'] };
            }

            // Criar usuário
            const newUser = db.createUser({
                nome: userData.nome.trim(),
                email: userData.email.toLowerCase().trim(),
                senha: userData.senha,
                role: 'cliente'
            });

            // Autenticar automaticamente após registro
            const session = db.saveSession(newUser);

            return { 
                success: true, 
                user: session.user,
                redirectUrl: this.redirectUrl 
            };

        } catch (error) {
            console.error('Erro no registro:', error);
            return { success: false, errors: ['Erro ao criar conta'] };
        }
    }

    // Realizar logout
    logout() {
        db.clearSession();
        window.location.href = 'index.html';
    }

    // ===== RECUPERAÇÃO DE SENHA =====
    
    // Enviar email de recuperação (simulado)
    async sendPasswordReset(email) {
        try {
            if (!this.validateEmail(email)) {
                return { success: false, errors: ['Email inválido'] };
            }

            const user = db.getUserByEmail(email);
            if (!user) {
                // Por segurança, não informamos se email existe ou não
                return { success: true, message: 'Se o email estiver cadastrado, você receberá instruções' };
            }

            // Gerar token de recuperação
            const resetToken = this.generateResetToken();
            const resetData = {
                userId: user.id,
                token: resetToken,
                expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hora
            };

            // Salvar token no localStorage
            localStorage.setItem('lookEasyPasswordReset', JSON.stringify(resetData));

            // Simular envio de email
            console.log(`Token de recuperação para ${email}: ${resetToken}`);

            return { 
                success: true, 
                message: 'Email de recuperação enviado com sucesso',
                token: resetToken // Apenas para demonstração
            };

        } catch (error) {
            console.error('Erro na recuperação de senha:', error);
            return { success: false, errors: ['Erro ao processar solicitação'] };
        }
    }

    // Redefinir senha
    async resetPassword(token, novaSenha, confirmarSenha) {
        try {
            if (!token || novaSenha !== confirmarSenha) {
                return { success: false, errors: ['Dados inválidos'] };
            }

            if (!this.validatePassword(novaSenha)) {
                return { success: false, errors: ['Senha deve ter pelo menos 6 caracteres'] };
            }

            // Verificar token
            const resetData = localStorage.getItem('lookEasyPasswordReset');
            if (!resetData) {
                return { success: false, errors: ['Token inválido ou expirado'] };
            }

            const reset = JSON.parse(resetData);
            const now = new Date();
            const expiresAt = new Date(reset.expiresAt);

            if (reset.token !== token || now > expiresAt) {
                localStorage.removeItem('lookEasyPasswordReset');
                return { success: false, errors: ['Token inválido ou expirado'] };
            }

            // Atualizar senha
            const user = db.getUserById(reset.userId);
            if (user) {
                db.updateUser(reset.userId, { senha: novaSenha });
                localStorage.removeItem('lookEasyPasswordReset');
                return { success: true, message: 'Senha redefinida com sucesso' };
            }

            return { success: false, errors: ['Usuário não encontrado'] };

        } catch (error) {
            console.error('Erro na redefinição de senha:', error);
            return { success: false, errors: ['Erro ao redefinir senha'] };
        }
    }

    // Gerar token de recuperação
    generateResetToken() {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }

    // ===== VERIFICAÇÃO DE SESSÃO =====
    
    // Verificar se usuário está logado
    isLoggedIn() {
        return db.isLoggedIn();
    }

    // Verificar se é administrador
    isAdmin() {
        return db.isAdmin();
    }

    // Obter usuário atual
    getCurrentUser() {
        const session = db.getCurrentSession();
        return session ? session.user : null;
    }

    // Proteger página (redirecionar se não estiver logado)
    protectPage(requiredRole = null) {
        if (!this.isLoggedIn()) {
            window.location.href = 'login.html';
            return false;
        }

        if (requiredRole === 'admin' && !this.isAdmin()) {
            window.location.href = 'index.html';
            return false;
        }

        return true;
    }

    // Redirecionar se já estiver logado
    redirectIfLoggedIn() {
        if (this.isLoggedIn()) {
            const user = this.getCurrentUser();
            const redirectUrl = user.role === 'admin' ? this.adminRedirectUrl : this.redirectUrl;
            window.location.href = redirectUrl;
            return true;
        }
        return false;
    }

    // ===== UTILITÁRIOS =====
    
    // Formatar nome para exibição
    formatDisplayName(nome) {
        if (!nome) return '';
        const names = nome.trim().split(' ');
        return names.length > 1 ? `${names[0]} ${names[names.length - 1]}` : names[0];
    }

    // Obter iniciais do nome
    getInitials(nome) {
        if (!nome) return '';
        const names = nome.trim().split(' ');
        return names.map(n => n[0]).join('').toUpperCase().substring(0, 2);
    }

    // Atualizar interface com dados do usuário
    updateAuthUI() {
        const user = this.getCurrentUser();
        
        // Atualizar elementos comuns
        const userDisplayElements = document.querySelectorAll('.user-display-name');
        userDisplayElements.forEach(el => {
            el.textContent = this.formatDisplayName(user?.nome || '');
        });

        const userInitialsElements = document.querySelectorAll('.user-initials');
        userInitialsElements.forEach(el => {
            el.textContent = this.getInitials(user?.nome || '');
        });

        // Mostrar/ocultar elementos baseado no auth
        const authElements = document.querySelectorAll('.auth-required');
        const noAuthElements = document.querySelectorAll('.no-auth-required');
        const adminElements = document.querySelectorAll('.admin-required');

        if (user) {
            authElements.forEach(el => el.style.display = 'block');
            noAuthElements.forEach(el => el.style.display = 'none');
            
            if (user.role === 'admin') {
                adminElements.forEach(el => el.style.display = 'block');
            } else {
                adminElements.forEach(el => el.style.display = 'none');
            }
        } else {
            authElements.forEach(el => el.style.display = 'none');
            noAuthElements.forEach(el => el.style.display = 'block');
            adminElements.forEach(el => el.style.display = 'none');
        }

        // Atualizar contador do carrinho
        this.updateCartCounter();
    }

    // Atualizar contador do carrinho
    updateCartCounter() {
        const cartCount = db.getCartItemCount();
        const cartCounterElements = document.querySelectorAll('.cart-counter');
        
        cartCounterElements.forEach(el => {
            if (cartCount > 0) {
                el.textContent = cartCount;
                el.style.display = 'inline-block';
            } else {
                el.style.display = 'none';
            }
        });
    }

    // Exibir mensagem de erro
    showError(errors) {
        const errorsArray = Array.isArray(errors) ? errors : [errors];
        showNotification('Erro', errorsArray.join(', '), 'error');
    }

    // Exibir mensagem de sucesso
    showSuccess(message) {
        showNotification('Sucesso', message, 'success');
    }

    // ===== INICIALIZAÇÃO =====
    
    // Inicializar sistema de autenticação
    init() {
        // Verificar sessão atual
        this.updateAuthUI();

        // Adicionar event listeners globais
        this.setupGlobalEventListeners();

        // Verificar proteção de página
        this.checkPageProtection();
    }

    // Configurar event listeners globais
    setupGlobalEventListeners() {
        // Logout
        document.addEventListener('click', (e) => {
            if (e.target.closest('.logout-btn')) {
                e.preventDefault();
                this.logout();
            }
        });

        // Links que exigem autenticação
        document.addEventListener('click', (e) => {
            const authLink = e.target.closest('.auth-link');
            if (authLink && !this.isLoggedIn()) {
                e.preventDefault();
                window.location.href = 'login.html';
            }
        });

        // Links de administrador
        document.addEventListener('click', (e) => {
            const adminLink = e.target.closest('.admin-link');
            if (adminLink && !this.isAdmin()) {
                e.preventDefault();
                this.showError('Acesso restrito a administradores');
            }
        });
    }

    // Verificar proteção da página atual
    checkPageProtection() {
        const currentPath = window.location.pathname;
        
        // Páginas protegidas
        const protectedPages = ['carrinho.html', 'perfil.html'];
        const adminPages = ['admin/'];
        
        // Verificar se página atual requer autenticação
        if (protectedPages.some(page => currentPath.includes(page))) {
            this.protectPage();
        }
        
        // Verificar se página atual requer admin
        if (adminPages.some(page => currentPath.includes(page))) {
            this.protectPage('admin');
        }
        
        // Verificar redirecionamento para páginas de auth
        if (currentPath.includes('login.html') || currentPath.includes('register.html')) {
            this.redirectIfLoggedIn();
        }
    }
}

// Instância global do gerenciador de autenticação
const auth = new AuthManager();

// Para debug - tornar disponível no console
window.auth = auth;

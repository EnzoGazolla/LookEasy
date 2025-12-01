// Lógica específica para a página de autenticação
// Gerencia formulários de login, registro e recuperação de senha

class AuthPage {
    constructor() {
        this.currentTab = 'login';
        this.init();
    }

    // ===== INICIALIZAÇÃO =====
    
    init() {
        this.setupTabs();
        this.setupForms();
        this.setupPasswordToggle();
        this.setupModal();
        this.setupDemoButtons();
        
        // Verificar se usuário já está logado
        auth.redirectIfLoggedIn();
    }

    // ===== TABS =====
    
    setupTabs() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const forms = document.querySelectorAll('.auth-form');

        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const targetTab = e.target.getAttribute('data-tab');
                this.switchTab(targetTab);
            });
        });
    }

    switchTab(tabName) {
        // Atualizar botões
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-tab') === tabName) {
                btn.classList.add('active');
            }
        });

        // Atualizar formulários
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.remove('active');
        });

        const targetForm = document.getElementById(`${tabName}Form`);
        if (targetForm) {
            targetForm.classList.add('active');
        }

        this.currentTab = tabName;
        this.clearAllErrors();
    }

    // ===== FORMULÁRIOS =====
    
    setupForms() {
        // Formulário de Login
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Formulário de Registro
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        // Formulário de Recuperação
        const resetForm = document.getElementById('resetForm');
        if (resetForm) {
            resetForm.addEventListener('submit', (e) => this.handlePasswordReset(e));
        }

        // Validação em tempo real
        this.setupRealTimeValidation();
    }

    // ===== LOGIN =====
    
    async handleLogin(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const email = formData.get('email');
        const senha = formData.get('senha');
        const manterConectado = document.getElementById('manterConectado').checked;

        // Limpar erros anteriores
        this.clearAllErrors();

        // Desabilitar botão
        const submitBtn = e.target.querySelector('.auth-btn');
        this.setButtonLoading(submitBtn, true);

        try {
            // Tentar login
            const result = await auth.login(email, senha, manterConectado);

            if (result.success) {
                auth.showSuccess('Login realizado com sucesso!');
                
                // Redirecionar após pequeno delay
                setTimeout(() => {
                    window.location.href = result.redirectUrl;
                }, 1000);
            } else {
                // Mostrar erros
                this.showFormErrors(result.errors);
            }
        } catch (error) {
            console.error('Erro no login:', error);
            this.showFormErrors(['Erro ao realizar login. Tente novamente.']);
        } finally {
            this.setButtonLoading(submitBtn, false);
        }
    }

    // ===== REGISTRO =====
    
    async handleRegister(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const userData = {
            nome: formData.get('nome'),
            email: formData.get('email'),
            senha: formData.get('senha'),
            confirmarSenha: formData.get('confirmarSenha'),
            termos: document.getElementById('termos').checked
        };

        // Limpar erros anteriores
        this.clearAllErrors();

        // Desabilitar botão
        const submitBtn = e.target.querySelector('.auth-btn');
        this.setButtonLoading(submitBtn, true);

        try {
            // Tentar registro
            const result = await auth.register(userData);

            if (result.success) {
                auth.showSuccess('Conta criada com sucesso!');
                
                // Redirecionar após pequeno delay
                setTimeout(() => {
                    window.location.href = result.redirectUrl;
                }, 1000);
            } else {
                // Mostrar erros
                this.showFormErrors(result.errors);
            }
        } catch (error) {
            console.error('Erro no registro:', error);
            this.showFormErrors(['Erro ao criar conta. Tente novamente.']);
        } finally {
            this.setButtonLoading(submitBtn, false);
        }
    }

    // ===== RECUPERAÇÃO DE SENHA =====
    
    async handlePasswordReset(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const email = formData.get('email');

        // Limpar erros anteriores
        this.clearAllErrors();

        // Desabilitar botão
        const submitBtn = e.target.querySelector('.auth-btn');
        this.setButtonLoading(submitBtn, true);

        try {
            // Enviar email de recuperação
            const result = await auth.sendPasswordReset(email);

            if (result.success) {
                auth.showSuccess(result.message);
                this.closeModal();
                
                // Em ambiente real, o usuário receberia um email
                // Para demo, vamos mostrar o token no console
                if (result.token) {
                    console.log('Token de recuperação (demo):', result.token);
                }
            } else {
                // Mostrar erros
                this.showFormErrors(result.errors, e.target);
            }
        } catch (error) {
            console.error('Erro na recuperação:', error);
            this.showFormErrors(['Erro ao processar solicitação. Tente novamente.'], e.target);
        } finally {
            this.setButtonLoading(submitBtn, false);
        }
    }

    // ===== VALIDAÇÃO EM TEMPO REAL =====
    
    setupRealTimeValidation() {
        // Validação de email
        const emailInputs = document.querySelectorAll('input[type="email"]');
        emailInputs.forEach(input => {
            input.addEventListener('blur', () => this.validateEmail(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });

        // Validação de senha
        const passwordInputs = document.querySelectorAll('input[type="password"]');
        passwordInputs.forEach(input => {
            if (input.id !== 'confirmarSenha') {
                input.addEventListener('blur', () => this.validatePassword(input));
            }
            input.addEventListener('input', () => this.clearFieldError(input));
        });

        // Validação de confirmação de senha
        const confirmSenha = document.getElementById('confirmarSenha');
        if (confirmSenha) {
            confirmSenha.addEventListener('blur', () => this.validatePasswordConfirmation());
            confirmSenha.addEventListener('input', () => this.clearFieldError(confirmSenha));
        }

        // Validação de nome
        const nomeInput = document.getElementById('registerNome');
        if (nomeInput) {
            nomeInput.addEventListener('blur', () => this.validateName(nomeInput));
            nomeInput.addEventListener('input', () => this.clearFieldError(nomeInput));
        }
    }

    validateEmail(input) {
        const email = input.value.trim();
        if (!email) {
            this.showFieldError(input, 'Email é obrigatório');
            return false;
        }
        if (!auth.validateEmail(email)) {
            this.showFieldError(input, 'Email inválido');
            return false;
        }
        return true;
    }

    validatePassword(input) {
        const senha = input.value;
        if (!senha) {
            this.showFieldError(input, 'Senha é obrigatória');
            return false;
        }
        if (!auth.validatePassword(senha)) {
            this.showFieldError(input, 'Senha deve ter pelo menos 6 caracteres');
            return false;
        }
        return true;
    }

    validatePasswordConfirmation() {
        const senha = document.getElementById('registerSenha').value;
        const confirmar = document.getElementById('confirmarSenha').value;
        const confirmInput = document.getElementById('confirmarSenha');

        if (!confirmar) {
            this.showFieldError(confirmInput, 'Confirmação de senha é obrigatória');
            return false;
        }
        if (senha !== confirmar) {
            this.showFieldError(confirmInput, 'Senhas não coincidem');
            return false;
        }
        return true;
    }

    validateName(input) {
        const nome = input.value.trim();
        if (!nome) {
            this.showFieldError(input, 'Nome é obrigatório');
            return false;
        }
        if (!auth.validateName(nome)) {
            this.showFieldError(input, 'Nome deve ter pelo menos 3 caracteres');
            return false;
        }
        return true;
    }

    // ===== TOGGLE DE SENHA =====
    
    setupPasswordToggle() {
        const toggleButtons = document.querySelectorAll('.toggle-password');
        
        toggleButtons.forEach(button => {
            button.addEventListener('click', () => {
                const input = button.parentElement.querySelector('input');
                const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
                input.setAttribute('type', type);
                
                // Atualizar ícone
                const icon = button.querySelector('svg');
                if (type === 'text') {
                    icon.innerHTML = `
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                    `;
                } else {
                    icon.innerHTML = `
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                    `;
                }
            });
        });
    }

    // ===== MODAL =====
    
    setupModal() {
        const modal = document.getElementById('resetModal');
        const openBtn = document.querySelector('.forgot-password');
        const closeBtn = document.querySelector('.modal-close');

        if (openBtn) {
            openBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.openModal();
            });
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeModal());
        }

        // Fechar ao clicar fora
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal();
            }
        });

        // Fechar com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('show')) {
                this.closeModal();
            }
        });
    }

    openModal() {
        const modal = document.getElementById('resetModal');
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
        
        // Limpar formulário
        document.getElementById('resetForm').reset();
        this.clearAllErrors();
        
        // Focar no input
        setTimeout(() => {
            document.getElementById('resetEmail').focus();
        }, 100);
    }

    closeModal() {
        const modal = document.getElementById('resetModal');
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }

    // ===== BOTÕES DE DEMONSTRAÇÃO =====
    
    setupDemoButtons() {
        // Os botões já têm onclick no HTML, mas vamos adicionar suporte a teclado
        const demoButtons = document.querySelectorAll('.demo-btn');
        demoButtons.forEach(button => {
            button.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const type = button.textContent.includes('Admin') ? 'admin' : 'cliente';
                    this.fillDemoData(type);
                }
            });
        });
    }

    // ===== UTILITÁRIOS =====
    
    setButtonLoading(button, loading) {
        const btnText = button.querySelector('.btn-text');
        const btnLoader = button.querySelector('.btn-loader');
        
        if (loading) {
            button.disabled = true;
            if (btnText) btnText.style.display = 'none';
            if (btnLoader) btnLoader.style.display = 'inline-flex';
        } else {
            button.disabled = false;
            if (btnText) btnText.style.display = 'inline';
            if (btnLoader) btnLoader.style.display = 'none';
        }
    }

    showFieldError(input, message) {
        input.classList.add('error');
        const errorElement = input.parentElement.querySelector('.error-message');
        if (errorElement) {
            errorElement.textContent = message;
        }
    }

    clearFieldError(input) {
        input.classList.remove('error');
        const errorElement = input.parentElement.querySelector('.error-message');
        if (errorElement) {
            errorElement.textContent = '';
        }
    }

    showFormErrors(errors, form = null) {
        const targetForm = form || document.querySelector('.auth-form.active');
        
        if (Array.isArray(errors)) {
            // Se for um array, mostrar primeiro erro no campo correspondente
            errors.forEach(error => {
                if (error.includes('Email')) {
                    const emailInput = targetForm.querySelector('input[type="email"]');
                    if (emailInput) this.showFieldError(emailInput, error);
                } else if (error.includes('Senha')) {
                    const senhaInput = targetForm.querySelector('input[type="password"]');
                    if (senhaInput) this.showFieldError(senhaInput, error);
                } else if (error.includes('Nome')) {
                    const nomeInput = targetForm.querySelector('input[name="nome"]');
                    if (nomeInput) this.showFieldError(nomeInput, error);
                }
            });
            
            // Mostrar primeiro erro geral
            if (errors.length > 0) {
                auth.showError(errors[0]);
            }
        } else {
            auth.showError(errors);
        }
    }

    clearAllErrors() {
        // Limpar erros dos campos
        document.querySelectorAll('.form-group input').forEach(input => {
            input.classList.remove('error');
        });
        
        // Limpar mensagens de erro
        document.querySelectorAll('.error-message').forEach(element => {
            element.textContent = '';
        });
    }
}

// Função global para preencher dados de demonstração
function fillDemoData(type) {
    const emailInput = document.getElementById('loginEmail');
    const senhaInput = document.getElementById('loginSenha');
    
    if (type === 'admin') {
        if (emailInput) emailInput.value = 'admin@lookeasy.com';
        if (senhaInput) senhaInput.value = 'admin123';
    } else {
        if (emailInput) emailInput.value = 'cliente@lookeasy.com';
        if (senhaInput) senhaInput.value = 'cliente123';
    }
    
    // Mudar para tab de login se estiver no registro
    if (authPage.currentTab !== 'login') {
        authPage.switchTab('login');
    }
    
    // Dar feedback visual
    if (emailInput && senhaInput) {
        emailInput.style.borderColor = '#10B981';
        senhaInput.style.borderColor = '#10B981';
        
        setTimeout(() => {
            emailInput.style.borderColor = '';
            senhaInput.style.borderColor = '';
        }, 2000);
    }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.authPage = new AuthPage();
});

// Função global de notificação (compatibilidade com auth.js)
function showNotification(title, message, type = 'info') {
    // Criar elemento de notificação
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? '#EF4444' : type === 'success' ? '#10B981' : '#3B82F6'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        z-index: 10001;
        min-width: 300px;
        animation: slideInRight 0.3s ease-out;
        font-weight: 500;
    `;
    
    notification.innerHTML = `
        <div style="font-weight: bold; margin-bottom: 0.5rem;">${title}</div>
        <div style="font-size: 0.9rem;">${message}</div>
    `;
    
    document.body.appendChild(notification);
    
    // Adicionar animação se não existir
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            @keyframes slideOutRight {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Remover após 3 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        notification.style.animationFillMode = 'forwards';
        
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

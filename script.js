// ==========================================
// 1. FUNCIONALIDADES GLOBAIS (UI/UX)
// ==========================================

document.addEventListener('DOMContentLoaded', function () {
    // Inicializar sistema de autenticação
    if (typeof auth !== 'undefined') auth.init();

    // Carregar produtos da Home (Se estivermos na página inicial)
    if (document.getElementById('gridDestaques')) {
        loadHomeProducts();
    }

    // Inicializar listeners globais
    setupGlobalListeners();

    // Atualizar contador do carrinho ao carregar
    updateCartCount();

    // Configurar lazy loading de imagens
    setupLazyLoading();
});

function setupGlobalListeners() {
    // Fechar dropdowns quando clicar fora
    document.addEventListener('click', function (event) {
        // Dropdown Categorias
        const categoryContainer = document.querySelector('.dropdown');
        if (categoryContainer && !categoryContainer.contains(event.target)) {
            const dropdown = document.getElementById('categoryDropdown');
            const button = document.querySelector('.dropdown-btn');
            if (dropdown && button) {
                dropdown.style.display = 'none';
                button.innerHTML = 'Categorias ▼';
            }
        }

        // Dropdown Perfil
        const profileContainer = document.querySelector('.profile-container');
        if (profileContainer && !profileContainer.contains(event.target)) {
            const profileDropdown = document.getElementById('profileDropdown');
            if (profileDropdown) profileDropdown.classList.remove('active');
        }
    });

    // Busca (Header)
    const searchButton = document.querySelector('.search-btn');
    const searchInput = document.querySelector('.search-bar input');

    if (searchButton && searchInput) {
        searchButton.addEventListener('click', performSearch);
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') performSearch();
        });
    }

    // Botão CTA do Banner (Scroll suave)
    const ctaButton = document.querySelector('.cta-button');
    if (ctaButton) {
        ctaButton.addEventListener('click', function () {
            const section = document.querySelector('.products-section');
            if (section) section.scrollIntoView({ behavior: 'smooth' });
        });
    }
}

// Toggle do Dropdown de Categorias
function toggleDropdown() {
    const dropdown = document.getElementById('categoryDropdown');
    const button = document.querySelector('.dropdown-btn');

    if (dropdown.style.display === 'block') {
        dropdown.style.display = 'none';
        button.innerHTML = 'Categorias ▼';
    } else {
        dropdown.style.display = 'block';
        button.innerHTML = 'Categorias ▲';
    }
}

// Busca Simples
function performSearch() {
    const searchInput = document.querySelector('.search-bar input');
    const term = searchInput.value.trim().toLowerCase();
    if (term) {
        showNotification('Busca', `Buscando por: ${term}`);
        // Aqui você pode redirecionar para uma página de busca ou filtrar
    }
}

// Lazy Loading de Imagens
function setupLazyLoading() {
    const images = document.querySelectorAll('img');
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.style.opacity = '1';
                obs.unobserve(img);
            }
        });
    });
    images.forEach(img => {
        img.style.transition = 'opacity 0.5s ease';
        img.style.opacity = '0'; // Começa invisível
        observer.observe(img);
    });
}

// ==========================================
// 2. LÓGICA DE PRODUTOS E ESTOQUE (HOME)
// ==========================================

function loadHomeProducts() {
    // Buscar produtos do "Banco de Dados" (localStorage)
    const allProducts = db.getProducts();

    // Filtrar apenas ativos
    const activeProducts = allProducts.filter(p => p.ativo !== false);

    // Separar por categorias ou lógica de destaque
    // Exemplo: 3 primeiros para destaques, próximos 3 para "Para Você"
    const destaques = activeProducts.slice(0, 3);
    const paraVoce = activeProducts.slice(3, 6);

    renderProductSection(destaques, 'gridDestaques');
    renderProductSection(paraVoce, 'gridParaVoce');
}

function renderProductSection(products, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = products.map(product => {
        // === LÓGICA DE ESTOQUE ===
        let badgeHTML = '';
        let buttonHTML = '';
        let cardClass = 'product-card';
        let stockDisplay = '';

        // 1. Sem Estoque
        if (product.estoque <= 0) {
            badgeHTML = '<span class="stock-badge out">Esgotado</span>';
            cardClass += ' out-of-stock';
            buttonHTML = `<button class="buy-btn" disabled style="background-color: #ccc; cursor: not-allowed;">Indisponível</button>`;
            // Texto vermelho forte
            stockDisplay = `<div style="margin-top: 8px; color: #EF4444; font-weight: 800; font-size: 0.9rem;">🚫 Sem estoque</div>`;

            // 2. Pouco Estoque (Menos de 5)
        } else if (product.estoque <= 5) {
            badgeHTML = '<span class="stock-badge low">Últimas Unidades</span>';
            buttonHTML = `<button class="buy-btn" onclick="addToCart(${product.id}); event.stopPropagation();">Comprar</button>`;
            // Texto laranja/vermelho
            stockDisplay = `<div style="margin-top: 8px; color: #d9534f; font-weight: bold; font-size: 0.9rem;">🔥 Restam apenas ${product.estoque}</div>`;

            // 3. Estoque Normal
        } else {
            buttonHTML = `<button class="buy-btn" onclick="addToCart(${product.id}); event.stopPropagation();">Comprar</button>`;
            // Texto escuro padrão
            stockDisplay = `<div style="margin-top: 8px; color: #1F2937; font-weight: 600; font-size: 0.9rem;">📦 Estoque: ${product.estoque}</div>`;
        }

        return `
            <article class="${cardClass}" onclick="showProductDetails(${product.id})">
                <div class="product-image">
                    ${badgeHTML}
                    <img src="${product.imagem}" alt="${product.nome}">
                </div>
                <div class="product-footer">
                    <div class="product-info">
                        <h3 class="product-name">${product.nome}</h3>
                        <p class="product-price">R$ ${product.preco.toFixed(2)}</p>
                        
                        ${stockDisplay}
                    </div>
                    ${buttonHTML}
                </div>
            </article>
        `;
    }).join('');
}

function showProductDetails(id) {
    // Apenas visual, poderia redirecionar para produto.html
    const product = db.getProductById(id);
    if (product) showNotification('Visualizar', `Você clicou em: ${product.nome}`);
}

// ==========================================
// 3. CARRINHO DE COMPRAS E CHECKOUT
// ==========================================

// Adicionar ao Carrinho (Com verificação de estoque)
function addToCart(productId) {
    const product = db.getProductById(productId);

    if (!product) {
        showNotification('Erro', 'Produto não encontrado.');
        return;
    }

    // Verificar estoque localmente antes de chamar o DB (UI feedback imediato)
    if (product.estoque <= 0) {
        showNotification('Erro', 'Produto esgotado!');
        return;
    }

    // Tentar adicionar
    const result = db.addToCart(productId, 1);

    if (result.success) {
        updateCartCount();
        showNotification('Sucesso', `${product.nome} adicionado!`);

        // Se o modal estiver aberto, atualiza a lista
        const modal = document.getElementById('cartModal');
        if (modal && modal.classList.contains('active')) {
            renderCart();
        }
    } else {
        showNotification('Atenção', result.message);
    }
}

function openCart() {
    const modal = document.getElementById('cartModal');
    if (modal) {
        modal.classList.add('active');
        renderCart();
    }
}

function closeCart() {
    const modal = document.getElementById('cartModal');
    if (modal) modal.classList.remove('active');
}

function renderCart() {
    const cart = db.getCart();
    const container = document.getElementById('cartItems');
    const emptyMsg = document.getElementById('cartEmpty');
    const totalEl = document.getElementById('cartTotal');

    if (!container) return;

    if (cart.length === 0) {
        container.style.display = 'none';
        if (emptyMsg) emptyMsg.style.display = 'flex';
        if (totalEl) totalEl.textContent = 'R$ 0,00';
        return;
    }

    if (emptyMsg) emptyMsg.style.display = 'none';
    container.style.display = 'flex';

    container.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-image">
                <img src="${item.imagem}" alt="${item.nome}">
            </div>
            <div class="cart-item-details">
                <div class="cart-item-name">${item.nome}</div>
                <div class="cart-item-price">R$ ${item.preco.toFixed(2)}</div>
                
                <div class="cart-item-controls">
                    <div class="cart-item-quantity">
                        <button class="quantity-btn" onclick="updateQuantity(${item.id}, ${item.quantidade - 1})">-</button>
                        <span>${item.quantidade}</span>
                        <button class="quantity-btn" onclick="updateQuantity(${item.id}, ${item.quantidade + 1})">+</button>
                    </div>
                    <button class="cart-item-remove" onclick="removeFromCart(${item.id})">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    if (totalEl) totalEl.textContent = `R$ ${db.calculateCartTotal().toFixed(2)}`;
}

function updateQuantity(itemId, newQty) {
    if (newQty < 1) return; // Não permitir 0 por aqui (usar remover)
    const result = db.updateCartItemQuantity(itemId, newQty);
    if (result.success) {
        renderCart();
        updateCartCount();
    } else {
        showNotification('Estoque', result.message);
    }
}

function removeFromCart(itemId) {
    db.removeFromCart(itemId);
    renderCart();
    updateCartCount();
}

function clearCart() {
    if (confirm("Tem certeza que deseja esvaziar o carrinho?")) {
        db.clearCart();
        renderCart();
        updateCartCount();
        showNotification('Carrinho', 'Carrinho limpo.');
    }
}

function updateCartCount() {
    const count = db.getCartItemCount();
    const badge = document.getElementById('cartCount');
    if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'block' : 'none';
    }
}

// Checkout Real (Com baixa de estoque)
function checkout() {
    const cart = db.getCart();
    if (cart.length === 0) {
        showNotification('Erro', 'Seu carrinho está vazio.');
        return;
    }

    // Verificar se usuário está logado
    const session = db.getCurrentSession();
    if (!session) {
        showNotification('Atenção', 'Faça login para finalizar a compra.');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return;
    }

    // 1. Tentar dar baixa no estoque
    let errors = [];
    cart.forEach(item => {
        // Tenta diminuir o estoque no "banco de dados"
        const success = db.decreaseStock(item.productId, item.quantidade);
        if (!success) {
            errors.push(`Estoque insuficiente para: ${item.nome}`);
        }
    });


    // 4. Sucesso
    showNotification('Sucesso', `Pedido #${orderResult.order.id} realizado com sucesso! Total: R$ ${total.toFixed(2)}`);

    // 5. Limpar carrinho
    db.clearCart();
    closeCart();
    updateCartCount();

    // 6. Atualizar vitrine
    if (document.getElementById('gridDestaques')) {
        loadHomeProducts();
    }

    // 7. Redirecionar para página de pedidos após 2 segundos
    setTimeout(() => {
        window.location.href = 'pedidos.html';
    }, 2000);
}

// ==========================================
// 4. PERFIL E UTILITÁRIOS
// ==========================================

function toggleProfileMenu() {
    const dropdown = document.getElementById('profileDropdown');
    const isActive = dropdown.classList.contains('active');

    // Fechar outros dropdowns
    const catDropdown = document.getElementById('categoryDropdown');
    if (catDropdown) catDropdown.style.display = 'none';

    if (!isActive) {
        updateProfileMenu(); // Renderiza conteúdo baseado no login
        dropdown.classList.add('active');
    } else {
        dropdown.classList.remove('active');
    }
}

function updateProfileMenu() {
    const dropdown = document.getElementById('profileDropdown');
    const user = (typeof auth !== 'undefined') ? auth.getCurrentUser() : null;

    if (user) {
        dropdown.innerHTML = `
            <div class="profile-user-info">
                <div class="profile-user-name">${user.nome}</div>
                <div class="profile-user-email">${user.email}</div>
            </div>
            <div class="profile-menu-items">
                <a href="#" class="profile-menu-item" onclick="handleProfileAction('meus-pedidos')">📦 Meus Pedidos</a>
                ${user.role === 'admin' ? `<a href="#" class="profile-menu-item" onclick="handleProfileAction('admin')">⚙️ Admin</a>` : ''}
                <div class="profile-divider"></div>
                <button class="profile-menu-item danger" onclick="handleProfileAction('logout')">🚪 Sair</button>
            </div>
        `;
    } else {
        dropdown.innerHTML = `
            <div class="profile-login-prompt">
                <div class="profile-login-text">Faça login para ver seus pedidos</div>
                <button class="profile-login-btn" onclick="window.location.href='login.html'">Entrar / Cadastrar</button>
            </div>
        `;
    }
}

function handleProfileAction(action) {
    const dropdown = document.getElementById('profileDropdown');
    if (dropdown) dropdown.classList.remove('active');

    switch (action) {
        case 'logout':
            if (auth) auth.logout();
            break;
        case 'admin':
            window.location.href = 'admin/dashboard.html';
            break;
        case 'meus-pedidos':
            window.location.href = 'pedidos.html';
            break;
    }
}

// Sistema de Notificação (Toast)
function showNotification(title, message) {
    // Remove notificação anterior se houver muitas
    const existing = document.querySelectorAll('.notification-toast');
    if (existing.length > 2) existing[0].remove();

    const notification = document.createElement('div');
    notification.className = 'notification-toast';

    // Estilo inline para garantir funcionamento sem CSS extra
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #1F2937, #000);
        color: #fff;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        min-width: 250px;
        border-left: 4px solid #FFD700;
        animation: slideIn 0.3s ease-out;
        font-family: 'Segoe UI', sans-serif;
    `;

    notification.innerHTML = `
        <div style="font-weight:bold; margin-bottom:5px; color:#FFD700">${title}</div>
        <div style="font-size:0.9rem">${message}</div>
    `;

    document.body.appendChild(notification);

    // Animação CSS (Adicionada dinamicamente)
    if (!document.getElementById('toast-style')) {
        const style = document.createElement('style');
        style.id = 'toast-style';
        style.textContent = `@keyframes slideIn { from { transform: translateX(100%); opacity:0; } to { transform: translateX(0); opacity:1; } }`;
        document.head.appendChild(style);
    }

    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-10px)';
        notification.style.transition = 'all 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}
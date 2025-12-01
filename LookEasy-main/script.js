// ==========================================
// 1. FUNCIONALIDADES GLOBAIS (UI/UX)
// ==========================================

document.addEventListener('DOMContentLoaded', function () {
    // Inicializar sistema de autenticação
    if (typeof auth !== 'undefined') auth.init();

    // Carregar produtos da Home (Se estivermos na página inicial)
    if (document.getElementById('gridDestaques')) {
        loadHomeProducts();
        
        // Verificar se há uma busca vindo da URL (ex: index.html?search=camisa)
        const urlParams = new URLSearchParams(window.location.search);
        const searchTerm = urlParams.get('search');
        if (searchTerm) {
            const searchInput = document.querySelector('.search-bar input');
            if (searchInput) {
                searchInput.value = searchTerm;
                performSearch(); // Executa a busca automaticamente
            }
        }
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

// === LÓGICA DE BUSCA (CORRIGIDA) ===
function performSearch() {
    const searchInput = document.querySelector('.search-bar input');
    if (!searchInput) return;

    const term = searchInput.value.trim().toLowerCase();
    const gridDestaques = document.getElementById('gridDestaques');
    const gridParaVoce = document.getElementById('gridParaVoce');

    // Cenário 1: Estamos na Home Page
    if (gridDestaques) {
        if (term) {
            // Filtrar produtos no "banco de dados"
            const allProducts = db.getProducts();
            const filtered = allProducts.filter(p => 
                p.ativo !== false && 
                (p.nome.toLowerCase().includes(term) || 
                 (p.descricao && p.descricao.toLowerCase().includes(term)) ||
                 (p.categoria && p.categoria.toLowerCase().includes(term)))
            );

            // Atualizar Título da Seção
            const sectionTitle = gridDestaques.closest('.products-section').querySelector('.section-title');
            if (sectionTitle) sectionTitle.textContent = `Resultados para "${searchInput.value}"`;

            // Esconder a segunda seção (Para Você) para focar na busca
            if (gridParaVoce) {
                gridParaVoce.closest('.products-section').style.display = 'none';
            }

            // Renderizar resultados
            if (filtered.length > 0) {
                renderProductSection(filtered, 'gridDestaques');
            } else {
                // Mensagem de "Não encontrado"
                gridDestaques.innerHTML = `
                    <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                        <div style="font-size: 3rem; margin-bottom: 1rem;">🔍</div>
                        <h3>Nenhum produto encontrado</h3>
                        <p style="color: #666;">Não encontramos nada com "${searchInput.value}".</p>
                        <button onclick="resetSearch()" class="cta-button" style="margin-top: 1rem; font-size: 0.9rem; padding: 0.5rem 1.5rem;">Limpar Busca</button>
                    </div>
                `;
            }
        } else {
            // Se o campo estiver vazio, reseta para o estado inicial
            resetSearch();
        }
    } 
    // Cenário 2: Estamos em outra página (ex: Masculino)
    else {
        if (term) {
            // Redireciona para a home enviando o termo na URL
            window.location.href = `index.html?search=${encodeURIComponent(term)}`;
        }
    }
}

// Função para limpar a busca e voltar ao normal
window.resetSearch = function() {
    const searchInput = document.querySelector('.search-bar input');
    if (searchInput) searchInput.value = '';
    
    // Restaurar Home
    const gridDestaques = document.getElementById('gridDestaques');
    const gridParaVoce = document.getElementById('gridParaVoce');
    
    if (gridDestaques) {
        const sectionTitle = gridDestaques.closest('.products-section').querySelector('.section-title');
        if (sectionTitle) sectionTitle.textContent = 'DESTAQUES';
        loadHomeProducts();
    }
    
    if (gridParaVoce) {
        gridParaVoce.closest('.products-section').style.display = 'block';
    }
    
    // Limpar URL sem recarregar
    window.history.pushState({}, document.title, window.location.pathname);
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
            stockDisplay = `<div style="margin-top: 8px; color: #EF4444; font-weight: 800; font-size: 0.9rem;">🚫 Sem estoque</div>`;

        // 2. Pouco Estoque (Menos de 5)
        } else if (product.estoque <= 5) {
            badgeHTML = '<span class="stock-badge low">Últimas Unidades</span>';
            buttonHTML = `<button class="buy-btn" onclick="addToCart(${product.id}); event.stopPropagation();">Comprar</button>`;
            stockDisplay = `<div style="margin-top: 8px; color: #d9534f; font-weight: bold; font-size: 0.9rem;">🔥 Restam apenas ${product.estoque}</div>`;

        // 3. Estoque Normal
        } else {
            buttonHTML = `<button class="buy-btn" onclick="addToCart(${product.id}); event.stopPropagation();">Comprar</button>`;
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

// Função para abrir o modal com os detalhes do produto
// Função para abrir o modal com os detalhes do produto
function showProductDetails(id) {
    const product = db.getProductById(id);
    if (!product) return;

    // 1. Preencher os dados no HTML do Modal
    const modalImg = document.getElementById('modalImg');
    const modalCategory = document.getElementById('modalCategory');
    const modalTitle = document.getElementById('modalTitle');
    const modalPrice = document.getElementById('modalPrice');
    const modalDesc = document.getElementById('modalDesc');

    // Verificação de segurança caso o modal não exista na página
    if (modalImg) modalImg.src = product.imagem;
    if (modalCategory) modalCategory.textContent = product.categoria;
    if (modalTitle) modalTitle.textContent = product.nome;
    if (modalPrice) modalPrice.textContent = `R$ ${product.preco.toFixed(2)}`;
    if (modalDesc) modalDesc.textContent = product.descricao || "Sem descrição disponível.";

    // 2. Configurar o botão de compra do modal
    const btn = document.getElementById('modalBtn');
    
    if (btn) {
        // Remove listeners antigos clonando o botão
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        
        if (product.estoque > 0) {
            newBtn.textContent = "Adicionar ao Carrinho";
            newBtn.disabled = false;
            newBtn.style.backgroundColor = ""; 
            newBtn.style.cursor = "pointer";
            newBtn.onclick = function() {
                addToCart(product.id);
                closeProductModal(); 
            };
        } else {
            newBtn.textContent = "Produto Esgotado";
            newBtn.disabled = true;
            newBtn.style.backgroundColor = "#ccc";
            newBtn.style.cursor = "not-allowed";
        }
    }

    // 3. Mostrar o Modal
    const modalElement = document.getElementById('productModal');
    if (modalElement) modalElement.classList.add('active');
}

// Função para fechar o modal
function closeProductModal() {
    const modal = document.getElementById('productModal');
    if (modal) modal.classList.remove('active');
}

// Fechar modal ao clicar fora dele
window.onclick = function(event) {
    const modal = document.getElementById('productModal');
    if (event.target == modal) {
        closeProductModal();
    }
}
// ==========================================
// 3. CARRINHO DE COMPRAS E CHECKOUT
// ==========================================

function addToCart(productId) {
    const product = db.getProductById(productId);

    if (!product) {
        showNotification('Erro', 'Produto não encontrado.');
        return;
    }

    if (product.estoque <= 0) {
        showNotification('Erro', 'Produto esgotado!');
        return;
    }

    const result = db.addToCart(productId, 1);

    if (result.success) {
        updateCartCount();
        showNotification('Sucesso', `${product.nome} adicionado!`);

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
    if (newQty < 1) return;
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

    const session = db.getCurrentSession();
    if (!session) {
        showNotification('Atenção', 'Faça login para finalizar a compra.');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return;
    }

    let errors = [];
    cart.forEach(item => {
        const success = db.decreaseStock(item.productId, item.quantidade);
        if (!success) {
            errors.push(`Estoque insuficiente para: ${item.nome}`);
        }
    });

    if (errors.length > 0) {
        showNotification('Erro', errors[0]);
        return;
    }

    // Criar e Salvar Pedido
    const total = db.calculateCartTotal();
    const orderResult = db.createOrder(session.user.id, cart, total);

    if (orderResult.success) {
        showNotification('Sucesso', `Pedido #${orderResult.order.id} realizado com sucesso!`);
        db.clearCart();
        closeCart();
        updateCartCount();

        if (document.getElementById('gridDestaques')) {
            loadHomeProducts();
        }

        setTimeout(() => {
            window.location.href = 'pedidos.html';
        }, 2000);
    } else {
        showNotification('Erro', 'Falha ao salvar o pedido.');
    }
}

// ==========================================
// 4. PERFIL E UTILITÁRIOS
// ==========================================

function toggleProfileMenu() {
    const dropdown = document.getElementById('profileDropdown');
    const isActive = dropdown.classList.contains('active');
    const catDropdown = document.getElementById('categoryDropdown');
    if (catDropdown) catDropdown.style.display = 'none';

    if (!isActive) {
        updateProfileMenu();
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

function showNotification(title, message) {
    const existing = document.querySelectorAll('.notification-toast');
    if (existing.length > 2) existing[0].remove();

    const notification = document.createElement('div');
    notification.className = 'notification-toast';
    notification.style.cssText = `
        position: fixed; top: 20px; right: 20px;
        background: linear-gradient(135deg, #1F2937, #000);
        color: #fff; padding: 15px 20px; border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3); z-index: 10000;
        min-width: 250px; border-left: 4px solid #FFD700;
        animation: slideIn 0.3s ease-out; font-family: 'Segoe UI', sans-serif;
    `;

    notification.innerHTML = `
        <div style="font-weight:bold; margin-bottom:5px; color:#FFD700">${title}</div>
        <div style="font-size:0.9rem">${message}</div>
    `;

    document.body.appendChild(notification);

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
// Helpers do painel de administração — LookEasy
// Este script usa os objetos globais `db` e `auth` definidos em `js/database.js` e `js/auth.js`.
// Fornece: listagem/edição de usuários, edição de estoque e cadastro de produtos.
document.addEventListener('DOMContentLoaded', () => {
    // Inicializa o sistema de autenticação (atualiza UI e listeners globais)
    if (typeof auth === 'undefined') {
        console.error('Auth não encontrado. Verifique se ../js/auth.js foi carregado antes deste script.');
        return;
    }

    auth.init();
    // Protege a página: somente administradores podem continuar
    if (!auth.protectPage('admin')) return;

    const usersContainer = document.getElementById('usersContainer');
    const productsContainer = document.getElementById('productsContainer');
    const createProductForm = document.getElementById('createProductForm');

    // Renderiza a tabela de usuários no container `usersContainer`
    function renderUsers() {
        const users = db.getUsers();
        if (users.length === 0) {
            usersContainer.innerHTML = '<div>Nenhum usuário cadastrado</div>';
            return;
        }

        let html = '<table><thead><tr><th>ID</th><th>Nome</th><th>Email</th><th>Role</th><th>Ativo</th><th>Ações</th></tr></thead><tbody>';
        users.forEach(u => {
            html += `<tr>
                <td>${u.id}</td>
                <td>${u.nome}</td>
                <td>${u.email}</td>
                <td>${u.role}</td>
                <td>${u.ativo ? 'Sim' : 'Não'}</td>
                <td>
                    <button class="btn" data-action="toggleActive" data-id="${u.id}">${u.ativo ? 'Inativar' : 'Ativar'}</button>
                    <button class="btn" data-action="toggleRole" data-id="${u.id}">Alterar Role</button>
                </td>
            </tr>`;
        });
        html += '</tbody></table>';
        usersContainer.innerHTML = html;

        // Associa handlers de clique aos botões gerados na tabela
        usersContainer.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = btn.getAttribute('data-action');
                const id = btn.getAttribute('data-id');
                if (action === 'toggleActive') toggleActive(id);
                if (action === 'toggleRole') toggleRole(id);
            });
        });
    }

    // Alterna o estado `ativo` do usuário (ativar / inativar)
    function toggleActive(id) {
        const user = db.getUserById(id);
        if (!user) return alert('Usuário não encontrado');
        db.updateUser(id, { ativo: !user.ativo });
        alert(`Usuário ${user.email} agora está ${!user.ativo ? 'ativo' : 'inativo'}`);
        renderUsers();
    }

    // Alterna a role entre 'admin' e 'cliente'
    function toggleRole(id) {
        const user = db.getUserById(id);
        if (!user) return alert('Usuário não encontrado');
        const newRole = user.role === 'admin' ? 'cliente' : 'admin';
        db.updateUser(id, { role: newRole });
        alert(`Role de ${user.email} alterada para ${newRole}`);
        renderUsers();
    }

    // Renderiza a lista de produtos e insere campos para editar o estoque
    function renderProducts() {
        const products = db.getProducts();
        if (!products || products.length === 0) {
            productsContainer.innerHTML = '<div>Nenhum produto cadastrado</div>';
            return;
        }

        let html = '<table><thead><tr><th>ID</th><th>Nome</th><th>Preço</th><th>Estoque</th><th>Ativo</th><th>Ações</th></tr></thead><tbody>';
        products.forEach(p => {
            html += `<tr>
                <td>${p.id}</td>
                <td>${p.nome}</td>
                <td>R$ ${p.preco.toFixed(2)}</td>
                <td>
                    <input class="small-input" data-id="${p.id}" type="number" value="${p.estoque || 0}">
                    <button class="btn" data-action="saveStock" data-id="${p.id}">Salvar</button>
                </td>
                <td>${p.ativo === false ? 'Não' : 'Sim'}</td>
                <td>
                    <button class="btn btn-danger" data-action="remove" data-id="${p.id}">Inativar</button>
                </td>
            </tr>`;
        });
        html += '</tbody></table>';
        productsContainer.innerHTML = html;

        // Associa handlers de clique aos botões da tabela de produtos
        productsContainer.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = btn.getAttribute('data-action');
                const id = btn.getAttribute('data-id');
                if (action === 'saveStock') saveStock(id);
                if (action === 'remove') removeProduct(id);
            });
        });
    }

    // Salva o novo valor de estoque do produto identificado por `id`
    function saveStock(id) {
        const input = productsContainer.querySelector(`input[data-id='${id}']`);
        if (!input) return;
        const newStock = parseInt(input.value, 10);
        if (Number.isNaN(newStock) || newStock < 0) return alert('Quantidade inválida');
        db.updateStock(id, newStock);
        alert('Estoque atualizado');
        renderProducts();
    }

    // Inativa (soft-delete) o produto
    function removeProduct(id) {
        if (!confirm('Deseja realmente inativar este produto?')) return;
        db.removeProduct(id);
        alert('Produto inativado');
        renderProducts();
    }

    // Configura o formulário de criação de produto e o handler de submit
    function setupCreateProductForm() {
        createProductForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const fd = new FormData(createProductForm);
            const data = {
                nome: fd.get('nome'),
                categoria: fd.get('categoria') || 'outros',
                preco: parseFloat(fd.get('preco')) || 0,
                estoque: parseInt(fd.get('estoque'), 10) || 0,
                imagem: fd.get('imagem') || '',
                descricao: fd.get('descricao') || '',
                tamanhos: fd.get('tamanhos') ? fd.get('tamanhos').split(',').map(s => s.trim()) : [],
                cores: fd.get('cores') ? fd.get('cores').split(',').map(s => s.trim()) : []
            };

            const newP = db.createProduct(data);
            alert('Produto criado: ' + newP.nome);
            createProductForm.reset();
            renderProducts();
        });
    }

    // Render inicial e bind do form
    renderUsers();
    renderProducts();
    setupCreateProductForm();
});

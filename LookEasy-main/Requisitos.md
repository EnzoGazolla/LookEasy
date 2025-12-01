# Especificação do Projeto: LookEasy (E-commerce)

## 1. Visão Geral
[cite_start]Desenvolvimento de uma interface web para um comércio eletrônico focado na venda de roupas e acessórios (camisetas, moletons, calças, bermudas, etc.)[cite: 5, 6]. O sistema deve atuar como uma vitrine digital organizada.

---
## 2. Stack Tecnológica (Definição de Arquitetura)
> **ATENÇÃO PARA O CLINE:** Este é um projeto **apenas Frontend**. Não utilize Node.js, Express, Python ou bancos de dados reais.
- **Estrutura:** HTML5 Semântico.
- **Estilo:** CSS3 (Flexbox/Grid) com arquivo de variáveis para cores.
- **Lógica e Persistência:** JavaScript (ES6+).
- **Banco de Dados:** Utilizar **LocalStorage** do navegador para simular a persistência de dados de:
    - Usuários cadastrados (Array de objetos JSON).
    - Sessão atual (Usuário logado).
    - Carrinho de compras.
    - Produtos (caso o admin cadastre novos, salvar no LocalStorage também).

---

## 3. Requisitos Funcionais (RF)
O sistema deve implementar as seguintes funcionalidades principais, divididas por perfil de acesso:

### Funcionalidades Gerais (Cliente e Administrador)
- **[RF01] Registrar no site:** O usuário deve conseguir criar uma nova conta (Autocadastro).
- **[RF02] Logar no site:** O sistema deve autenticar usuários e diferenciar o acesso entre **Cliente** e **Administrador**, redirecionando para a interface correta.
- **[RF03] Recuperar senha:** O usuário deve conseguir redefinir sua senha caso a esqueça.

### Funcionalidades do Cliente (Loja)
- **[RF04] Listar produtos:** Exibir produtos disponíveis contendo imagem, nome e preço.
- **[RF05] Filtrar produtos:** Permitir filtragem por tamanho, cor, categoria, gênero e preço.
- **[RF06] Adicionar ao carrinho:** Usuário seleciona tamanho e cor antes de adicionar o item.
- **[RF07] Remover do carrinho:** Permitir a exclusão de itens previamente adicionados.
- **[RF08] Alterar carrinho:** O usuário deve poder alterar a quantidade de itens.
- **[RF09] Calcular valor automaticamente:** O sistema deve somar o total do carrinho em tempo real.

### Funcionalidades do Administrador (Backoffice)
- [cite_start]**[RF10] Cadastrar produtos:** O administrador deve poder inserir novos produtos no sistema, definindo nome, preço, imagem, categoria e estoque inicial.
- [cite_start]**[RF11] Gerenciar usuários:** O administrador deve ter permissão para visualizar e gerenciar as contas de usuários cadastradas no sistema.

---

## 4. Regras de Negócio (RN) - Adaptação Frontend
Estas regras devem ser validadas no JavaScript do navegador:

- **[RN01] Controle de Estoque:** Ao carregar a página, verificar no LocalStorage a quantidade disponível.
- **[RN02] Indisponibilidade:** Produtos sem estoque devem exibir visualmente a tag ou texto "Indisponível".
- **[RN03] Unicidade de Conta:** Antes de salvar um novo registro no LocalStorage, percorrer o Array de usuários existentes para garantir que o e-mail não existe.
- **[RN04] Simulação de Admin:** O sistema deve verificar uma propriedade `role` ou `tipo` no objeto do usuário logado para liberar o acesso às telas de "Cadastrar Produtos" e "Gerenciar Usuários".
---

## 5. Requisitos Não Funcionais (RNF)
Critérios de qualidade técnica:

- **[RNF01] Performance:** A página inicial deve carregar em no máximo 3 segundos (Banda Larga).
- **[RNF02] Compatibilidade:** O layout deve funcionar nos navegadores modernos (Chrome, Firefox, Edge, Safari).
- **[RNF03] Segurança:** Validação de entradas (inputs) deve ocorrer tanto no Frontend quanto no Backend.

---

## 6. Diretrizes de Interface (UI/UX)
Baseado no protótipo visual do projeto:

- **Paleta de Cores:** Fundo claro/branco para vitrine, detalhes em amarelo para botões de ação ("Comprar", "Sale") e preto para cabeçalho/rodapé.
- **Seções da Home:**
    1. Header com busca e carrinho.
    2. Banner rotativo (Destaque/Promoção 50% OFF).
    3. Menu de Categorias (Feminino, Masculino, Acessórios).
    4. Grade de "Destaques".
    5. Grade de "Para Você".
- **Cards de Produto:** Devem mostrar Imagem, Nome, Preço e Botão "Comprar".
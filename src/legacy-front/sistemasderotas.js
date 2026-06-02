// Sistema de Autenticação e Proteção de Rotas

/**
 * Gerenciador de autenticação
 */
class AuthManager {
    constructor() {
        this.tokenKey = 'casa_repouso_token';
        this.userKey = 'casa_repouso_user';
        this.loginUrl = 'login.html';
        this.homeUrl = 'base.html';
        this.apiBaseUrl = '/api'; // Configurar conforme backend
    }

    /**
     * Verifica se o usuário está logado
     * @returns {boolean}
     */
    isLoggedIn() {
        const token = this.getToken();
        const user = this.getUser();
        
        if (!token || !user) {
            return false;
        }

        // Verifica se o token não expirou
        try {
            const payload = this.parseJWT(token);
            const now = Math.floor(Date.now() / 1000);
            
            if (payload.exp && payload.exp < now) {
                this.logout();
                return false;
            }
            
            return true;
        } catch (error) {
            console.error('Erro ao verificar token:', error);
            this.logout();
            return false;
        }
    }

    /**
     * Obtém o token de autenticação
     * @returns {string|null}
     */
    getToken() {
        return localStorage.getItem(this.tokenKey) || sessionStorage.getItem(this.tokenKey);
    }

    /**
     * Obtém os dados do usuário logado
     * @returns {Object|null}
     */
    getUser() {
        const userStr = localStorage.getItem(this.userKey) || sessionStorage.getItem(this.userKey);
        try {
            return userStr ? JSON.parse(userStr) : null;
        } catch (error) {
            console.error('Erro ao parsear dados do usuário:', error);
            return null;
        }
    }

    /**
     * Salva os dados de autenticação
     * @param {string} token - Token de autenticação
     * @param {Object} user - Dados do usuário
     * @param {boolean} remember - Se deve lembrar o login
     */
    saveAuth(token, user, remember = false) {
        const storage = remember ? localStorage : sessionStorage;
        
        storage.setItem(this.tokenKey, token);
        storage.setItem(this.userKey, JSON.stringify(user));
        
        // Remove do outro storage se existir
        const otherStorage = remember ? sessionStorage : localStorage;
        otherStorage.removeItem(this.tokenKey);
        otherStorage.removeItem(this.userKey);
    }

    /**
     * Realiza login
     * @param {LoginDTO} loginDTO - Dados de login
     * @returns {Promise<RespostaDTO>}
     */
    async login(loginDTO) {
        try {
            const validation = loginDTO.validate();
            if (!validation.isValid) {
                return new RespostaDTO({
                    sucesso: false,
                    mensagem: 'Dados inválidos',
                    erros: validation.errors
                });
            }

            const response = await fetch(`${this.apiBaseUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(loginDTO.toJSON())
            });

            const data = await response.json();
            const resposta = RespostaDTO.fromResponse(data);

            if (resposta.isSuccess() && resposta.dados) {
                this.saveAuth(
                    resposta.dados.token,
                    resposta.dados.usuario,
                    loginDTO.lembrarAcesso
                );
            }

            return resposta;
        } catch (error) {
            console.error('Erro no login:', error);
            return new RespostaDTO({
                sucesso: false,
                mensagem: 'Erro de conexão. Tente novamente.',
                codigo: 500
            });
        }
    }

    /**
     * Realiza logout
     */
    logout() {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.userKey);
        sessionStorage.removeItem(this.tokenKey);
        sessionStorage.removeItem(this.userKey);
        
        // Redireciona para login se não estiver na página de login
        if (!window.location.pathname.includes(this.loginUrl)) {
            this.redirectToLogin();
        }
    }

    /**
     * Redireciona para página de login
     * @param {string} returnUrl - URL para retornar após login
     */
    redirectToLogin(returnUrl = null) {
        const currentUrl = returnUrl || window.location.pathname + window.location.search;
        const loginUrlWithReturn = `${this.loginUrl}?return=${encodeURIComponent(currentUrl)}`;
        window.location.href = loginUrlWithReturn;
    }

    /**
     * Redireciona para página inicial
     */
    redirectToHome() {
        const urlParams = new URLSearchParams(window.location.search);
        const returnUrl = urlParams.get('return');
        
        if (returnUrl && returnUrl !== this.loginUrl) {
            window.location.href = decodeURIComponent(returnUrl);
        } else {
            window.location.href = this.homeUrl;
        }
    }

    /**
     * Obtém headers para requisições autenticadas
     * @returns {Object}
     */
    getAuthHeaders() {
        const token = this.getToken();
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    }

    /**
     * Faz requisição autenticada
     * @param {string} url - URL da requisição
     * @param {Object} options - Opções da requisição
     * @returns {Promise<Response>}
     */
    async authenticatedFetch(url, options = {}) {
        const headers = {
            ...this.getAuthHeaders(),
            ...options.headers
        };

        const response = await fetch(url, {
            ...options,
            headers
        });

        // Se não autorizado, faz logout
        if (response.status === 401) {
            this.logout();
            throw new Error('Sessão expirada. Faça login novamente.');
        }

        return response;
    }

    /**
     * Parse JWT token (apenas para verificar expiração)
     * @param {string} token - Token JWT
     * @returns {Object}
     */
    parseJWT(token) {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    }

    /**
     * Verifica permissões do usuário
     * @param {string|Array} permissions - Permissão(ões) necessária(s)
     * @returns {boolean}
     */
    hasPermission(permissions) {
        const user = this.getUser();
        if (!user || !user.permissions) {
            return false;
        }

        const userPermissions = user.permissions;
        const requiredPermissions = Array.isArray(permissions) ? permissions : [permissions];

        return requiredPermissions.some(permission => 
            userPermissions.includes(permission) || userPermissions.includes('admin')
        );
    }
}

/**
 * Protetor de rotas
 */
class RouteGuard {
    constructor(authManager) {
        this.authManager = authManager;
        this.protectedPages = [
            'base.html',
            'regdocs.html',
            'listagem_pacientes.html',
            'help_page_final.html'
        ];
        this.publicPages = [
            'login.html'
        ];
    }

    /**
     * Verifica se a página atual é protegida
     * @returns {boolean}
     */
    isCurrentPageProtected() {
        const currentPage = this.getCurrentPageName();
        return this.protectedPages.some(page => currentPage.includes(page));
    }

    /**
     * Verifica se a página atual é pública
     * @returns {boolean}
     */
    isCurrentPagePublic() {
        const currentPage = this.getCurrentPageName();
        return this.publicPages.some(page => currentPage.includes(page));
    }

    /**
     * Obtém o nome da página atual
     * @returns {string}
     */
    getCurrentPageName() {
        return window.location.pathname.split('/').pop() || 'index.html';
    }

    /**
     * Protege a página atual
     */
    protectCurrentPage() {
        if (this.isCurrentPageProtected()) {
            if (!this.authManager.isLoggedIn()) {
                this.authManager.redirectToLogin();
                return false;
            }
        }

        // Se está logado e na página de login, redireciona para home
        if (this.isCurrentPagePublic() && this.authManager.isLoggedIn()) {
            this.authManager.redirectToHome();
            return false;
        }

        return true;
    }

    /**
     * Adiciona proteção a links
     */
    protectLinks() {
        document.addEventListener('click', (event) => {
            const link = event.target.closest('a');
            if (!link) return;

            const href = link.getAttribute('href');
            if (!href || href.startsWith('#') || href.startsWith('http')) return;

            const isProtectedLink = this.protectedPages.some(page => href.includes(page));
            
            if (isProtectedLink && !this.authManager.isLoggedIn()) {
                event.preventDefault();
                this.authManager.redirectToLogin(href);
            }
        });
    }
}

/**
 * Componente de login
 */
class LoginComponent {
    constructor(authManager) {
        this.authManager = authManager;
        this.form = null;
        this.submitButton = null;
        this.errorContainer = null;
    }

    /**
     * Inicializa o componente de login
     */
    init() {
        this.form = document.querySelector('form');
        this.submitButton = this.form?.querySelector('button[type="submit"]');
        
        if (!this.form) {
            console.error('Formulário de login não encontrado');
            return;
        }

        this.createErrorContainer();
        this.bindEvents();
    }

    /**
     * Cria container para mensagens de erro
     */
    createErrorContainer() {
        this.errorContainer = document.createElement('div');
        this.errorContainer.className = 'alert alert-error';
        this.errorContainer.style.display = 'none';
        this.errorContainer.style.marginBottom = '20px';
        this.errorContainer.style.padding = '15px';
        this.errorContainer.style.backgroundColor = 'rgba(255, 82, 82, 0.1)';
        this.errorContainer.style.border = '1px solid #FF5252';
        this.errorContainer.style.borderRadius = '6px';
        this.errorContainer.style.color = '#FF5252';
        
        this.form.insertBefore(this.errorContainer, this.form.firstChild);
    }

    /**
     * Vincula eventos do formulário
     */
    bindEvents() {
        this.form.addEventListener('submit', this.handleSubmit.bind(this));
    }

    /**
     * Manipula envio do formulário
     * @param {Event} event
     */
    async handleSubmit(event) {
        event.preventDefault();
        
        this.hideError();
        this.setLoading(true);

        try {
            const formData = new FormData(this.form);
            const loginDTO = LoginDTO.fromForm(formData);
            
            const resposta = await this.authManager.login(loginDTO);
            
            if (resposta.isSuccess()) {
                this.authManager.redirectToHome();
            } else {
                this.showError(resposta.getPrimeiroErro());
            }
        } catch (error) {
            console.error('Erro no login:', error);
            this.showError('Erro de conexão. Tente novamente.');
        } finally {
            this.setLoading(false);
        }
    }

    /**
     * Mostra mensagem de erro
     * @param {string} message
     */
    showError(message) {
        this.errorContainer.textContent = message;
        this.errorContainer.style.display = 'block';
    }

    /**
     * Esconde mensagem de erro
     */
    hideError() {
        this.errorContainer.style.display = 'none';
    }

    /**
     * Define estado de carregamento
     * @param {boolean} loading
     */
    setLoading(loading) {
        if (this.submitButton) {
            this.submitButton.disabled = loading;
            this.submitButton.textContent = loading ? 'Entrando...' : 'Entrar';
        }
    }
}

/**
 * Componente de informações do usuário
 */
class UserInfoComponent {
    constructor(authManager) {
        this.authManager = authManager;
    }

    /**
     * Cria elemento de informações do usuário
     * @returns {HTMLElement}
     */
    createElement() {
        const user = this.authManager.getUser();
        if (!user) return null;

        const container = document.createElement('div');
        container.className = 'user-info';
        container.innerHTML = `
            <div class="user-info-content">
                <span class="user-name">Olá, ${user.nome}</span>
                <button class="btn-logout" onclick="authManager.logout()">Sair</button>
            </div>
        `;

        return container;
    }

    /**
     * Adiciona informações do usuário ao header
     */
    addToHeader() {
        const header = document.querySelector('header');
        const nav = header?.querySelector('nav');
        
        if (header && nav) {
            const userInfo = this.createElement();
            if (userInfo) {
                header.appendChild(userInfo);
            }
        }
    }
}

// Instância global do gerenciador de autenticação
const authManager = new AuthManager();
const routeGuard = new RouteGuard(authManager);

// Inicialização automática
document.addEventListener('DOMContentLoaded', function() {
    // Protege a página atual
    if (!routeGuard.protectCurrentPage()) {
        return; // Página foi redirecionada
    }

    // Protege links
    routeGuard.protectLinks();

    // Inicializa componente de login se estiver na página de login
    if (routeGuard.isCurrentPagePublic()) {
        const loginComponent = new LoginComponent(authManager);
        loginComponent.init();
    }

    // Adiciona informações do usuário se estiver logado
    if (authManager.isLoggedIn()) {
        const userInfoComponent = new UserInfoComponent(authManager);
        userInfoComponent.addToHeader();
    }
});

// Exporta para uso global
window.authManager = authManager;
window.routeGuard = routeGuard;
window.AuthManager = AuthManager;
window.RouteGuard = RouteGuard;
window.LoginComponent = LoginComponent;
window.UserInfoComponent = UserInfoComponent;


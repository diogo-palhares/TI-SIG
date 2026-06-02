import { api, ApiError } from './client.js';

// Mapeia o status HTTP do backend para mensagens claras ao usuário.
const LOGIN_MESSAGES = {
  401: 'Senha incorreta. Verifique sua senha e tente novamente.',
  404: 'E-mail não encontrado. Confira o endereço digitado ou faça seu cadastro.',
  403: 'Este usuário está inativo. Entre em contato com o administrador.',
  422: 'Preencha o e-mail e a senha corretamente.',
};

export async function login(email, password) {
  try {
    await api.post('/logins/authenticate', { email, password });
    return true;
  } catch (err) {
    if (err instanceof ApiError) {
      throw new ApiError(err.status, LOGIN_MESSAGES[err.status] || err.message);
    }
    throw err;
  }
}

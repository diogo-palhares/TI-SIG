// Cliente HTTP central para a API do backend (Spring Boot).
// O backend tem CORS liberado, então chamamos a URL absoluta diretamente.
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

function defaultMessageForStatus(status) {
  switch (status) {
    case 400:
      return 'Dados inválidos. Verifique os campos e tente novamente.';
    case 401:
      return 'Não autorizado.';
    case 403:
      return 'Acesso negado.';
    case 404:
      return 'Registro não encontrado.';
    case 409:
      return 'Já existe um registro com esses dados (CPF, RG, e-mail ou carteirinha).';
    case 422:
      return 'Há campos obrigatórios não preenchidos ou inválidos.';
    default:
      return `Ocorreu um erro (código ${status}). Tente novamente.`;
  }
}

async function request(path, { method = 'GET', body } = {}) {
  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(
      0,
      'Não foi possível conectar ao servidor. Verifique se o backend está em execução.'
    );
  }

  if (!response.ok) {
    throw new ApiError(response.status, defaultMessageForStatus(response.status));
  }

  if (response.status === 204) return null;

  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text; // resposta em texto puro (ex.: login bem-sucedido)
  }
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  del: (path) => request(path, { method: 'DELETE' }),
};

export { BASE_URL };

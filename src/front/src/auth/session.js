// Sessão simples baseada em sessionStorage (o backend não usa JWT).
const KEY = 'usuarioLogado';

export function setSession(email) {
  sessionStorage.setItem(KEY, email);
}

export function getSession() {
  return sessionStorage.getItem(KEY);
}

export function clearSession() {
  sessionStorage.removeItem(KEY);
}

export function isAuthenticated() {
  return !!getSession();
}

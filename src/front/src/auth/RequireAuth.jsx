import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from './session.js';

// Protege rotas: redireciona para /login se o usuário não estiver autenticado.
export default function RequireAuth({ children }) {
  const location = useLocation();
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}

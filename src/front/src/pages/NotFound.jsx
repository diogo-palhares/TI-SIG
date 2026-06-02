import { Link } from 'react-router-dom';
import { isAuthenticated } from '../auth/session.js';

export default function NotFound() {
  const dest = isAuthenticated() ? '/pacientes' : '/login';
  return (
    <div className="auth-wrap">
      <div className="panel center" style={{ maxWidth: 480 }}>
        <div style={{ fontSize: 56 }}>🔍</div>
        <h1 style={{ margin: '12px 0' }}>Página não encontrada</h1>
        <p className="muted">A página que você procura não existe ou foi movida.</p>
        <div className="mt-2">
          <Link to={dest} className="btn btn-primary">
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}

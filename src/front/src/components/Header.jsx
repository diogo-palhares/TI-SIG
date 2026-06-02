import { NavLink, useNavigate } from 'react-router-dom';
import { getSession, clearSession } from '../auth/session.js';

export default function Header() {
  const navigate = useNavigate();
  const user = getSession();

  function handleLogout() {
    clearSession();
    navigate('/login', { replace: true });
  }

  return (
    <header className="app-header">
      <NavLink to="/pacientes" className="logo">
        <img src="/logo.jpg" alt="Logo Casa de Repouso" className="logo-img" />
        <span className="logo-text">Casa de Repouso Do Jeitinho da Vovó</span>
      </NavLink>
      <nav className="nav">
        <NavLink to="/pacientes" className="nav-link">
          Pacientes
        </NavLink>
        <NavLink to="/medicamentos" className="nav-link">
          Medicamentos
        </NavLink>
        <NavLink to="/ajuda" className="nav-link">
          Ajuda
        </NavLink>
        <span className="nav-user">
          {user && <span title="Usuário logado">👤 {user}</span>}
          <button
            type="button"
            className="btn btn-secondary"
            style={{ padding: '7px 14px' }}
            onClick={handleLogout}
          >
            Sair
          </button>
        </span>
      </nav>
    </header>
  );
}

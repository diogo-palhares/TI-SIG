import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { login } from '../api/auth.js';
import { setSession } from '../auth/session.js';
import { ApiError } from '../api/client.js';
import Message from '../components/Message.jsx';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/pacientes';

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);

    if (!email.trim() || !password.trim()) {
      setMessage({ type: 'error', text: 'Preencha o e-mail e a senha para entrar.' });
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password.trim());
      setSession(email.trim());
      navigate(from, { replace: true });
    } catch (err) {
      const text =
        err instanceof ApiError ? err.message : 'Não foi possível entrar. Tente novamente.';
      setMessage({ type: 'error', text });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-left">
          <img src="/logo.jpg" alt="Logo Casa de Repouso" />
          <h2>
            Casa de Repouso
            <br />
            Do Jeitinho da Vovó
          </h2>
          <p>Cuidado, conforto e carinho para quem merece o melhor atendimento.</p>
        </div>
        <div className="auth-right">
          <h2>Bem-vindo de volta!</h2>
          <p>Acesse o sistema para gerenciar as informações do asilo.</p>
          <form onSubmit={handleSubmit} noValidate>
            {message && <Message type={message.type}>{message.text}</Message>}
            <div className="field">
              <label htmlFor="email">Usuário (E-mail)</label>
              <input
                id="email"
                className="input"
                type="text"
                placeholder="Digite seu e-mail"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setMessage(null);
                }}
              />
            </div>
            <div className="field">
              <label htmlFor="senha">Senha</label>
              <input
                id="senha"
                className="input"
                type="password"
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setMessage(null);
                }}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
          <p className="center mt-2 muted">
            Não tem conta?{' '}
            <Link to="/cadastro-usuario" className="link-button">
              Cadastre-se
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

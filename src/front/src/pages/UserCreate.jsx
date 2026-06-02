import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { usersApi } from '../api/users.js';
import { ApiError } from '../api/client.js';
import { isValidCPF, onlyDigits } from '../utils/cpf.js';
import Message from '../components/Message.jsx';

const EMPTY = { name: '', cpf: '', email: '', senha: '', confirmar: '' };

export default function UserCreate() {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setMessage(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);

    if (!form.name.trim()) {
      setMessage({ type: 'error', text: 'Informe o nome completo.' });
      return;
    }
    if (!isValidCPF(form.cpf)) {
      setMessage({ type: 'error', text: 'CPF inválido. Verifique os números digitados.' });
      return;
    }
    if (!form.email.trim()) {
      setMessage({ type: 'error', text: 'Informe um e-mail válido.' });
      return;
    }
    if (form.senha.length < 4) {
      setMessage({ type: 'error', text: 'A senha deve ter pelo menos 4 caracteres.' });
      return;
    }
    if (form.senha !== form.confirmar) {
      setMessage({ type: 'error', text: 'As senhas não coincidem.' });
      return;
    }

    setLoading(true);
    try {
      await usersApi.create({
        name: form.name.trim(),
        password: form.senha,
        cpf: onlyDigits(form.cpf),
        email: form.email.trim(),
      });
      setMessage({
        type: 'success',
        text: 'Usuário cadastrado com sucesso! Redirecionando para o login...',
      });
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      const text = err instanceof ApiError ? err.message : 'Erro ao cadastrar usuário.';
      setMessage({ type: 'error', text });
    } finally {
      setLoading(false);
    }
  }

  const cpfInvalid = form.cpf.length > 0 && !isValidCPF(form.cpf);

  return (
    <div className="auth-wrap">
      <div className="panel auth-narrow" style={{ width: '100%' }}>
        <h2 className="panel-title">Cadastro de Usuário</h2>
        <p className="muted" style={{ marginBottom: 20 }}>
          Preencha os dados para criar um novo usuário do sistema.
        </p>
        <form onSubmit={handleSubmit} noValidate>
          {message && <Message type={message.type}>{message.text}</Message>}
          <div className="field">
            <label>Nome Completo</label>
            <input
              className="input"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              placeholder="Nome do usuário"
            />
          </div>
          <div className="field">
            <label>CPF</label>
            <input
              className={`input ${cpfInvalid ? 'invalid' : ''}`}
              value={form.cpf}
              onChange={(e) => update('cpf', e.target.value)}
              placeholder="000.000.000-00"
            />
            {cpfInvalid && <span className="field-error">CPF inválido.</span>}
          </div>
          <div className="field">
            <label>E-mail</label>
            <input
              className="input"
              type="email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              placeholder="exemplo@usuario.com"
            />
          </div>
          <div className="field">
            <label>Senha</label>
            <input
              className="input"
              type="password"
              value={form.senha}
              onChange={(e) => update('senha', e.target.value)}
              placeholder="Digite a senha"
            />
          </div>
          <div className="field">
            <label>Confirmar Senha</label>
            <input
              className="input"
              type="password"
              value={form.confirmar}
              onChange={(e) => update('confirmar', e.target.value)}
              placeholder="Confirme a senha"
            />
          </div>
          <div className="form-actions">
            <Link to="/login" className="btn btn-secondary">
              Cancelar
            </Link>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Cadastrando...' : 'Cadastrar Usuário'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

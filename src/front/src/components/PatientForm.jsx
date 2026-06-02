import { useState } from 'react';
import { isValidCPF, onlyDigits } from '../utils/cpf.js';
import Message from './Message.jsx';

const BLOOD_TYPES = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

const EMPTY = {
  name: '',
  cpf: '',
  rg: '',
  birthdate: '',
  bloodType: '',
  plano: '',
  carteirinha: '',
  conditions: '',
  contactName: '',
  contactRelation: '',
  contactPhone: '',
  contactEmail: '',
};

// Formulário compartilhado entre cadastro e edição de paciente.
// onSubmit recebe (payload, setMessage) para que a página exiba erros da API.
export default function PatientForm({
  initial,
  onSubmit,
  submitting,
  submitLabel = 'Salvar',
  extraActions,
}) {
  const [form, setForm] = useState({ ...EMPTY, ...(initial || {}) });
  const [message, setMessage] = useState(null);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setMessage(null);
  }

  function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);

    if (!form.name.trim()) {
      setMessage({ type: 'error', text: 'Informe o nome completo do paciente.' });
      return;
    }
    if (!isValidCPF(form.cpf)) {
      setMessage({ type: 'error', text: 'CPF inválido. Verifique os números digitados.' });
      return;
    }
    if (!form.birthdate) {
      setMessage({ type: 'error', text: 'Informe a data de nascimento.' });
      return;
    }

    const payload = { ...form, cpf: onlyDigits(form.cpf) };
    onSubmit(payload, setMessage);
  }

  const cpfInvalid = form.cpf.length > 0 && !isValidCPF(form.cpf);

  return (
    <form onSubmit={handleSubmit} noValidate>
      {message && <Message type={message.type}>{message.text}</Message>}

      <div className="panel">
        <h3 className="panel-title">Dados Pessoais</h3>
        <div className="form-grid">
          <div className="field">
            <label>Nome Completo *</label>
            <input
              className="input"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
            />
          </div>
          <div className="field">
            <label>Data de Nascimento *</label>
            <input
              type="date"
              className="input"
              value={form.birthdate || ''}
              onChange={(e) => update('birthdate', e.target.value)}
            />
          </div>
          <div className="field">
            <label>CPF *</label>
            <input
              className={`input ${cpfInvalid ? 'invalid' : ''}`}
              value={form.cpf}
              onChange={(e) => update('cpf', e.target.value)}
              placeholder="000.000.000-00"
            />
            {cpfInvalid && <span className="field-error">CPF inválido.</span>}
          </div>
          <div className="field">
            <label>RG *</label>
            <input className="input" value={form.rg} onChange={(e) => update('rg', e.target.value)} />
          </div>
        </div>
      </div>

      <div className="panel">
        <h3 className="panel-title">Informações Médicas</h3>
        <div className="form-grid-3">
          <div className="field">
            <label>Tipo Sanguíneo *</label>
            <select
              className="select"
              value={form.bloodType}
              onChange={(e) => update('bloodType', e.target.value)}
            >
              <option value="">Selecione</option>
              {BLOOD_TYPES.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Plano de Saúde *</label>
            <input
              className="input"
              value={form.plano}
              onChange={(e) => update('plano', e.target.value)}
            />
          </div>
          <div className="field">
            <label>Carteirinha *</label>
            <input
              className="input"
              value={form.carteirinha}
              onChange={(e) => update('carteirinha', e.target.value)}
            />
          </div>
        </div>
        <div className="field">
          <label>Doenças Crônicas</label>
          <textarea
            className="textarea"
            rows="2"
            value={form.conditions}
            onChange={(e) => update('conditions', e.target.value)}
          />
        </div>
      </div>

      <div className="panel">
        <h3 className="panel-title">Contato de Emergência</h3>
        <div className="form-grid">
          <div className="field">
            <label>Nome</label>
            <input
              className="input"
              value={form.contactName}
              onChange={(e) => update('contactName', e.target.value)}
            />
          </div>
          <div className="field">
            <label>Parentesco</label>
            <input
              className="input"
              value={form.contactRelation}
              onChange={(e) => update('contactRelation', e.target.value)}
            />
          </div>
          <div className="field">
            <label>Telefone</label>
            <input
              className="input"
              value={form.contactPhone}
              onChange={(e) => update('contactPhone', e.target.value)}
            />
          </div>
          <div className="field">
            <label>E-mail</label>
            <input
              className="input"
              type="email"
              value={form.contactEmail}
              onChange={(e) => update('contactEmail', e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="form-actions">
        {extraActions}
        <button type="submit" className="btn btn-success" disabled={submitting}>
          {submitting ? 'Salvando...' : submitLabel}
        </button>
      </div>
    </form>
  );
}

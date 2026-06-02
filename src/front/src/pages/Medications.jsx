import { useEffect, useMemo, useState } from 'react';
import { medicationsApi } from '../api/medications.js';
import { patientsApi } from '../api/patients.js';
import { ApiError } from '../api/client.js';
import { formatDate } from '../utils/format.js';
import Modal from '../components/Modal.jsx';
import Message from '../components/Message.jsx';

function statusInfo(status) {
  const s = (status || '').toString().toUpperCase();
  if (s === 'CRITICO') return { key: 'critico', cls: 'status-critico', label: 'Crítico' };
  if (s === 'BAIXO') return { key: 'baixo', cls: 'status-baixo', label: 'Baixo' };
  return { key: 'ok', cls: 'status-ok', label: 'OK' };
}

const EMPTY_FORM = {
  description: '',
  dosage: '',
  quantity: '',
  expirationDate: '',
  patientId: '',
};

export default function Medications() {
  const [medications, setMedications] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [flash, setFlash] = useState(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formMessage, setFormMessage] = useState(null);
  const [saving, setSaving] = useState(false);

  const patientName = useMemo(() => {
    const map = {};
    patients.forEach((p) => {
      map[p.patientId] = p.name;
    });
    return map;
  }, [patients]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [pats, meds] = await Promise.all([patientsApi.list(), medicationsApi.list()]);
      setPatients(Array.isArray(pats) ? pats : []);
      setMedications(Array.isArray(meds) ? meds : []);
    } catch {
      setError('Erro ao carregar dados. Verifique se o backend está em execução.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!flash) return;
    const t = setTimeout(() => setFlash(null), 4000);
    return () => clearTimeout(t);
  }, [flash]);

  const visible = useMemo(() => {
    let list = medications.map((m) => ({
      ...m,
      paciente: patientName[m.patientId] || 'Paciente não encontrado',
    }));
    if (search) {
      list = list.filter((m) => m.paciente.toLowerCase().includes(search.toLowerCase()));
    }
    if (statusFilter) {
      list = list.filter((m) => statusInfo(m.status).key === statusFilter);
    }
    if (sortBy) {
      list = [...list].sort((a, b) => {
        if (sortBy === 'nome') return a.paciente.localeCompare(b.paciente);
        if (sortBy === 'quantidade') return (b.quantity || 0) - (a.quantity || 0);
        if (sortBy === 'validade') {
          if (!a.expirationDate) return 1;
          if (!b.expirationDate) return -1;
          return new Date(a.expirationDate) - new Date(b.expirationDate);
        }
        return 0;
      });
    }
    return list;
  }, [medications, patientName, search, statusFilter, sortBy]);

  function openAdd() {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setFormMessage(null);
    setModalOpen(true);
  }

  async function openEdit(id) {
    setFormMessage(null);
    try {
      const m = await medicationsApi.get(id);
      setEditingId(m.id);
      setForm({
        description: m.description || '',
        dosage: m.dosage || '',
        quantity: m.quantity ?? '',
        expirationDate: m.expirationDate || '',
        patientId: m.patientId || '',
      });
      setModalOpen(true);
    } catch {
      setError('Erro ao carregar o medicamento para edição.');
    }
  }

  function closeModal() {
    setModalOpen(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormMessage(null);
  }

  async function handleSave(e) {
    e.preventDefault();
    setFormMessage(null);

    if (!editingId && !form.patientId) {
      setFormMessage({ type: 'error', text: 'Selecione um paciente.' });
      return;
    }
    if (!form.description.trim()) {
      setFormMessage({ type: 'error', text: 'Informe a descrição do medicamento.' });
      return;
    }
    const qty = parseInt(form.quantity, 10);
    if (isNaN(qty) || qty < 0) {
      setFormMessage({ type: 'error', text: 'Informe uma quantidade válida (número maior ou igual a zero).' });
      return;
    }

    const payload = {
      patientId: form.patientId,
      description: form.description.trim(),
      dosage: form.dosage.trim(),
      quantity: qty,
      expirationDate: form.expirationDate || null,
    };

    setSaving(true);
    try {
      if (editingId) {
        payload.id = editingId;
        await medicationsApi.update(editingId, payload);
      } else {
        await medicationsApi.create(payload);
      }
      closeModal();
      setFlash(
        editingId ? 'Medicamento atualizado com sucesso!' : 'Medicamento adicionado com sucesso!'
      );
      await load();
    } catch (err) {
      const text = err instanceof ApiError ? err.message : 'Erro ao salvar o medicamento.';
      setFormMessage({ type: 'error', text });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Tem certeza que deseja excluir este medicamento?')) return;
    try {
      await medicationsApi.remove(id);
      setFlash('Medicamento excluído com sucesso!');
      await load();
    } catch {
      setError('Erro ao excluir o medicamento.');
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-icon">💊</div>
          <div>
            <h1 className="page-title">Gerenciamento de Estoque</h1>
            <p className="page-subtitle">
              Controle e monitore o estoque de medicamentos por paciente.
            </p>
          </div>
        </div>
        <div className="page-actions">
          <button className="btn btn-success" onClick={openAdd}>
            ➕ Adicionar Medicamento
          </button>
        </div>
      </div>

      <div className="panel">
        <div className="filters">
          <div className="field">
            <label>Buscar por paciente</label>
            <input
              className="input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nome do paciente..."
            />
          </div>
          <div className="field">
            <label>Status</label>
            <select
              className="select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="ok">Estoque OK</option>
              <option value="baixo">Estoque Baixo</option>
              <option value="critico">Estoque Crítico</option>
            </select>
          </div>
          <div className="field">
            <label>Ordenar por</label>
            <select className="select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="">Padrão</option>
              <option value="nome">Nome do Paciente</option>
              <option value="quantidade">Quantidade</option>
              <option value="validade">Data de Validade</option>
            </select>
          </div>
        </div>
      </div>

      <div className="panel">
        {flash && <Message type="success">{flash}</Message>}
        {error && <Message type="error">{error}</Message>}
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Paciente</th>
                <th>Descrição</th>
                <th>Posologia</th>
                <th>Qtd.</th>
                <th>Validade</th>
                <th>Status</th>
                <th>Adição</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="empty-state">
                    Carregando...
                  </td>
                </tr>
              ) : visible.length === 0 ? (
                <tr>
                  <td colSpan="8" className="empty-state">
                    <span className="emoji">📦</span>
                    Nenhum medicamento encontrado
                  </td>
                </tr>
              ) : (
                visible.map((m) => {
                  const st = statusInfo(m.status);
                  return (
                    <tr key={m.id}>
                      <td className="row-strong">{m.paciente}</td>
                      <td>{m.description}</td>
                      <td>{m.dosage || '-'}</td>
                      <td>{m.quantity}</td>
                      <td>{formatDate(m.expirationDate)}</td>
                      <td>
                        <span className={`status-badge ${st.cls}`}>{st.label}</span>
                      </td>
                      <td>{formatDate(m.addedAt)}</td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn-icon" title="Editar" onClick={() => openEdit(m.id)}>
                            ✏️
                          </button>
                          <button
                            className="btn-icon btn-deactivate"
                            title="Excluir"
                            onClick={() => handleDelete(m.id)}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <Modal
          title={editingId ? 'Editar Medicamento' : 'Adicionar Medicamento'}
          onClose={closeModal}
          footer={
            <>
              <button className="btn btn-secondary" onClick={closeModal}>
                Cancelar
              </button>
              <button className="btn btn-success" form="med-form" type="submit" disabled={saving}>
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </>
          }
        >
          <form id="med-form" onSubmit={handleSave} noValidate>
            {formMessage && <Message type={formMessage.type}>{formMessage.text}</Message>}
            {!editingId && (
              <div className="field">
                <label>Paciente</label>
                <select
                  className="select"
                  value={form.patientId}
                  onChange={(e) => setForm((f) => ({ ...f, patientId: e.target.value }))}
                >
                  <option value="">Selecione um paciente</option>
                  {patients.map((p) => (
                    <option key={p.patientId} value={p.patientId}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="field">
              <label>Descrição (Nome do Medicamento)</label>
              <input
                className="input"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="field">
              <label>Posologia / Dosagem</label>
              <input
                className="input"
                value={form.dosage}
                onChange={(e) => setForm((f) => ({ ...f, dosage: e.target.value }))}
              />
            </div>
            <div className="form-grid">
              <div className="field">
                <label>Quantidade</label>
                <input
                  type="number"
                  min="0"
                  className="input"
                  value={form.quantity}
                  onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
                />
              </div>
              <div className="field">
                <label>Data de Validade</label>
                <input
                  type="date"
                  className="input"
                  value={form.expirationDate || ''}
                  onChange={(e) => setForm((f) => ({ ...f, expirationDate: e.target.value }))}
                />
              </div>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

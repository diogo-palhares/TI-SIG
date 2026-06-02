import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { patientsApi } from '../api/patients.js';
import { formatCPF } from '../utils/cpf.js';
import { formatDate, calcAge } from '../utils/format.js';
import Modal from '../components/Modal.jsx';
import Message from '../components/Message.jsx';

export default function PatientList() {
  const navigate = useNavigate();
  const location = useLocation();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [flash, setFlash] = useState(location.state?.flash || null);
  const [filters, setFilters] = useState({ name: '', cpf: '', status: '' });
  const [selected, setSelected] = useState(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await patientsApi.list();
      setPatients(Array.isArray(data) ? data : []);
    } catch {
      setError('Erro ao carregar pacientes. Verifique se o backend está em execução.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (flash) {
      window.history.replaceState({}, '');
      const t = setTimeout(() => setFlash(null), 4000);
      return () => clearTimeout(t);
    }
  }, [flash]);

  const filtered = useMemo(() => {
    return patients.filter((p) => {
      const byName =
        !filters.name || (p.name || '').toLowerCase().includes(filters.name.toLowerCase());
      const byCpf = !filters.cpf || (p.cpf || '').includes(filters.cpf.replace(/\D/g, ''));
      const byStatus =
        !filters.status || (filters.status === 'active' ? p.active : !p.active);
      return byName && byCpf && byStatus;
    });
  }, [patients, filters]);

  async function toggleStatus(p) {
    const action = p.active ? 'desativar' : 'ativar';
    if (!window.confirm(`Tem certeza que deseja ${action} o paciente ${p.name}?`)) return;
    try {
      if (p.active) await patientsApi.deactivate(p.patientId);
      else await patientsApi.activate(p.patientId);
      await load();
    } catch {
      setError(`Não foi possível ${action} o paciente.`);
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-icon">👥</div>
          <div>
            <h1 className="page-title">Pesquisa de Pacientes</h1>
            <p className="page-subtitle">
              Utilize os filtros abaixo para encontrar pacientes. Você pode visualizar, editar e
              ativar/desativar os registros.
            </p>
          </div>
        </div>
        <div className="page-actions">
          <button className="btn btn-success" onClick={() => navigate('/pacientes/novo')}>
            ➕ Cadastrar Paciente
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/medicamentos')}>
            💊 Medicamentos
          </button>
        </div>
      </div>

      <div className="panel">
        <h2 className="panel-title">Filtros de Pesquisa</h2>
        <div className="filters">
          <div className="field">
            <label>Nome do Paciente</label>
            <input
              className="input"
              value={filters.name}
              onChange={(e) => setFilters((f) => ({ ...f, name: e.target.value }))}
              placeholder="Digite o nome"
            />
          </div>
          <div className="field">
            <label>CPF</label>
            <input
              className="input"
              value={filters.cpf}
              onChange={(e) => setFilters((f) => ({ ...f, cpf: e.target.value }))}
              placeholder="000.000.000-00"
            />
          </div>
          <div className="field">
            <label>Status</label>
            <select
              className="select"
              value={filters.status}
              onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
            >
              <option value="">Todos</option>
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
            </select>
          </div>
          <button
            className="btn btn-secondary"
            onClick={() => setFilters({ name: '', cpf: '', status: '' })}
          >
            Limpar Filtros
          </button>
        </div>
      </div>

      <div className="panel">
        <div className="results-header">
          <h2 style={{ fontSize: 19 }}>Resultados</h2>
          <span className="results-count">
            {filtered.length} paciente{filtered.length !== 1 ? 's' : ''} encontrado
            {filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {flash && <Message type="success">{flash}</Message>}
        {error && <Message type="error">{error}</Message>}

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Paciente</th>
                <th>Idade</th>
                <th>CPF</th>
                <th>Data de Entrada</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="empty-state">
                    Carregando...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-state">
                    <span className="emoji">🔍</span>
                    Nenhum paciente encontrado
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.patientId}>
                    <td className="row-strong">{p.name}</td>
                    <td>{calcAge(p.birthdate)}</td>
                    <td>{formatCPF(p.cpf)}</td>
                    <td>{formatDate(p.addedAt)}</td>
                    <td>
                      <span
                        className={`status-badge ${p.active ? 'status-active' : 'status-inactive'}`}
                      >
                        {p.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-icon"
                          title="Visualizar"
                          onClick={() => setSelected(p)}
                        >
                          👁️
                        </button>
                        <button
                          className="btn-icon"
                          title="Editar"
                          onClick={() => navigate(`/pacientes/${p.patientId}/editar`)}
                        >
                          ✏️
                        </button>
                        <button
                          className={`btn-icon ${p.active ? 'btn-deactivate' : 'btn-activate'}`}
                          title={p.active ? 'Desativar' : 'Ativar'}
                          onClick={() => toggleStatus(p)}
                        >
                          {p.active ? '⏻' : '✓'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <Modal
          title="Detalhes do Paciente"
          onClose={() => setSelected(null)}
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setSelected(null)}>
                Fechar
              </button>
              <button
                className="btn btn-primary"
                onClick={() => navigate(`/pacientes/${selected.patientId}/editar`)}
              >
                Editar Paciente
              </button>
            </>
          }
        >
          <PatientDetails p={selected} />
        </Modal>
      )}
    </div>
  );
}

function PatientDetails({ p }) {
  const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    p.name || 'Paciente'
  )}&background=E6D2B6&color=2B2B2B&size=128`;
  const dataNasc = p.birthdate ? formatDate(p.birthdate) : '';
  return (
    <div className="patient-details">
      <div className="patient-header">
        <img src={avatar} alt={`Foto de ${p.name}`} className="patient-photo" />
        <div>
          <div className="patient-name-large">{p.name}</div>
          <span className={`status-badge ${p.active ? 'status-active' : 'status-inactive'}`}>
            {p.active ? 'Ativo' : 'Inativo'}
          </span>
          <div className="patient-meta">
            <span>
              🎂 {calcAge(p.birthdate)}
              {dataNasc ? ` (${dataNasc})` : ''}
            </span>
            <span>📅 Entrada: {formatDate(p.addedAt)}</span>
          </div>
        </div>
      </div>
      <div className="detail-section">
        <h4 className="detail-title">Informações Pessoais</h4>
        <div className="detail-row">
          <div className="detail-label">CPF</div>
          <div className="detail-value">{formatCPF(p.cpf)}</div>
        </div>
        <div className="detail-row">
          <div className="detail-label">RG</div>
          <div className="detail-value">{p.rg || '-'}</div>
        </div>
      </div>
      <div className="detail-section">
        <h4 className="detail-title">Plano e Saúde</h4>
        <div className="detail-row">
          <div className="detail-label">Tipo Sanguíneo</div>
          <div className="detail-value">{p.bloodType || '-'}</div>
        </div>
        <div className="detail-row">
          <div className="detail-label">Plano de Saúde</div>
          <div className="detail-value">{p.plano || '-'}</div>
        </div>
        <div className="detail-row">
          <div className="detail-label">Carteirinha</div>
          <div className="detail-value">{p.carteirinha || '-'}</div>
        </div>
        <div className="detail-row">
          <div className="detail-label">Doenças Crônicas</div>
          <div className="detail-value">{p.conditions || '-'}</div>
        </div>
      </div>
      <div className="detail-section">
        <h4 className="detail-title">Contato de Emergência</h4>
        <div className="detail-row">
          <div className="detail-label">Nome</div>
          <div className="detail-value">{p.contactName || '-'}</div>
        </div>
        <div className="detail-row">
          <div className="detail-label">Telefone</div>
          <div className="detail-value">{p.contactPhone || '-'}</div>
        </div>
        <div className="detail-row">
          <div className="detail-label">Parentesco</div>
          <div className="detail-value">{p.contactRelation || '-'}</div>
        </div>
        <div className="detail-row">
          <div className="detail-label">E-mail</div>
          <div className="detail-value">{p.contactEmail || '-'}</div>
        </div>
      </div>
    </div>
  );
}

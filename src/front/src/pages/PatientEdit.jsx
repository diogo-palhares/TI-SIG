import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PatientForm from '../components/PatientForm.jsx';
import { patientsApi } from '../api/patients.js';
import { ApiError } from '../api/client.js';
import Message from '../components/Message.jsx';

export default function PatientEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initial, setInitial] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    patientsApi
      .get(id)
      .then((p) => {
        if (!active) return;
        setInitial({
          name: p.name || '',
          cpf: p.cpf || '',
          rg: p.rg || '',
          birthdate: p.birthdate || '',
          bloodType: p.bloodType || '',
          plano: p.plano || '',
          carteirinha: p.carteirinha || '',
          conditions: p.conditions || '',
          contactName: p.contactName || '',
          contactRelation: p.contactRelation || '',
          contactPhone: p.contactPhone || '',
          contactEmail: p.contactEmail || '',
        });
      })
      .catch(() => {
        if (active) setLoadError('Não foi possível carregar os dados do paciente.');
      });
    return () => {
      active = false;
    };
  }, [id]);

  async function handleSubmit(payload, setMessage) {
    setSubmitting(true);
    try {
      await patientsApi.update(id, payload);
      navigate('/pacientes', { state: { flash: 'Paciente atualizado com sucesso!' } });
    } catch (err) {
      const text = err instanceof ApiError ? err.message : 'Erro ao atualizar paciente.';
      setMessage({ type: 'error', text });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-icon">✏️</div>
          <div>
            <h1 className="page-title">Editar Paciente</h1>
            <p className="page-subtitle">Atualize as informações do paciente.</p>
          </div>
        </div>
      </div>

      {loadError && <Message type="error">{loadError}</Message>}
      {!initial && !loadError && <div className="panel">Carregando dados do paciente...</div>}
      {initial && (
        <PatientForm
          initial={initial}
          onSubmit={handleSubmit}
          submitting={submitting}
          submitLabel="Salvar Alterações"
          extraActions={
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/pacientes')}
            >
              Cancelar
            </button>
          }
        />
      )}
    </div>
  );
}

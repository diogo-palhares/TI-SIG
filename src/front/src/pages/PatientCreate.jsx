import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PatientForm from '../components/PatientForm.jsx';
import { patientsApi } from '../api/patients.js';
import { ApiError } from '../api/client.js';

export default function PatientCreate() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(payload, setMessage) {
    setSubmitting(true);
    try {
      await patientsApi.create(payload);
      navigate('/pacientes', { state: { flash: 'Paciente cadastrado com sucesso!' } });
    } catch (err) {
      const text = err instanceof ApiError ? err.message : 'Erro ao cadastrar paciente.';
      setMessage({ type: 'error', text });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-icon">📝</div>
          <div>
            <h1 className="page-title">Cadastro de Paciente</h1>
            <p className="page-subtitle">
              Preencha os dados do novo paciente. Campos com * são obrigatórios.
            </p>
          </div>
        </div>
      </div>
      <PatientForm
        onSubmit={handleSubmit}
        submitting={submitting}
        submitLabel="Cadastrar Paciente"
        extraActions={
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/pacientes')}>
            Cancelar
          </button>
        }
      />
    </div>
  );
}

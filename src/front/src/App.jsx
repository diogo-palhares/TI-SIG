import { Routes, Route, Navigate } from 'react-router-dom';
import RequireAuth from './auth/RequireAuth.jsx';
import Layout from './components/Layout.jsx';
import Login from './pages/Login.jsx';
import UserCreate from './pages/UserCreate.jsx';
import PatientList from './pages/PatientList.jsx';
import PatientCreate from './pages/PatientCreate.jsx';
import PatientEdit from './pages/PatientEdit.jsx';
import Medications from './pages/Medications.jsx';
import Help from './pages/Help.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <Routes>
      {/* Páginas públicas / standalone (sem o menu do sistema) */}
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro-usuario" element={<UserCreate />} />

      {/* Páginas protegidas, dentro do layout do sistema */}
      <Route
        element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }
      >
        <Route path="/pacientes" element={<PatientList />} />
        <Route path="/pacientes/novo" element={<PatientCreate />} />
        <Route path="/pacientes/:id/editar" element={<PatientEdit />} />
        <Route path="/medicamentos" element={<Medications />} />
        <Route path="/ajuda" element={<Help />} />
      </Route>

      <Route path="/" element={<Navigate to="/pacientes" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

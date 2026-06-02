import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-container">
        <div className="footer-logo">
          <img src="/logo.jpg" alt="Logo Casa de Repouso" />
          <span>
            Casa de Repouso
            <br />
            Do Jeitinho da Vovó
          </span>
        </div>
        <div className="footer-links">
          <div>
            <h4>Sistema</h4>
            <ul>
              <li>
                <Link to="/pacientes">Pacientes</Link>
              </li>
              <li>
                <Link to="/medicamentos">Medicamentos</Link>
              </li>
              <li>
                <Link to="/ajuda">Ajuda</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4>Legal</h4>
            <ul>
              <li>
                <a
                  href="https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm"
                  target="_blank"
                  rel="noreferrer"
                >
                  LGPD
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        &copy; 2025 Casa de Repouso Do Jeitinho da Vovó. Todos os direitos reservados.
      </div>
    </footer>
  );
}

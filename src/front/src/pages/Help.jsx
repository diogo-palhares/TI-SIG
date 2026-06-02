import { Link } from 'react-router-dom';

const FAQ = [
  {
    q: 'Como faço login no sistema?',
    a: 'Na tela inicial, informe seu e-mail e senha cadastrados e clique em "Entrar". Caso ainda não tenha cadastro, clique em "Cadastre-se".',
  },
  {
    q: 'Como cadastrar um novo paciente?',
    a: 'Acesse o menu "Pacientes" e clique em "Cadastrar Paciente". Preencha os campos obrigatórios (marcados com *) e confirme em "Cadastrar Paciente".',
  },
  {
    q: 'Como ativar ou desativar um paciente?',
    a: 'Na listagem de pacientes, use o botão de status na coluna "Ações" (⏻ para desativar, ✓ para ativar). Pacientes inativos permanecem no sistema, porém sinalizados.',
  },
  {
    q: 'Como controlar o estoque de medicamentos?',
    a: 'Acesse o menu "Medicamentos". É possível adicionar, editar e excluir medicamentos vinculados a cada paciente. O status do estoque é calculado automaticamente a partir da quantidade.',
  },
  {
    q: 'O que significam os status de estoque?',
    a: 'OK: quantidade suficiente. Baixo: estoque reduzido, atenção à reposição. Crítico: estoque muito baixo, reposição urgente.',
  },
];

export default function Help() {
  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-icon">❓</div>
          <div>
            <h1 className="page-title">Central de Ajuda</h1>
            <p className="page-subtitle">Dúvidas frequentes sobre o uso do sistema.</p>
          </div>
        </div>
      </div>

      <div className="panel">
        {FAQ.map((item, i) => (
          <details key={i} style={{ marginBottom: 14 }}>
            <summary style={{ cursor: 'pointer', fontWeight: 500, fontSize: 16 }}>{item.q}</summary>
            <p className="muted" style={{ marginTop: 8 }}>
              {item.a}
            </p>
          </details>
        ))}
      </div>

      <div className="panel">
        <h3 className="panel-title">Precisa de mais ajuda?</h3>
        <p className="muted">
          Entre em contato com o administrador do sistema ou consulte a documentação do projeto.
        </p>
        <div className="mt-2">
          <Link to="/pacientes" className="btn btn-primary">
            Voltar para Pacientes
          </Link>
        </div>
      </div>
    </div>
  );
}

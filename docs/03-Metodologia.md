
# Metodologia

A metodologia adotada pelo grupo inclui o gerenciamento do código-fonte utilizando Git e GitHub, com ambientes distintos para desenvolvimento, testes e produção. A versão inicial da aplicação é executada localmente por meio do Maven Wrapper com um JDK 17 e do banco de dados H2 em memória, o que dispensa a instalação de Docker ou de um SGBD externo para fins de avaliação. Para o ambiente de produção está previsto o uso do PostgreSQL como banco de dados e a hospedagem na Hostinger após a homologação.


## Controle de versão

A ferramenta de controle de versão adotada no projeto foi o [Git](https://git-scm.com/), sendo que o [GitHub](https://github.com) foi utilizado para hospedagem do repositório.

O projeto segue a seguinte convenção para o nome de branches:

- `main`: versão estável já testada do software
- `tested`: versão já testada do software
- `testing`: versão em testes do software
- `dev`: versão de desenvolvimento do software
- `feature/nome-da-feature`: branch de implementação de uma funcionalidade
- `bugFix/nome-da-feature`: branch de correnção de uma funcionalidade
- `improve/nome-da-feature`: branch de melhoria de uma funcionalidade

## Planejamento do projeto

### Matriz de Responsabilidades

| Atividades | Ana Clara | Ana Flávia | Diogo | Eduarda | Igor | Pedro | Clínica |
|-------------|-----------|------------|-------|---------|------|-------|---------|
| Visita ao local escolhido para entendimento das necessidades | I | I | R | I | R | I | C |
| Levantamento de requisitos e solução para o problema apresentado | R | R | R | R | R | R | C |
| Preenchimento Documento Atividade 1 | R | R | R | R | R | R | I |
| Realização dos Slides Atividade 1 | R | C | C | C | C | C | C |
| Apresentação e discussão sobre o problema identificado e proposta de projeto | R | R | R | R | R | R | C |
| Preenchimento Documento Atividade 2 | R | R | R | R | R | R | I |
| Realização da Proposta | R | R | R | R | R | R | A |
| Realização dos Slides Atividade 2 | C | C | C | C | R | C | C |
| Apresentação - Caracterização da comunidade e Requisitos - Ajustes na proposta | R | R | R | R | R | R | C |
| Protótipo das telas | R | R | R | R | R | R | A |
| Realização da proposta de implementação | R | R | R | R | R | R | A |
| Apresentação das telas | R | R | R | R | R | R | I |
| Apresentação de telas e diagramas de Casos de Uso | R | R | R | R | R | R | I |
| Correção dos entregas passadas | R | R | R | R | R | R | I |
| Realização dos Slides Atividade 3 | R | C | C | C | C | C | C |
| Desenvolvimento do sistema (programação das funcionalidades) | R | R | R | R | R | R | I |
| Testes de funcionalidades | R | R | R | R | R | R | I |
| Ajustes pós-testes | R | R | R | R | R | R | I |
| Apresentação do software à comunidade | R | R | R | R | R | R | A |
| Entrega Final | R | R | R | R | R | R | I |
| Mostra Tecnológica Interdisciplinar | R | R | R | R | R | R | I |
| Treinamento dos usuários (pessoal da Clínica) | R | R | R | R | R | R | C |
| Coleta de feedback dos usuários | R | R | R | R | R | R | C |
| Correções finais e atualização do sistema | R | R | R | R | R | R | I |

---

### Legenda

- **A – Aprovador:** Quem aprova ou valida formalmente a atividade.
- **R – Responsável:** Quem executa formalmente a atividade.
- **C – Consultado:** Quem gera informações que agregam valor ou apoia na execução.
- **I – Informado:** Quem precisa ser notificado do resultado da atividade.

### Processo

O grupo adotou a metodologia ágil Scrum para conduzir o desenvolvimento do projeto, dividindo o trabalho em ciclos iterativos e incrementais (sprints). A seguir estão os principais pontos da nossa abordagem:

* Papéis definidos no time
Product Owner (PO): Responsável por priorizar as funcionalidades e garantir o alinhamento com as necessidades do cliente.

Scrum Master: Facilitador do processo ágil, ajudando a remover impedimentos e garantir o bom andamento das sprints.

Time de Desenvolvimento: Composto por membros responsáveis pela análise, design, codificação, testes e documentação do sistema.

* Cerimônias aplicadas
Sprint Planning (Planejamento da Sprint): Definimos as tarefas que serão realizadas com base na prioridade do backlog.

Daily Scrum (Reunião Diária): Realizamos reuniões rápidas para atualização de progresso e identificação de bloqueios.

Sprint Review: Apresentamos as funcionalidades entregues ao final de cada sprint.

Sprint Retrospective: Avaliamos o que funcionou bem e o que pode ser melhorado nas próximas sprints.

* Artefatos usados
Product Backlog: Lista de funcionalidades e melhorias planejadas, criada no GitHub Projects.

Sprint Backlog: Seleção de itens do Product Backlog que serão desenvolvidos na sprint atual.

Incremento: Funcionalidades entregues ao final de cada sprint.

## Relação de ambientes de trabalho

Os artefatos do projeto são desenvolvidos a partir de diversas plataformas. Todos os ambientes e frameworks utilizados no desenvolvimento da aplicação estão listados na seção abaixo.

### Ferramentas

| Ambiente                            | Plataforma                         | Link de acesso                         |
|-------------------------------------|------------------------------------|----------------------------------------|
| Repositório de código fonte         | GitHub                             | https://github.com/ICEI-PUC-Minas-PCO-SI/TIAS-2025 |
| Projeto de interface                | Figma                              | https://www.figma.com/design/VqTzr0XPoxf7ExrdXQ6Gvm/Untitled?node-id=0-1&p=f&t=GLlCR4eIMJev9y6H-0 |

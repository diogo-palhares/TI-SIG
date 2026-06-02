# Arquitetura da solução

<span style="color:red">Pré-requisitos: <a href="05-Projeto-interface.md"> Projeto de interface</a></span>


![Arquitetura da Solução](images/Arquitetura.png)

## Diagrama de classes

![class_diagram](https://github.com/user-attachments/assets/71dafa54-6312-4340-af7c-1ba9b292530d)


##  Modelo de dados

### Modelo DER

![er_diagram](https://github.com/user-attachments/assets/94c1ec10-05bf-41c4-b07f-d8c296c61509)


### Esquema relacional

Com base no Diagrama Entidade-Relacionamento (DER), o modelo relacional é definido pelas seguintes tabelas:

Tabela: USERS

•
id (INT, PRIMARY KEY)

•
username (VARCHAR(255), UNIQUE, NOT NULL)

•
password_hash (VARCHAR(255), NOT NULL)

•
role (VARCHAR(50), NOT NULL)

Tabela: PATIENTS

•
id (INT, PRIMARY KEY)

•
name (VARCHAR(255), NOT NULL)

•
date_of_birth (DATE)

•
address (VARCHAR(255))

•
phone (VARCHAR(20))

•
email (VARCHAR(255))

Tabela: MEDICATIONS

•
id (INT, PRIMARY KEY)

•
name (VARCHAR(255), NOT NULL)

•
dosage (VARCHAR(100))

•
description (TEXT)

Tabela: LOGINS

•
id (INT, PRIMARY KEY)

•
user_id (INT, FOREIGN KEY REFERENCES USERS(id), NOT NULL)

•
login_time (DATETIME, NOT NULL)

•
ip_address (VARCHAR(45))

Tabela: DOCUMENTATIONS

•
id (INT, PRIMARY KEY)

•
title (VARCHAR(255), NOT NULL)

•
content (TEXT)

•
creation_date (DATETIME, NOT NULL)

•
user_id (INT, FOREIGN KEY REFERENCES USERS(id), NOT NULL)

•
document_type (VARCHAR(100))

•
patient_id (INT, FOREIGN KEY REFERENCES PATIENTS(id), NULLABLE)

•
medication_id (INT, FOREIGN KEY REFERENCES MEDICATIONS(id), NULLABLE)

Relacionamentos:

•
Um USER pode ter muitos LOGINS (1:N).

•
Um USER pode criar muitas DOCUMENTATIONS (1:N).

•
Um PATIENT pode ter muitas DOCUMENTATIONS relacionadas (1:N).

•
Um MEDICATION pode ser referenciado em muitas DOCUMENTATIONS (1:N).



### Modelo físico

-- Criação da tabela USERS
CREATE TABLE USERS (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL
);

-- Criação da tabela PATIENTS
CREATE TABLE PATIENTS (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    date_of_birth DATE,
    address VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(255)
);

-- Criação da tabela MEDICATIONS
CREATE TABLE MEDICATIONS (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100),
    description TEXT
);

-- Criação da tabela LOGINS
CREATE TABLE LOGINS (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    login_time DATETIME NOT NULL,
    ip_address VARCHAR(45),
    FOREIGN KEY (user_id) REFERENCES USERS(id)
);

-- Criação da tabela DOCUMENTATIONS
CREATE TABLE DOCUMENTATIONS (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    creation_date DATETIME NOT NULL,
    user_id INT NOT NULL,
    document_type VARCHAR(100),
    patient_id INT,
    medication_id INT,
    FOREIGN KEY (user_id) REFERENCES USERS(id),
    FOREIGN KEY (patient_id) REFERENCES PATIENTS(id),
    FOREIGN KEY (medication_id) REFERENCES MEDICATIONS(id)
);

### Modelo implementado (versão inicial do APP)

O modelo apresentado acima corresponde ao projeto conceitual inicial. A versão implementada da aplicação, descrita nesta entrega, contempla as quatro entidades efetivamente desenvolvidas, com as seguintes definições:

- **Usuário:** identificador (UUID), nome, CPF (único), e-mail (único) e situação (ativo/inativo).
- **Login:** identificador (UUID), e-mail, senha, situação (ativo/inativo), data e hora do último acesso e referência ao usuário correspondente (relação 1:1).
- **Paciente:** identificador (UUID), nome, CPF (único), RG (único), data de nascimento, tipo sanguíneo, plano de saúde, número da carteirinha (único), condições/doenças crônicas, dados do contato de emergência (nome, e-mail, telefone e parentesco), situação (ativo/inativo) e data de cadastro.
- **Medicamento:** identificador (UUID), descrição, quantidade, data de validade, posologia/dosagem, data de adição, status de estoque (OK, BAIXO ou CRÍTICO) e referência ao paciente (relação N:1).

Relacionamentos implementados:

- Um **Usuário** possui um **Login** associado (1:1).
- Um **Paciente** possui muitos **Medicamentos** (1:N).

As principais diferenças em relação ao modelo conceitual são: o uso de chaves primárias do tipo UUID (em vez de inteiros sequenciais); a ausência da tabela de documentos/laudos (`DOCUMENTATIONS`), cujo upload de anexos não foi implementado nesta versão inicial; e o cálculo automático do status do medicamento a partir da quantidade em estoque, atendendo ao requisito RF-008 (baixa automática de estoque).

## Tecnologias

As tecnologias efetivamente utilizadas na implementação da versão inicial da solução são:

- **Front-end:** React (biblioteca JavaScript) com Vite e React Router, consumindo a API REST; layout responsivo voltado a dispositivos móveis.
- **Back-end:** Java 17 com Spring Boot 3 (módulos Spring Web e Spring Data JPA/Hibernate), expondo uma API REST.
- **SGBD:** H2 em memória para desenvolvimento e testes (execução local sem instalações adicionais) e PostgreSQL previsto para o ambiente de produção, selecionável por perfil de execução.
- **Gerenciamento de dependências e build:** Maven, por meio do Maven Wrapper (`mvnw`).
- **Testes automatizados:** JUnit 5 e Mockito (testes unitários de serviço e testes de fatia de controlador com MockMvc).

Relação entre as Tecnologias:

A interação do usuário com o sistema ocorre da seguinte forma:

1. O usuário interage com a interface Front-end (aplicação React) através de um navegador web.

2. As requisições do Front-end são enviadas, via HTTP/JSON, para a API REST do Back-end (desenvolvida em Java com Spring Boot).

3. O Back-end processa as requisições nas camadas de controlador e serviço, aplicando as regras de negócio e validações, e interage com o SGBD por meio do Spring Data JPA para persistência e recuperação de dados.

4. O Back-end retorna a resposta (em JSON) para o Front-end.

5. O Front-end atualiza a interface do usuário com os dados recebidos.


## Qualidade de software

Qualidade de Software

Com base na norma internacional ISO/IEC 25010, que define características e subcaracterísticas de qualidade para produtos de software, identificamos as seguintes subcaracterísticas como base para nortear o desenvolvimento do projeto Jeitinho da Vovó e do Vovô:

1. Adequação Funcional (Functional Suitability)

Subcaracterística: Completude Funcional (Functional Completeness)

Justificativa: O projeto buscou substituir registros físicos e um sistema anterior complexo, centralizando as informações e automatizando tarefas. A completude funcional garante que todas as funções necessárias para atender aos requisitos do usuário (acesso, organização e segurança das informações dos pacientes, controle de estoque, administração de medicamentos) foram implementadas.

Métricas: Número de requisitos funcionais implementados com sucesso; Percentual de funcionalidades cobertas pelos testes de aceitação.


Subcaracterística: Correção Funcional (Functional Correctness)

Justificativa: A precisão dos dados e a execução correta das funcionalidades são cruciais para um sistema de gestão de pacientes e medicamentos, onde erros podem ter consequências sérias. Esta subcaracterística assegura que o sistema fornece os resultados corretos com a precisão esperada.

Métricas: Número de defeitos funcionais encontrados por funcionalidade; Taxa de sucesso das operações de CRUD (Create, Read, Update, Delete) de dados.


2. Usabilidade (Usability)

Subcaracterística: Capacidade de Aprendizagem (Learnability)

Justificativa: O projeto visa uma interface intuitiva, facilitando o uso mesmo por profissionais com pouca familiaridade com tecnologia. A capacidade de aprendizagem mede a facilidade com que novos usuários podem aprender a operar o sistema e se tornar proficientes.

Métricas: Tempo médio para novos usuários completarem tarefas básicas; Número de erros cometidos por novos usuários durante a primeira interação.



Subcaracterística: Operabilidade (Operability)

Justificativa: A otimização da rotina dos colaboradores e a redução do tempo de consulta de dados dependem de um sistema fácil de operar. Esta subcaracterística foca na facilidade de controle e operação do sistema pelos usuários.

Métricas: Tempo médio para completar tarefas complexas; Número de cliques ou passos necessários para realizar uma operação.


3. Confiabilidade (Reliability)

Subcaracterística: Tolerância a Falhas (Fault Tolerance)

Justificativa: A segurança das informações e a continuidade do serviço são essenciais em um sistema de saúde. A tolerância a falhas garante que o sistema pode operar corretamente mesmo na presença de falhas de hardware ou software.

Métricas: Tempo médio entre falhas (MTBF); Tempo médio para reparo (MTTR); Número de recuperações bem-sucedidas após falhas.

Subcaracterística: Maturidade (Maturity)

Justificativa: Um sistema maduro é aquele que demonstra estabilidade e baixa frequência de falhas. Isso é vital para a confiança dos usuários e para a operação contínua da instituição.

Métricas: Número de falhas por unidade de tempo; Densidade de defeitos (número de defeitos por linha de código ou ponto de função).


4. Eficiência de Desempenho (Performance Efficiency)

Subcaracterística: Comportamento Temporal (Time-behaviour)

Justificativa: A redução do tempo de consulta de dados é um dos principais resultados esperados. O comportamento temporal avalia os tempos de resposta e processamento do sistema sob diferentes condições de carga.

Métricas: Tempo de resposta para operações críticas (e.g., busca de paciente, registro de medicamento); Vazão (throughput) de transações por segundo.



5. Segurança (Security)

Subcaracterística: Confidencialidade (Confidentiality)

Justificativa: A segurança das informações dos pacientes é um requisito crítico. A confidencialidade garante que os dados sensíveis são protegidos contra acesso não autorizado.

Métricas: Número de tentativas de acesso não autorizado bloqueadas; Conformidade com políticas de privacidade de dados.

Subcaracterística: Integridade (Integrity)

Justificativa: A integridade dos dados assegura que as informações não são alteradas ou destruídas de forma não autorizada. Isso é fundamental para a confiabilidade dos registros médicos.

Métricas: Número de violações de integridade de dados detectadas e corrigidas; Percentual de dados com validação de entrada implementada.





## Como Utilizar
PASSO A PASSO PARA ACESSO E EXECUÇÃO DO PROJETO NO WINDOWS (COM GIT E VS CODE)

## 1. Instalar o VS Code
O VS Code será usado para editar e visualizar o projeto.

Acesse: https://code.visualstudio.com/

* Clique em “Download for Windows” e instale normalmente.
* Após a instalação, recomendo instalar as extensões:
* Java Extension Pack
* Spring Boot Extension Pack
* PostgreSQL
* Maven for Java
* GitLens (opcional)

 ## 2. Clonar o Repositório com Git
É necessário ter o Git instalado. Se não tiver, baixe em: https://git-scm.com/

Comando:
bash
Copiar
Editar
git clone https://github.com/ICEI-PUC-Minas-PCO-SI/2025-1-p5-tias-2025-1-tias-t2-grupo-02.git

## 3. Abrir o Projeto no VS Code
bash
Copiar
Editar
cd nome-do-repositorio
code .
O comando code . abre o VS Code na pasta atual (funciona se você selecionou "Add to PATH" na instalação do VS Code).

# Passo a Passo para Rodar a Aplicação no Windows (sem Docker e sem banco de dados externo)

A versão inicial do APP é composta por um **backend** (Java + Spring Boot, executado com apenas um JDK 17 e banco **H2 em memória** — sem PostgreSQL nem Docker) e por um **frontend em React (Vite)**, que requer o **Node.js**. Os dois são iniciados separadamente, conforme os passos abaixo.

## 1. Instalar o JDK 17
- Baixe e instale um JDK 17 (por exemplo, o Eclipse Temurin 17).
- Verifique a instalação com o comando `java -version` (deve indicar a versão 17).

## 2. Iniciar o Backend
- Abra um terminal na pasta `src/back`.
- Execute o **Maven Wrapper** (não é necessário instalar o Maven separadamente):
  - Windows (PowerShell ou CMD): `.\mvnw.cmd spring-boot:run`
  - Linux/macOS: `./mvnw spring-boot:run`
- Aguarde a mensagem `Started BackApplication`. O servidor ficará disponível em `http://localhost:8080`.
- Na primeira execução, o sistema cria automaticamente dados de exemplo (5 pacientes com seus medicamentos e um usuário de teste).

## 3. Iniciar o Frontend (React)
- O frontend é uma aplicação **React (Vite)** e requer o **Node.js 18+** (recomendado o Node 20 LTS). Baixe em https://nodejs.org e confira com `node -version`.
- Abra um terminal na pasta `src/front`.
- Na primeira execução, instale as dependências: `npm install`.
- Inicie o servidor de desenvolvimento: `npm run dev` — o navegador abrirá automaticamente em `http://localhost:5173`.
- Mantenha o backend em execução em paralelo (passo 2).
- Faça login com o usuário de teste:
  - **E-mail:** `diogo@teste.com`
  - **Senha:** `12345`
- Após o login, você será direcionado para a listagem de pacientes, que consome a API do backend.
- Para gerar a versão de produção do frontend: `npm run build` (saída na pasta `src/front/dist`).

## 4. (Opcional) Console do Banco de Dados H2
- Com o backend em execução, acesse `http://localhost:8080/h2-console`.
- **JDBC URL:** `jdbc:h2:mem:gericare` — **Usuário:** `sa` — **Senha:** (deixe em branco).

## 5. (Opcional) Executar com PostgreSQL
- Caso deseje usar PostgreSQL em vez do H2, crie o banco de dados e execute o backend com o perfil `postgres`:
  - `.\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=postgres"`
- As credenciais e a URL de conexão podem ser ajustadas em `src/back/src/main/resources/application-postgres.properties`.

## 6. (Opcional) Executar os Testes Automatizados
- Na pasta `src/back`, execute: `.\mvnw.cmd test`
- A suíte cobre as regras de negócio das camadas de serviço e os endpoints REST (testes unitários com JUnit 5 e Mockito).


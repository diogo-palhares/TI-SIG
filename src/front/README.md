# Frontend — GeriCare (Casa de Repouso Do Jeitinho da Vovó)

Aplicação web em **React + Vite** que consome a API REST do backend (Spring Boot).

## Pré-requisitos
- Node.js 18+ (recomendado o Node 20 LTS)
- Backend em execução em `http://localhost:8080` (ver `src/back`)

## Como rodar (desenvolvimento)
```bash
npm install        # apenas na primeira vez
npm run dev        # inicia em http://localhost:5173
```

## Build de produção
```bash
npm run build      # gera a pasta dist/
npm run preview    # serve o build localmente para conferência
```

## Usuário de teste
- E-mail: `diogo@teste.com`
- Senha: `12345`

## Configuração da API
Por padrão a aplicação aponta para `http://localhost:8080/api`. Para usar outra URL,
defina a variável de ambiente `VITE_API_URL` (por exemplo, em um arquivo `.env`):
```
VITE_API_URL=http://localhost:8080/api
```

## Estrutura
```
src/
  api/         Cliente HTTP e chamadas por recurso (patients, medications, users, auth)
  auth/        Sessão (sessionStorage) e proteção de rotas (RequireAuth)
  components/  Layout, Header, Footer, Modal, Message, PatientForm
  pages/       Login, UserCreate, PatientList, PatientCreate, PatientEdit, Medications, Help, NotFound
  utils/       Validação de CPF e formatação de datas/idade
```

> A versão anterior do frontend (HTML/CSS/JS puro) foi preservada em `src/legacy-front`.

# Backend Hoje é Onde

## Descrição

Backend da aplicação **Hoje é Onde**, um sistema que permite usuários se cadastrarem, fazer login, excluir suas contas e gerenciar dados via API RESTful. O backend foi construído em Node.js com Express, usando PostgreSQL para banco de dados e JWT para autenticação.

## Tecnologias Utilizadas

- Node.js
- Express
- PostgreSQL (com pool de conexões)
- JWT para autenticação
- Bcrypt para hash de senhas
- Ngrok para tunelamento e testes externos
- Dotenv para variáveis de ambiente

## Funcionalidades

- Registro de usuário com validação
- Login com geração de token JWT
- Logout (simples resposta para front)
- Exclusão de conta autenticada
- Hash seguro de senha
- Controle de erros e respostas HTTP adequadas

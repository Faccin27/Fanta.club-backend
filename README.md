# Fanta.club - Back-end API

**Fanta.club** é o back-end do sistema de gerenciamento da plataforma social, de showcases e vendas **Fanta.club**. Construído com **Fastify** e utilizando **Prisma ORM** para integração com o banco de dados **MySQL**, o back-end garante alta performance, segurança e escalabilidade.

## Funcionalidades

### 🔐 Autenticação e Segurança

- **JWT**: Sistema de autenticação baseado em tokens JWT.
- **Bcrypt**: Hash seguro de senhas de usuários.
- **Cookies Seguros**: Gerenciamento de autenticação por cookies com a biblioteca `@fastify/cookie`.

### 📤 Gerenciamento de Uploads

- **Upload de Arquivos**: Gerenciamento de uploads utilizando `@fastify/multipart` e integração com **Cloudinary** para armazenamento de imagens.

### 📨 Sistema de E-mail

- **Envio de E-mails**: Implementação de notificações por e-mail para confirmação de conta e recuperação de senha utilizando **Nodemailer**.

### 📦 APIs RESTful

- **Gestão de Usuários**: Criação, atualização e remoção de usuários.
- **Showcases**: APIs para gerenciamento e exibição de showcases personalizados.
- **Fóruns**: Suporte a criação, leitura, atualização e exclusão de tópicos nos fóruns.
- **Compras**: APIs para gerenciamento de histórico e novas compras.

### 🌍 Integração com Front-end

- **CORS Configurado**: Suporte ao front-end baseado em **Next.js**.
- **Rotas Otimizadas**: Estrutura clara e bem documentada para integração com clientes.

## Tecnologias Utilizadas

- **Servidor**: 
  - Fastify para gerenciamento de rotas.
  - Fastify Plugins:
    - `@fastify/cookie` para gerenciamento de cookies.
    - `@fastify/cors` para habilitar CORS.
    - `@fastify/jwt` para autenticação baseada em JWT.
    - `@fastify/multipart` para upload de arquivos.

- **Banco de Dados**:
  - **MySQL** com integração via **Prisma ORM**.

- **Autenticação e Segurança**:
  - `bcrypt` para hash de senhas.
  - `jsonwebtoken` para gerenciamento de tokens JWT.

- **Envio de E-mails**:
  - Nodemailer para envio de e-mails transacionais.

- **Upload de Arquivos**:
  - Integração com **Cloudinary**.

- **Outras Ferramentas**:
  - **dotenv** para gerenciamento de variáveis de ambiente.
  - **Nodemon** para reinicialização automática no desenvolvimento.

## Como Rodar o Projeto

1. Clone este repositório:

   ```bash
   git clone https://github.com/Faccin27/Fanta.club-backend
   ```

2. Instale as dependências:

   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente:

   Crie um arquivo `.env` com os campos presente em .env.example:

4. Rode as migrações para o banco de dados:

   ```bash
   npx prisma migrate deploy
   ```

5. Inicie o servidor:

   ```bash
   npm run dev
   ```

6. Acesse a API:

   ```
   http://localhost:8000
   ```


## Repositório do Front-end

Confira o repositório do front-end [aqui](https://github.com/Faccin27/Fanta.club).

## Contribuições

Contribuições são bem-vindas! Abra um PR ou relate problemas para ajudar no desenvolvimento. 
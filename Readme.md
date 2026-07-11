# 🚀 Tech Challenge — API com Node.js, Express e MongoDB

API REST desenvolvida para o Tech Challenge da graduação, com foco na construção de um back-end organizado, escalável e containerizado. O projeto utiliza Node.js, Express, MongoDB, Docker e Jest, aplicando boas práticas de arquitetura, testes automatizados e separação de responsabilidades.

---

# 📌 Sobre o projeto

A proposta do projeto é desenvolver uma API back-end capaz de servir como base para uma plataforma de blogging educacional, permitindo futura integração com aplicações web e mobile.

A aplicação foi construída utilizando:

- Node.js
- Express
- MongoDB
- Docker
- Jest
- Supertest
- Zod

Além disso, o projeto segue conceitos importantes de desenvolvimento back-end moderno, como:

- Arquitetura MVC
- Middlewares globais
- Validação de dados com Zod
- Variáveis de ambiente
- Containerização com Docker
- Persistência de dados
- Testes automatizados
- Pipeline CI/CD

---

# 📋 Índice

- [Pré-requisitos](#-pré-requisitos)
- [Clonando o projeto](#-clonando-o-projeto)
- [Configuração do ambiente](#-configuração-do-ambiente)
- [Executando com Docker](#-executando-com-docker)
- [Comandos do dia a dia](#-comandos-do-dia-a-dia)
- [Parando os containers](#-parando-os-containers)
- [Executando os testes](#-executando-os-testes)
- [Autenticação JWT](#autenticação-jwt)
- [Rotas disponíveis](#-rotas-disponíveis)
- [Estrutura do projeto](#-estrutura-do-projeto)
- [Healthcheck](#healthcheck)
- [Pipeline CI/CD](#-pipeline-cicd)
- [Arquitetura da aplicação](#-arquitetura-da-aplicação)
- [Solução de problemas](#-solução-de-problemas)

---

# ✅ Pré-requisitos

Você precisa apenas de:

| Ferramenta | Download               | Finalidade                       |
| ---------- | ---------------------- | -------------------------------- |
| Git        | https://git-scm.com    | Clonar o repositório             |
| Docker     | https://www.docker.com | Executar a aplicação e o MongoDB |

> ⚠️ Não é necessário instalar Node.js ou MongoDB localmente. O Docker cuidará de todo o ambiente da aplicação.

---

# 📥 Clonando o projeto

```bash
# Clonar o repositório
git clone https://github.com/Roch-Daniel/blog-api

# Entrar na pasta do projeto
cd blog-api
```

---

# ⚙️ Configuração do ambiente

Crie o arquivo `.env` com base no `.env.example`.

## Linux/Mac

```bash
cp .env.example .env
```

## Windows

```bash
copy .env.example .env
```

---

## Exemplo do `.env`

```env
NODE_ENV=production
PORT=3000

MONGO_INITDB_ROOT_USERNAME=adm
MONGO_INITDB_ROOT_PASSWORD=adm
MONGO_INITDB_DATABASE=blog_api

USE_IN_MEMORY_DB=false
MONGODB_URI=mongodb://adm:adm@localhost:27017/blog_api?authSource=admin

JWT_SECRET=sua-chave-secreta-longa-e-aleatoria
```

## Exemplo do `.env` para uso com Docker Compose

O arquivo `.env.example` do projeto já está preparado para o ambiente com containers e inclui:

```env
NODE_ENV=production
PORT=3000

MONGO_INITDB_ROOT_USERNAME=adm
MONGO_INITDB_ROOT_PASSWORD=adm
MONGO_INITDB_DATABASE=blog_api
MONGO_PORT=27017

USE_IN_MEMORY_DB=false
MONGODB_URI=mongodb://adm:adm@db:27017/blog_api?authSource=admin

JWT_SECRET=sua-chave-secreta-longa-e-aleatoria
```

> 💡 No Docker Compose, o host `db` é o nome do serviço do MongoDB.

Quando USE_IN_MEMORY_DB=true, a aplicação utiliza um repositório em memória, dispensando a necessidade de um MongoDB. Esse modo é útil para desenvolvimento local, demonstrações e testes manuais.

> 💡 O arquivo `.env` contém variáveis sensíveis e não deve ser enviado para o GitHub.

---

# 🐳 Executando com Docker

## Primeira execução

```bash
docker compose up --build -d
```

Esse comando irá:

1. Construir a imagem da aplicação
2. Baixar a imagem oficial do MongoDB
3. Instalar as dependências
4. Executar os testes automatizados
5. Criar os containers
6. Configurar a rede entre aplicação e banco
7. Iniciar a API e o MongoDB

---

## Verificando os containers

```bash
docker compose ps
```

Exemplo esperado:

```bash
NAME                  STATUS                PORTS
blog-api-app-1     running               0.0.0.0:3000->3000/tcp
blog-api-db-1      running (healthy)     0.0.0.0:27017->27017/tcp
```

> 💡 Após a inicialização completa, a API também deve responder ao endpoint `/health`, utilizado no healthcheck do container e na validação da pipeline.

---

# 🌐 Acessando a aplicação

Após subir os containers:

| Serviço     | URL                          |
| ----------- | ---------------------------- |
| API         | http://localhost:3000        |
| Swagger     | http://localhost:3000/docs   |
| Healthcheck | http://localhost:3000/health |
| MongoDB     | localhost:27017              |

> 💡 A rota raiz `http://localhost:3000/` redireciona para a documentação Swagger.

> 📖 A documentação OpenAPI está disponível em: `http://localhost:3000/docs`.
> Ela permite visualizar e testar todos os endpoints diretamente pelo navegador.

---

# 🧪 Testando a API

Com a API iniciada e o MongoDB acessível pela variável `MONGODB_URI`, use o Postman ou `curl` para validar as rotas de posts.

Se você estiver sem MongoDB local, defina `USE_IN_MEMORY_DB=true` no `.env`. Nesse modo a API sobe com dados de exemplo em memória e permite testar tudo no Postman sem banco externo.

Exemplo de criação de post (requer token JWT de professor):

```bash
curl --request POST http://localhost:3000/posts \
  --header "Content-Type: application/json" \
  --header "Authorization: Bearer <token>" \
  --data '{
    "title": "Novo post",
    "content": "Conteúdo completo do post",
    "summary": "Resumo do post",
    "disciplineId": "ID_DA_DISCIPLINA",
    "statusId": "ID_DO_STATUS"
  }'
```

Regra importante: apenas usuários com email terminando em `@professor.com` podem criar, editar ou excluir posts. O token JWT é obtido via `POST /auth/login`.

---

# 📌 Comandos do dia a dia

| Comando                        | Descrição                    |
| ------------------------------ | ---------------------------- |
| `docker compose up --build -d` | Builda e sobe os containers  |
| `docker compose up -d`         | Sobe sem rebuild             |
| `docker compose ps`            | Lista containers ativos      |
| `docker compose logs -f app`   | Logs da aplicação            |
| `docker compose logs -f db`    | Logs do MongoDB              |
| `docker compose stop`          | Pausa os containers          |
| `docker compose start`         | Reinicia containers pausados |
| `docker compose down`          | Remove containers            |
| `docker compose down -v`       | Remove containers e volumes  |

---

# ⏹️ Parando os containers

## Apenas pausar

```bash
docker compose stop
```

## Continuar containers pausados

```bash
docker compose start
```

## Remover containers

```bash
docker compose down
```

## Remover containers e banco de dados

O projeto utiliza MongoDB através do Mongoose.
Os relacionamentos entre Post, User, Status e Discipline são feitos utilizando ObjectId.

```bash
docker compose down -v
```

> ⚠️ O comando `-v` remove os volumes e apaga permanentemente os dados do MongoDB.

---

# 🧪 Executando os testes

Os testes utilizam Jest, Supertest e `mongodb-memory-server`, então não dependem do MongoDB externo para validação automatizada.

## Instalar dependências localmente

```bash
npm install
```

## Rodar os testes

```bash
npm test
```

O projeto utiliza:

- Jest
- Supertest
- Cobertura de testes (`--coverage`)
- MongoDB em memória para testes de integração

## Popular dados para teste manual

Para criar usuários, disciplinas, status e posts de exemplo no banco configurado em `MONGODB_URI`:

```bash
npm run seed
```

O seed cria:

- 1 professor autorizado a publicar
- 1 usuário sem permissão de publicação
- 2 disciplinas
- 2 status
- 2 posts iniciais

## Modelagem persistida

O projeto usa Mongoose como ODM com os seguintes modelos:

- `User`: dados de autenticação e autorização do autor
- `Discipline`: categoria acadêmica do conteúdo
- `Status`: estado editorial do post
- `Post`: entidade central com referências para autor, disciplina e status

Relacionamentos aplicados:

- `User (1) -> (N) Posts`
- `Discipline (1) -> (N) Posts`
- `Status (1) -> (N) Posts`

As referências são persistidas no MongoDB por `ObjectId` e retornadas populadas nas consultas de posts.

# Autenticação JWT

As rotas de escrita em `/posts` e `/catalog` (POST, PUT, PATCH, DELETE) exigem autenticação via JWT. Apenas usuários com email terminando em `@professor.com` e conta ativa podem realizar essas operações. As rotas de leitura (GET) permanecem públicas.

## Obtendo o token

```bash
curl --request POST http://localhost:3000/auth/login \
  --header "Content-Type: application/json" \
  --data '{
    "email": "professor@professor.com",
    "password": "senha123"
  }'
```

Resposta:

```json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "60d5ecb8b392d21534c32b11",
      "name": "Professor Exemplo",
      "email": "professor@professor.com"
    }
  }
}
```

O token tem validade de 8 horas.

## Utilizando o token

Inclua o token no cabeçalho `Authorization` em todas as requisições de escrita:

```
Authorization: Bearer <token>
```

Sem o token, a API retorna `401 Unauthorized`. Com um token de usuário sem domínio `@professor.com`, retorna `403 Forbidden`.

## Senhas

As senhas são armazenadas com hash `bcrypt` (fator de custo 10). O seed (`npm run seed`) cria os usuários iniciais com as senhas já hasheadas corretamente. As respostas da API nunca expõem o campo de senha, nem mesmo o hash.

## Limite de tentativas de login

O endpoint `POST /auth/login` aceita no máximo 5 tentativas com falha por email a cada 15 minutos. Logins bem-sucedidos não consomem o limite. Ao exceder, a API retorna `429 Too Many Requests`. Essa proteção dificulta ataques de força bruta contra a senha de uma conta específica.

---

# 🛣️ Rotas disponíveis

| Método | Endpoint                   | Descrição                                                                    |
| ------ | -------------------------- | ---------------------------------------------------------------------------- |
| POST   | `/auth/login`              | Realiza login e retorna o token JWT                                          |
| GET    | `/catalog/users`           | Lista usuários disponíveis para teste                                        |
| POST   | `/catalog/users`           | Cria um novo usuário (requer token JWT de professor)                         |
| PUT    | `/catalog/users/:id`       | Atualiza um usuário existente (requer token JWT de professor)                |
| DELETE | `/catalog/users/:id`       | Remove um usuário existente (requer token JWT de professor)                  |
| GET    | `/catalog/disciplines`     | Lista disciplinas disponíveis para seleção                                   |
| POST   | `/catalog/disciplines`     | Cria uma nova disciplina (requer token JWT de professor)                     |
| PUT    | `/catalog/disciplines/:id` | Atualiza uma disciplina existente (requer token JWT de professor)            |
| DELETE | `/catalog/disciplines/:id` | Remove uma disciplina existente (requer token JWT de professor)              |
| GET    | `/catalog/status`          | Lista status disponíveis para seleção                                        |
| POST   | `/catalog/status`          | Cria um novo status (requer token JWT de professor)                          |
| PUT    | `/catalog/status/:id`      | Atualiza um status existente (requer token JWT de professor)                 |
| DELETE | `/catalog/status/:id`      | Remove um status existente (requer token JWT de professor)                   |
| GET    | `/posts`                   | Lista somente os posts com status ativo                                      |
| GET    | `/posts/all`               | Lista todas as postagens, incluindo inativas (requer token JWT de professor) |
| GET    | `/posts/:id`               | Busca um post por ID                                                         |
| POST   | `/posts`                   | Cria um post (requer token JWT de professor)                                 |
| PUT    | `/posts/:id`               | Atualiza todos os campos de um post (requer token JWT de professor)          |
| PATCH  | `/posts/:id`               | Atualiza parcialmente um post (requer token JWT de professor)                |
| DELETE | `/posts/:id`               | Remove um post (requer token JWT de professor)                               |

> 💡 O `GET /posts` retorna apenas posts vinculados a um status com `isActive: true`. Posts com status inativo não aparecem na listagem.

---

# 📁 Estrutura do projeto

```bash
src/
├── config/
├── controllers/
├── docs/
├── interfaces/
├── middlewares/
├── models/
├── routes/
├── schemas/
├── scripts/
├── services/
├── types/
├── app.ts
└── index.ts

tests/
├── posts.test.ts
├── catalog.test.ts

Dockerfile
docker-compose.yml
package.json
.env
.env.example
```

Além dessa estrutura, o projeto também conta com o workflow `.github/workflows/ci.yml` para automatizar a validação no GitHub Actions.

---

## Healthcheck

A aplicação disponibiliza o endpoint:

GET /health

Ele é utilizado para:

- Docker Healthcheck
- GitHub Actions
- Monitoramento
- Ferramentas de Deploy

O endpoint retorna:

```
{
    status,
    database,
    service,
    timestamp
}
```

---

# 🏗️ Arquitetura da aplicação

O projeto utiliza arquitetura MVC para organização das responsabilidades:

| Camada      | Responsabilidade                           |
| ----------- | ------------------------------------------ |
| Routes      | Gerenciamento das rotas                    |
| Controllers | Controle das requisições                   |
| Services    | Regras de negócio                          |
| Schemas     | Validação e sanitização dos dados com Zod  |
| Models      | Estrutura e manipulação dos dados          |
| Middlewares | Validação de entrada e tratamento de erros |
| Config      | Configuração da aplicação                  |
| Docs        | Documentação OpenAPI                       |
| Scripts     | Seed do banco                              |
| Tests       | Testes automatizados                       |

---

# 🔄 Pipeline CI/CD

A cada `push` ou `pull request` na branch principal, o GitHub Actions executa:

```text
Push para o GitHub
       │
       ▼
  Job: test
  └── npm install
  └── npm test
       │
       ▼
  Job: docker
  └── docker build
  └── docker compose up
  └── docker compose down
```

No workflow atual em `.github/workflows/ci.yml`, essa validação foi detalhada em:

- `npm ci`
- `npm test`
- `npm run build`
- `docker build --target test -t blog-api:test .`
- `docker compose up --build -d`
- smoke test em `http://127.0.0.1:3000/health`
- `docker compose down -v`

Isso garante que:

- os testes estejam funcionando
- a imagem Docker seja construída corretamente
- a aplicação consiga subir sem erros

---

# 🔧 Solução de problemas

## Porta 3000 já está em uso

```bash
docker compose down
```

Ou altere a porta no `docker-compose.yml`:

```yaml
ports:
  - "3001:3000"
```

---

## Porta 27017 já está em uso

Altere a variável `MONGO_PORT` no `.env`:

```env
MONGO_PORT=27018
```

---

## Docker daemon não está rodando

Abra o Docker Desktop e aguarde a inicialização.

---

## Banco não conecta

Verifique os logs:

```bash
docker compose logs db
```

Depois tente novamente:

```bash
docker compose up -d
```

---

## Alterações no código não aparecem

Reconstrua os containers:

```bash
docker compose up --build -d
```

---

# 👨‍💻 Autor

Projeto acadêmico desenvolvido para o Tech Challenge utilizando Node.js, Express, MongoDB, Docker e Jest.

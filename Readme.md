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

Além disso, o projeto segue conceitos importantes de desenvolvimento back-end moderno, como:

- Arquitetura MVC
- Middlewares globais
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
- [Rotas disponíveis](#-rotas-disponíveis)
- [Estrutura do projeto](#-estrutura-do-projeto)
- [Pipeline CI/CD](#-pipeline-cicd)
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
git clone https://github.com/seu-usuario/meu-projeto.git

# Entrar na pasta do projeto
cd meu-projeto
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
```

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
meu-projeto-app-1     running               0.0.0.0:3000->3000/tcp
meu-projeto-db-1      running (healthy)     0.0.0.0:27017->27017/tcp
```

---

# 🌐 Acessando a aplicação

Após subir os containers:

| Serviço | URL                   |
| ------- | --------------------- |
| API     | http://localhost:3000 |
| MongoDB | localhost:27017       |

---

# 🧪 Testando a API

## Rota principal

```bash
curl http://localhost:3000
```

Resposta esperada:

```json
{
  "message": "Hello World!",
  "status": "API online"
}
```

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

```bash
docker compose down -v
```

> ⚠️ O comando `-v` remove os volumes e apaga permanentemente os dados do MongoDB.

---

# 🧪 Executando os testes

Os testes utilizam Jest e Supertest.

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
- Mock do MongoDB

---

# 🛣️ Rotas disponíveis

| Método | Endpoint     | Descrição            |
| ------ | ------------ | -------------------- |
| GET    | `/`          | Status da API        |
| GET    | `/posts`     | Lista todos os posts |
| GET    | `/posts/:id` | Busca um post por ID |

---

# 📁 Estrutura do projeto

```bash
src/
├── controllers/
├── services/
├── routes/
├── middlewares/
├── config/
├── interfaces/
├── app.ts
└── index.ts

tests/
├── posts.test.ts

Dockerfile
docker-compose.yml
package.json
.env
.env.example
```

---

# 🏗️ Arquitetura da aplicação

O projeto utiliza arquitetura MVC para organização das responsabilidades:

| Camada      | Responsabilidade                  |
| ----------- | --------------------------------- |
| Routes      | Gerenciamento das rotas           |
| Controllers | Controle das requisições          |
| Services    | Regras de negócio                 |
| Models      | Estrutura e manipulação dos dados |
| Middlewares | Tratamento global de erros        |

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

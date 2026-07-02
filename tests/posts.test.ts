import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../src/app";
import { connectDB, disconnectDB } from "../src/config/database";
import DisciplineModel from "../src/models/disciplines.model";
import PostModel from "../src/models/posts.model";
import StatusModel from "../src/models/status.model";
import UserModel from "../src/models/users.model";

let mongoServer: MongoMemoryServer;
let professorId: string;
let studentId: string;
let disciplineId: string;
let statusId: string;
let postId: string;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await connectDB(mongoServer.getUri());
});

beforeEach(async () => {
  await PostModel.deleteMany({});
  await UserModel.deleteMany({});
  await DisciplineModel.deleteMany({});
  await StatusModel.deleteMany({});

  const professor = await UserModel.create({
    name: "Prof Teste",
    username: "prof.teste",
    password: "123456",
    email: "prof@professor.com",
    isActive: true,
  });

  const student = await UserModel.create({
    name: "Aluno Teste",
    username: "aluno.teste",
    password: "123456",
    email: "aluno@gmail.com",
    isActive: true,
  });

  const discipline = await DisciplineModel.create({
    label: "Matemática",
    order: 1,
    isActive: true,
  });

  const status = await StatusModel.create({
    label: "Publicado",
    order: 1,
    isActive: true,
  });

  const post = await PostModel.create({
    title: "Post inicial",
    content: "Conteúdo inicial",
    summary: "Resumo inicial",
    discipline: discipline._id,
    author: professor._id,
    status: status._id,
  });

  professorId = professor.id;
  studentId = student.id;
  disciplineId = discipline.id;
  statusId = status.id;
  postId = post.id;
});

afterAll(async () => {
  await disconnectDB();
  await mongoServer.stop();
});

describe("GET /posts", () => {
  it("deve listar os posts persistidos no MongoDB", async () => {
    const response = await request(app).get("/posts");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      data: expect.arrayContaining([
        expect.objectContaining({
          _id: expect.any(String),
          title: expect.any(String),
          summary: expect.any(String),
        }),
      ]),
    });
  });
});

describe("GET /posts/:id", () => {
  it("deve retornar erro para id inválido", async () => {
    const response = await request(app).get("/posts/teste");

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message");
  });

  it("deve retornar um post pelo id", async () => {
    const response = await request(app).get(`/posts/${postId}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual(
      expect.objectContaining({
        _id: postId,
        title: "Post inicial",
      }),
    );
  });
});

describe("POST /posts — validação de campos", () => {
  it("deve retornar 400 quando campos obrigatórios estiverem ausentes", async () => {
    const response = await request(app).post("/posts").send({
      title: "Post sem campos obrigatórios",
      disciplineId,
      authorId: professorId,
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain("Campo obrigatório não informado");
  });

  it("deve retornar 400 quando imageUrl for inválida", async () => {
    const response = await request(app).post("/posts").send({
      title: "Post com URL inválida",
      content: "Conteúdo do post com URL inválida",
      summary: "Resumo do post com URL inválida",
      disciplineId,
      authorId: professorId,
      statusId,
      imageUrl: "nao-e-uma-url",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("imageUrl deve ser uma URL válida");
  });

  it("deve retornar 400 quando título for apenas espaços", async () => {
    const response = await request(app).post("/posts").send({
      title: "   ",
      content: "Conteúdo válido",
      summary: "Resumo válido",
      disciplineId,
      authorId: professorId,
      statusId,
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      "Campo obrigatório não informado: título",
    );
  });

  it("deve retornar 400 quando título for apenas HTML vazio", async () => {
    const response = await request(app).post("/posts").send({
      title: "<b></b>",
      content: "Conteúdo válido",
      summary: "Resumo válido",
      disciplineId,
      authorId: professorId,
      statusId,
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      "Campo obrigatório não informado: título",
    );
  });

  it("deve retornar 400 com mensagem correta quando ID tiver formato inválido", async () => {
    const response = await request(app).post("/posts").send({
      title: "Título válido",
      content: "Conteúdo válido",
      summary: "Resumo válido",
      semester: "1",
      disciplineId: "id-invalido",
      authorId: professorId,
      statusId,
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("ID inválido do MongoDB");
  });

  it("deve sanitizar tags HTML dos campos de texto", async () => {
    const response = await request(app).post("/posts").send({
      title: "<script>alert('xss')</script>Título Limpo",
      content: "<b>Conteúdo completo do post</b>",
      summary: "<i>Resumo completo do post</i>",
      semester: "1",
      disciplineId,
      authorId: professorId,
      statusId,
    });

    expect(response.status).toBe(201);
    expect(response.body.data.title).toBe("Título Limpo");
    expect(response.body.data.content).toBe("Conteúdo completo do post");
    expect(response.body.data.summary).toBe("Resumo completo do post");
  });
});

describe("POST /posts", () => {
  it("deve criar post quando o autor possui email de professor", async () => {
    const response = await request(app).post("/posts").send({
      title: "Novo post",
      content: "Conteúdo do novo post",
      summary: "Resumo do novo post",
      disciplineId,
      authorId: professorId,
      statusId,
      series: "3º ano",
      semester: "1",
    });

    expect(response.status).toBe(201);
    expect(response.body.data).toEqual(
      expect.objectContaining({ title: "Novo post" }),
    );
  });

  it("deve retornar 400 quando o body vier vazio", async () => {
    const response = await request(app)
      .post("/posts")
      .set("Content-Type", "application/json")
      .send();

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Body da requisição não informado");
  });

  it("deve bloquear criação para usuário fora do domínio professor", async () => {
    const response = await request(app).post("/posts").send({
      title: "Post inválido",
      content: "Conteúdo válido do post",
      summary: "Resumo válido do post",
      semester: "1",
      disciplineId,
      authorId: studentId,
      statusId,
    });

    expect(response.status).toBe(403);
    expect(response.body.message).toContain("@professor.com");
  });
});

describe("PUT /posts/:id — validação de campos", () => {
  it("deve retornar 400 quando o body vier vazio", async () => {
    const response = await request(app)
      .put(`/posts/${postId}`)
      .set("Content-Type", "application/json")
      .send();

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Body da requisição não informado");
  });

  it("deve retornar 400 quando imageUrl for inválida no PUT", async () => {
    const response = await request(app).put(`/posts/${postId}`).send({
      title: "Título válido",
      content: "Conteúdo válido do post",
      summary: "Resumo válido do post",
      semester: "1",
      disciplineId,
      authorId: professorId,
      statusId,
      imageUrl: "nao-e-uma-url",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("imageUrl deve ser uma URL válida");
  });

  it("deve retornar 400 quando semester estiver ausente no PUT", async () => {
    const response = await request(app).put(`/posts/${postId}`).send({
      title: "Título válido",
      content: "Conteúdo válido do post",
      summary: "Resumo válido do post",
      disciplineId,
      authorId: professorId,
      statusId,
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      "Campo obrigatório não informado: semestre",
    );
  });

  it("deve sanitizar tags HTML nos campos de texto no PUT", async () => {
    const response = await request(app).put(`/posts/${postId}`).send({
      title: "<b>Título Atualizado via PUT</b>",
      content: "<p>Conteúdo atualizado via PUT com HTML</p>",
      summary: "<i>Resumo atualizado via PUT</i>",
      semester: "1",
      disciplineId,
      authorId: professorId,
      statusId,
    });

    expect(response.status).toBe(200);
    expect(response.body.data.title).toBe("Título Atualizado via PUT");
    expect(response.body.data.content).toBe(
      "Conteúdo atualizado via PUT com HTML",
    );
    expect(response.body.data.summary).toBe("Resumo atualizado via PUT");
  });
});

describe("PUT /posts/:id", () => {
  it("deve atualizar um post existente com todos os campos", async () => {
    const response = await request(app).put(`/posts/${postId}`).send({
      title: "Post atualizado via PUT",
      content: "Conteúdo atualizado via PUT",
      summary: "Resumo atualizado via PUT",
      semester: "1",
      disciplineId,
      authorId: professorId,
      statusId,
    });

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual(
      expect.objectContaining({
        _id: postId,
        title: "Post atualizado via PUT",
        summary: "Resumo atualizado via PUT",
      }),
    );
  });

  it("deve retornar 400 quando faltar campo obrigatório no PUT", async () => {
    const response = await request(app).put(`/posts/${postId}`).send({
      title: "Título sem os outros campos",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain("Campo obrigatório não informado");
  });

  it("deve retornar 404 para post inexistente", async () => {
    const response = await request(app)
      .put("/posts/000000000000000000000001")
      .send({
        title: "Título válido",
        content: "Conteúdo válido do post",
        summary: "Resumo válido do post",
        semester: "1",
        disciplineId,
        authorId: professorId,
        statusId,
      });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("message");
  });
});

describe("PATCH /posts/:id — validação de campos", () => {
  it("deve retornar 400 quando o body vier vazio", async () => {
    const response = await request(app)
      .patch(`/posts/${postId}`)
      .set("Content-Type", "application/json")
      .send();

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Body da requisição não informado");
  });

  it("deve retornar 400 quando imageUrl for inválida no PATCH", async () => {
    const response = await request(app).patch(`/posts/${postId}`).send({
      imageUrl: "nao-e-uma-url",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("imageUrl deve ser uma URL válida");
  });

  it("deve sanitizar tags HTML ao atualizar campos de texto", async () => {
    const response = await request(app).patch(`/posts/${postId}`).send({
      title: "<h1>Título Atualizado</h1>",
      summary: "<p>Resumo atualizado do post</p>",
    });

    expect(response.status).toBe(200);
    expect(response.body.data.title).toBe("Título Atualizado");
    expect(response.body.data.summary).toBe("Resumo atualizado do post");
  });
});

describe("PATCH /posts/:id", () => {
  it("deve atualizar um post com todos os campos", async () => {
    const response = await request(app).patch(`/posts/${postId}`).send({
      title: "Post atualizado",
      content: "Conteúdo atualizado",
      summary: "Resumo atualizado",
      semester: "1",
      disciplineId,
      authorId: professorId,
      statusId,
    });

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual(
      expect.objectContaining({
        _id: postId,
        title: "Post atualizado",
        summary: "Resumo atualizado",
      }),
    );
  });

  it("deve atualizar parcialmente um post existente", async () => {
    const response = await request(app).patch(`/posts/${postId}`).send({
      title: "Post atualizado via PATCH",
      summary: "Resumo atualizado via PATCH",
    });

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual(
      expect.objectContaining({
        _id: postId,
        title: "Post atualizado via PATCH",
        summary: "Resumo atualizado via PATCH",
      }),
    );
  });

  it("deve retornar 404 para post inexistente", async () => {
    const response = await request(app)
      .patch("/posts/000000000000000000000001")
      .send({
        title: "Tentativa de patch",
      });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("message");
  });
});

describe("DELETE /posts/:id", () => {
  it("deve bloquear exclusão quando o autor do post não for professor", async () => {
    const postDeAluno = await PostModel.create({
      title: "Post do aluno",
      content: "Conteúdo",
      summary: "Resumo",
      discipline: disciplineId,
      author: studentId,
      status: statusId,
    });

    const response = await request(app).delete(`/posts/${postDeAluno._id}`);

    expect(response.status).toBe(403);
    expect(response.body.message).toContain("@professor.com");
  });

  it("deve remover um post existente", async () => {
    const response = await request(app).delete(`/posts/${postId}`);

    expect(response.status).toBe(204);

    const storedPost = await PostModel.findById(postId);
    expect(storedPost).toBeNull();
  });

  it("deve retornar 404 para post inexistente", async () => {
    const response = await request(app).delete(
      "/posts/000000000000000000000001",
    );

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("message");
  });
});

describe("GET /posts/search", () => {
  it("deve retornar posts encontrados pelo título", async () => {
    const response = await request(app)
      .get("/posts/search")
      .query({ q: "inicial" });

    expect(response.status).toBe(200);

    expect(response.body.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          _id: postId,
          title: "Post inicial",
        }),
      ]),
    );
  });

  it("deve retornar posts encontrados pelo resumo", async () => {
    const response = await request(app)
      .get("/posts/search")
      .query({ q: "Resumo" });

    expect(response.status).toBe(200);

    expect(response.body.data.length).toBeGreaterThan(0);
  });

  it("deve retornar posts encontrados pelo conteúdo", async () => {
    const response = await request(app)
      .get("/posts/search")
      .query({ q: "Conteúdo" });

    expect(response.status).toBe(200);

    expect(response.body.data.length).toBeGreaterThan(0);
  });

  it("deve retornar lista vazia quando não encontrar resultados", async () => {
    const response = await request(app)
      .get("/posts/search")
      .query({ q: "texto-que-nao-existe-123456" });

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual([]);
  });

  it("deve retornar lista vazia quando q não for informado", async () => {
    const response = await request(app).get("/posts/search");

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual([]);
  });
});

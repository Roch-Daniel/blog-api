import request from "supertest";
import bcrypt from "bcryptjs";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../src/app";
import { connectDB, disconnectDB } from "../src/config/database";
import DisciplineModel from "../src/models/disciplines.model";
import PostModel from "../src/models/posts.model";
import StatusModel from "../src/models/status.model";
import UserModel from "../src/models/users.model";

let mongoServer: MongoMemoryServer;
let professorToken: string;
let studentToken: string;
let professorId: string;
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

  const hashedPassword = await bcrypt.hash("A12345678", 10);

  const professor = await UserModel.create({
    name: "Prof Teste",
    username: "prof.teste",
    password: hashedPassword,
    email: "prof@professor.com",
    isActive: true,
    role: "PROFESSOR",
  });

  await UserModel.create({
    name: "Aluno Teste",
    username: "aluno.teste",
    password: hashedPassword,
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
  disciplineId = discipline.id;
  statusId = status.id;
  postId = post.id;

  const profLogin = await request(app)
    .post("/auth/login")
    .send({ email: "prof@professor.com", password: "A12345678" });
  professorToken = profLogin.body.data.token;

  const studentLogin = await request(app)
    .post("/auth/login")
    .send({ email: "aluno@gmail.com", password: "A12345678" });
  studentToken = studentLogin.body.data.token;
});

afterAll(async () => {
  await disconnectDB();

  if (mongoServer) {
    await mongoServer.stop();
  }
});

describe("POST /auth/login", () => {
  it("deve realizar login com credenciais válidas", async () => {
    const response = await request(app)
      .post("/auth/login")
      .send({ email: "prof@professor.com", password: "A12345678" });

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty("token");
    expect(response.body.data.user.email).toBe("prof@professor.com");
    expect(response.body.data.user).toMatchObject({
      id: professorId,
      username: "prof.teste",
      role: "PROFESSOR",
    });
    expect(response.body.data.user).not.toHaveProperty("password");
  });

  it("deve retornar o perfil ALUNO salvo no cadastro do usuário", async () => {
    const response = await request(app)
      .post("/auth/login")
      .send({ email: "aluno@gmail.com", password: "A12345678" });

    expect(response.status).toBe(200);
    expect(response.body.data.user).toMatchObject({
      username: "aluno.teste",
      role: "ALUNO",
    });
    expect(response.body.data.user).not.toHaveProperty("password");
  });

  it("deve retornar 401 para senha incorreta", async () => {
    const response = await request(app)
      .post("/auth/login")
      .send({ email: "prof@professor.com", password: "senha_errada" });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message");
  });

  it("deve retornar 401 para email não cadastrado", async () => {
    const response = await request(app)
      .post("/auth/login")
      .send({ email: "naoexiste@professor.com", password: "A12345678" });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message");
  });

  it("deve retornar 400 quando email ou senha não forem informados", async () => {
    const response = await request(app).post("/auth/login").send({});

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message");
  });
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

describe("GET /posts/all", () => {
  it("deve retornar 401 sem token", async () => {
    const response = await request(app).get("/posts/all");

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message");
  });

  it("deve retornar 403 com token de aluno", async () => {
    const response = await request(app)
      .get("/posts/all")
      .set("Authorization", `Bearer ${studentToken}`);

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("message");
  });

  it("deve listar todos os posts para professor, incluindo os com status inativo", async () => {
    const inactiveStatus = await StatusModel.create({
      label: "Rascunho",
      order: 2,
      isActive: false,
    });

    await PostModel.create({
      title: "Post com status inativo",
      content: "Conteúdo oculto",
      summary: "Resumo oculto",
      discipline: disciplineId,
      author: professorId,
      status: inactiveStatus._id,
    });

    const publicResponse = await request(app).get("/posts");
    const professorResponse = await request(app)
      .get("/posts/all")
      .set("Authorization", `Bearer ${professorToken}`);

    expect(professorResponse.status).toBe(200);
    expect(professorResponse.body.data).toHaveLength(2);
    expect(publicResponse.body.data).toHaveLength(1);
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

describe("POST /posts - autenticação", () => {
  it("deve retornar 401 quando token estiver ausente", async () => {
    const response = await request(app).post("/posts").send({
      title: "Post",
      content: "Conteúdo",
      summary: "Resumo",
      disciplineId,
      statusId,
    });

    expect(response.status).toBe(401);
  });

  it("deve retornar 403 quando usuário não for professor", async () => {
    const response = await request(app)
      .post("/posts")
      .set("Authorization", `Bearer ${studentToken}`)
      .send({
        title: "Post",
        content: "Conteúdo",
        summary: "Resumo",
        disciplineId,
        statusId,
      });

    expect(response.status).toBe(403);
    expect(response.body.message).toContain("@professor.com");
  });
});

describe("POST /posts - validação de campos", () => {
  it("deve retornar 400 quando campos obrigatórios estiverem ausentes", async () => {
    const response = await request(app)
      .post("/posts")
      .set("Authorization", `Bearer ${professorToken}`)
      .send({ title: "Post sem campos obrigatórios", disciplineId });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain("Campo obrigatório não informado");
  });

  it("deve retornar 400 quando imageUrl for inválida", async () => {
    const response = await request(app)
      .post("/posts")
      .set("Authorization", `Bearer ${professorToken}`)
      .send({
        title: "Post com URL inválida",
        content: "Conteúdo do post com URL inválida",
        summary: "Resumo do post com URL inválida",
        disciplineId,
        statusId,
        imageUrl: "nao-e-uma-url",
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("imageUrl deve ser uma URL válida");
  });

  it("deve retornar 400 quando título for apenas espaços", async () => {
    const response = await request(app)
      .post("/posts")
      .set("Authorization", `Bearer ${professorToken}`)
      .send({
        title: "   ",
        content: "Conteúdo válido",
        summary: "Resumo válido",
        disciplineId,
        statusId,
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      "Campo obrigatório não informado: título",
    );
  });

  it("deve retornar 400 quando título for apenas HTML vazio", async () => {
    const response = await request(app)
      .post("/posts")
      .set("Authorization", `Bearer ${professorToken}`)
      .send({
        title: "<b></b>",
        content: "Conteúdo válido",
        summary: "Resumo válido",
        disciplineId,
        statusId,
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      "Campo obrigatório não informado: título",
    );
  });

  it("deve retornar 400 com mensagem correta quando ID tiver formato inválido", async () => {
    const response = await request(app)
      .post("/posts")
      .set("Authorization", `Bearer ${professorToken}`)
      .send({
        title: "Título válido",
        content: "Conteúdo válido",
        summary: "Resumo válido",
        semester: "1",
        disciplineId: "id-invalido",
        statusId,
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("ID inválido do MongoDB");
  });

  it("deve sanitizar tags HTML dos campos de texto", async () => {
    const response = await request(app)
      .post("/posts")
      .set("Authorization", `Bearer ${professorToken}`)
      .send({
        title: "<script>alert('xss')</script>Título Limpo",
        content: "<b>Conteúdo completo do post</b>",
        summary: "<i>Resumo completo do post</i>",
        semester: "1",
        disciplineId,
        statusId,
      });

    expect(response.status).toBe(201);
    expect(response.body.data.title).toBe("Título Limpo");
    expect(response.body.data.content).toBe("Conteúdo completo do post");
    expect(response.body.data.summary).toBe("Resumo completo do post");
  });
});

describe("POST /posts", () => {
  it.each([true, false, undefined])(
    "deve persistir o destaque na criação com isFeatured=%s",
    async (isFeatured) => {
      const response = await request(app)
        .post("/posts")
        .set("Authorization", `Bearer ${professorToken}`)
        .send({
          title: "Post com destaque",
          content: "Conteúdo completo do post",
          summary: "Resumo completo do post",
          disciplineId,
          statusId,
          semester: "1",
          ...(isFeatured === undefined ? {} : { isFeatured }),
        });

      expect(response.status).toBe(201);
      expect(response.body.data.isFeatured).toBe(isFeatured ?? false);
      const storedPost = await PostModel.findById(response.body.data._id);
      expect(storedPost?.isFeatured).toBe(isFeatured ?? false);
    },
  );

  it("deve criar post quando o autor possui email de professor", async () => {
    const response = await request(app)
      .post("/posts")
      .set("Authorization", `Bearer ${professorToken}`)
      .send({
        title: "Novo post",
        content: "Conteúdo do novo post",
        summary: "Resumo do novo post",
        disciplineId,
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
      .set("Authorization", `Bearer ${professorToken}`)
      .set("Content-Type", "application/json")
      .send();

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Body da requisição não informado");
  });
});

describe("PUT /posts/:id - autenticação", () => {
  it("deve retornar 401 quando token estiver ausente no PUT", async () => {
    const response = await request(app).put(`/posts/${postId}`).send({
      title: "Título",
      content: "Conteúdo",
      summary: "Resumo",
      semester: "1",
      disciplineId,
      statusId,
    });

    expect(response.status).toBe(401);
  });

  it("deve retornar 403 quando usuário não for professor no PUT", async () => {
    const response = await request(app)
      .put(`/posts/${postId}`)
      .set("Authorization", `Bearer ${studentToken}`)
      .send({
        title: "Título",
        content: "Conteúdo",
        summary: "Resumo",
        semester: "1",
        disciplineId,
        statusId,
      });

    expect(response.status).toBe(403);
    expect(response.body.message).toContain("@professor.com");
  });
});

describe("PUT /posts/:id - validação de campos", () => {
  it("deve retornar 400 quando o body vier vazio", async () => {
    const response = await request(app)
      .put(`/posts/${postId}`)
      .set("Authorization", `Bearer ${professorToken}`)
      .set("Content-Type", "application/json")
      .send();

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Body da requisição não informado");
  });

  it("deve retornar 400 quando imageUrl for inválida no PUT", async () => {
    const response = await request(app)
      .put(`/posts/${postId}`)
      .set("Authorization", `Bearer ${professorToken}`)
      .send({
        title: "Título válido",
        content: "Conteúdo válido do post",
        summary: "Resumo válido do post",
        semester: "1",
        disciplineId,
        statusId,
        imageUrl: "nao-e-uma-url",
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("imageUrl deve ser uma URL válida");
  });

  it("deve retornar 400 quando semester estiver ausente no PUT", async () => {
    const response = await request(app)
      .put(`/posts/${postId}`)
      .set("Authorization", `Bearer ${professorToken}`)
      .send({
        title: "Título válido",
        content: "Conteúdo válido do post",
        summary: "Resumo válido do post",
        disciplineId,
        statusId,
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      "Campo obrigatório não informado: semestre",
    );
  });

  it("deve sanitizar tags HTML nos campos de texto no PUT", async () => {
    const response = await request(app)
      .put(`/posts/${postId}`)
      .set("Authorization", `Bearer ${professorToken}`)
      .send({
        title: "<b>Título Atualizado via PUT</b>",
        content: "<p>Conteúdo atualizado via PUT com HTML</p>",
        summary: "<i>Resumo atualizado via PUT</i>",
        semester: "1",
        disciplineId,
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
    const response = await request(app)
      .put(`/posts/${postId}`)
      .set("Authorization", `Bearer ${professorToken}`)
      .send({
        title: "Post atualizado via PUT",
        content: "Conteúdo atualizado via PUT",
        summary: "Resumo atualizado via PUT",
        semester: "1",
        disciplineId,
        statusId,
      });

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual(
      expect.objectContaining({
        _id: postId,
        title: "Post atualizado via PUT",
      }),
    );
  });

  it("deve retornar 400 quando faltar campo obrigatório no PUT", async () => {
    const response = await request(app)
      .put(`/posts/${postId}`)
      .set("Authorization", `Bearer ${professorToken}`)
      .send({ title: "Título sem os outros campos" });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain("Campo obrigatório não informado");
  });

  it("deve retornar 404 para post inexistente", async () => {
    const response = await request(app)
      .put("/posts/000000000000000000000001")
      .set("Authorization", `Bearer ${professorToken}`)
      .send({
        title: "Título válido",
        content: "Conteúdo válido do post",
        summary: "Resumo válido do post",
        semester: "1",
        disciplineId,
        statusId,
      });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("message");
  });
});

describe("PATCH /posts/:id - autenticação", () => {
  it("deve retornar 401 quando token estiver ausente no PATCH", async () => {
    const response = await request(app)
      .patch(`/posts/${postId}`)
      .send({ title: "Título atualizado" });

    expect(response.status).toBe(401);
  });

  it("deve retornar 403 quando usuário não for professor no PATCH", async () => {
    const response = await request(app)
      .patch(`/posts/${postId}`)
      .set("Authorization", `Bearer ${studentToken}`)
      .send({ title: "Título atualizado" });

    expect(response.status).toBe(403);
    expect(response.body.message).toContain("@professor.com");
  });
});

describe("PATCH /posts/:id - validação de campos", () => {
  it("deve retornar 400 quando o body vier vazio", async () => {
    const response = await request(app)
      .patch(`/posts/${postId}`)
      .set("Authorization", `Bearer ${professorToken}`)
      .set("Content-Type", "application/json")
      .send();

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Body da requisição não informado");
  });

  it("deve retornar 400 quando imageUrl for inválida no PATCH", async () => {
    const response = await request(app)
      .patch(`/posts/${postId}`)
      .set("Authorization", `Bearer ${professorToken}`)
      .send({ imageUrl: "nao-e-uma-url" });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("imageUrl deve ser uma URL válida");
  });

  it("deve sanitizar tags HTML ao atualizar campos de texto", async () => {
    const response = await request(app)
      .patch(`/posts/${postId}`)
      .set("Authorization", `Bearer ${professorToken}`)
      .send({
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
    const response = await request(app)
      .patch(`/posts/${postId}`)
      .set("Authorization", `Bearer ${professorToken}`)
      .send({
        title: "Post atualizado",
        content: "Conteúdo atualizado",
        summary: "Resumo atualizado",
        semester: "1",
        disciplineId,
        statusId,
      });

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual(
      expect.objectContaining({ _id: postId, title: "Post atualizado" }),
    );
  });

  it("deve atualizar parcialmente um post existente", async () => {
    const response = await request(app)
      .patch(`/posts/${postId}`)
      .set("Authorization", `Bearer ${professorToken}`)
      .send({
        title: "Post atualizado via PATCH",
        summary: "Resumo atualizado via PATCH",
      });

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual(
      expect.objectContaining({
        _id: postId,
        title: "Post atualizado via PATCH",
      }),
    );
  });

  it("deve retornar 404 para post inexistente", async () => {
    const response = await request(app)
      .patch("/posts/000000000000000000000001")
      .set("Authorization", `Bearer ${professorToken}`)
      .send({ title: "Tentativa de patch" });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("message");
  });
});

describe("Imagem opcional dos posts", () => {
  it("deve criar um post sem imagem quando o formulário envia a URL vazia", async () => {
    const response = await request(app)
      .post("/posts")
      .set("Authorization", `Bearer ${professorToken}`)
      .send({
        title: "Post sem imagem",
        content: "Conteúdo do post sem imagem",
        summary: "Resumo do post sem imagem",
        semester: "1",
        disciplineId,
        statusId,
        imageUrl: "",
      });

    expect(response.status).toBe(201);
    const storedPost = await PostModel.findById(response.body.data._id);
    expect(storedPost?.imageUrl).toBe("");
  });

  it.each(["put", "patch"] as const)("deve remover a imagem persistida usando %s", async (method) => {
    await PostModel.findByIdAndUpdate(postId, { imageUrl: "https://exemplo.com/capa.jpg" });

    const response = await request(app)[method](`/posts/${postId}`)
      .set("Authorization", `Bearer ${professorToken}`)
      .send(method === "patch" ? { imageUrl: "" } : {
        title: "Post sem a capa anterior",
        content: "Conteúdo preservado durante a edição",
        summary: "Resumo preservado durante a edição",
        semester: "1",
        disciplineId,
        statusId,
        imageUrl: "",
      });

    expect(response.status).toBe(200);
    const readResponse = await request(app).get(`/posts/${postId}`);
    expect(readResponse.body.data.imageUrl).toBe("");
    expect(readResponse.body.data.author._id).toBe(professorId);
  });

  it("deve preservar a imagem quando uma edição parcial não envia imageUrl", async () => {
    await PostModel.findByIdAndUpdate(postId, { imageUrl: "https://exemplo.com/capa.jpg" });
    const response = await request(app)
      .patch(`/posts/${postId}`)
      .set("Authorization", `Bearer ${professorToken}`)
      .send({ title: "Apenas o título atualizado" });

    expect(response.status).toBe(200);
    const storedPost = await PostModel.findById(postId);
    expect(storedPost?.imageUrl).toBe("https://exemplo.com/capa.jpg");
  });
});

describe("DELETE /posts/:id - autenticação", () => {
  it("deve retornar 401 quando token estiver ausente no DELETE", async () => {
    const response = await request(app).delete(`/posts/${postId}`);

    expect(response.status).toBe(401);
  });

  it("deve retornar 403 quando usuário não for professor no DELETE", async () => {
    const response = await request(app)
      .delete(`/posts/${postId}`)
      .set("Authorization", `Bearer ${studentToken}`);

    expect(response.status).toBe(403);
    expect(response.body.message).toContain("@professor.com");
  });
});

describe("DELETE /posts/:id", () => {
  it("deve remover um post existente", async () => {
    const response = await request(app)
      .delete(`/posts/${postId}`)
      .set("Authorization", `Bearer ${professorToken}`);

    expect(response.status).toBe(204);

    const storedPost = await PostModel.findById(postId);
    expect(storedPost).toBeNull();
  });

  it("deve retornar 404 para post inexistente", async () => {
    const response = await request(app)
      .delete("/posts/000000000000000000000001")
      .set("Authorization", `Bearer ${professorToken}`);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("message");
  });
});

describe("GET /posts/search", () => {
  it("deve retornar posts encontrados pelo título", async () => {
    const response = await request(app)
      .get("/posts/search")
      .query({ q: "inicial" });

    console.log(response);

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
      .query({ q: "texto-que-nao-existe-A12345678" });

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual([]);
  });

  it("deve retornar lista vazia quando q não for informado", async () => {
    const response = await request(app).get("/posts/search");

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual([]);
  });
});

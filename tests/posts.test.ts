import request from "supertest";
import app from "../src/app";

/* jest.mock("../src/database", () => jest.fn().mockResolvedValue(true));
jest.mock("mongoose", () => ({
  connect: jest.fn().mockResolvedValue(true),
  connection: {
    readyState: 1,
  },
})); */

describe("GET /posts", () => {
  it('deve retornar "Lista de posts funcionando",', async () => {
    const response = await request(app).get("/posts");

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      data: expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(Number),
          title: expect.any(String),
          descript: expect.any(String),
        }),
      ]),
    });
  });
});

describe("GET /posts/:id", () => {
  it("deve retornar erro para id inválido", async () => {
    const response = await request(app).get("/posts/teste");

    expect(response.status).toBe(500);

    expect(response.body).toHaveProperty("message");
  });
});

/* describe("GET /", () => {
  it("deve retornar status 200", async () => {
    const response = await request(app).get("/");
    expect(response.status).toBe(200);
  });

  it("deve retornar a mensagem Hello World", async () => {
    const response = await request(app).get("/");
    expect(response.body.message).toBe("Hello World!");
  });
});

describe("GET /health", () => {
  it("deve retornar o status do banco de dados", async () => {
    const response = await request(app).get("/health");
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("banco_de_dados");
  });
}); */

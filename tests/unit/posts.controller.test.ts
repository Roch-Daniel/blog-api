//mock
import request from "supertest";
import app from "../../src/app";

import { getAllPosts, getPostById } from "../../src/services/posts.services";

jest.mock("../../src/services/posts.services", () => ({
  getAllPosts: jest.fn(),
  getPostById: jest.fn(),
}));

const mockedGetAllPosts = getAllPosts as jest.Mock;
const mockedGetPostById = getPostById as jest.Mock;

const mockPost = {
  _id: "6a0d15d3a97073ce0554f2b7",
  title: "Meu primeiro post",
  discipline: "Desenvolvimento Web",
  author: "Joao Blibau",
  grade: "8.5",
  semester: "2025.1",
  imageTitle: "Imagem do projeto",
  imageUrl: "https://exemplo.com/imagem.jpg",
  description: "Descrição do post aqui.",
  createdAt: "2026-05-20T02:00:51.375Z",
  updatedAt: "2026-05-20T02:00:51.375Z",
};

describe("GET /posts", () => {
  it("should return posts", async () => {
    mockedGetAllPosts.mockResolvedValue([mockPost]);

    const response = await request(app).get("/posts");

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      posts: expect.arrayContaining([
        expect.objectContaining({
          _id: expect.any(String),
          title: expect.any(String),
          discipline: expect.any(String),
          author: expect.any(String),
          grade: expect.any(String),
          semester: expect.any(String),
          imageTitle: expect.any(String),
          imageUrl: expect.any(String),
          description: expect.any(String),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        }),
      ]),
    });
  });
});

describe("GET /posts/:id", () => {
  it("should call error middleware", async () => {
    mockedGetPostById.mockRejectedValue(new Error("Erro interno teste"));

    const response = await request(app).get("/posts/6a0d15d3a97073ce0554f2b7");

    expect(response.status).toBe(400);

    expect(response.body).toEqual({
      status: 400,
      message: "Erro interno teste",
    });
  });
});

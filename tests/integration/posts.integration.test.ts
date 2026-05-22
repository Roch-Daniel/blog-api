import request from "supertest";
import app from "../../src/app";

describe("GET /posts", () => {
  it("return list posts", async () => {
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
  it("return erro invalid id", async () => {
    const response = await request(app).get("/posts/teste");

    expect(response.status === 400 || response.status === 500).toBe(true);

    expect(response.body).toHaveProperty("message");
  });
});

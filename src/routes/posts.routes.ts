import { Router } from "express";
import {
  listAllPosts,
  listPosts,
  patchPostById,
  removePost,
  showPost,
  storePost,
  updatePostById,
  searchPostsByTerm,
} from "../controllers/posts.controller";
import { requireProfessor } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  createPostSchema,
  updatePartialPostSchema,
} from "../schemas/posts.schema";

const postsRoutes = Router();

postsRoutes.get("/", listPosts);
postsRoutes.get("/search", searchPostsByTerm);
postsRoutes.get("/all", requireProfessor, listAllPosts);
postsRoutes.post("/", requireProfessor, validate(createPostSchema), storePost);
postsRoutes.get("/:id", showPost);
postsRoutes.put("/:id", requireProfessor, validate(createPostSchema), updatePostById);
postsRoutes.patch("/:id", requireProfessor, validate(updatePartialPostSchema), patchPostById);
postsRoutes.delete("/:id", requireProfessor, removePost);

export default postsRoutes;

import { Router } from "express";
import {
  listPosts,
  patchPostById,
  removePost,
  searchPostsByTerm,
  showPost,
  storePost,
  updatePostById,
} from "../controllers/posts.controller";
import { validate } from "../middlewares/validate.middleware";
import { createPostSchema, updatePartialPostSchema } from "../schemas/posts.schema";

const postsRoutes = Router();

postsRoutes.get("/", listPosts);
postsRoutes.get("/search", searchPostsByTerm);

postsRoutes.post("/", validate(createPostSchema), storePost);
postsRoutes.get("/:id", showPost);
postsRoutes.put("/:id", validate(createPostSchema), updatePostById);
postsRoutes.patch("/:id", validate(updatePartialPostSchema), patchPostById);
postsRoutes.delete("/:id", removePost);

export default postsRoutes;
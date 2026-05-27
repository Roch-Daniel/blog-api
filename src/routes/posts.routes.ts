import { Router } from "express";
import {
  createPostController,
  deletePostController,
  listPosts,
  showPost,
  updatePartialPostController,
  updatePostController,
} from "../controllers/posts.controller";
import {
  createPostSchema,
  updatePartialPostSchema,
} from "../schemas/posts.schema";
import { validate } from "../middlewares/validate.middleware";

const postsRoutes = Router();

postsRoutes.get("/", listPosts);
postsRoutes.get("/:id", showPost);
postsRoutes.post("/", validate(createPostSchema), createPostController);
postsRoutes.put("/:id", validate(createPostSchema), updatePostController);
postsRoutes.patch(
  "/:id",
  validate(updatePartialPostSchema),
  updatePartialPostController,
);
postsRoutes.delete("/:id", deletePostController);

export default postsRoutes;

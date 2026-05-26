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
} from "../schema/posts.schema";
import { validate } from "../middlewares/validate.middleware";

const postsRoutes = Router();

postsRoutes.get("/", listPosts);
postsRoutes.get("/:id", showPost);
postsRoutes.post("/", validate(createPostSchema), createPostController);
postsRoutes.delete("/:id", deletePostController);
postsRoutes.put("/:id", validate(createPostSchema), updatePostController);
postsRoutes.patch(
  "/:id",
  validate(updatePartialPostSchema),
  updatePartialPostController,
);

export default postsRoutes;

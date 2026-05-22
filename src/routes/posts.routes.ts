import { Router } from "express";
import {
  createPostController,
  deletePostController,
  listPosts,
  showPost,
  updatePartialPostController,
  updatePostController,
} from "../controllers/posts.controller";

const postsRoutes = Router();

postsRoutes.get("/", listPosts);
postsRoutes.get("/:id", showPost);
postsRoutes.post("/", createPostController);
postsRoutes.delete("/:id", deletePostController);
postsRoutes.put("/:id", updatePostController);
postsRoutes.patch("/:id", updatePartialPostController);

export default postsRoutes;

import { Router, Request, Response } from "express";
import { listPosts, showPost } from "../controllers/posts.controller";

const postsRoutes = Router();

postsRoutes.get("/", listPosts);
postsRoutes.get("/:id", showPost);

export default postsRoutes;

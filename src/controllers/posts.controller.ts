import { NextFunction, Request, Response } from "express";
import { getAllPosts, getPostById } from "../services/posts.services";

export const listPosts = (_req: Request, res: Response, next: NextFunction) => {
  try {
    const posts = getAllPosts();
    return res.status(200).json({
      data: [...posts],
    });
  } catch (error) {
    next(error);
  }
};

export const showPost = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (isNaN(Number(id))) {
      const error = new Error("ID inválido");
      return next(error);
    }

    const post = getPostById(Number(id));

    if (!post) {
      const error = new Error("Post não encontrado");
      return next(error);
    }

    return res.status(200).json({
      ...post,
    });
  } catch (error) {
    next(error);
  }
};

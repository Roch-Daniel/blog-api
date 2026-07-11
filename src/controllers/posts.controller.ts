import { NextFunction, Request, Response } from "express";
import {
  createPost,
  deletePost,
  getAllPosts,
  getAllPostsForProfessor,
  getPostById,
  searchPosts,
  updatePost,
} from "../services/posts.services";

const getRouteId = (idParam: string | string[]): string => {
  return Array.isArray(idParam) ? idParam[0] : idParam;
};

export const listPosts = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const posts = await getAllPosts();

    return res.status(200).json({
      data: posts,
    });
  } catch (error) {
    next(error);
  }
};

export const listAllPosts = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const posts = await getAllPostsForProfessor();

    return res.status(200).json({
      data: posts,
    });
  } catch (error) {
    next(error);
  }
};

export const showPost = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const post = await getPostById(getRouteId(req.params.id));

    return res.status(200).json({
      data: post,
    });
  } catch (error) {
    next(error);
  }
};

export const storePost = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const post = await createPost({ ...req.body, authorId: req.user!._id.toString() });

    return res.status(201).json({
      data: post,
    });
  } catch (error) {
    next(error);
  }
};

export const updatePostById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const post = await updatePost(getRouteId(req.params.id), { ...req.body, authorId: req.user!._id.toString() });

    return res.status(200).json({
      data: post,
    });
  } catch (error) {
    next(error);
  }
};

export const patchPostById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const post = await updatePost(getRouteId(req.params.id), { ...req.body, authorId: req.user!._id.toString() });

    return res.status(200).json({
      data: post,
    });
  } catch (error) {
    next(error);
  }
};

export const removePost = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await deletePost(getRouteId(req.params.id));

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const searchPostsByTerm = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const term = String(req.query.q ?? "").trim();

    const posts = await searchPosts(term);

    return res.status(200).json({
      data: posts,
    });
  } catch (error) {
    next(error);
  }
};

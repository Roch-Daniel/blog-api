import { NextFunction, Request, Response } from "express";
import {
  createPost,
  deletePost,
  getAllPosts,
  getPostById,
  updatePost,
  updatePostPartial,
} from "../services/posts.services";
import IPosts from "../interfaces/IPosts";
import mongoose from "mongoose";

type ReqPostParams = {
  id: string;
};

export const listPosts = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const posts = await getAllPosts();
    return res.status(200).json({
      posts,
    });
  } catch (error) {
    next(error);
  }
};

export const showPost = async (
  req: Request<ReqPostParams>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "ID inválido",
      });
    }

    const post = await getPostById(id);

    if (!post) {
      return res.status(404).json({
        message: "Post não encontrado",
      });
    }

    return res.status(200).json({
      post,
    });
  } catch (error) {
    next(error);
  }
};

export const createPostController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const postData: IPosts = req.body;
    const newPost = await createPost(postData);
    return res.status(201).json({
      post: newPost,
    });
  } catch (error) {
    next(error);
  }
};

export const deletePostController = async (
  req: Request<ReqPostParams>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "ID inválido",
      });
    }

    const deletePostResult = await deletePost(id);

    if (!deletePostResult) {
      return res.status(404).json({
        message: "Post não encontrado",
      });
    }

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const updatePostController = async (
  req: Request<ReqPostParams>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const postData: IPosts = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "ID inválido",
      });
    }

    const updatedPost = await updatePost(id, postData);

    if (!updatedPost) {
      return res.status(404).json({
        message: "Post não encontrado",
      });
    }

    return res.status(200).json({
      post: updatedPost,
    });
  } catch (error) {
    next(error);
  }
};

export const updatePartialPostController = async (
  req: Request<ReqPostParams>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "ID inválido",
      });
    }

    const post = await updatePostPartial(id, req.body);

    if (!post) {
      return res.status(404).json({
        message: "Post não encontrado",
      });
    }

    return res.status(200).json({
      post,
    });
  } catch (error) {
    next(error);
  }
};

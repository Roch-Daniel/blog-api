import IPosts from "../interfaces/IPosts";
import PostModel from "../models/posts.model";

export const getAllPosts = async () => {
  return await PostModel.find();
};

export const getPostById = async (id: string) => {
  return await PostModel.findById(id);
};

export const createPost = async (postData: IPosts) => {
  return await PostModel.create(postData);
};

export const deletePost = async (id: string) => {
  return await PostModel.findByIdAndDelete(id);
};

export const updatePost = async (id: string, postData: IPosts) => {
  // new: true - return the updated document
  return await PostModel.findByIdAndUpdate(id, postData, {
    returnDocument: "after",
    runValidators: true,
  });
};

export const updatePostPartial = async (
  id: string,
  postDataModific: IPosts,
) => {
  const post = await PostModel.findById(id);
  if (!post) {
    throw new Error("Post não encontrado");
  }
  return await PostModel.findByIdAndUpdate(
    id,
    { $set: postDataModific },
    { returnDocument: "after", runValidators: true },
  );
};

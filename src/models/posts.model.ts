import mongoose, { Schema, Document } from "mongoose";

export interface IPosts extends Document {
  title: string;
  content: string;
  author: string;
}

const PostSchema = new Schema<IPosts>({
  title: {
    type: String,
    required: true,
  },

  content: {
    type: String,
    required: true,
  },

  author: {
    type: String,
    required: true,
  },
});

const PostModel = mongoose.model<IPosts>("Post", PostSchema);

export default PostModel;

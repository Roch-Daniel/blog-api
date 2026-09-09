import mongoose, { Schema } from "mongoose";
import { IPost } from "../interfaces/IPosts";

const PostSchema = new Schema<IPost>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    summary: {
      type: String,
      required: true,
      trim: true,
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    series: {
      type: String,
      trim: true,
    },
    semester: {
      type: String,
      trim: true,
    },
    discipline: {
      type: Schema.Types.ObjectId,
      ref: "Discipline",
      required: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: Schema.Types.ObjectId,
      ref: "Status",
      required: true,
    },
  },
  {
    timestamps: {
      createdAt: "createDate",
      updatedAt: "updateDate",
    },
    versionKey: false,
  },
);

const PostModel = mongoose.model<IPost>("Post", PostSchema);

export default PostModel;

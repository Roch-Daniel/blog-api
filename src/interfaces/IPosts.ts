import { Document } from "mongoose";

export default interface IPosts extends Document {
  title: string;
  description: string;
  discipline: string;
  author: string;
  grade: string;
  semester: string;
  imageTitle: string;
  imageUrl: string;
  timestamps: true;
}

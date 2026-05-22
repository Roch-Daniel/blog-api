import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../src/config/database";

dotenv.config();

beforeAll(async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI não definida");
  }

  await connectDB(process.env.MONGODB_URI);
});

afterAll(async () => {
  await mongoose.connection.close();
});

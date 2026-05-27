import "./config/zod";
import dotenv from "dotenv";
import app from "./app";
import connectDB from "./config/database";

dotenv.config();

const PORT: number = Number(process.env.PORT) || 3000;
const MONGODB_URI = process.env.MONGODB_URI || "";

const start = async (): Promise<void> => {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI não definida no .env");
  }

  await connectDB(MONGODB_URI);

  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
};

start();

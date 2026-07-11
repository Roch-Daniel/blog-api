import "./config/zod";
import dotenv from "dotenv";
import app from "./app";
import { connectDB, disconnectDB } from "./config/database";
import { resetMemoryStore } from "./services/memory-data.service";

dotenv.config();

const PORT = Number(process.env.PORT) || 3000;
const MONGODB_URI = process.env.MONGODB_URI || "";
const USE_IN_MEMORY_DB = process.env.USE_IN_MEMORY_DB === "true";

let server: ReturnType<typeof app.listen> | null = null;
let isShuttingDown = false;

const start = async (): Promise<void> => {
  if (!USE_IN_MEMORY_DB && !MONGODB_URI) {
    throw new Error("MONGODB_URI nao definida no .env");
  }

  if (USE_IN_MEMORY_DB) {
    resetMemoryStore();
    console.log("API iniciada em modo local com dados em memoria.");
  } else {
    await connectDB(MONGODB_URI);
  }

  server = app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });

  process.on("SIGINT", () => {
    void shutdown("SIGINT");
  });

  process.on("SIGTERM", () => {
    void shutdown("SIGTERM");
  });
};

const shutdown = async (signal: string): Promise<void> => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`Recebido ${signal}. Encerrando aplicacao...`);

  try {
    if (!USE_IN_MEMORY_DB) {
      await disconnectDB();
      console.log("MongoDB desconectado.");
    }

    if (server) {
      server.close(() => {
        console.log("Servidor HTTP fechado.");
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  } catch (error) {
    console.error("Erro ao encerrar aplicacao:", error);
    process.exit(1);
  }
};

start().catch((error: Error) => {
  console.error(`Falha ao iniciar a aplicacao: ${error.message}`);
  process.exit(1);
});

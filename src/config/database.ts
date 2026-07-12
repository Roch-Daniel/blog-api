import mongoose from "mongoose";

export const connectDB = async (
  uri: string,
): Promise<typeof mongoose.connection> => {
  try {
    if (!uri) {
      throw new Error("A variavel MONGODB_URI nao foi informada.");
    }

    if (mongoose.connection.readyState === 1) {
      return mongoose.connection;
    }

    const conn = await mongoose.connect(uri);

    console.log(
      `MongoDB conectado: ${conn.connection.host}:${conn.connection.port}`,
    );

    return conn.connection;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Erro desconhecido ao conectar no MongoDB";

    throw new Error(`Falha na conexao com MongoDB: ${message}`);
  }
};

export const disconnectDB = async (): Promise<void> => {
  if (mongoose.connection.readyState === 0) {
    return;
  }

  await mongoose.disconnect();
};


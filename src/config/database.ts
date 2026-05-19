import mongoose from "mongoose";

const connectDB = async (uri: string): Promise<void> => {
  try {
    const conn = await mongoose.connect(uri);

    console.log(
      `MongoDB conectado: ${conn.connection.host}:${conn.connection.port}`,
    );
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Erro ao conectar no MongoDB: ${error.message}`);
    }

    process.exit(1);
  }
};

export default connectDB;

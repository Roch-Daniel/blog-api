import mongoose from "mongoose";
import { HealthPayload } from "../schemas/health.schema";

type HealthResponse = {
  httpStatus: 200 | 503;
  payload: HealthPayload;
};

export const getHealthStatus = (): HealthResponse => {
  const useInMemoryDb = process.env.USE_IN_MEMORY_DB === "true";
  const dbConnected = useInMemoryDb || mongoose.connection.readyState === 1;

  return {
    httpStatus: dbConnected ? 200 : 503,
    payload: {
      status: dbConnected ? "ok" : "degraded",
      service: "blog-api",
      database: useInMemoryDb
        ? "in-memory"
        : dbConnected
          ? "connected"
          : "disconnected",
      timestamp: new Date().toISOString(),
    },
  };
};

import { z } from "zod";

export const healthResponseSchema = z.object({
  status: z.enum(["ok", "degraded"]),
  service: z.literal("blog-api"),
  database: z.enum(["in-memory", "connected", "disconnected"]),
  timestamp: z.iso.datetime(),
});

export type HealthPayload = z.infer<typeof healthResponseSchema>;

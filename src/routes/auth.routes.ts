import { Router } from "express";
import rateLimit from "express-rate-limit";
import { loginController } from "../controllers/auth.controller";

const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  keyGenerator: (req) => (req.body?.email ? String(req.body.email).toLowerCase() : "sem-email"),
  skip: () => process.env.NODE_ENV === "test",
  message: { status: 429, message: "Muitas tentativas de login. Tente novamente em alguns minutos." },
});

const authRoutes = Router();

authRoutes.post("/login", loginRateLimiter, loginController);

export default authRoutes;

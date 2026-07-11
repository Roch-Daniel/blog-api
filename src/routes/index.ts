import { Router } from "express";
import swaggerUi from "swagger-ui-express";
import { openApiDocument } from "../docs/openapi";
import authRoutes from "./auth.routes";
import catalogRoutes from "./catalog.routes";
import healthRoutes from "./health.routes";
import postsRoutes from "./posts.routes";

const routes = Router();

routes.get("/", (_req, res) => {
  res.redirect("/docs");
});

routes.use("/health", healthRoutes);
routes.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(openApiDocument, {
    explorer: true,
  }),
);
routes.use("/auth", authRoutes);
routes.use("/posts", postsRoutes);
routes.use("/catalog", catalogRoutes);

export default routes;

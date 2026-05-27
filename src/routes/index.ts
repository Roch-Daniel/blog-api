import { Router } from "express";
import swaggerUi from "swagger-ui-express";
import { openApiDocument } from "../docs/openapi";
import postsRoutes from "./posts.routes";
const routes = Router();

routes.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(openApiDocument, {
    explorer: true,
  }),
);

routes.use("/posts", postsRoutes);

export default routes;

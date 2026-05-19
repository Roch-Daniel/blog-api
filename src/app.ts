import express, { Application } from "express";
import cors from "cors";
import errorMiddleware from "./middlewares/error.middleware";
import routes from "./routes";

const app: Application = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(routes);

app.use(errorMiddleware);

export default app;

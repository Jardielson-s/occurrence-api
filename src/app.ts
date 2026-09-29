import express from "express";
import cors from "cors";
import { startServerExpress } from "./modules/routes/routes";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
startServerExpress(app);

export default app;

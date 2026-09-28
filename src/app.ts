import express from "express";
import bodyParser from "body-parser";
import { startServerExpress } from "./modules/routes/routes";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
startServerExpress(app);

export default app;

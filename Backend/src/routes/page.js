// routes/auth.js
import express from "express";
import { verifyToken } from "../middlewares/Auth.js";
import { getUserPagesController } from "../controllers/page.js";

const PageRouter = express.Router();

PageRouter.get("/user-pages", verifyToken, getUserPagesController);

export default PageRouter;

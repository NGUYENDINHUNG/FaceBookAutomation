// routes/auth.js
import express from "express";
import {
  getAccount,
  loginFaceBook,
  logout,
  RefreshTokenUser,
} from "../controllers/auth.js";
import passport from "../config/passport.js";
import { verifyToken } from "../middlewares/Auth.js";

const AuthRouter = express.Router();


AuthRouter.get(
  "/facebook",
  (req, res, next) => {
    console.log("Facebook login URL:", req.url);
    next();
  },
  passport.authenticate("facebook", {
    scope: [
      "public_profile",
      "email",
      "pages_manage_posts",
      "pages_read_engagement",
      "pages_show_list",
    ],
  })
);
AuthRouter.get(
  "/facebook/callback",
  passport.authenticate("facebook", {
    session: false,
    failWithError: true,
  }),
  loginFaceBook
);
AuthRouter.get("/refresh-token", RefreshTokenUser);
AuthRouter.get("/me", verifyToken, getAccount);
AuthRouter.post("/logout", logout);

export default AuthRouter;

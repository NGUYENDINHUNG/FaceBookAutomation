// routes/post.js
import express from "express";
import { verifyToken } from "../middlewares/Auth.js";
import {
  createPost,
  deletePostController,
  getAllPosts,
  getPostById,
  publishToFacebook,
  updatePostController,
  schedulePost,
} from "../controllers/post.js";

const PostRouter = express.Router();

PostRouter.post("/create-post", verifyToken, createPost);
PostRouter.get("/get-all-posts", verifyToken, getAllPosts);
PostRouter.post("/schedule-post/:postId", verifyToken, schedulePost);
PostRouter.post("/publish-to-facebook/:postId", verifyToken, publishToFacebook);
PostRouter.put("/update-post/:postId", verifyToken, updatePostController);
PostRouter.delete("/delete-post/:postId", verifyToken, deletePostController);
PostRouter.get("/get-post-by-id/:postId", verifyToken, getPostById);

export default PostRouter;

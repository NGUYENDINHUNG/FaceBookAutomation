import express from "express";
import connection from "./src/config/database.js";
import configExpress from "./src/config/express.js";
import { environment } from "./src/config/environment.js";
import AuthRouter from "./src/routes/auth.js";
import PageRouter from "./src/routes/page.js";
import PostRouter from "./src/routes/post.js";
import { initScheduledPosts } from "./src/services/schedule.js";

const app = express();
const port = environment.PORT;

configExpress(app);

//User routes
app.use("api/auth", AuthRouter);
app.use("api/page", PageRouter);
app.use("api/post", PostRouter);

// Kết nối DB và start server
const startServer = async () => {
  try {
    await connection();
    app.listen(port, async () => {
      console.log(`Server is running on port ${port}`);
      await initScheduledPosts();
    });
  } catch (error) {
    console.log("Error connecting to DB:", error);
  }
};
startServer();

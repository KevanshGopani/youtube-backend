import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    //Ctrl + space and explore it
  })
);

app.use(
  express.json({
    limit: "16kb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "16kb",
  })
);

app.use(express.static("public"));
app.use(cookieParser());

//Routes
import userRouter from "./routes/user.routes.js";
import videoRoutes from "./routes/video.routes.js";
import commentRoutes from "./routes/comment.routes.js";
import playlistRoutes from "./routes/playlist.routes.js";
import tweetRoutes from "./routes/tweet.routes.js";
import likeRoutes from "./routes/like.routes.js";

//Routes declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/video", videoRoutes);
app.use("/api/v1/comment", commentRoutes);
app.use("/api/v1/playlist", playlistRoutes);
app.use("/api/v1/tweet", tweetRoutes);
app.use("/api/v1/like", likeRoutes);

export { app };

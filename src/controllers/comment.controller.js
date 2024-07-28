import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!videoId) {
    return new ApiError(404, "VideoId is required!");
  }

  const allComments = await Comment.find({ video: videoId });
  return res.status(200).json(new ApiResponse(200, allComments));
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video

  const { content } = req.body;
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(401, "VideoId is required");
  }

  if (!content) {
    throw new ApiError(401, "content is required");
  }

  const addComment = await Comment.create({
    content,
    video: videoId,
    owner: req?.user?._id,
  });

  if (!addComment) {
    return new ApiResponse(
      401,
      "something went wrong with creating comment in database"
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(201, addComment, "Comment stored successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
});

export { getVideoComments, addComment, updateComment, deleteComment };

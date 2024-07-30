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
  const skip = (page - 1) * limit;

  if (!videoId) {
    return new ApiError(404, "VideoId is required!");
  }

  const allComments = await Comment.find({ video: videoId })
    .skip(skip)
    .limit(limit);
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

  const addedComment = await Comment.create({
    content,
    video: videoId,
    owner: req?.user?._id,
  });

  if (!addedComment) {
    return new ApiResponse(
      401,
      "something went wrong with creating comment in database"
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(201, addedComment, "Comment stored successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;

  if (!commentId) {
    throw new ApiError(401, "Comment Id is required");
  }

  const updatedComment = await Comment.findByIdAndUpdate(
    commentId,
    { content: content },
    {
      new: true,
    }
  );
  if (!updatedComment) {
    throw new ApiError(500, "Something went wrong during updating comment");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(201, updatedComment, "Update is successfully completed")
    );
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  if (!commentId) {
    throw new ApiError(401, "comment id must required");
  }
  const deletedComment = await Comment.findByIdAndDelete(commentId, {
    new: true,
  });
  if (!deletedComment) {
    throw new ApiError(500, "Something went wrong during delete");
  }
  return res
    .status(200)
    .json(new ApiResponse(201, null, "Deleted Successfully"));
});

export { getVideoComments, addComment, updateComment, deleteComment };

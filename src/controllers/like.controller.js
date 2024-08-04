import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user._id;

  const existingLike = await Like.findOne({ video: videoId, likedBy: userId });

  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id);
  } else {
    await Like.create({
      likedBy: userId,
      video: videoId,
    });
  }
  return res.status(200).json(new ApiResponse(201, null, "success"));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user._id;
  //TODO: toggle like on comment

  const existingComment = await Like.findOne({ comment: commentId });

  if (existingComment) {
    await Like.findByIdAndDelete(existingComment._id);
  } else {
    await Like.create({
      likedBy: userId,
      comment: commentId,
    });
  }
  return res.status(200).json(new ApiResponse(201, null, "success"));
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const userId = req.user._id;

  //TODO: toggle like on tweet
  const existingComment = await Like.findOne({
    tweet: tweetId,
    likedBy: userId,
  });

  if (existingComment) {
    await Like.findByIdAndDelete(existingComment._id);
  } else {
    await Like.create({
      likedBy: userId,
      tweet: tweetId,
    });
  }
  return res.status(200).json(new ApiResponse(201, null, "success"));
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos

  const getAllLikedVideos = await Like.find({
    video: {
      $exists: 1,
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(201, getAllLikedVideos, "success"));
});

const getLikedComments = asyncHandler(async (req, res) => {
  //TODO: get all liked videos

  const getAllLikedComment = await Like.find({
    comment: {
      $exists: 1,
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(201, getAllLikedComment, "success"));
});

const getLikedTweets = asyncHandler(async (req, res) => {
  //TODO: get all liked videos

  const getAllLikedTweets = await Like.find({
    tweet: {
      $exists: 1,
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(201, getAllLikedTweets, "success"));
});

export {
  toggleCommentLike,
  toggleTweetLike,
  toggleVideoLike,
  getLikedVideos,
  getLikedComments,
  getLikedTweets,
};

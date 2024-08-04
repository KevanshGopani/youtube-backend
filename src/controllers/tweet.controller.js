import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createTweet = asyncHandler(async (req, res) => {
  //TODO: create tweet

  const { content } = req.body;
  if (!content.trim()) {
    throw new ApiError(404, "Content is required");
  }

  const createdTweet = await Tweet.create({
    content,
    owner: req.user._id,
  });

  return res
    .status(200)
    .json(new ApiResponse(201, createdTweet, "Tweet is created"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  // TODO: get user tweets
  const { userId } = req.param;
  if (userId) {
    return ApiError(404, "User is not found");
  }
  const getAllUserTweet = await Tweet.find({ owner: userId });

  return res
    .status(200)
    .json(
      new ApiResponse(201, getAllUserTweet, "User tweets fetch successfully")
    );
});

const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update tweet
  const { tweetId } = req.params;
  const { content } = req.body;

  const updatedTweet = await Tweet.findByIdAndUpdate(
    tweetId,
    { content },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(201, updatedTweet, "Tweet updated successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet

  const { tweetId } = req.params;

  if (!tweetId) {
    throw ApiError(404, "TweetId is required");
  }
  const deletedTweet = await Tweet.findByIdAndDelete(tweetId);
  return res
    .status(200)
    .json(new ApiResponse(201, deletedTweet, "Tweet deleted successfully"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };

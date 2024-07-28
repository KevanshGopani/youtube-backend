import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import asyncHandler from "../utils/asyncHandler.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  // TODO: get video, upload to cloudinary, create video
  if (![title, description].every((item) => item?.trim())) {
    return new ApiError(401, "Enter all required fields");
  }

  const videoFile = req?.files?.videoFile?.[0]?.path;
  const thumbnail = req?.files?.thumbnail?.[0]?.path;

  if (!videoFile && !thumbnail) {
    throw new ApiError(400, "videoFile and thumbnail files is required");
  }
  const [uploadedVideo, uploadedThumbnail] = await Promise.all([
    uploadOnCloudinary(videoFile),
    uploadOnCloudinary(thumbnail),
  ]);

  if (!uploadedThumbnail) {
    throw new ApiError(400, "Thumbnail file upload failed");
  }
  if (!uploadedVideo) {
    throw new ApiError(400, "Video file upload failed");
  }

  const createVideo = await Video.create({
    videoFile: uploadedVideo?.url,
    thumbnail: uploadedThumbnail?.url,
    title,
    description,
    duration: uploadedVideo?.duration,
    isPublished: true,
    owner: req?.user?._id,
  });

  if (!createVideo) {
    throw new ApiError(
      500,
      "Internal server error while creating video in database"
    );
  }
  return res.status(201).json(
    new ApiResponse(
      200,
      {
        title: createVideo.title,
        thumbnail: createVideo?.thumbnail,
        video: createVideo?.videoFile,
        createdAt: createVideo?.createdAt,
      },
      "video created successfully"
    )
  );
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};

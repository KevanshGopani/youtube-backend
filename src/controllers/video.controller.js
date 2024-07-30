import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import asyncHandler from "../utils/asyncHandler.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 2, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination
  const skip = (page - 1) * limit;
  const allVideos = await Video.find()
    .sort({ [sortBy]: sortType === "des" ? -1 : 1 })
    .skip(skip)
    .limit(limit);

  const totalVideos = await Video.countDocuments();
  return res
    .status(200)
    .json(
      new ApiResponse(
        201,
        { allVideos, totalVideos },
        "All videos are successfully fetched"
      )
    );
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
  if (!videoId) {
    throw new ApiError(404, "Video id not found");
  }

  const video = await Video.findById(videoId).populate("owner");
  if (!video) {
    throw new ApiError(401, "Video not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(201, video, "Here is you video details"));
});

const updateVideo = asyncHandler(async (req, res) => {
  let query = {};
  const { videoId } = req.params;
  const { views, title, description } = req.body;
  const thumbnailLocalPath = req?.file?.path;
  if (thumbnailLocalPath) {
    const updatedThumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    query.thumbnail = updatedThumbnail?.url;
  }

  if (views) {
    query.views = views;
  }

  if (title) {
    query.title = title;
  }

  if (description) {
    query.description = description;
  }

  const updateVideo = await Video.findByIdAndUpdate(videoId, query, {
    new: true,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, updateVideo, "Video updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const deletedVideo = await Video.findByIdAndDelete(videoId);
  return res
    .status(200)
    .json(new ApiResponse(200, deletedVideo, "Video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { isPublished } = req.body;
  const video = await Video.findByIdAndUpdate(
    videoId,
    {
      isPublished: isPublished,
    },
    { new: true }
  );
  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video status updated"));
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};

import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  if (![name, description].some((item) => item.trim())) {
    throw new ApiError(404, "All fields are required");
  }
  const createdPlaylist = await Playlist.create({
    name,
    description,
    owner: req?.user?._id,
  });

  if (!createdPlaylist) {
    throw new ApiError(404, "Something went wrong");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(201, createPlaylist, "Playlist created successfully")
    );

  //TODO: create playlist
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  //TODO: get user playlists

  if (!userId) {
    throw new ApiError(404, "User id not found");
  }

  const getAllPlaylistOfUser = await Playlist.find({ owner: userId });

  if (!getAllPlaylistOfUser) {
    return res
      .status(200)
      .json(new ApiResponse(201, getAllPlaylistOfUser, "Playlist not found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(201, getAllPlaylistOfUser, "success"));
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  if (!playlistId) {
    throw new ApiError(404, "playlistId not found");
  }
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }
  return res.status(200).json(new ApiResponse(201, playlist, "success"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  const addVideoIntoPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $push: {
        videos: videoId,
      },
    },
    { new: true }
  );
  return res
    .status(200)
    .json(new ApiResponse(201, addVideoIntoPlaylist, "Success"));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  // TODO: remove video from playlist
  if (!playlistId || !videoId) {
    throw new ApiError(400, "Playlist ID and Video ID are required");
  }

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $pull: { videos: videoId },
    },
    { new: true }
  );

  return res.status(200).json(new ApiResponse(201, updatedPlaylist, "Success"));
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // TODO: delete playlist

  if (!playlistId) {
    throw new ApiError(404, "playlist id not found");
  }
  const deletePlaylist = await Playlist.findByIdAndDelete(playlistId, {
    new: true,
  });

  return res.status(200).json(new ApiResponse(201, deletePlaylist, "Success"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  //TODO: update playlist

  if (!playlistId) {
    throw new ApiError(404, "playlistId not found");
  }
  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    { name, description },
    { new: true }
  );

  return res.status(200).json(new ApiResponse(201, updatedPlaylist, "Success"));
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};

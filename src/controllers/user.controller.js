import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const registerUser = asyncHandler(async (req, res) => {
  const { username, fullName, email, password } = req.body;

  // Validate required fields
  if (![username, fullName, email, password].every((field) => field?.trim())) {
    throw new ApiError(400, "All Fields are required!");
  }

  // Check if user already exists
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  // Validate avatar file presence
  const avatarLocalPath = req?.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req?.files?.coverImage?.[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  // Upload images to Cloudinary
  const [avatar, coverImage] = await Promise.all([
    uploadOnCloudinary(avatarLocalPath),
    uploadOnCloudinary(coverImageLocalPath),
  ]);

  if (!avatar) {
    throw new ApiError(400, "Avatar file upload failed");
  }

  // Create user
  const createdUser = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  if (!createdUser) {
    throw new ApiError(
      500,
      "Internal server error while creating user in database"
    );
  }

  // Send success response
  return res.status(201).json(
    new ApiResponse(
      200,
      {
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        username: username.toLowerCase(),
      },
      "User created successfully"
    )
  );
});

export { registerUser };

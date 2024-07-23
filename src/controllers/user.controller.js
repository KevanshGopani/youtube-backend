import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";

//combine method for token

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating referesh and access token"
    );
  }
};

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
  console.table(createdUser);
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

const loginUser = asyncHandler(async (req, res) => {
  // Received data from body
  // check user is exist or not
  //password check
  // access and refresh token generate
  //send cookies
  const { username, email, password } = req.body;

  if (!username && !email) {
    throw new ApiError(400, "username or password are required!");
  }

  const user = await User.findOne({ $or: [{ username }, { email }] });
  if (!user) {
    throw new ApiError(404, "User does not exist!");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(404, "Invalid credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user?._id
  );

  const loggedInUser = await User.findById(user?._id).select(
    "-password -refreshToken"
  );

  const options = {
    //it can visible in frontend and edited from server only
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in Successfully"
      )
    );
});

export const logoutUser = asyncHandler(async (req, res) => {
  User.findByIdAndUpdate(
    req.user?._id,
    { $set: { refreshToken: undefined } },
    { new: true }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, "Logout successfully"));
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;
  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  const decodedToken = jwt.verify(
    incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );
  const user = await User.findById(decodedToken?._id);
  if (!user) {
    throw new ApiError(401, "Invalid refresh token");
  }
  if (incomingRefreshToken != user?.refreshToken) {
    throw new ApiError(401, "Refresh token is expired or used");
  }

  const options = {
    httpOnly: true,
    secured: true,
  };

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user?._id
  );
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, { accessToken, refreshToken }));
});

export { registerUser, loginUser };

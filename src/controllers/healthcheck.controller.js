import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const healthCheck = asyncHandler(async (req, res) => {
  //TODO: build a healthCheck response that simply returns the OK status as json with a message

  const mongoState = mongoose.connection.readyState;

  try {
    if (mongoState === 1) {
      res.status(200).json({ status: "ok", message: "Database is connected" });
    } else {
      res
        .status(500)
        .json({ status: "error", message: "Database is not connected" });
    }
  } catch (error) {
    res
      .status(500)
      .json({
        status: "error",
        message: "An error occurred",
        error: error.message,
      });
  }
});

export { healthCheck };

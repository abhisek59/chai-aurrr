import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudnary.js";
import { ApiResponse } from "../utils/apiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  try{
    const { fullName, username, email, password } = req.body;
console.log("username",username)
    // Check if the request contains files
    // Validate required fields
    if ([fullName, username, email, password].some((field) => !field?.trim())) {
        throw new ApiError("All fields are required", 400);
    }

    // Check if user already exists
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (existedUser) {
        throw new ApiError("User with email or username already exists", 409);
    }

    // Handle file uploads
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImagePath = req.files?.coverImage?.[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError("Avatar file is required", 400);
    }

    // Upload to cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = coverImagePath ? await uploadOnCloudinary(coverImagePath) : null;

    if (!avatar) {
        throw new ApiError("Avatar file upload failed", 400);
    }

    // Create user
    const user = await User.create({
        fullName,
        username: username.toLowerCase(),
        email,
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || ""
    });

    const createdUser = await User.findById(user._id)
        .select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError("User creation failed", 500)
    }

    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered successfully")
    );}
    catch (error) {
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json(
                new ApiResponse(error.statusCode, null, error.message)
            );
        }
        return res.status(500).json(
            new ApiResponse(500, null, "Internal server error")
        );
    }
});

export { registerUser };
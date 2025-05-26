import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudnary.js";
import { ApiResponse } from "../utils/apiResponse.js";

const generateAccessTokenAndRefreshToken = async(userId)=>{
    try{
     const user =   await User.findById(userId)
     const accessToken = user.generateAccessToken();
     const refreshToken = user.generateRefreshTocken();
     user.refreshToken = refreshToken
      await user.save({validateBeforeSave: false});
      return {
        accessToken,
        refreshToken
      };

    }catch (error) {
        throw new ApiError("something went wrong while generating tokens", 500);
}
}

const registerUser = asyncHandler(async (req, res) => {
  try{
    const { fullname, username, email, password } = req.body;
console.log("username",username)
    // Check if the request contains files
    // Validate required fields
    if ([fullname, username, email, password].some((field) => !field?.trim())) {
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
    // const avatar = await uploadOnCloudinary(avatarLocalPath);
    // const coverImage = coverImagePath ? await uploadOnCloudinary(coverImagePath) : null;

    // if (!avatar) {
    //     throw new ApiError("Avatar file upload failed", 400);
    // }

    // Create user
    const user = await User.create({
        fullname,
        username: username.toLowerCase(),
        email,
        password,
        avatar: avatarLocalPath,
        coverImage: coverImagePath || "",
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
        console.log("Error",error)
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

const loginUser = asyncHandler(async(res,res)=>{
//get username ansd password 
//find the user
//password check
//access and refresh token
//send token throuhj secured cookie
//send response

const {email,username,password}=req.body;

if(!email|| ! username){
    throw new ApiError("Email and username are required", 400);
}
  const user =await User.findOne({$or:[{email},{username}]})
  if(!user){
    throw new ApiError("User not found", 404);
  }
    const isPasswordValid=await user.isPasswordCorrect(password)
     if(!isPasswordValid){
    throw new ApiError("Password is incorrect", 404);
  }

  const {accessToken,refreshToken} = await generateAccessTokenAndRefreshToken(user._id)

   const loggedInUser = User.findById(user._id).select ("-password -refreshToken");
   
   const options ={
    httpOnly : true,
    secure : true
   }
   return res
   .status(200)
   .cookie("accessToken", accessToken, options)
   .cookie("refreshToken", refreshToken, options)
   .json(
    new ApiResponse(200, {user :loggedInUser, accessToken, refreshToken}, "User logged in successfully"     
   )
)


})
export { registerUser,loginUser };
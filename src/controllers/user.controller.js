import { asyncHandler } from "../utils/asyncHandler.js";
import apiError from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudnary.js";
import { ApiResponse } from "../utils/apiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
   //get user data from front end
   //validation  like if username is empty or not and passwoord is 
   //check if user already exists check from username and email
   //check for images and avatars
   //upload them to cloudnary
   //create user object- create entry in db
   //remove password and refresh token from response
   //check for user creation
   //return response

   const {fullName,username,email,password}=req.body
   console.log("email",email);
   if ([
        fullName,
        username,
        email,
        password
    ].some((item) =>item?.trim()==="")) {
       throw new apiError("Please fill all the fields", 400);   
    }
    const existedUser=User.findOne({$or:[{username},{email}]})
    .then((user) => {
        if (existedUser) {
            throw new apiError("User already exists", 400);
        }


    })
  const avatarLocalPath =  req.files?.avatar[0]?.path;
  constcoverLocationPath = req.files?.coverImafe[0]?.path;
  if(!avatarLocalPath || !coverLocationPath){
    throw new apiError("Please upload images", 400);
  }
  const avatar= await uploadOnCloudinary(avatarLocalPath)
   const cover = await uploadOnCloudinary(coverLocationPath)
   if(!avatar || !cover){
    throw new apiError("Image upload failed", 400);
   }
   const user = await User.create({
    fullName,
    username:username.toLowerCase(),
    email,
    password,
    avatar: avatar.url,
    coverImage:cover.urlImage?.url ||"",
   })
   const createdUser = await User.findById(user._id).select("-password -refreshToken")

   if (!createdUser) {
    throw new apiError("User creation failed", 500);
   }

   return res.status(201).json(
    new ApiResponse(201, createdUser,"User created successfully")
   );
});


export { registerUser };



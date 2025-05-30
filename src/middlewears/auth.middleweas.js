import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";


export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token = req.cookies?.access_token || req.header("Authorization")?.replace("Bearer ", "") 
  
    if(!token) {
      throw ApiError("You are not authenticated!", 401);
    }
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  
    await UserActivation.findById(decodedToken?._id).select("-password -refreshToken")
  
    if(!user){
      throw new ApiError("invalid access token", 401);
    }
    req.user=user;
    next();
  } catch (error) {
    next(ApiError(error.message || "Authentication failed", error.status || 401));
    
  }
}

)
import { asyncHandler } from "../utils/asyncHandler";
import { apiError } from "../utils/apiError";


export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token = req.cookies?.access_token || req.header("Authorization")?.replace("Bearer ", "") 
  
    if(!token) {
      throw apiError("You are not authenticated!", 401);
    }
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  
    await UserActivation.findById(decodedToken?._id).select("-password -refreshToken")
  
    if(!user){
      throw new apiError("invalid access token", 401);
    }
    req.user=user;
    next();
  } catch (error) {
    next(apiError(error.message || "Authentication failed", error.status || 401));
    
  }
}

)
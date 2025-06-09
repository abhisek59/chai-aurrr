import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";
import { Tweet } from "../models/tweet.models.js";

const createTweet = asyncHandler(async (req, res) => {
    const {content}=req.params
    const {videoId}=req.params
    if(!content){
        throw new ApiError(200,"content is required")
    }
    const tweetData = {
        content,
        owner: req.user._id };
    if(videoId){
        const video = await Video.findById(videoId)
        if (!video) {
            throw new ApiError(404, "Video not found");
    }
tweetData.video = videoId;}
const tweet = await Tweet.create(tweetData)
 .populate("owner", "username avatar fullname")
        .populate("video", "title thumbnail");
         if (!createdTweet) {
        throw new ApiError(500, "Something went wrong while creating tweet");
    }

    return res.status(201).json(
        new ApiResponse(201, createdTweet, "Tweet created successfully")
    );


   
})
const getUserTweet = asyncHandler(async(req,res)=>{

   const {userId}= req.params;
   if(!userId){
    throw new ApiError(400,"user id is not found")
   }
   const user = await User.findById(userId)
   if(!user){
    throw new ApiError(400,"User not found")
   }
   const tweets = await Tweet.find({owner:userId})
   .populate({
    path:"omwner",
    select:"title thumbnail"
   }).sort("-createdAt")
   if(!tweets ||tweets.length === 0)
    res.status(200)
.json({
    sucess:true,
    data:[],
    message:"No tweets found"
})
else 
res 
.status(200)
.json({
    ststus:true,
    data:tweets
})


})
const updateTweet = asyncHandler(async (req, res) => {
    const {content}=req.body;
    const{tweetId}=req.params;
    if(!content||tweetId){
        throw new ApiError("200","content and tweetId is necessary")
    }
   const tweet = await Tweet.findByIdAndUpdate(tweetId,{
    $set:
    {
    content
}
   },{new:true}.populate("owner","username"))

   
   if(!tweet){
    throw new ApiError(400,"tweet not found")
   }
     if (tweet.owner._id.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized to update this tweet");
    }
    return 
    res.status(200),
    json({
        sucess:true,
        message:"tweet update sucesfully",
        data:tweet
    })


})
const deleteTweet =asyncHandler(async(req,res)=>{
     const{tweetId}=req.params;
     if(!tweetId){
        throw new ApiError(200,"tweet id is necessary to delete tweet")
     }
     const tweet = await Tweet.findById(tweetId)
     if(!tweet){
        throw new ApiError(200,"tweet not found")
     }
      if (tweet.owner._id.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized to update this tweet");
    }
    await Tweet.findByIdAndDelete(tweetId)
    res 
    .status(200)
    .json({
        sucess:true,
        message:"Tweet deleted sucesfully"

    })

})
export {getUserTweet,updateTweet,deleteTweet,createTweet}
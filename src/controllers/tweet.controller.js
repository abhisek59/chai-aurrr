import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";
import { Tweet } from "../models/tweet.models.js";
import {ApiResponse} from "../utils/apiResponse.js"

const createTweet = asyncHandler(async (req, res) => {
    const {content}=req.body
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
const populateTweet = await Tweet.findById(tweet._id)
 .populate("owner", "username avatar fullname")
        .populate("video", "title thumbnail");
         if (!populateTweet) {
        throw new ApiError(500, "Something went wrong while creating tweet");
    }

    return res.status(201).json(
        new ApiResponse(201,tweet, "Tweet created successfully")
    );


   
})
const getUserTweet = asyncHandler(async(req, res) => {
    const {userId} = req.params;
    
    if(!userId){
        throw new ApiError(400, "User ID is required")
    }
    
    const user = await User.findById(userId)
    console.log(user)
    if(!user){
        throw new ApiError(404, "User not found")
        
    }
    
    const tweets = await Tweet.find({owner: userId})
        .populate({
            path: "owner",
            select: "username avatar fullname"
        })
        .populate({
            path: "video",
            select: "title thumbnail"
        })
        .sort("-createdAt")

    return res.status(200).json(
        new ApiResponse(
            200,
            tweets,
            tweets.length ? "Tweets fetched successfully" : "No tweets found"
        )
    )
})
const updateTweet = asyncHandler(async (req, res) => {
    const {content} = req.body;
    const {tweetId} = req.params;

    // Validate input
    if (!content || !tweetId) {
        throw new ApiError(400, "Content and tweetId are required")
    }

    // First find the tweet to check ownership
    const tweet = await Tweet.findById(tweetId)
        .populate("owner", "username");

    if (!tweet) {
        throw new ApiError(404, "Tweet not found")
    }

    // Check ownership
    if (tweet.owner._id.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized to update this tweet");
    }

    // Update the tweet
    const updatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set: { content }
        },
        {
            new: true
        }
    ).populate("owner", "username");

    // Return response using ApiResponse
    return res.status(200).json(
        new ApiResponse(
            200,
            updatedTweet,
            "Tweet updated successfully"
        )
    );
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
export {
    getUserTweet,
    updateTweet,
    deleteTweet,
    createTweet
}
import { Like } from "../models/like.models.js"
import { Video } from "../models/video.model.js"
import { ApiError } from "../utils/apiError.js"
import { Comment } from "../models/comment.models.js"
import { Tweet } from "../models/tweet.models.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params;

    // First validate video ID
    if(!videoId){
        throw new ApiError(400, "Video id is required");
    }

    // Check if video exists
    const video = await Video.findById(videoId);
    if(!video){
        throw new ApiError(404, "Video not found");
    }

    // Check if already liked
    const existingLike = await Like.findOne({
        video: videoId,
        likedBy: req.user._id
    });

    if (existingLike) {
        // Unlike the video
        await Like.findByIdAndDelete(existingLike._id);
        return res.status(200).json({
            success: true,
            message: "Video unliked successfully"
        });
    }

    // Like the video
    await Like.create({
        video: videoId,
        likedBy: req.user._id
    });

    return res.status(200).json({
        success: true,
        message: "Video liked successfully"
    });
});

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    
    if(!commentId){
        throw new ApiError(400, "Comment id is required")
    }
    const comment = await Comment.findById(commentId)
    if(!comment){
        throw new ApiError(404, "Comment not found")
    }

    const existingLiked = await Like.findOne({
        comment: commentId,
        likedBy: req.user._id
    })

    if (existingLiked) {
        await Like.findByIdAndDelete(existingLiked._id)
        return res.status(200).json({
            success: true,
            message: "Comment unliked successfully"
        })
    }

    await Like.create({
        comment: commentId,
        likedBy: req.user._id
    })

    return res.status(200).json({
        success: true,
        message: "Comment liked successfully"
    })
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId, videoId} = req.params
    
    if(!tweetId || !videoId){
        throw new ApiError(400, "Both tweet ID and video ID are required")
    }

    // First check if tweet exists and belongs to the video
    const tweet = await Tweet.findOne({
        _id: tweetId,
        video: videoId
    })

    if(!tweet){
        throw new ApiError(404, "Tweet not found or does not belong to this video")
    }

    // Check if video exists
    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(404, "Video not found")
    }

    const existingLiked = await Like.findOne({
        tweet: tweetId,
        likedBy: req.user._id
    })

    if (existingLiked) {
        await Like.findByIdAndDelete(existingLiked._id)
        return res.status(200).json({
            success: true,
            message: "Tweet unliked successfully"
        })
    }

    await Like.create({
        tweet: tweetId,
        likedBy: req.user._id,
        video: videoId
    })

    return res.status(200).json({
        success: true,
        message: "Tweet liked successfully"
    })
})

const getLikedVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, sort = "createdAt" } = req.query
    
    // Validate query parameters
    const pageNumber = Math.max(1, parseInt(page))
    const limitNumber = Math.min(20, Math.max(1, parseInt(limit)))
    
    const likedVideos = await Like.find({
        likedBy: req.user._id,
        video: { $exists: true } // Only get video likes
    })
    .populate({
        path: "video",
        select: "title description videoFile thumbnail views duration"
    })
    .sort({ [sort]: -1 })
    .limit(limitNumber)
    .skip((pageNumber - 1) * limitNumber)

    const totalLikes = await Like.countDocuments({ 
        likedBy: req.user._id,
        video: { $exists: true }
    })

    if (!likedVideos?.length) {
        return res.status(200).json({
            success: true,
            data: [],
            metadata: {
                totalLikes: 0,
                totalPages: 0,
                currentPage: pageNumber,
                perPage: limitNumber
            }
        })
    }

    return res.status(200).json({
        success: true,
        data: likedVideos,
        metadata: {
            totalLikes,
            totalPages: Math.ceil(totalLikes / limitNumber),
            currentPage: pageNumber,
            perPage: limitNumber
        }
    })
})

export {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getLikedVideos
}
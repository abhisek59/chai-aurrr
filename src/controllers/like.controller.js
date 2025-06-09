import { Like } from "../models/like.models"
import { Video } from "../models/video.model"
import { ApiError } from "../utils/apiError"
import { Comment } from "../models/comment.models"
import { Tweet } from "../models/tweet.models"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    
    if(!videoId){
        throw new ApiError(400, "Video id is required")
    }

    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(404, "Video not found")
    }

    const existingLiked = await Like.findOne({
        video: videoId,
        likedBy: req.user._id
    })

    if (existingLiked) {
        await Like.findByIdAndDelete(existingLiked._id)
        return res.status(200).json({
            success: true,
            message: "Video unliked successfully"
        })
    }

    await Like.create({
        video: videoId,
        likedBy: req.user._id
    })

    return res.status(200).json({
        success: true,
        message: "Video liked successfully"
    })
})

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
    const {tweetId} = req.params
    
    if(!tweetId){
        throw new ApiError(400, "Tweet id is required")
    }

    const tweet = await Tweet.findById(tweetId)
    if(!tweet){
        throw new ApiError(404, "Tweet not found")
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
        likedBy: req.user._id
    })

    return res.status(200).json({
        success: true,
        message: "Tweet liked successfully"
    })
})

const getLikedVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query

    const likedVideos = await Like.find({
        likedBy: req.user._id
    })
    .populate({
        path: "video",
        select: "title description videoFile thumbnail views duration"
    })
    .limit(limit * 1)
    .skip((page - 1) * limit)

    const totalLikes = await Like.countDocuments({ likedBy: req.user._id })

    return res.status(200).json({
        success: true,
        data: likedVideos,
        metadata: {
            totalLikes,
            totalPages: Math.ceil(totalLikes / limit),
            currentPage: parseInt(page),
            perPage: parseInt(limit)
        }
    })
})

export {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getLikedVideos
}
import { Comment } from "../models/comment.models";
import { User } from "../models/user.model";
import { Video } from "../models/video.model";
import { ApiError } from "../utils/apiError";
import { asyncHandler } from "../utils/asyncHandler";

const getAllComment = asyncHandler (async(req,res)=>{
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query
    if(!videoId){
        throw new ApiError(400,"videoId is required")
    }
    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError (400,"video is required")
    }
     const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;
     const comments = await Comment.find({video: videoId })
     .populate("owner", "username avatar fullname")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber);
        const totalComments = await Comment.countDocuments({ video: videoId });

    return res.status(200).json({
        success: true,
        data: {
            comments,
            pagination: {
                currentPage: pageNumber,
                totalPages: Math.ceil(totalComments / limitNumber),
                totalComments
            }
        }
    });
});
const addComment = asyncHandler(async(req,res)=>{
   const {content}=req.body
   const {videoId}=req.psrsms
   if(!content || !videoId){
    throw new ApiError(200,"content and video id is required")
   }
   const video = await Video.findById(videoId)
   if(!videoId){
    throw new ApiError(200,"video id is requied")
   }
   const comment = await Comment.create(
   { content,
    video:videoId,
    owner:req.user._id}
   )
  const createdComment = await Comment.findById(comment._id)
        .populate("owner", "username avatar fullname")
        .populate("video", "title thumbnail");
         if (!createdComment) {
        throw new ApiError(500, "Error while creating comment");
    }
    return res.status(201).json({
        success: true,
        data: createdComment,
        message: "Comment added successfully"
    });

  
})
const updateComment = asyncHandler(async(req,res)=>{
    const {commentId}=req.params
    const {content}=req.body;
     if(!content||commentId){
        throw new ApiError("200","content and tweetId is necessary")
    }
    const comment = await Comment.findById(commentId)
      
    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }
    const updatedcomment = await Comment.findByIdAndUpdate(comment,{
        $set:{
            content
        }
    },{new:true}.populate("video","title"))
    if(!updatedcomment){
        throw new ApiError(200,"video is not found")
    }
    res.status(200)
    .json({
        sucess:true,
        message:"comment updated sucesfully"
    })
})
const deletedComment = asyncHandler(async(req,res)=>{
    const {commentId}=req.params
     if(commentId){
        throw new ApiError("200","commentId is necessary")
    }
     const comment = await Comment.findById(commentId)
      
    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }
    await  Comment.findByIdAndDelete(commentId)
    return res 
    .status (200)
    .json({
        sucess:true,
        message:"Comment deleted sucesfully"
    })

})
export {getAllComment,addComment,updateComment,deletedComment}
import { Video } from "../models/video.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose, { Aggregate } from "mongoose";
import  {ApiError} from "../utils/apiError.js";
import { uploadOnCloudinary } from "../utils/cloudnary.js";
import { User } from "../models/user.model.js";

const uploadVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    
    if (!title || !description) {
        throw new ApiError(400, "Title and description are required");
    }

    const videoLocalPath = req.files?.videoFile?.[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

    if (!videoLocalPath) {
        throw new ApiError(400, "Video file is required");
    }

    if (!thumbnailLocalPath) {
        throw new ApiError(400, "Thumbnail is required");
    }

    const videoFile = await uploadOnCloudinary(videoLocalPath);
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if (!videoFile || !thumbnail) {
        throw new ApiError(500, "Error uploading files to cloudinary");
    }

    const video = await Video.create({
        videoFile: videoFile.url,
        thumbnail: thumbnail.url,
        title,
        description,
        duration: videoFile.duration,
        owner: req.user._id
    });
   

   return res.status(201).json({
        message: "Video uploaded successfully",
        data: {
            video
        }
    });
});
const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const videos = await Video.aggregate([   
        {
            $match: {
                _id: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup: {
                from: "User", // Changed from "User" to "users" (collection name is lowercase)
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails"
            }
        },
        {
            $addFields: {
                ownerDetails: { $arrayElemAt: ["$ownerDetails", 0] }
            }
        },
        {
            $project: {
                title: 1,
                description: 1,
                videoFile: 1,
                thumbnail: 1,
                duration: 1,
                views: 1,
                createdAt: 1,
                ownerDetails: {
                    username: "$ownerDetails.username",
                    avatar: "$ownerDetails.avatar"
                }
            }
        }
    ]);

    if (!videos?.length) {
        throw new ApiError(404, "Video not found");
    }
    return res.status(200).json({
        message: "Video fetched successfully",
        data: {
            video: videos[0]
        }
    });
})

  
   


const updateVideo =asyncHandler(async(req,res)=>{
       const { videoId } = req.params;
    const localPath = req.files?.videoFile?.[0]?.path;
    if(!localPath){
        throw new ApiError(400, "Video file is required");
    }
    const videoFile = await uploadOnCloudinary(localPath);
    if(!videoFile){
        throw new ApiError(500, "Error uploading video to cloudinary");
    }
    const video = await Video.findByIdAndUpdate(
     videoId,
        {
            $set: {
                videoFile: videoFile.url,
                title: req.body.title,
                description: req.body.description,
            }
        },
        {new: true})
    if (!video) {
        throw new ApiError(404, "Video not found");
    }
    return res.status(200).json({
        message: "Video updated successfully",
        data: {
            video
        }
    });

})
const updateThumbnail = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    const localPath = req.files?.thumbnail?.[0]?.path;
    if (!localPath) {
        throw new ApiError(400, "Thumbnail is required");
    }

    const thumbnailFile = await uploadOnCloudinary(localPath);
    if (!thumbnailFile) {
        throw new ApiError(500, "Error uploading thumbnail to Cloudinary");
    }

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId, 
        {
            $set: {
                thumbnail: thumbnailFile.url,
            },
        },
        { new: true }
    );

    if (!updatedVideo) {
        throw new ApiError(404, "Video not found");
    }

    return res.status(200).json({
        message: "Thumbnail updated successfully",
        data: updatedVideo,
    });
});

export { uploadVideo, getVideoById,updateVideo, updateThumbnail}

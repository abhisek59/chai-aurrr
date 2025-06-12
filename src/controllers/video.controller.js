import { Video } from "../models/video.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose, { Aggregate } from "mongoose";
import  {ApiError} from "../utils/apiError.js";
import { uploadOnCloudinary } from "../utils/cloudnary.js";
import { User } from "../models/user.model.js";

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

    // Convert page and limit to numbers
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    // Calculate skip value for pagination
    const skip = (pageNumber - 1) * limitNumber;

    // Prepare filter object
    const filter = {
        isPublished: true
    };

    // Add search query if provided
    if (query) {
        filter.$or = [
            { title: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } }
        ];
    }

    // Add userId filter if provided
    if (userId) {
        filter.owner = new mongoose.Types.ObjectId(userId);
    }

    // Prepare sort object
    const sortObject = {};
    if (sortBy && sortType) {
        sortObject[sortBy] = sortType.toLowerCase() === 'desc' ? -1 : 1;
    } else {
        // Default sort by createdAt DESC
        sortObject.createdAt = -1;
    }

    const pipeline = [
        {
            $match: filter
        },
        {
            $lookup: {
                from: "users",
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
                videoFile: 1,
                thumbnail: 1,
                title: 1,
                description: 1,
                duration: 1,
                views: 1,
                createdAt: 1,
                owner: {
                    _id: "$ownerDetails._id",
                    username: "$ownerDetails.username",
                    fullName: "$ownerDetails.fullName",
                    avatar: "$ownerDetails.avatar"
                }
            }
        },
        {
            $sort: sortObject
        },
        {
            $skip: skip
        },
        {
            $limit: limitNumber
        }
    ];

    // Get total count for pagination
    const totalVideos = await Video.countDocuments(filter);

    // Execute aggregation pipeline
    const videos = await Video.aggregate(pipeline);

    return res.status(200).json({
        success: true,
        data: {
            videos,
            pagination: {
                currentPage: pageNumber,
                totalPages: Math.ceil(totalVideos / limitNumber),
                totalVideos,
                perPage: limitNumber
            }
        }
    });
});
const uploadVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    
    if (!title || !description) {
        throw new ApiError(404, "Title and description are required");
    }

    const videoLocalPath = req.files?.videoFile?.[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

    if (!videoLocalPath) {
        throw new ApiError(401, "Video file is required");
    }

    if (!thumbnailLocalPath) {
        throw new ApiError(402, "Thumbnail is required");
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
const updateVideo = asyncHandler(async(req, res) => {
    const {videoId} = req.params;
    const {title, description} = req.body;
    
    // Check if video exists first
    const existingVideo = await Video.findById(videoId);
    if (!existingVideo) {
        throw new ApiError(404, "Video not found");
    }

    // Initialize update object
    const updateFields = {};
    
    // Handle optional fields
    if (title) updateFields.title = title;
    if (description) updateFields.description = description;
    
    // Handle video file if uploaded
    if (req.file) {
        const videoFile = await uploadOnCloudinary(req.file.path);
        if (!videoFile) {
            
            throw new ApiError(500, "Error uploading video to cloudinary");
        }
        updateFields.videoFile = videoFile.url;
    }

    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: updateFields
        },
        {new: true}
    );

    return res.status(200).json({
        success: true,
        message: "Video updated successfully",
        data: video
    });
});
const updateThumbnail = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    // Check if video exists
    const existingVideo = await Video.findById(videoId);
    if (!existingVideo) {
        throw new ApiError(404, "Video not found");
    }

    // Check if file exists in request
    if (!req.file) {
        throw new ApiError(400, "Thumbnail file is required");
    }

    const thumbnailFile = await uploadOnCloudinary(req.file.path);
    if (!thumbnailFile) {
        throw new ApiError(500, "Error uploading thumbnail to Cloudinary");
    }

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId, 
        {
            $set: {
                thumbnail: thumbnailFile.url
            }
        },
        { new: true }
    );

    return res.status(200).json({
        success: true,
        message: "Thumbnail updated successfully",
        data: updatedVideo
    });
});
const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized to delete this video");
    }

    await Video.findByIdAndDelete(videoId);

    return res.status(200).json({
        success: true,
        message: "Video deleted successfully"
    });
});
const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }
     if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized to modify this video");
    }
    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                isPublished: !video.isPublished
            }
        },
        { new: true }
    );

    return res.status(200).json({
        success: true,
        message: `Video ${updatedVideo.isPublished ? 'published' : 'unpublished'} successfully`,
    });
});
export {
    getAllVideos,
     uploadVideo,
     getVideoById,
     updateVideo,
      updateThumbnail,
      deleteVideo,
      togglePublishStatus
    }

import { Playlist } from "../models/playlist.models"
import { User } from "../models/user.model"
import { Video } from "../models/video.model"
import { ApiError } from "../utils/apiError"
import { asyncHandler } from "../utils/asyncHandler"

const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    if(!name||!description){
        throw new ApiError(200,"Name and some discription is required")
    }
    const playlist = await Playlist.create({
       name,
        description

    })
    if(!playlist){
        throw new ApiError(200,"Failed to create playlist")
    }
    res.status(200)
    .json({
        sucess:true,
        message:"playlist created sucesfully",playlist
    })
})

const getUserPlaylist = asyncHandler(async(req,res)=>{
    const {userId}=req.params;
    if(!userId){
        throw new ApiError(404,"Please provide user id")
    }
    const user = await User.findById(userId)
    if(!user){
        throw new ApiError(200,"User is not found")
    }
    const userPlaylist = await Playlist.find({
        owner: userId
    }).populate("owner","username","createdAt")
    .select("name description createdAt")

    if(!userPlaylist){
        throw new ApiError(200,"User playlist is not found")
    }
     
    return res.status(200).json({
        success: true,
        playlists: userPlaylist
    })
})
const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    if (!mongoose.isValidObjectId(playlistId)) {
           throw new ApiError(400, "Invalid playlist ID");
       }
       const playlist = await Playlist.findById(playlistId)
       .populate("owner", "username email")
        .select("name description createdAt videos");

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    return res.status(200).json({
        success: true,
         playlist
   
})
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
     if (!mongoose.isValidObjectId(playlistId)|| !mongoose.isValidObjectId(videoId)) {
           throw new ApiError(400, "Invalid playlist ID");
       }
      const playlist = await Playlist.findById(playlistId)
      if(!playlist){
        throw new ApiError (200,"invalid playlist")
      }
      if(playlistId.owner !== req.user?._id){
        throw new ApiError(403,"You dont have permisssion to add video")
      }
      const video = await Video.findById(videoId)
      if(!video){
        throw new ApiError(403,"Video is required to addd in the playlist") }
            if (playlist.videos.includes(videoId)) {
        return res.status(200).json({
            success: false,
            message: "Video already exists in playlist"
        });
    }
         const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $addToSet: { videos: videoId }
        },
        {
            new: true
        }
    ).populate("videos", "title description duration");

    return res.status(200).json({
        success: true,
        message: "Video added to playlist successfully",
        playlist: updatedPlaylist
    });
});
const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    // Validate IDs
    if (!mongoose.isValidObjectId(playlistId) || !mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid playlist or video ID");
    }

    // Find playlist
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    // Check ownership
    if (playlist.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "Unauthorized access");
    }

    // Verify video exists
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // Check if video is in playlist
    if (!playlist.videos.includes(videoId)) {
        throw new ApiError(400, "Video not found in playlist");
    }

    // Remove video from playlist using $pull operator
    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull: { videos: videoId }
        },
        {
            new: true
        }
    ).populate("videos", "title description duration");

    return res.status(200).json({
        success: true,
        message: "Video removed from playlist successfully",
        playlist: updatedPlaylist
    });
});
const deletePlaylist = asyncHandler(async(req,res)=>{
    const {playlistId}=req.params;
   if (!mongoose.isValidObjectId(playlistId)) {
           throw new ApiError(400, "Invalid playlist ID");
       }
       const playlist = await Playlist.findById(playlistId)
       if(!playlist){
        throw new ApiError(404,"Playlist is not found")
       }
       if(playlistId.owner.toString() !== req.user?._id.toString()){
        throw new ApiError("Unathorized access",404)
       }
       await Playlist.findByIdAndDelete(playlistId)
       return res
       .status(200)
       .json({
        success:true,
        message:"playlist deleted sucesfully"
       })
       
})
const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    if (!mongoose.isValidObjectId(playlistId)) {
           throw new ApiError(400, "Invalid playlist ID");
       }
       if(!name||! description){
        throw new ApiError("Provide valid name and discription is required")
       }
        const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    if (playlist.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "Unauthorized access")
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set: {
                name: name || playlist.name,
                description: description || playlist.description
            }
        },
        {
            new: true
        }
    )

    return res.status(200).json({
        success: true,
        message: "Playlist updated successfully",
        playlist: updatedPlaylist
    })
})
export {
    createPlaylist,
    getUserPlaylist,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
    



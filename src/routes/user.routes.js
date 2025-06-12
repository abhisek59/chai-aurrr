import { Router } from "express";
import { loginUser, logoutUser, registerUser,accessRefreshToken, changeCurrentPassword, getCurrentUser, updateUserAvatar, updateUserCoverImage, getUserChannelProfile, getWatchHistory, updateAccountDetails } from "../controllers/user.controller.js";
import {upload} from "../middlewears/multer.middlewear.js";
import { verifyJWT } from "../middlewears/auth.middleweas.js";
import { User } from "../models/user.model.js";``
import { deleteVideo, getAllVideos, getVideoById, togglePublishStatus, updateThumbnail, updateVideo, uploadVideo } from "../controllers/video.controller.js";
const router = Router();


router.route("/register").post( 
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1,
        }
    ]),
    registerUser

)

router.route("/login").post(loginUser)

//securefd routes
router.route("/logOut").post(verifyJWT, logoutUser)
router.route("/refresh-token").post(accessRefreshToken)
router.route("/changePassword").post(verifyJWT, changeCurrentPassword)
router.route("/currentUser").get(verifyJWT, getCurrentUser)
router.route("/updateUserAvatar").patch(verifyJWT,upload.single("avatar"),updateUserAvatar)
router.route("/updateUserCoverImage").patch(verifyJWT,upload.single("coverImage"),updateUserCoverImage)
router.route("/updateUserDetails").post(verifyJWT,updateAccountDetails)
router.route("/updateUserWatchHistory").get(verifyJWT,getWatchHistory)


router.route("/uploadvideo").post(
    verifyJWT,
    upload.fields([
        { name: "videoFile", maxCount: 1 },
        { name: "thumbnail", maxCount: 1 }
    ]),
    uploadVideo
);

// Get video by ID
router.route("/videos/:videoId").get(verifyJWT, getVideoById);

// Update video info and optionally video file
router.route("/videos/:videoId/update").patch(
    verifyJWT,
    upload.single("videoFile"),
    updateVideo
);

// Update thumbnail
router.route("/videos/:videoId/thumbnail").patch(
    verifyJWT,
    upload.single("thumbnail"),
    updateThumbnail
);

// Toggle publish status
router.route("/videos/:videoId/publish").patch(
    verifyJWT,
    togglePublishStatus
);

// Delete video
router.route("/videos/:videoId/publish").delete(verifyJWT, deleteVideo);
router.route("/videos").get(getAllVideos)

export {router}











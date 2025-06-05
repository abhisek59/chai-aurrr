import { Router } from "express";
import { loginUser, logoutUser, registerUser,accessRefreshToken, changeCurrentPassword, getCurrentUser, updateUserAvatar, updateUserCoverImage, getUserChannelProfile, getWatchHistory, updateAccountDetails } from "../controllers/user.controller.js";
import {upload} from "../middlewears/multer.middlewear.js";
import { verifyJWT } from "../middlewears/auth.middleweas.js";
import { User } from "../models/user.model.js";
import { getVideoById, updateVideo, uploadVideo } from "../controllers/video.controller.js";
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
        {
            name: "videoFile",
            maxCount: 1
        },
        {
            name: "thumbnail",
            maxCount: 1
        }
    ]),
   uploadVideo
);
// router.route("/videos/:videoId").get(verifyJWT, getVideoById)
router.route ("videos/:videoId").patch(verifyJWT,upload.single("video"),updateVideo)
// router.route("/videos/:videoId")
//     .get(verifyJWT, getVideoById)  
//     .delete(verifyJWT, deleteVideo);  
export {router}











import { Router } from "express";
import { verifyJWT } from "../middlewears/auth.middleweas.js";
import { 
    getLikedVideos, 
    toggleCommentLike, 
    toggleTweetLike, 
    toggleVideoLike 
} from "../controllers/like.controller.js";

const likeRouter = Router();

// Video like routes
likeRouter.route("/toggleVideoLike/:videoId").post(verifyJWT,toggleVideoLike)

// Tweet like routes
likeRouter.route("/videos/:videoId/tweets/:tweetId/like")
    .post(verifyJWT, toggleTweetLike);

// Comment like routes
likeRouter.route("/comments/:commentId/like")
    .post(verifyJWT, toggleCommentLike);

// Get liked videos
likeRouter.route("/videos/liked")
    .get(verifyJWT, getLikedVideos);


export { likeRouter }
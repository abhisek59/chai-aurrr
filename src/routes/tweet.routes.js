import { Router } from "express";
import { verifyJWT } from "../middlewears/auth.middleweas.js";
import { createTweet, deleteTweet, getUserTweet, updateTweet } from "../controllers/tweet.controller.js";
import { upload } from "../middlewears/multer.middlewear.js";

const tweetRouter = Router()
tweetRouter.route("/createTweet/:videoId").post(verifyJWT,createTweet)
tweetRouter.route("/getUserTweet/:userId").get(getUserTweet)
tweetRouter.route("/updateTweet/:tweetId").patch(verifyJWT,
    upload.single("content"),updateTweet
)
tweetRouter.route("/deleteTweet/:tweetId").delete(verifyJWT,deleteTweet)
export{tweetRouter}
import { Router } from "express";
import { verifyJWT } from "../middlewears/auth.middleweas.js";
import { addComment, deletedComment, getAllComment, updateComment } from "../controllers/comment.controller.js";

const commentRouter = Router()
  
commentRouter.route("/videos/:videoId/addComment").post(verifyJWT,addComment)
commentRouter.route("/videos/:commentId/updateComment").patch(verifyJWT,updateComment)
commentRouter.route("/comment/:commentId/deletecomments").delete(verifyJWT, deletedComment);
commentRouter.route("/getAllComments/:videoId").get(verifyJWT,getAllComment)
export {commentRouter}

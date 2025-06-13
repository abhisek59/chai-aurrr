// import { Router } from "express";
// import { verifyJWT } from "../middlewears/auth.middleweas.js";
// import { 
//     createPlaylist, 
//     getUserPlaylist, 
//     getPlaylistById,
//     addVideoToPlaylist,
//     removeVideoFromPlaylist,
//     deletePlaylist,
//     updatePlaylist
// } from "../controllers/playlist.controller.js";

// const playlistRouter = Router();

// // Create a new playlist
// playlistRouter.route("/create").post(verifyJWT, createPlaylist);

// // // Get user's playlists
// // playlistRouter.route("/user/:userId").get(verifyJWT, getUserPlaylist);

// // // Get, update and delete playlist by ID
// // playlistRouter
// //     .route("/:playlistId")
// //     .get(verifyJWT, getPlaylistById)
// //     .patch(verifyJWT, updatePlaylist)
// //     .delete(verifyJWT, deletePlaylist);

// // // Add and remove videos from playlist
// // playlistRouter
// //     .route("/:playlistId/videos/:videoId")
// //     .post(verifyJWT, addVideoToPlaylist)
// //     .delete(verifyJWT, removeVideoFromPlaylist);

// export { playlistRouter };

import { Router } from "express";
import { verifyJWT } from "../middlewears/auth.middleweas.js";
import { addVideoToPlaylist, createPlaylist, deletePlaylist, getPlaylistById, getUserPlaylist, removeVideoFromPlaylist, updatePlaylist } from "../controllers/playlist.controller.js";
const playlistRouter = Router()

//create playlist
playlistRouter.route("/createPlaylist").post(verifyJWT, createPlaylist);
playlistRouter.route("/getUserPlaylist/:userId").get(verifyJWT,getUserPlaylist)
playlistRouter.route("/getPlaylistById/:playlistId").get(verifyJWT,getPlaylistById)
playlistRouter.route("/:playlistId/videos/:videoId").post(verifyJWT,addVideoToPlaylist)
playlistRouter.route("/:playlistId/videos/:videoId").delete(verifyJWT,removeVideoFromPlaylist)
playlistRouter.route("/:playlistId/delete").delete(verifyJWT,deletePlaylist)
playlistRouter.route("/:playlistId/updatePlaylist").patch(verifyJWT,updatePlaylist)
export {playlistRouter}

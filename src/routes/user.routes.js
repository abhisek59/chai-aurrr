import { Router } from "express";
import { loginUser, logoutUser, registerUser,accessRefreshToken } from "../controllers/user.controller.js";
import {upload} from "../middlewears/multer.middlewear.js";
import { verifyJWT } from "../middlewears/auth.middleweas.js";
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


export {router}











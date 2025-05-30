import { Router } from "express";
import { loginUser, logoutUser, registerUser } from "../controllers/user.controller.js";
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


export {router}











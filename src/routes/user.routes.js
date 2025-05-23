import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import {upload}
    from "../middlewears/multer.middlewear.js";
const router = Router();

router.route("/register").post( 
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"Coverimg",
            maxCount:1,
        }
    ]),
    registerUser

)




export {router}











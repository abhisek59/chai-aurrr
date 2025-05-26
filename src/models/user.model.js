import mongoose, {Schema}from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true  ,
        index:true     
    },
      email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true , 
    },
      fullname:{
        type:String,
        required:true,
        trim:true  ,
        index:true,  
    }, 
     avatar:{
        type:String,//Cloudinary url
        required:true,  
    },
    coverimage:{
        type:String,//Cloudinary url
    },
    watchhistory:[
        {
            type:Schema.Types.ObjectId,
            ref:"Video",
        }
    ],
    password:{
        type:String,
        required:[true,"Password is required"], 
    },
    refreshToken:{
        type:String,
    },},
    {
        timestamps:true
    });

    userSchema.pre("save",async function(next){
        if(!this.isModified("password"))
            return next();
        else{
            this.password = await bcrypt.hash(this.password,10);
        }
        this.password=bcrypt.hash(this.password,10)
        next(); 
    });

    userSchema.methods.isPasswordCorrect = async function (password){
        bcrypt.compare(password, this.password)
        .then((result) => {
            return result;
        })
        .catch((error) => {
            return false;
        });
    }
    userSchema.methods.generateAccessToken =function(){
        return  jwt.sign({
            _id:this._id,
            username:this.userName,
            email:this.email,
            fullname:this.fullname,
        },
    process.env.ACCESS_TOKEN_SECRET,{
        expiresIn:REFRESH_TOKEN_EXPIRES_IN
    })
    }
      userSchema.methods.generateRefreshTocken =function(){
        return  jwt.sign({
            _id:this._id,
        },
    process.env.ACCESS_REFRESH_SECRET,{
        expiresIn:REFRESH_REFRESH_EXPIRES_IN
    })
    }
    
export const User = mongoose.model("User", userSchema);

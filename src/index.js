import connectDB from "./db";
import dotenv from "dotenv";

dotenv.config({
    path:'./env'
});

connectDB();


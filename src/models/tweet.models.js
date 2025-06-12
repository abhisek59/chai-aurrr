import mongoose,{Schema} from "mongoose";

const tweetSchema = new Schema({
    content: {
        type: String,
        required: true,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
     video: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video"
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Like",
    }],
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
    }],
}, { timestamps: true });


export const Tweet = mongoose.model("Tweet", tweetSchema);
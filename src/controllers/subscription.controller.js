import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { ApiError } from "../utils/apiError.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    if(!channelId){
        throw new ApiError(400, "ChannelId is required")
    }

    const isValidChannel = await User.findById(channelId)
    if(!isValidChannel) {
        throw new ApiError(404, "Channel not found")
    }

    // Check if user is trying to subscribe to their own channel
    if(channelId.toString() === req.user._id.toString()) {
        throw new ApiError(400, "You cannot subscribe to your own channel")
    }

    const existingSubscription = await Subscription.findOne({
        subscriber: req.user._id,
        channel: channelId
    })

    let subscription
    if(existingSubscription) {
        // Unsubscribe
        await Subscription.findByIdAndDelete(existingSubscription._id)
        subscription = null
    } else {
        // Subscribe
        subscription = await Subscription.create({
            subscriber: req.user._id,
            channel: channelId
        })
    }

    return res.status(200).json({
        success: true,
        message: subscription ? "Subscribed successfully" : "Unsubscribed successfully",
        subscription
    })
})

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    if(!channelId) {
        throw new ApiError(400, "ChannelId is required")
    }

    const subscribers = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriber",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullName: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$subscriber"
        }
    ])

    return res.status(200).json({
        success: true,
        data: subscribers
    })
})

const getSubscribedChannels = asyncHandler(async (req, res) => {
    const {subscriberId} = req.params
    if(!subscriberId) {
        throw new ApiError(400, "SubscriberId is required")
    }

    const subscribedChannels = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "channel",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullName: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$channel"
        }
    ])

    return res.status(200).json({
        success: true,
        data: subscribedChannels
    })
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}
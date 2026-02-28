import mongoose from "mongoose";

const accountSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.ObjectId,
        ref:"user",
        required:[true, "Account must be associated with a user"],
        index: true

    },
    status: {
        type: String,
        enum: {
            values: ["ACTIVE" , "FROZEN" , "CLOSED"],
            message: "Status can be either ACTIVE, FROZEN or CLOSED",
        },

        default: "ACTIVE"
    },
    currency:{
        type: String,
        required: true,
        default: "INR"
    }
},{
    timestamps: true
})


const accountModel = mongoose.model("account" , accountSchema)

export default accountModel
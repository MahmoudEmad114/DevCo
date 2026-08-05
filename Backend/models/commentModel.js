const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        text: {
            type: String,
            required: true,
            trim: true,
            minlength: [1, "Comment cannot be empty"],
            maxlength: [2000, "Comment cannot exceed 2000 characters"],
        },
        targetType: {
            type: String,
            required: true,
            enum: ["Task", "Issue"],
        },
        targetId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: "targetType",
        },
    },
    {
        timestamps: true,
    },
);

const Comment = mongoose.model("Comment", commentSchema);
module.exports = Comment;

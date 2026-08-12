const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
    {
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
            required: [true, "Message must belong to a project."],
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Message must have a sender."],
        },
        text: {
            type: String,
            required: [true, "Message text cannot be empty."],
            trim: true,
            minlength: [1, "Message cannot be empty."],
            maxlength: [5000, "Message cannot exceed 5000 characters."],
        },
        isRead: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    },
);

messageSchema.index({
    project: 1,
    createdAt: 1
});

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;

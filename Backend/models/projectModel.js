const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
    {
        workspace: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Workspace",
            required: [true, "Project must belong to a workspace"],
        },

        name: {
            type: String,
            required: [true, "Project name is required"],
            trim: true,
            minlength: [3, "Project name must be at least 3 characters"],
            maxlength: [100, "Project name cannot exceed 100 characters"],
        },

        description: {
            type: String,
            trim: true,
            maxlength: [1000, "Description cannot exceed 1000 characters"],
            default: "",
        },

        status: {
            type: String,
            enum: [
                "planning",
                "active",
                "on_hold",
                "completed",
                "archived",
            ],
            default: "planning",
        },

        startDate: {
            type: Date,
            required: [true, "Start date is required"],
        },

        deadline: {
            type: Date,
            required: [true, "Deadline is required"],
            validate: {
                validator: function (value) {
                    return value > this.startDate;
                },
                message: "Deadline must be after start date",
            },
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Project must have a creator"],
        },
    },
    {
        timestamps: true,
    }
);

projectSchema.index({ workspace: 1, name: 1 }, { unique: true });

const Project = mongoose.model("Project", projectSchema);

module.exports = Project;
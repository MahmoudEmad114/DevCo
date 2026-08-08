const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

// get user
exports.getUser = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new AppError("User not found", 404));
    }

    res.status(200).json({
        status: "success",
        data: {
            user,
        },
    });
});

// get current logged in user
exports.getMe = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    if (!user) {
        return next(new AppError("User not found", 404));
    }

    res.status(200).json({
        status: "success",
        data: {
            user,
        },
    });
});

// get all users
exports.getAllUsers = catchAsync(async (req, res, next) => {
    const users = await User.find();

    res.status(200).json({
        status: "success",
        results: users.length,
        data: {
            users,
        },
    });
});

// search users
exports.searchUsers = catchAsync(async (req, res, next) => {
    const keyword = req.query.keyword;

    if (!keyword) {
        return next(new AppError("Please provide a search keyword", 400));
    }

    const users = await User.find({
        $or: [
            { name: { $regex: keyword, $options: "i" } },
            { email: { $regex: keyword, $options: "i" } },
        ],
    });

    res.status(200).json({
        status: "success",
        results: users.length,
        data: {
            users,
        },
    });
});

// update current user
exports.updateMe = catchAsync(async (req, res, next) => {
    const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        {
            name: req.body.name,
            bio: req.body.bio,
            skills: req.body.skills,
            ...(req.file && { photo: req.file.filename }),
        },
        {
            new: true,
            runValidators: true,
        }
    );

    if (!updatedUser) {
        return next(new AppError("User not found", 404));
    }

    res.status(200).json({
        status: "success",
        data: {
            user: updatedUser,
        },
    });
});

// delete current user (soft delete)
exports.deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, {
        isActive: false,
    });

    res.status(204).json({
        status: "success",
        data: null,
    });
});

// upload photo
exports.uploadPhoto = catchAsync(async (req, res, next) => {
    if (!req.file) {
        return next(new AppError("Please upload an image", 400));
    }

    const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        {
            photo: req.file.filename,
        },
        {
            new: true,
            runValidators: true,
        }
    );

    res.status(200).json({
        status: "success",
        data: {
            user: updatedUser,
        },
    });
});
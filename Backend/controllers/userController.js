const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

// Filter allowed fields for update
const filterObj = (obj, ...allowedFields) => {
    const newObj = {};

    Object.keys(obj).forEach((el) => {
        if (allowedFields.includes(el)) {
            newObj[el] = obj[el];
        }
    });

    return newObj;
};

// Get user by ID
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

// Get current logged-in user
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

// Get all users
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

// Search users
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

// Update current user
exports.updateMe = catchAsync(async (req, res, next) => {
    if (req.body.password || req.body.passwordConfirm) {
        return next(
            new AppError(
                "This route is not for password updates. Please use /updateMyPassword",
                400
            )
        );
    }

    const filteredBody = filterObj(
        req.body,
        "name",
        "email",
        "bio",
        "skills"
    );

    if (req.file) {
        filteredBody.photo = req.file.filename;
    }

    const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        filteredBody,
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

// Delete current user (soft delete)
exports.deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, {
        isActive: false,
    });

    res.status(204).json({
        status: "success",
        data: null,
    });
});

// Upload photo
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
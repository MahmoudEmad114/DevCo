const multer = require('multer');
const AppError = require('./../utils/appError');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');

const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => { // cb => callback
        cb(null, 'public/img/users')
    },
    filename: (req, file, cb) => {
        // user-767676abc76dba-33232376764.jpeg
        const ext = file.mimetype.split('/')[1];
        cb(null, `user-${req.user.id}-${Date.now()}.${ext}`)
    }
})

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true)
    } else {
        cb(new AppError('Not an image! Please upload only images', 400), false)
    }
}

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
})

exports.uploadUserPhoto = upload.single('photo');

const filterObj = (obj, ...allowedFields) => {
    const newObj = {}
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
}

exports.getAllUsers = catchAsync(async (req, res, next) => {
    const users = await User.find()

    res.status(200).json({
        status: 'success',
        results: users.length,
        data: {
            users
        }
    })
});

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

exports.getMe = catchAsync(async (req, res, next) => {

    const user = await User.findById(req.user.id);

    res.status(200).json({
        status: 'success',
        data: {
            user
        }
    });

});

exports.updateMe = catchAsync(async (req, res, next) => {
    console.log(req.file);
    console.log(req.body);
    if (req.body.password || req.body.passwordConfirm) {
        return next(new AppError('This route is not for password updates. Please use /updateMyPassword', 400))
    }

    const filteredBody = filterObj(req.body,
        'name',
        'email',
        'bio',
        'skills',
    );

    if (req.file) filteredBody.photo = req.file.filename;

    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, { new: true, runValidators: true });

    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser
        }
    })
})

exports.deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { isActive: false })

    res.status(204).json({
        status: 'success',
        data: null
    })
})

exports.searchUsers = catchAsync(async (req, res, next) => {
    const { query } = req.query;

    if (!query || query.trim().length < 2) {
        return next(
            new AppError(
                'Search query must be at least 2 characters',
                400
            )
        );
    }

    const searchRegex = new RegExp(query.trim(), 'i');

    const users = await User.find({
        _id: { $ne: req.user._id },
        isActive: true,
        $or: [
            { name: searchRegex },
            { email: searchRegex }
        ]
    })
        .select('name email photo bio skills')
        .limit(10);

    res.status(200).json({
        status: 'success',
        results: users.length,
        data: {
            users
        }
    });
});

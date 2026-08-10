const Notification = require('../models/notificationModel');
const createNotification = require('../utils/notification');

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getMyNotifications = catchAsync(async (req, res, next) => {

    const filter = {
        recipient: req.user._id
    };

    if (req.query.isRead !== undefined) {
        filter.isRead = req.query.isRead === 'true';
    }

    const notifications = await Notification.find(filter)
        .sort('-createdAt')
        .populate('sender', 'name');

    res.status(200).json({
        status: 'success',
        results: notifications.length,
        data: {
            notifications
        }
    });

});

exports.markAsRead = catchAsync(async (req, res, next) => {

    const notification = await Notification.findOne({
        _id: req.params.id,
        recipient: req.user._id
    });

    if (!notification) {
        return next(
            new AppError(
                'No notification found with that id',
                404
            )
        );
    }

    notification.isRead = true;

    await notification.save();

    res.status(200).json({
        status: 'success',
        data: {
            notification
        }
    });

});

exports.markAllAsRead = catchAsync(async (req, res, next) => {

    await Notification.updateMany(
        {
            recipient: req.user._id,
            isRead: false
        },
        {
            isRead: true
        }
    );

    res.status(200).json({
        status: 'success',
        message: 'All notifications marked as read'
    });

});

exports.deleteNotification = catchAsync(async (req, res, next) => {

    const notification = await Notification.findOneAndDelete({
        _id: req.params.id,
        recipient: req.user._id
    });

    if (!notification) {
        return next(
            new AppError(
                'No notification found with that id',
                404
            )
        );
    }

    res.status(204).json({
        status: 'success',
        data: null
    });

});



exports.createNotification = catchAsync(async (req, res, next) => {

    const { recipient, sender, type, message, relatedItem, relatedItemType } = req.body;

    const notification = await Notification.create({
        recipient,
        sender: sender || req.user._id,
        type,
        message,
        relatedItem,
        relatedItemType
    });

    res.status(201).json({
        status: 'success',
        data: {
            notification
        }
    });

});


// Helper function - تُستخدم داخليًا من controllers تانية (مش route)
exports.createNotificationHelper = async ({ recipient, sender, type, message, relatedItem, relatedItemType }) => {
    return await Notification.create({
        recipient,
        sender,
        type,
        message,
        relatedItem,
        relatedItemType
    });
};
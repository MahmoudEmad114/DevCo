const Notification = require('../models/notificationModel');

const createNotification = async ({
    recipient,
    sender,
    type,
    message,
    relatedItem,
    relatedItemType
}, io) => {

    const notification = await Notification.create({
        recipient,
        sender,
        type,
        message,
        relatedItem,
        relatedItemType
    });

    const populatedNotification =
        await Notification.findById(notification._id)
            .populate('sender', 'name email');

    io.to(`user:${recipient.toString()}`).emit(
        'newNotification',
        populatedNotification
    );

    return populatedNotification;
};

module.exports = createNotification;
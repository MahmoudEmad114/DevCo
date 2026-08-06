const Notification = require('../models/notificationModel');

// recipient is coming from a query param for now, swap to req.user.id once protect middleware exists
exports.getMyNotifications = async (req, res) => {
    try {
        const recipientId = req.query.recipient;

        if (!recipientId) {
            return res.status(400).json({ status: 'fail', message: 'recipient id is required' });
        }

        const filter = { recipient: recipientId };
        if (req.query.isRead) filter.isRead = req.query.isRead === 'true';

        const notifications = await Notification.find(filter)
            .sort('-createdAt')
            .populate('sender', 'name');

        res.status(200).json({
            status: 'success',
            results: notifications.length,
            data: { notifications }
        });

    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findByIdAndUpdate(
            req.params.id,
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ status: 'fail', message: 'no notification found with that id' });
        }

        res.status(200).json({
            status: 'success',
            data: { notification }
        });

    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

// marks everything unread for this user as read, used by the "clear all" button
exports.markAllAsRead = async (req, res) => {
    const recipientId = req.body.recipient;

    if (!recipientId) {
        return res.status(400).json({ status: 'fail', message: 'recipient id is required' });
    }

    try {
        await Notification.updateMany(
            { recipient: recipientId, isRead: false },
            { isRead: true }
        );

        res.status(200).json({ status: 'success', message: 'all notifications marked as read' });

    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

exports.deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findByIdAndDelete(req.params.id);

        if (!notification) {
            return res.status(404).json({ status: 'fail', message: 'no notification found with that id' });
        }

        res.status(204).json({ status: 'success', data: null });

    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};
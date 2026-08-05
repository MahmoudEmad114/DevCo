const mongoose = require('mongoose');

// notifications get sent to a user whenever something related to them happens
// (assigned to a task, someone commented, mentioned them)
const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Notification must have a recipient']
    },
    // who/what triggered this notification, optional since some are system generated
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    type: {
        type: String,
        enum: ['task-assigned', 'issue-assigned', 'comment-added', 'mention', 'status-changed'],
        required: [true, 'Notification must have a type']
    },
    message: {
        type: String,
        required: [true, 'Notification must have a message']
    },
    // this can point to a Task, Issue, Comment or Project depending on relatedItemType
    relatedItem: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'relatedItemType'
    },
    relatedItemType: {
        type: String,
        enum: ['Task', 'Issue', 'Comment', 'Project']
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
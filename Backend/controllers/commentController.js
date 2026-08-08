const Comment = require('../models/commentModel');
const Task = require('../models/taskModel');
const Issue = require('../models/issueModel');
const ProjectMember = require('../models/projectMemberModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { createNotificationHelper } = require('./notificationController');


// need to figure out which project the comment's target actually belongs to
// before we can check if the user is even allowed to comment on it
async function resolveProjectFromTarget(targetType, targetId) {
    if (targetType === 'Task') {
        const task = await Task.findById(targetId);
        return task ? task.project : null;
    }

    if (targetType === 'Issue') {
        const issue = await Issue.findById(targetId);
        return issue ? issue.project : null;
    }

    return null;
}

async function checkProjectMembership(projectId, userId) {
    // status has to be accepted, a pending invite shouldn't count as being a member yet
    return await ProjectMember.findOne({ project: projectId, user: userId, status: 'accepted' });
}

exports.createComment = catchAsync(async (req, res, next) => {
    const { targetType, targetId, text } = req.body;

    if (!targetType || !targetId) {
        return next(new AppError('targetType and targetId are required', 400));
    }

    const projectId = await resolveProjectFromTarget(targetType, targetId);
    if (!projectId) {
        return next(new AppError(`no ${targetType.toLowerCase()} found with that id`, 404));
    }

    const membership = await checkProjectMembership(projectId, req.user._id);
    if (!membership) {
        return next(new AppError('you are not a member of this project', 403));
    }

    const comment = await Comment.create({
        user: req.user._id,
        text,
        targetType,
        targetId
    });

    let target;
    if (targetType === 'Task') {
        target = await Task.findById(targetId);
    } else if (targetType === 'Issue') {
        target = await Issue.findById(targetId);
    }

    const recipientId = target?.assignedTo || target?.reportedBy || target?.createdBy;

    if (recipientId && recipientId.toString() !== req.user._id.toString()) {
        await createNotificationHelper({
            recipient: recipientId,
            sender: req.user._id,
            type: 'comment-added',
            message: `${req.user.name} commented on your ${targetType.toLowerCase()}`,
            relatedItem: comment._id,
            relatedItemType: 'Comment'
        });
    }

    res.status(201).json({ status: 'success', data: { comment } });
});

exports.getComments = catchAsync(async (req, res, next) => {
    const { targetType, targetId } = req.query;

    if (!targetType || !targetId) {
        return next(new AppError('targetType and targetId are required', 400));
    }

    const projectId = await resolveProjectFromTarget(targetType, targetId);
    if (!projectId) {
        return next(new AppError(`no ${targetType.toLowerCase()} found with that id`, 404));
    }

    const membership = await checkProjectMembership(projectId, req.user._id);
    if (!membership) {
        return next(new AppError('you are not a member of this project', 403));
    }

    const comments = await Comment.find({ targetType, targetId })
        .populate('user', 'name email')
        .sort('createdAt');

    res.status(200).json({
        status: 'success',
        results: comments.length,
        data: { comments }
    });
});

// only the person who actually wrote the comment gets to edit it, role doesn't matter here
exports.updateComment = catchAsync(async (req, res, next) => {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
        return next(new AppError('no comment found with that id', 404));
    }

    if (comment.user.toString() !== req.user._id.toString()) {
        return next(new AppError('you can only edit your own comments', 403));
    }

    comment.text = req.body.text;
    await comment.save();

    res.status(200).json({ status: 'success', data: { comment } });
});

exports.deleteComment = catchAsync(async (req, res, next) => {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
        return next(new AppError('no comment found with that id', 404));
    }

    // same rule as update, comment owner only
    if (comment.user.toString() !== req.user._id.toString()) {
        return next(new AppError('you can only delete your own comments', 403));
    }

    await Comment.findByIdAndDelete(req.params.id);
    res.status(204).json({ status: 'success', data: null });
});
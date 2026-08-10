const Message = require('../models/messageModel');
const ProjectMember = require('../models/projectMemberModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

async function checkProjectMembership(projectId, userId) {
    // status has to be accepted, a pending invite shouldn't count as being a member yet
    return await ProjectMember.findOne({ project: projectId, user: userId, status: 'accepted' });
}

// ============ REST ============

exports.getMessages = catchAsync(async (req, res, next) => {
    const membership = await checkProjectMembership(req.params.projectId, req.user._id);
    if (!membership) {
        return next(new AppError('you are not a member of this project', 403));
    }

    const messages = await Message.find({ project: req.params.projectId })
        .populate('sender', 'name email')
        .sort('createdAt');

    res.status(200).json({
        status: 'success',
        results: messages.length,
        data: { messages }
    });
});

exports.sendMessage = catchAsync(async (req, res, next) => {
    const membership = await checkProjectMembership(req.params.projectId, req.user._id);
    if (!membership) {
        return next(new AppError('you are not a member of this project', 403));
    }

    const message = await Message.create({
        project: req.params.projectId,
        sender: req.user._id,
        text: req.body.text
    });

    // TODO: emit this over socket.io once it's actually set up on the server,
    // right now people would have to refresh to see new messages

    res.status(201).json({ status: 'success', data: { message } });
});

exports.deleteMessage = catchAsync(async (req, res, next) => {
    const message = await Message.findById(req.params.id);
    if (!message) {
        return next(new AppError('no message found with that id', 404));
    }

    if (message.sender.toString() !== req.user._id.toString()) {
        return next(new AppError('you can only delete your own messages', 403));
    }

    await Message.findByIdAndDelete(req.params.id);
    res.status(204).json({ status: 'success', data: null });
});

// ============ SOCKET ============
// holding off on testing any of this, socket.io isn't even installed yet
// and server.js doesn't have an io instance. once that's set up, these should
// drop straight into io.on('connection', socket => { ... })
//
// note: these don't get wrapped in catchAsync, that helper is built for
// (req, res, next) style route handlers, not socket event handlers

// exports.joinRoom = (socket, projectId) => {
//     socket.join(projectId);
// };

// exports.leaveRoom = (socket, projectId) => {
//     socket.leave(projectId);
// };

// exports.typing = (socket, io, { projectId, userName }) => {
//     io.to(projectId).emit('typing', { userName });
// };

// exports.stopTyping = (socket, io, { projectId, userName }) => {
//     io.to(projectId).emit('stopTyping', { userName });
// };

// exports.newMessage = (io, projectId, message) => {
//     io.to(projectId).emit('newMessage', message);
// };
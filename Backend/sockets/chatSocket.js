const Message = require('../models/messageModel');
const ProjectMember = require('../models/projectMemberModel');


const checkProjectMembership = async (
    projectId,
    userId
) => {

    return ProjectMember.findOne({
        project: projectId,
        user: userId,
        status: 'accepted'
    });

};


module.exports = (socket, io) => {

    console.log(
        `Chat socket ready for ${socket.user.name}`
    );


    // =========================
    // JOIN PROJECT
    // =========================

    socket.on(
        'joinProject',
        async projectId => {

            try {

                const membership =
                    await checkProjectMembership(
                        projectId,
                        socket.user._id
                    );

                if (!membership) {

                    return socket.emit(
                        'socketError',
                        {
                            message:
                                'You are not a member of this project'
                        }
                    );

                }

                socket.join(projectId);

                console.log(
                    `${socket.user.name} joined project room: ${projectId}`
                );

                socket.emit(
                    'joinedProject',
                    {
                        projectId
                    }
                );

            } catch (err) {

                console.error(
                    'joinProject error:',
                    err
                );

                socket.emit(
                    'socketError',
                    {
                        message:
                            'Something went wrong'
                    }
                );

            }

        }
    );

    socket.on(
        'typing',
        ({ projectId }) => {

            if (!socket.rooms.has(projectId)) {
                return;
            }

            socket
                .to(projectId)
                .emit(
                    'typing',
                    {
                        userId: socket.user._id,
                        userName: socket.user.name
                    }
                );

        }
    );

    socket.on(
        'stopTyping',
        ({ projectId }) => {

            if (!socket.rooms.has(projectId)) {
                return;
            }

            socket
                .to(projectId)
                .emit(
                    'stopTyping',
                    {
                        userId: socket.user._id,
                        userName: socket.user.name
                    }
                );

        }
    );


    socket.on(
        'sendMessage',
        async ({ projectId, text }) => {

            try {

                if (!text || !text.trim()) {

                    return socket.emit(
                        'socketError',
                        {
                            message:
                                'Message text is required'
                        }
                    );

                }


                // Must be inside project room
                if (!socket.rooms.has(projectId)) {

                    return socket.emit(
                        'socketError',
                        {
                            message:
                                'You are not connected to this project chat'
                        }
                    );

                }


                // Must be an accepted member
                const membership =
                    await checkProjectMembership(
                        projectId,
                        socket.user._id
                    );

                if (!membership) {

                    return socket.emit(
                        'socketError',
                        {
                            message:
                                'You are not a member of this project'
                        }
                    );

                }


                const message =
                    await Message.create({
                        project: projectId,
                        sender: socket.user._id,
                        text: text.trim()
                    });


                const populatedMessage =
                    await Message
                        .findById(message._id)
                        .populate(
                            'sender',
                            'name email photo'
                        );


                io
                    .to(projectId)
                    .emit(
                        'newMessage',
                        populatedMessage
                    );

            } catch (err) {

                console.error(
                    'sendMessage error:',
                    err
                );

                socket.emit(
                    'socketError',
                    {
                        message:
                            'Something went wrong while sending the message'
                    }
                );

            }

        }
    );

    socket.on(
        'leaveProject',
        projectId => {

            if (!socket.rooms.has(projectId)) {
                return;
            }

            socket.leave(projectId);

            console.log(
                `${socket.user.name} left project room: ${projectId}`
            );

            socket.emit(
                'leftProject',
                {
                    projectId
                }
            );

        }
    );

};
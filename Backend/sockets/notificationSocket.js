module.exports = (socket, io) => {

    console.log(
        `Notification socket ready for ${socket.user.name}`
    );

    const userRoom = `user:${socket.user._id}`;

    socket.join(userRoom);

    console.log(
        `${socket.user.name} joined notification room: ${userRoom}`
    );
};
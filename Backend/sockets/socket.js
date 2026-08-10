const chatSocket = require('./chatSocket');
const notificationSocket = require('./notificationSocket');

module.exports = io => {

    io.on('connection', socket => {

        console.log('Socket connected:', socket.id);

        chatSocket(socket, io);
        notificationSocket(socket, io);

        socket.on('disconnect', () => {
            console.log('Socket disconnected:', socket.id);
        });

    });

};
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

module.exports = async (socket, next) => {

    try {

        const token = socket.handshake.auth.token;

        if (!token) {
            return next(new Error('Authentication required'));
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        const user = await User.findById(decoded.id);

        if (!user) {
            return next(new Error('User no longer exists'));
        }

        if (user.changedPasswordAfter(decoded.iat)) {
            return next(new Error('User recently changed password'));
        }

        socket.user = user;

        next();

    } catch (err) {

        next(new Error('Invalid or expired token'));

    }

};
const express = require('express');
const morgan = require('morgan');
const taskRouter = require('./routes/taskRoutes');
const memberRouter = require('./routes/memberRoutes');
const authRouter = require('./routes/authRoutes');
const issueRouter = require('./routes/issueRoutes');
const notificationRouter = require('./routes/notificationRoutes');
const userRouter = require('./routes/userRoutes');
const projectRouter = require('./routes/projectRoutes');
const workspaceRouter = require('./routes/workspaceRoutes');
const dashboardRouter = require('./routes/dashboardRoutes');
const chatRouter = require('./routes/chatRoutes');
const commentRouter = require('./routes/commentRoutes');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

app.use(express.json());

app.use((req, res, next) => {
    console.log('Hello from the middleware');
    next();
});

app.get('/test', (req, res) => {
    res.json({ message: 'Server is working' });
});

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/workspaces', workspaceRouter);
app.use('/api/v1/members', memberRouter);
app.use('/api/v1/projects', projectRouter);
app.use('/api/v1/tasks', taskRouter);
app.use('/api/v1/issues', issueRouter);
app.use('/api/v1/notifications', notificationRouter);
app.use('/api/v1/comment', commentRouter);
app.use('/api/v1/chat', chatRouter);
app.use('/api/v1/dashboard', dashboardRouter);

app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
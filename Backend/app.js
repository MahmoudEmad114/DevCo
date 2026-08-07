const express = require('express');
const morgan = require('morgan');
const taskRouter = require('./routes/taskRoutes');
const memberRouter = require('./routes/memberRoutes');

const app = express();

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

app.use(express.json());

app.use((req, res, next) => {
    console.log('Hello from the middleware');
    next();
});

app.use('/api/tasks', taskRouter);
app.use('/api', memberRouter);

module.exports = app;
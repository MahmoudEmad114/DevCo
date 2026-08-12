const mongoose = require('mongoose')
const dotenv = require('dotenv')

process.on('uncaughtException', err => {
    // handled exception error 
    // cl(x) => but x is not defined yet!
    console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    process.exit(1);
});

dotenv.config({ path: './.env' })
const app = require('./app')

const MONGO_URI = process.env.MONGO_URI;

mongoose
    .connect(MONGO_URI)
    .then(() => {
        console.log('DB connection successful!');
    })

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log(`App running on port ${port}...`);
})

process.on('unhandledRejection', err => {
console.log('UNHANDLED REJECTION! 💥 Shutting down...');
console.error(err.stack);

server.close(() => {
process.exit(1);
});
});
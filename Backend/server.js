const mongoose = require('mongoose')
const dotenv = require('dotenv')

dotenv.config({ path: './.env' })
const app = require('./app')

const MONGO_URI = process.env.MONGO_URI;

mongoose
    .connect(MONGO_URI)
    .then(() => {
        console.log('DB connection successful!');
        console.log('Current DB Name:', mongoose.connection.name);
        console.log('Connection readyState:', mongoose.connection.readyState);
    })

const PORT = process.env.PORT || 5050;
const server = app.listen(PORT, () => {
    console.log(`App running on port ${PORT}...`);
})

const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters'],
        maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        validate: {
            validator: validator.isEmail,
            message: 'Please provide a valid email'
        }

    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters'],
        // select: false
    },
    photo: {
        type: String,
        default: 'default-avatar.png'
    },
    bio: {
        type: String,
        maxlength: [500, "Bio cannot exceed 500 characters"],
        trim: true,
    },
    skills: [{
        type: String,
        trim: true,
    }],
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    isActive: {
        type: Boolean,
        default: true
    }
},
    {
        timestamps: true,
    })

const User = mongoose.model('User', userSchema);
module.exports = User;    
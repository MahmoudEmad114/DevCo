const mongoose = require('mongoose');

const workspaceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Workspace name is required'],
        trim: true,
        minlength: [3, 'Workspace name must be at least 3 characters'],
        maxlength: [50, 'Workspace name cannot exceed 50 characters'],
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters'],
        default: ''
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Workspace must have an owner']
    },

},
    {
        timestamps: true
    })
const Workspace = mongoose.model('Workspace', workspaceSchema);
module.exports = Workspace

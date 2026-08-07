const mongoose = require('mongoose');

const workspaceMemberSchema = new mongoose.Schema({
    workspace: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Workspace',
        required: [true, 'Workspace Member must belong to a workspace']
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Workspace must have members']
    },
    role: {
        type: String,
        enum: ['owner', 'admin', 'member'],
        default: 'member'
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    },
    joinedAt: {
        type: Date,
        default: Date.now
    }
},
    {
        timestamps: true
    })

workspaceMemberSchema.index({ workspace: 1, user: 1 }, { unique: true });
workspaceMemberSchema.index({ user: 1 });

const WorkspaceMember = mongoose.model('WorkspaceMember', workspaceMemberSchema);
module.exports = WorkspaceMember;
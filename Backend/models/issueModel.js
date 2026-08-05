const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Issue must have a title'],
        trim: true,
        minlength: [3, 'Issue title must be at least 3 characters'],
        maxlength: [100, 'Issue title cannot exceed 100 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [3000, 'Issue description cannot exceed 3000 characters'],
        default: ''
    },
    // every issue belongs to one project
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: [true, 'Issue must belong to a project']
    },
    reportedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Issue must have a reporter']
    },
    // not required, issue might not be assigned yet
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    status: {
        type: String,
        enum: ['open', 'in-progress', 'resolved', 'closed'],
        default: 'open'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    severity: {
        type: String,
        enum: ['minor', 'major', 'critical', 'blocker'],
        default: 'minor'
    }
}, {
    timestamps: true
});

const Issue = mongoose.model('Issue', issueSchema);
module.exports = Issue;
const Issue = require('../models/issueModel');

// TODO: swap reportedBy to req.user.id once auth is done, for now sending it from body
exports.createIssue = async (req, res) => {
    try {
        const newIssue = await Issue.create({
            title: req.body.title,
            description: req.body.description,
            project: req.body.project,
            reportedBy: req.body.reportedBy,
            assignedTo: req.body.assignedTo,
            priority: req.body.priority,
            severity: req.body.severity
        });

        res.status(201).json({
            status: 'success',
            data: { issue: newIssue }
        });

    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

exports.getAllIssues = async (req, res) => {
    try {
        const filter = {};

        if (req.query.project) filter.project = req.query.project;
        if (req.query.status) filter.status = req.query.status;
        if (req.query.assignedTo) filter.assignedTo = req.query.assignedTo;
        // could add priority/severity filters later if we need them

        const issues = await Issue.find(filter)
            .populate('reportedBy', 'name email')
            .populate('assignedTo', 'name email');

        res.status(200).json({
            status: 'success',
            results: issues.length,
            data: { issues }
        });

    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

exports.getIssue = async (req, res) => {
    try {
        const issue = await Issue.findById(req.params.id)
            .populate('reportedBy', 'name email')
            .populate('assignedTo', 'name email');

        if (!issue) {
            return res.status(404).json({ status: 'fail', message: 'no issue found with that id' });
        }

        res.status(200).json({
            status: 'success',
            data: { issue }
        });

    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

exports.updateIssue = async (req, res) => {
    try {
        const issue = await Issue.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!issue) {
            return res.status(404).json({ status: 'fail', message: 'no issue found with that id' });
        }

        res.status(200).json({
            status: 'success',
            data: { issue }
        });

    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

exports.deleteIssue = async (req, res) => {
    try {
        const issue = await Issue.findByIdAndDelete(req.params.id);

        if (!issue) {
            return res.status(404).json({ status: 'fail', message: 'no issue found with that id' });
        }

        res.status(204).json({ status: 'success', data: null });

    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

// separate route for assigning so the frontend doesn't have to send the whole issue object
// just to change who's working on it
exports.assignIssue = async (req, res) => {
    try {
        const { assignedTo } = req.body;

        if (!assignedTo) {
            return res.status(400).json({ status: 'fail', message: 'assignedTo is required' });
        }

        const issue = await Issue.findByIdAndUpdate(
            req.params.id,
            { assignedTo },
            { new: true, runValidators: true }
        ).populate('assignedTo', 'name email');

        if (!issue) {
            return res.status(404).json({ status: 'fail', message: 'no issue found with that id' });
        }

        // still need to send a notification to whoever just got assigned
        // holding off until notification creation is sorted between controllers

        res.status(200).json({
            status: 'success',
            data: { issue }
        });

    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

// used by the kanban board when a card gets dragged to a different column
exports.changeIssueStatus = async (req, res) => {
    const allowedStatuses = ['open', 'in-progress', 'resolved', 'closed'];

    if (!allowedStatuses.includes(req.body.status)) {
        return res.status(400).json({
            status: 'fail',
            message: 'status must be one of: ' + allowedStatuses.join(', ')
        });
    }

    try {
        const issue = await Issue.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true, runValidators: true }
        );

        if (!issue) {
            return res.status(404).json({ status: 'fail', message: 'no issue found with that id' });
        }

        res.status(200).json({
            status: 'success',
            data: { issue }
        });

    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};
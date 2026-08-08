const Issue = require('../models/issueModel');
const ProjectMember = require('../models/projectMemberModel');
const { createNotificationHelper } = require('./notificationController');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// ======================================================
// Helpers
// ======================================================

const checkProjectMembership = async (projectId, userId) => {

    return await ProjectMember.findOne({
        project: projectId,
        user: userId,
        status: 'accepted'
    });

};

const checkIssueMembership = async (issueId, userId) => {

    const issue = await Issue.findById(issueId);

    if (!issue) {
        return {
            issue: null,
            membership: null
        };
    }

    const membership = await checkProjectMembership(
        issue.project,
        userId
    );

    return {
        issue,
        membership
    };

};

// ======================================================
// Create Issue
// ======================================================

exports.createIssue = catchAsync(async (req, res, next) => {

    const membership = await checkProjectMembership(
        req.body.project,
        req.user._id
    );

    if (!membership) {
        return next(
            new AppError(
                'You are not a member of this project',
                403
            )
        );
    }

    if (req.body.assignedTo) {

        const assigneeMembership =
            await checkProjectMembership(
                req.body.project,
                req.body.assignedTo
            );

        if (!assigneeMembership) {
            return next(
                new AppError(
                    'Assigned user is not a member of this project',
                    400
                )
            );
        }

    }

    const issue = await Issue.create({

        title: req.body.title,
        description: req.body.description,
        project: req.body.project,
        reportedBy: req.user._id,
        assignedTo: req.body.assignedTo,
        priority: req.body.priority,
        severity: req.body.severity

    });

    res.status(201).json({

        status: 'success',
        data: {
            issue
        }

    });

});

// ======================================================
// Get All Issues
// ======================================================

exports.getAllIssues = catchAsync(async (req, res, next) => {

    const memberships = await ProjectMember.find({

        user: req.user._id,
        status: 'accepted'

    }).select('project');

    const projectIds = memberships.map(
        member => member.project
    );

    const filter = {

        project: {
            $in: projectIds
        }

    };

    if (req.query.project)
        filter.project = req.query.project;

    if (req.query.status)
        filter.status = req.query.status;

    if (req.query.assignedTo)
        filter.assignedTo = req.query.assignedTo;

    const issues = await Issue.find(filter)

        .populate(
            'reportedBy',
            'name email'
        )

        .populate(
            'assignedTo',
            'name email'
        )

        .populate(
            'project',
            'name'
        );

    res.status(200).json({

        status: 'success',
        results: issues.length,

        data: {
            issues
        }

    });

});

// ======================================================
// Get Single Issue
// ======================================================

exports.getIssue = catchAsync(async (req, res, next) => {

    const result = await checkIssueMembership(
        req.params.id,
        req.user._id
    );

    if (!result.issue) {

        return next(
            new AppError(
                'No issue found with that id',
                404
            )
        );

    }

    if (!result.membership) {

        return next(
            new AppError(
                'You are not a member of this project',
                403
            )
        );

    }

    const issue = await Issue.findById(req.params.id)

        .populate(
            'reportedBy',
            'name email'
        )

        .populate(
            'assignedTo',
            'name email'
        )

        .populate(
            'project',
            'name'
        );

    res.status(200).json({

        status: 'success',

        data: {
            issue
        }

    });

});

// ======================================================
// Update Issue
// ======================================================

exports.updateIssue = catchAsync(async (req, res, next) => {

    const { issue, membership } = await checkIssueMembership(
        req.params.id,
        req.user._id
    );

    if (!issue) {
        return next(
            new AppError(
                'No issue found with that id',
                404
            )
        );
    }

    if (!membership) {
        return next(
            new AppError(
                'You are not a member of this project',
                403
            )
        );
    }

    if (req.body.assignedTo) {

        const assigneeMembership =
            await checkProjectMembership(
                issue.project,
                req.body.assignedTo
            );

        if (!assigneeMembership) {
            return next(
                new AppError(
                    'Assigned user is not a member of this project',
                    400
                )
            );
        }

    }

    const allowedFields = [
        'title',
        'description',
        'assignedTo',
        'priority',
        'severity'
    ];

    const updates = {};

    allowedFields.forEach(field => {

        if (req.body[field] !== undefined)
            updates[field] = req.body[field];

    });

    const updatedIssue = await Issue.findByIdAndUpdate(

        req.params.id,
        updates,

        {
            new: true,
            runValidators: true
        }

    )

        .populate('reportedBy', 'name email')
        .populate('assignedTo', 'name email');

    res.status(200).json({

        status: 'success',

        data: {
            issue: updatedIssue
        }

    });

});
// ======================================================
// Delete Issue
// ======================================================

exports.deleteIssue = catchAsync(async (req, res, next) => {

    const { issue, membership } = await checkIssueMembership(
        req.params.id,
        req.user._id
    );

    if (!issue) {
        return next(
            new AppError(
                'No issue found with that id',
                404
            )
        );
    }

    if (!membership) {
        return next(
            new AppError(
                'You are not a member of this project',
                403
            )
        );
    }

    await Issue.findByIdAndDelete(req.params.id);

    res.status(204).json({

        status: 'success',
        data: null

    });

});
// ======================================================
// Assign Issue
// ======================================================

exports.assignIssue = catchAsync(async (req, res, next) => {

    const { issue, membership } = await checkIssueMembership(
        req.params.id,
        req.user._id
    );

    if (!issue) {
        return next(
            new AppError(
                'No issue found with that id',
                404
            )
        );
    }

    if (!membership) {
        return next(
            new AppError(
                'You are not a member of this project',
                403
            )
        );
    }

    const { assignedTo } = req.body;

    if (!assignedTo) {
        return next(
            new AppError(
                'assignedTo user id is required',
                400
            )
        );
    }

    const assigneeMembership =
        await checkProjectMembership(
            issue.project,
            assignedTo
        );

    if (!assigneeMembership) {
        return next(
            new AppError(
                'Cannot assign issue to a user who is not a member of this project',
                400
            )
        );
    }

    const updatedIssue = await Issue.findByIdAndUpdate(

        req.params.id,

        {
            assignedTo
        },

        {
            new: true,
            runValidators: true
        }

    )
        .populate('assignedTo', 'name email')
        .populate('reportedBy', 'name email');
    
await createNotificationHelper({
    recipient: assignedTo,
    sender: req.user._id,
    type: 'issue-assigned',
    message: `${req.user.name} assigned you an issue: ${updatedIssue.title}`,
    relatedItem: updatedIssue._id,
    relatedItemType: 'Issue'
});


    res.status(200).json({

        status: 'success',

        data: {
            issue: updatedIssue
        }

    });

});

// ======================================================
// Change Issue Status
// ======================================================

exports.changeIssueStatus = catchAsync(async (req, res, next) => {

    const { issue, membership } = await checkIssueMembership(
        req.params.id,
        req.user._id
    );

    if (!issue) {
        return next(
            new AppError(
                'No issue found with that id',
                404
            )
        );
    }

    if (!membership) {
        return next(
            new AppError(
                'You are not a member of this project',
                403
            )
        );
    }

    const { status } = req.body;

    const allowedStatuses = [
        'open',
        'in-progress',
        'resolved',
        'closed'
    ];

    if (!allowedStatuses.includes(status)) {
        return next(
            new AppError(
                `Status must be one of: ${allowedStatuses.join(', ')}`,
                400
            )
        );
    }

    const updatedIssue = await Issue.findByIdAndUpdate(

        req.params.id,

        {
            status
        },

        {
            new: true,
            runValidators: true
        }

    )
        .populate('assignedTo', 'name email')
        .populate('reportedBy', 'name email');


        if (updatedIssue.assignedTo) {
    await createNotificationHelper({
        recipient: updatedIssue.assignedTo._id,
        sender: req.user._id,
        type: 'status-changed',
        message: `${req.user.name} changed the status of issue "${updatedIssue.title}" to ${status}`,
        relatedItem: updatedIssue._id,
        relatedItemType: 'Issue'
    });
}

    res.status(200).json({

        status: 'success',

        data: {
            issue: updatedIssue
        }

    });

});
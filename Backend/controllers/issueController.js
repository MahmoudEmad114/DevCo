const Issue = require('../models/issueModel');
const ProjectMember = require('../models/projectMemberModel');

const createNotification = require('../utils/notification');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

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

    if (issue.assignedTo) {
        const io = req.app.get('io');

        await createNotification({
            recipient: req.body.assignedTo,
            sender: req.user._id,
            type: 'issue-assigned',
            message: `You have been assigned to issue: ${issue.title}`,
            relatedItem: issue._id,
            relatedItemType: 'Issue'
        }, io);
    }

    res.status(201).json({

        status: 'success',
        data: {
            issue
        }

    });

});

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

    const oldAssignee = issue.assignedTo
        ? issue.assignedTo.toString()
        : null;

    const newAssignee = req.body.assignedTo
        ? req.body.assignedTo.toString()
        : null;


    const allowedFields = [
        'title',
        'description',
        'assignedTo',
        'priority',
        'severity'
    ];

    const updates = {};

    allowedFields.forEach(field => {

        if (req.body[field] !== undefined) {
            updates[field] = req.body[field];
        }

    });


    const updatedIssue = await Issue.findByIdAndUpdate(
        req.params.id,
        updates,
        {
            returnDocument: 'after',
            runValidators: true
        }
    )
        .populate('reportedBy', 'name email')
        .populate('assignedTo', 'name email');

    if (
        req.body.assignedTo !== undefined &&
        oldAssignee !== newAssignee &&
        newAssignee
    ) {

        const io = req.app.get('io');

        await createNotification({

            recipient: newAssignee,

            sender: req.user._id,

            type: 'issue-assigned',

            message:
                `You have been assigned to issue: ${updatedIssue.title}`,

            relatedItem: updatedIssue._id,

            relatedItemType: 'Issue'

        }, io);

    }


    res.status(200).json({

        status: 'success',

        data: {
            issue: updatedIssue
        }

    });

});

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

    const oldAssignee = issue.assignedTo?.toString();
    const newAssignee = assignedTo.toString();

    const updatedIssue = await Issue.findByIdAndUpdate(
        req.params.id,
        {
            assignedTo
        },
        {
            returnDocument: 'after',
            runValidators: true
        }
    )
        .populate('assignedTo', 'name email')
        .populate('reportedBy', 'name email');

    if (oldAssignee !== newAssignee) {

        const io = req.app.get('io');

        await createNotification({
            recipient: assignedTo,
            sender: req.user._id,
            type: 'issue-assigned',
            message: `You have been assigned to issue: ${issue.title}`,
            relatedItem: issue._id,
            relatedItemType: 'Issue'
        }, io);
    }

    res.status(200).json({

        status: 'success',

        data: {
            issue: updatedIssue
        }

    });

});

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

    const oldStatus = issue.status;
    const updatedIssue = await Issue.findByIdAndUpdate(

        req.params.id,

        {
            status
        },

        {
            returnDocument: 'after',
            runValidators: true
        }

    )
        .populate('assignedTo', 'name email')
        .populate('reportedBy', 'name email');

    res.status(200).json({

        status: 'success',

        data: {
            issue: updatedIssue
        }

    });

});
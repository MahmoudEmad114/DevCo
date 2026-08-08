const Task = require('../models/taskModel');
const Subtask = require('../models/subtaskModel');
const ProjectMember = require('../models/projectMemberModel');

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const checkProjectMembership = async (projectId, userId) => {
    return await ProjectMember.findOne({
        project: projectId,
        user: userId
    });
};

const checkProjectMembershipCascade = async (taskId, userId) => {
    const task = await Task.findById(taskId);

    if (!task) {
        return {
            task: null,
            membership: null
        };
    }

    const membership = await checkProjectMembership(task.project, userId);

    return {
        task,
        membership
    };
};

// ======================================================
// Tasks
// ======================================================

exports.createTask = catchAsync(async (req, res, next) => {

    const membership = await checkProjectMembership(
        req.params.projectId,
        req.user._id
    );

    if (!membership) {
        return next(
            new AppError('You are not a member of this project', 403)
        );
    }

    const {
        title,
        description,
        labels,
        assignedTo,
        priority,
        dueDate
    } = req.body;

    if (assignedTo) {

        const assigneeMembership = await checkProjectMembership(
            req.params.projectId,
            assignedTo
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

    const task = await Task.create({
        title,
        description,
        labels,
        assignedTo,
        priority,
        dueDate,
        project: req.params.projectId,
        createdBy: req.user._id
    });

    res.status(201).json({
        status: 'success',
        data: {
            task
        }
    });

});

exports.getAllTasks = catchAsync(async (req, res, next) => {

    const memberships = await ProjectMember.find({
        user: req.user._id
    }).select('project');

    const projectIds = memberships.map(member => member.project);

    const tasks = await Task.find({
        project: {
            $in: projectIds
        }
    })
        .populate('project', 'name')
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name email');

    res.status(200).json({
        status: 'success',
        results: tasks.length,
        data: {
            tasks
        }
    });

});

exports.getTasksByProject = catchAsync(async (req, res, next) => {

    const membership = await checkProjectMembership(
        req.params.projectId,
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

    const tasks = await Task.find({
        project: req.params.projectId
    })
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name email');

    res.status(200).json({
        status: 'success',
        results: tasks.length,
        data: {
            tasks
        }
    });

});

exports.getTask = catchAsync(async (req, res, next) => {

    const task = await Task.findById(req.params.id)
        .populate('project', 'name')
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name email');

    if (!task) {
        return next(
            new AppError(
                'No task found with that id',
                404
            )
        );
    }

    const membership = await checkProjectMembership(
        task.project._id,
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

    res.status(200).json({
        status: 'success',
        data: {
            task
        }
    });

});

exports.updateTask = catchAsync(async (req, res, next) => {

    const existingTask = await Task.findById(req.params.id);

    if (!existingTask) {
        return next(
            new AppError(
                'No task found with that id',
                404
            )
        );
    }

    const membership = await checkProjectMembership(
        existingTask.project,
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

        const assigneeMembership = await checkProjectMembership(
            existingTask.project,
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
        'labels',
        'assignedTo',
        'priority',
        'dueDate'
    ];

    const updates = {};

    allowedFields.forEach(field => {

        if (req.body[field] !== undefined) {
            updates[field] = req.body[field];
        }

    });

    const task = await Task.findByIdAndUpdate(
        req.params.id,
        updates,
        {
            new: true,
            runValidators: true
        }
    );

    res.status(200).json({
        status: 'success',
        data: {
            task
        }
    });

});

exports.assignTask = catchAsync(async (req, res, next) => {

    const existingTask = await Task.findById(req.params.id);

    if (!existingTask) {
        return next(
            new AppError(
                'No task found with that id',
                404
            )
        );
    }

    const membership = await checkProjectMembership(
        existingTask.project,
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

    const { assignedTo } = req.body;

    if (!assignedTo) {
        return next(
            new AppError(
                'assignedTo user id is required',
                400
            )
        );
    }

    const assigneeMembership = await checkProjectMembership(
        existingTask.project,
        assignedTo
    );

    if (!assigneeMembership) {
        return next(
            new AppError(
                'Cannot assign task to a user who is not a member of this project',
                400
            )
        );
    }

    const task = await Task.findByIdAndUpdate(
        req.params.id,
        {
            assignedTo
        },
        {
            new: true,
            runValidators: true
        }
    ).populate('assignedTo', 'name email');

    res.status(200).json({
        status: 'success',
        data: {
            task
        }
    });

});

// ======================================================
// Task Status & Priority
// ======================================================

exports.changePriority = catchAsync(async (req, res, next) => {

    const existingTask = await Task.findById(req.params.id);

    if (!existingTask) {
        return next(new AppError('No task found with that id', 404));
    }

    const membership = await checkProjectMembership(
        existingTask.project,
        req.user._id
    );

    if (!membership) {
        return next(new AppError('You are not a member of this project', 403));
    }

    const { priority } = req.body;

    const allowedPriorities = [
        'low',
        'medium',
        'high',
        'urgent'
    ];

    if (!allowedPriorities.includes(priority)) {
        return next(
            new AppError(
                `Priority must be one of: ${allowedPriorities.join(', ')}`,
                400
            )
        );
    }

    const task = await Task.findByIdAndUpdate(
        req.params.id,
        { priority },
        {
            new: true,
            runValidators: true
        }
    );

    res.status(200).json({
        status: 'success',
        data: {
            task
        }
    });

});

exports.changeStatus = catchAsync(async (req, res, next) => {

    const existingTask = await Task.findById(req.params.id);

    if (!existingTask) {
        return next(new AppError('No task found with that id', 404));
    }

    const membership = await checkProjectMembership(
        existingTask.project,
        req.user._id
    );

    if (!membership) {
        return next(new AppError('You are not a member of this project', 403));
    }

    const { status } = req.body;

    const allowedStatuses = [
        'todo',
        'in-progress',
        'review',
        'testing',
        'done'
    ];

    if (!allowedStatuses.includes(status)) {
        return next(
            new AppError(
                `Status must be one of: ${allowedStatuses.join(', ')}`,
                400
            )
        );
    }

    const task = await Task.findByIdAndUpdate(
        req.params.id,
        { status },
        {
            new: true,
            runValidators: true
        }
    );

    res.status(200).json({
        status: 'success',
        data: {
            task
        }
    });

});

exports.deleteTask = catchAsync(async (req, res, next) => {

    const existingTask = await Task.findById(req.params.id);

    if (!existingTask) {
        return next(new AppError('No task found with that id', 404));
    }

    const membership = await checkProjectMembership(
        existingTask.project,
        req.user._id
    );

    if (!membership) {
        return next(new AppError('You are not a member of this project', 403));
    }

    await Subtask.deleteMany({
        task: req.params.id
    });

    await Task.findByIdAndDelete(req.params.id);

    res.status(204).json({
        status: 'success',
        data: null
    });

});

// ======================================================
// Subtasks
// ======================================================

exports.createSubtask = catchAsync(async (req, res, next) => {

    const { task, membership } =
        await checkProjectMembershipCascade(
            req.params.taskId,
            req.user._id
        );

    if (!task) {
        return next(new AppError('No task found with that id', 404));
    }

    if (!membership) {
        return next(new AppError('You are not a member of this project', 403));
    }

    const {
        title,
        assignedTo,
        order
    } = req.body;

    if (assignedTo) {

        const assigneeMembership =
            await checkProjectMembership(
                task.project,
                assignedTo
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

    const subtask = await Subtask.create({
        title,
        assignedTo,
        order,
        task: req.params.taskId,
        createdBy: req.user._id
    });

    res.status(201).json({
        status: 'success',
        data: {
            subtask
        }
    });

});

exports.getSubtasks = catchAsync(async (req, res, next) => {

    const { task, membership } =
        await checkProjectMembershipCascade(
            req.params.taskId,
            req.user._id
        );

    if (!task) {
        return next(new AppError('No task found with that id', 404));
    }

    if (!membership) {
        return next(new AppError('You are not a member of this project', 403));
    }

    const subtasks = await Subtask.find({
        task: req.params.taskId
    })
        .populate('assignedTo', 'name email')
        .sort('order');

    res.status(200).json({
        status: 'success',
        results: subtasks.length,
        data: {
            subtasks
        }
    });

});

exports.updateSubtask = catchAsync(async (req, res, next) => {

    const existingSubtask =
        await Subtask.findById(req.params.subtaskId);

    if (!existingSubtask) {
        return next(new AppError('No subtask found with that id', 404));
    }

    const { task, membership } =
        await checkProjectMembershipCascade(
            existingSubtask.task,
            req.user._id
        );

    if (!membership) {
        return next(new AppError('You are not a member of this project', 403));
    }

    if (req.body.assignedTo) {

        const assigneeMembership =
            await checkProjectMembership(
                task.project,
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
        'assignedTo',
        'order'
    ];

    const updates = {};

    allowedFields.forEach(field => {

        if (req.body[field] !== undefined) {
            updates[field] = req.body[field];
        }

    });

    const subtask = await Subtask.findByIdAndUpdate(
        req.params.subtaskId,
        updates,
        {
            new: true,
            runValidators: true
        }
    );

    res.status(200).json({
        status: 'success',
        data: {
            subtask
        }
    });

});

exports.completeSubtask = catchAsync(async (req, res, next) => {

    const existingSubtask =
        await Subtask.findById(req.params.subtaskId);

    if (!existingSubtask) {
        return next(new AppError('No subtask found with that id', 404));
    }

    const { membership } =
        await checkProjectMembershipCascade(
            existingSubtask.task,
            req.user._id
        );

    if (!membership) {
        return next(new AppError('You are not a member of this project', 403));
    }

    const isCompleted =
        req.body.isCompleted !== undefined
            ? req.body.isCompleted
            : !existingSubtask.isCompleted;

    const subtask = await Subtask.findByIdAndUpdate(
        req.params.subtaskId,
        {
            isCompleted
        },
        {
            new: true,
            runValidators: true
        }
    );

    res.status(200).json({
        status: 'success',
        data: {
            subtask
        }
    });

});

exports.deleteSubtask = catchAsync(async (req, res, next) => {

    const existingSubtask =
        await Subtask.findById(req.params.subtaskId);

    if (!existingSubtask) {
        return next(new AppError('No subtask found with that id', 404));
    }

    const { membership } =
        await checkProjectMembershipCascade(
            existingSubtask.task,
            req.user._id
        );

    if (!membership) {
        return next(new AppError('You are not a member of this project', 403));
    }

    await Subtask.findByIdAndDelete(req.params.subtaskId);

    res.status(204).json({
        status: 'success',
        data: null
    });

});
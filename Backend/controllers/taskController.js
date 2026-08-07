const Task = require('../models/taskModel');
const Subtask = require('../models/subtaskModel');
const ProjectMember = require('../models/projectMemberModel');


const checkProjectMembership = async (projectId, userId) => {
    const membership = await ProjectMember.findOne({
        project: projectId,
        user: userId
    });
    return membership;
};

const checkProjectMembershipCascade = async (taskId, userId) => {
    const task = await Task.findById(taskId);
    if (!task) return { task: null, membership: null };

    const membership = await checkProjectMembership(task.project, userId);
    return { task, membership };
};


exports.createTask = async (req, res) => {
    try {
        const membership = await checkProjectMembership(req.params.projectId, req.user._id);
        if (!membership) {
            return res.status(403).json({ status: 'fail', message: 'You are not a member of this project' });
        }

        const { title, description, labels, assignedTo, priority, dueDate } = req.body;

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

        res.status(201).json({ status: 'success', data: { task } });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

exports.getAllTasks = async (req, res) => {
    try {
        const memberships = await ProjectMember.find({ user: req.user._id }).select('project');
        const projectIds = memberships.map(m => m.project);

        const tasks = await Task.find({ project: { $in: projectIds } })
            .populate('project', 'name')
            .populate('assignedTo', 'name email')
            .populate('createdBy', 'name email');

        res.status(200).json({ status: 'success', results: tasks.length, data: { tasks } });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

exports.getTasksByProject = async (req, res) => {
    try {
        const membership = await checkProjectMembership(req.params.projectId, req.user._id);
        if (!membership) {
            return res.status(403).json({ status: 'fail', message: 'You are not a member of this project' });
        }

        const tasks = await Task.find({ project: req.params.projectId })
            .populate('assignedTo', 'name email')
            .populate('createdBy', 'name email');

        res.status(200).json({ status: 'success', results: tasks.length, data: { tasks } });
    } catch (err) {
        res.status(500).json({ status: 'fail', message: err.message });
    }
};

exports.getTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id)
            .populate('project', 'name')
            .populate('assignedTo', 'name email')
            .populate('createdBy', 'name email');

        if (!task) {
            return res.status(404).json({ status: 'fail', message: 'No task found with that id' });
        }

        res.status(200).json({ status: 'success', data: { task } });
    } catch (err) {
        res.status(500).json({ status: 'fail', message: err.message });
    }
};

exports.updateTask = async (req, res) => {
    try {
        const existingTask = await Task.findById(req.params.id);
        if (!existingTask) {
            return res.status(404).json({ status: 'fail', message: 'No task found with that id' });
        }

        const membership = await checkProjectMembership(existingTask.project, req.user._id);
        if (!membership) {
            return res.status(403).json({ status: 'fail', message: 'You are not a member of this project' });
        }

        const allowedFields = ['title', 'description', 'labels', 'assignedTo', 'priority', 'dueDate'];
        const updates = {};
        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) updates[field] = req.body[field];
        });

        const task = await Task.findByIdAndUpdate(req.params.id, updates, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ status: 'success', data: { task } });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

exports.assignTask = async (req, res) => {
    try {
        const existingTask = await Task.findById(req.params.id);
        if (!existingTask) {
            return res.status(404).json({ status: 'fail', message: 'No task found with that id' });
        }

        const membership = await checkProjectMembership(existingTask.project, req.user._id);
        if (!membership) {
            return res.status(403).json({ status: 'fail', message: 'You are not a member of this project' });
        }

        const { assignedTo } = req.body;
        if (!assignedTo) {
            return res.status(400).json({ status: 'fail', message: 'assignedTo user id is required' });
        }

        const assigneeMembership = await checkProjectMembership(existingTask.project, assignedTo);
        if (!assigneeMembership) {
            return res.status(400).json({ status: 'fail', message: 'Cannot assign task to a user who is not a member of this project' });
        }

        const task = await Task.findByIdAndUpdate(
            req.params.id,
            { assignedTo },
            { new: true, runValidators: true }
        ).populate('assignedTo', 'name email');

        res.status(200).json({ status: 'success', data: { task } });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

exports.changePriority = async (req, res) => {
    try {
        const existingTask = await Task.findById(req.params.id);
        if (!existingTask) {
            return res.status(404).json({ status: 'fail', message: 'No task found with that id' });
        }

        const membership = await checkProjectMembership(existingTask.project, req.user._id);
        if (!membership) {
            return res.status(403).json({ status: 'fail', message: 'You are not a member of this project' });
        }

        const { priority } = req.body;
        const allowedPriorities = ['low', 'medium', 'high', 'urgent'];

        if (!allowedPriorities.includes(priority)) {
            return res.status(400).json({ status: 'fail', message: `Priority must be one of: ${allowedPriorities.join(', ')}` });
        }

        const task = await Task.findByIdAndUpdate(
            req.params.id,
            { priority },
            { new: true, runValidators: true }
        );

        res.status(200).json({ status: 'success', data: { task } });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

exports.changeStatus = async (req, res) => {
    try {
        const existingTask = await Task.findById(req.params.id);
        if (!existingTask) {
            return res.status(404).json({ status: 'fail', message: 'No task found with that id' });
        }

        const membership = await checkProjectMembership(existingTask.project, req.user._id);
        if (!membership) {
            return res.status(403).json({ status: 'fail', message: 'You are not a member of this project' });
        }

        const { status } = req.body;
        const allowedStatuses = ['todo', 'in-progress', 'review', 'testing', 'done'];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ status: 'fail', message: `Status must be one of: ${allowedStatuses.join(', ')}` });
        }

        const task = await Task.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        );

        res.status(200).json({ status: 'success', data: { task } });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

exports.deleteTask = async (req, res) => {
    try {
        const existingTask = await Task.findById(req.params.id);
        if (!existingTask) {
            return res.status(404).json({ status: 'fail', message: 'No task found with that id' });
        }

        const membership = await checkProjectMembership(existingTask.project, req.user._id);
        if (!membership) {
            return res.status(403).json({ status: 'fail', message: 'You are not a member of this project' });
        }

        await Subtask.deleteMany({ task: req.params.id });
        await Task.findByIdAndDelete(req.params.id);

        res.status(204).json({ status: 'success', data: null });
    } catch (err) {
        res.status(500).json({ status: 'fail', message: err.message });
    }
};


exports.createSubtask = async (req, res) => {
    try {
        const { task, membership } = await checkProjectMembershipCascade(req.params.taskId, req.user._id);

        if (!task) {
            return res.status(404).json({ status: 'fail', message: 'No task found with that id' });
        }
        if (!membership) {
            return res.status(403).json({ status: 'fail', message: 'You are not a member of this project' });
        }

        const { title, assignedTo, order } = req.body;

        const subtask = await Subtask.create({
            title,
            assignedTo,
            order,
            task: req.params.taskId,
            createdBy: req.user._id
        });

        res.status(201).json({ status: 'success', data: { subtask } });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

exports.getSubtasks = async (req, res) => {
    try {
        const { task, membership } = await checkProjectMembershipCascade(req.params.taskId, req.user._id);

        if (!task) {
            return res.status(404).json({ status: 'fail', message: 'No task found with that id' });
        }
        if (!membership) {
            return res.status(403).json({ status: 'fail', message: 'You are not a member of this project' });
        }

        const subtasks = await Subtask.find({ task: req.params.taskId })
            .populate('assignedTo', 'name email')
            .sort('order');

        res.status(200).json({ status: 'success', results: subtasks.length, data: { subtasks } });
    } catch (err) {
        res.status(500).json({ status: 'fail', message: err.message });
    }
};

exports.updateSubtask = async (req, res) => {
    try {
        const existingSubtask = await Subtask.findById(req.params.subtaskId);
        if (!existingSubtask) {
            return res.status(404).json({ status: 'fail', message: 'No subtask found with that id' });
        }

        const { membership } = await checkProjectMembershipCascade(existingSubtask.task, req.user._id);
        if (!membership) {
            return res.status(403).json({ status: 'fail', message: 'You are not a member of this project' });
        }

        const allowedFields = ['title', 'assignedTo', 'order'];
        const updates = {};
        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) updates[field] = req.body[field];
        });

        const subtask = await Subtask.findByIdAndUpdate(req.params.subtaskId, updates, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ status: 'success', data: { subtask } });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

exports.completeSubtask = async (req, res) => {
    try {
        const existingSubtask = await Subtask.findById(req.params.subtaskId);
        if (!existingSubtask) {
            return res.status(404).json({ status: 'fail', message: 'No subtask found with that id' });
        }

        const { membership } = await checkProjectMembershipCascade(existingSubtask.task, req.user._id);
        if (!membership) {
            return res.status(403).json({ status: 'fail', message: 'You are not a member of this project' });
        }

        const isCompleted = req.body.isCompleted !== undefined
            ? req.body.isCompleted
            : !existingSubtask.isCompleted;

        const subtask = await Subtask.findByIdAndUpdate(
            req.params.subtaskId,
            { isCompleted },
            { new: true, runValidators: true }
        );

        res.status(200).json({ status: 'success', data: { subtask } });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

exports.deleteSubtask = async (req, res) => {
    try {
        const existingSubtask = await Subtask.findById(req.params.subtaskId);
        if (!existingSubtask) {
            return res.status(404).json({ status: 'fail', message: 'No subtask found with that id' });
        }

        const { membership } = await checkProjectMembershipCascade(existingSubtask.task, req.user._id);
        if (!membership) {
            return res.status(403).json({ status: 'fail', message: 'You are not a member of this project' });
        }

        await Subtask.findByIdAndDelete(req.params.subtaskId);

        res.status(204).json({ status: 'success', data: null });
    } catch (err) {
        res.status(500).json({ status: 'fail', message: err.message });
    }
};
const Workspace = require('../models/workspaceModel');
const WorkspaceMember = require('../models/workspaceMemberModel');
const Project = require('../models/projectModel');
const ProjectMember = require('../models/projectMemberModel');
const Task = require('../models/taskModel');
const Issue = require('../models/issueModel');
const Message = require('../models/messageModel');

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.createWorkspace = catchAsync(async (req, res, next) => {

    const { name, description } = req.body;

    const workspace = await Workspace.create({
        name,
        description,
        owner: req.user._id
    });

    // Automatically add creator as workspace owner
    await WorkspaceMember.create({
        workspace: workspace._id,
        user: req.user._id,
        role: 'owner',
        status: 'accepted'
    });

    res.status(201).json({
        status: 'success',
        data: {
            workspace
        }
    });
});

exports.getAllWorkspaces = catchAsync(async (req, res, next) => {

    // Workspaces owned by current user
    const ownedWorkspaces = await Workspace.find({
        owner: req.user._id
    });

    // Workspaces where current user is an accepted member
    const memberships = await WorkspaceMember.find({
        user: req.user._id,
        status: 'accepted'
    }).select('workspace');

    const memberWorkspaceIds = memberships.map(
        membership => membership.workspace
    );

    const memberWorkspaces = await Workspace.find({
        _id: { $in: memberWorkspaceIds },
        owner: { $ne: req.user._id }
    });

    const workspaces = [
        ...ownedWorkspaces,
        ...memberWorkspaces
    ];

    res.status(200).json({
        status: 'success',
        results: workspaces.length,
        data: {
            workspaces
        }
    });
});

exports.getWorkspace = catchAsync(async (req, res, next) => {

    const workspace = await Workspace.findById(req.params.id)
        .populate('owner', 'name email');

    if (!workspace) {
        return next(
            new AppError(
                'No workspace found with that id',
                404
            )
        );
    }

    // Check if current user is the owner
    const isOwner =
        workspace.owner._id.toString() === req.user._id.toString();

    // Check accepted membership
    const membership = await WorkspaceMember.findOne({
        workspace: workspace._id,
        user: req.user._id,
        status: 'accepted'
    });

    if (!isOwner && !membership) {
        return next(
            new AppError(
                'You do not have access to this workspace',
                403
            )
        );
    }

    res.status(200).json({
        status: 'success',
        data: {
            workspace
        }
    });
});

exports.updateWorkspace = catchAsync(async (req, res, next) => {

    const workspace = await Workspace.findById(req.params.id);

    if (!workspace) {
        return next(
            new AppError(
                'No workspace found with that id',
                404
            )
        );
    }

    // Only owner can update workspace
    if (
        workspace.owner.toString() !== req.user._id.toString()
    ) {
        return next(
            new AppError(
                'Only the workspace owner can update the workspace',
                403
            )
        );
    }

    const allowedFields = [
        'name',
        'description'
    ];

    const updates = {};

    allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
            updates[field] = req.body[field];
        }
    });

    const updatedWorkspace =
        await Workspace.findByIdAndUpdate(
            req.params.id,
            updates,
            {
                new: true,
                runValidators: true
            }
        ).populate('owner', 'name email');

    res.status(200).json({
        status: 'success',
        data: {
            workspace: updatedWorkspace
        }
    });
});

exports.deleteWorkspace = catchAsync(async (req, res, next) => {

    const workspace = await Workspace.findById(req.params.id);

    if (!workspace) {
        return next(
            new AppError(
                'No workspace found with that id',
                404
            )
        );
    }

    // Only owner can delete workspace
    if (
        workspace.owner.toString() !== req.user._id.toString()
    ) {
        return next(
            new AppError(
                'Only the workspace owner can delete the workspace',
                403
            )
        );
    }

    // await WorkspaceMember.deleteMany({ workspace: workspace._id });
    // await Project.deleteMany({ workspace: workspace._id });
    // await ProjectMember.deleteMany({ project: project._id });
    // await Task.deleteMany({ project: project._id });
    // await Issue.deleteMany({ project: project._id });
    // await Message.deleteMany({ project: project._id });

    // await Workspace.findByIdAndDelete(req.params.id);

    const projects = await Project.find({
        workspace: workspace._id
    }).select('_id');

    const projectIds = projects.map(project => project._id);

    await ProjectMember.deleteMany({
        project: { $in: projectIds }
    });

    await Task.deleteMany({
        project: { $in: projectIds }
    });

    await Issue.deleteMany({
        project: { $in: projectIds }
    });

    await Message.deleteMany({
        project: { $in: projectIds }
    });

    await Project.deleteMany({
        workspace: workspace._id
    });

    await WorkspaceMember.deleteMany({
        workspace: workspace._id
    });

    await Workspace.findByIdAndDelete(req.params.id);

    res.status(204).json({
        status: 'success',
        data: null
    });
});

exports.leaveWorkspace = catchAsync(async (req, res, next) => {

    const workspace = await Workspace.findById(req.params.id);

    if (!workspace) {
        return next(
            new AppError(
                'No workspace found with that id',
                404
            )
        );
    }

    // Owner cannot leave the workspace
    if (
        workspace.owner.toString() === req.user._id.toString()
    ) {
        return next(
            new AppError(
                'Workspace owner cannot leave the workspace. Transfer ownership or delete the workspace.',
                400
            )
        );
    }

    const membership = await WorkspaceMember.findOne({
        workspace: workspace._id,
        user: req.user._id,
        status: 'accepted'
    });

    if (!membership) {
        return next(
            new AppError(
                'You are not a member of this workspace',
                404
            )
        );
    }

    await WorkspaceMember.findByIdAndDelete(
        membership._id
    );

    res.status(204).json({
        status: 'success',
        data: null
    });
});
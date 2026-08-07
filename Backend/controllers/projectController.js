const Project = require('../models/projectModel');
const Workspace = require('../models/workspaceModel');
const WorkspaceMember = require('../models/workspaceMemberModel');
const ProjectMember = require('../models/projectMemberModel');

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const checkWorkspaceMembership = async (workspaceId, userId) => {
    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) return null;

    if (workspace.owner.toString() === userId.toString()) {
        return {
            role: 'owner',
            isOwner: true
        };
    }

    const membership = await WorkspaceMember.findOne({
        workspace: workspaceId,
        user: userId,
        status: 'accepted'
    });

    if (!membership) return null;

    return {
        role: membership.role,
        isOwner: false
    };
};

exports.createProject = catchAsync(async (req, res, next) => {

    const { workspaceId } = req.params;

    const membership = await checkWorkspaceMembership(
        workspaceId,
        req.user._id
    );

    if (!membership) {
        return next(
            new AppError(
                'You are not a member of this workspace',
                403
            )
        );
    }

    if (!['owner', 'admin'].includes(membership.role)) {
        return next(
            new AppError(
                'Only workspace owner/admin can create projects',
                403
            )
        );
    }

    const {
        name,
        description,
        status,
        startDate,
        deadline
    } = req.body;

    const project = await Project.create({
        workspace: workspaceId,
        name,
        description,
        status,
        startDate,
        deadline,
        createdBy: req.user._id
    });

    await ProjectMember.create({
        project: project._id,
        user: req.user._id,
        role: 'project_manager',
        status: 'accepted'
    });

    res.status(201).json({
        status: 'success',
        data: {
            project
        }
    });
});

exports.getAllProjects = catchAsync(async (req, res, next) => {

    const ownedWorkspaces = await Workspace.find({
        owner: req.user._id
    }).select('_id');

    const memberships = await WorkspaceMember.find({
        user: req.user._id,
        status: 'accepted'
    }).select('workspace');

    const workspaceIds = [
        ...ownedWorkspaces.map(workspace => workspace._id),
        ...memberships.map(member => member.workspace)
    ];

    const uniqueWorkspaceIds = [
        ...new Set(
            workspaceIds.map(id => id.toString())
        )
    ];

    const projects = await Project.find({
        workspace: {
            $in: uniqueWorkspaceIds
        }
    })
        .populate('workspace', 'name')
        .populate('createdBy', 'name email');

    res.status(200).json({
        status: 'success',
        results: projects.length,
        data: {
            projects
        }
    });
});

exports.getProject = catchAsync(async (req, res, next) => {

    const project = await Project.findById(req.params.id)
        .populate('workspace', 'name owner')
        .populate('createdBy', 'name email');

    if (!project) {
        return next(
            new AppError(
                'No project found with that id',
                404
            )
        );
    }

    const membership = await checkWorkspaceMembership(
        project.workspace._id,
        req.user._id
    );

    if (!membership) {
        return next(
            new AppError(
                'You do not have access to this project',
                403
            )
        );
    }

    res.status(200).json({
        status: 'success',
        data: {
            project
        }
    });
});

exports.updateProject = catchAsync(async (req, res, next) => {

    const project = await Project.findById(req.params.id);

    if (!project) {
        return next(
            new AppError(
                'No project found with that id',
                404
            )
        );
    }

    const membership = await checkWorkspaceMembership(
        project.workspace,
        req.user._id
    );

    if (!membership) {
        return next(
            new AppError(
                'You do not have access to this project',
                403
            )
        );
    }

    // Only workspace owner/admin can update project
    if (!['owner', 'admin'].includes(membership.role)) {
        return next(
            new AppError(
                'Only workspace owner/admin can update projects',
                403
            )
        );
    }

    const allowedFields = [
        'name',
        'description',
        'status',
        'startDate',
        'deadline'
    ];

    const updates = {};

    allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
            updates[field] = req.body[field];
        }
    });

    const updatedProject = await Project.findByIdAndUpdate(
        req.params.id,
        updates,
        {
            new: true,
            runValidators: true
        }
    )
        .populate('workspace', 'name')
        .populate('createdBy', 'name email');

    res.status(200).json({
        status: 'success',
        data: {
            project: updatedProject
        }
    });
});

exports.deleteProject = catchAsync(async (req, res, next) => {

    const project = await Project.findById(req.params.id);

    if (!project) {
        return next(
            new AppError(
                'No project found with that id',
                404
            )
        );
    }

    const membership = await checkWorkspaceMembership(
        project.workspace,
        req.user._id
    );

    if (!membership) {
        return next(
            new AppError(
                'You do not have access to this project',
                403
            )
        );
    }

    if (membership.role !== 'owner') {
        return next(
            new AppError(
                'Only workspace owner can delete projects',
                403
            )
        );
    }

    await ProjectMember.deleteMany({
        project: project._id
    });

    await Project.findByIdAndDelete(req.params.id);

    res.status(204).json({
        status: 'success',
        data: null
    });
});
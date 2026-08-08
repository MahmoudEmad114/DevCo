const ProjectMember = require('../models/projectMemberModel');
const WorkspaceMember = require('../models/workspaceMemberModel');
const Workspace = require('../models/workspaceModel');

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const checkWorkspaceMembership = async (workspaceId, userId) => {
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) return null;

    if (workspace.owner.toString() === userId.toString()) {
        return {
            role: 'owner',
            isRealOwner: true
        };
    }

    return await WorkspaceMember.findOne({
        workspace: workspaceId,
        user: userId,
        status: 'accepted'
    });

};

const checkProjectMembershipAccepted = async (projectId, userId) => {
    return await ProjectMember.findOne({
        project: projectId,
        user: userId,
        status: 'accepted'
    });
};

exports.inviteToWorkspace = catchAsync(async (req, res, next) => {

    const inviterMembership = await checkWorkspaceMembership(
        req.params.workspaceId,
        req.user._id
    );

    if (!inviterMembership || !['owner', 'admin'].includes(inviterMembership.role)) {
        return next(
            new AppError(
                'Only owner/admin can invite members',
                403
            )
        );
    }
    const { userId } = req.body;

    if (!userId) {
        return next(
            new AppError(
                'userId is required',
                400
            )
        );
    }

    const existing = await WorkspaceMember.findOne({
        workspace: req.params.workspaceId,
        user: userId
    });

    if (existing) {
        return next(
            new AppError(
                `User already has status: ${existing.status} in this workspace`,
                400
            )
        );
    }

    const invite = await WorkspaceMember.create({
        workspace: req.params.workspaceId,
        user: userId,
        role: 'member',
        status: 'pending'
    });

    res.status(201).json({
        status: 'success',
        data: {
            invite
        }
    });

});

exports.acceptWorkspaceInvite = catchAsync(async (req, res, next) => {
    const membership = await WorkspaceMember.findOne({
        workspace: req.params.workspaceId,
        user: req.user._id,
        status: 'pending'
    });

    if (!membership) {
        return next(
            new AppError(
                'No pending invite found for this workspace',
                404
            )
        );
    }

    membership.status = 'accepted';
    membership.joinedAt = Date.now();

    await membership.save();

    res.status(200).json({
        status: 'success',
        data: {
            membership
        }
    });

});

exports.rejectWorkspaceInvite = catchAsync(async (req, res, next) => {

    const membership = await WorkspaceMember.findOne({
        workspace: req.params.workspaceId,
        user: req.user._id,
        status: 'pending'
    });

    if (!membership) {
        return next(
            new AppError(
                'No pending invite found for this workspace',
                404
            )
        );
    }

    membership.status = 'rejected';
    await membership.save();
    res.status(200).json({
        status: 'success',
        data: {
            membership
        }
    });

});

exports.removeWorkspaceMember = catchAsync(async (req, res, next) => {
    const requesterMembership = await checkWorkspaceMembership(
        req.params.workspaceId,
        req.user._id
    );
    if (!requesterMembership || !['owner', 'admin'].includes(requesterMembership.role)) {
        return next(
            new AppError(
                'Only owner/admin can remove members',
                403
            )
        );
    }

    const targetMembership = await WorkspaceMember.findOne({
        workspace: req.params.workspaceId,
        user: req.params.userId
    });

    if (!targetMembership) {
        return next(
            new AppError(
                'Member not found in this workspace',
                404
            )
        );
    }

    if (targetMembership.role === 'owner') {
        return next(
            new AppError(
                'Workspace owner cannot be removed',
                400
            )
        );
    }

    await WorkspaceMember.findByIdAndDelete(targetMembership._id);

    res.status(204).json({
        status: 'success',
        data: null
    });

});

exports.changeWorkspaceRole = catchAsync(async (req, res, next) => {

    const requesterMembership = await checkWorkspaceMembership(
        req.params.workspaceId,
        req.user._id
    );

    if (!requesterMembership || requesterMembership.role !== 'owner') {
        return next(
            new AppError(
                'Only the owner can change roles',
                403
            )
        );
    }

    const { role } = req.body;

    const allowedRoles = [
        'admin',
        'member'
    ];

    if (!allowedRoles.includes(role)) {
        return next(
            new AppError(
                `Role must be one of: ${allowedRoles.join(', ')}`,
                400
            )
        );
    }

    const targetMembership = await WorkspaceMember.findOneAndUpdate(
        {
            workspace: req.params.workspaceId,
            user: req.params.userId
        },
        {
            role
        },
        {
            new: true,
            runValidators: true
        }
    );

    if (!targetMembership) {
        return next(
            new AppError(
                'Member not found in this workspace',
                404
            )
        );
    }

    res.status(200).json({
        status: 'success',
        data: {
            membership: targetMembership
        }
    });

});

exports.getWorkspaceMembers = catchAsync(async (req, res, next) => {

    const membership = await checkWorkspaceMembership(
        req.params.workspaceId,
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

    const members = await WorkspaceMember.find({
        workspace: req.params.workspaceId,
        status: 'accepted'
    })
        .populate('user', 'name email')
        .sort('role');

    res.status(200).json({
        status: 'success',
        results: members.length,
        data: {
            members
        }
    });

});

exports.inviteToProject = catchAsync(async (req, res, next) => {

    const inviterMembership = await checkProjectMembershipAccepted(
        req.params.projectId,
        req.user._id
    );

    if (
        !inviterMembership ||
        inviterMembership.role !== 'project_manager'
    ) {
        return next(
            new AppError(
                'Only the project manager can invite members',
                403
            )
        );
    }

    const { userId } = req.body;

    if (!userId) {
        return next(
            new AppError(
                'userId is required',
                400
            )
        );
    }

    const existing = await ProjectMember.findOne({
        project: req.params.projectId,
        user: userId
    });

    if (existing) {
        return next(
            new AppError(
                `User already has status: ${existing.status} in this project`,
                400
            )
        );
    }

    const invite = await ProjectMember.create({
        project: req.params.projectId,
        user: userId,
        role: 'member',
        status: 'pending'
    });

    res.status(201).json({
        status: 'success',
        data: {
            invite
        }
    });

});

exports.acceptProjectInvite = catchAsync(async (req, res, next) => {

    const membership = await ProjectMember.findOne({
        project: req.params.projectId,
        user: req.user._id,
        status: 'pending'
    });

    if (!membership) {
        return next(
            new AppError(
                'No pending invite found for this project',
                404
            )
        );
    }

    membership.status = 'accepted';
    membership.joinedAt = Date.now();

    await membership.save();

    res.status(200).json({
        status: 'success',
        data: {
            membership
        }
    });

});

exports.rejectProjectInvite = catchAsync(async (req, res, next) => {

    const membership = await ProjectMember.findOne({
        project: req.params.projectId,
        user: req.user._id,
        status: 'pending'
    });

    if (!membership) {
        return next(
            new AppError(
                'No pending invite found for this project',
                404
            )
        );
    }

    membership.status = 'rejected';

    await membership.save();

    res.status(200).json({
        status: 'success',
        data: {
            membership
        }
    });

});

exports.removeProjectMember = catchAsync(async (req, res, next) => {

    const requesterMembership =
        await checkProjectMembershipAccepted(
            req.params.projectId,
            req.user._id
        );

    if (
        !requesterMembership ||
        requesterMembership.role !== 'project_manager'
    ) {
        return next(
            new AppError(
                'Only the project manager can remove members',
                403
            )
        );
    }

    const targetMembership =
        await ProjectMember.findOne({
            project: req.params.projectId,
            user: req.params.userId
        });

    if (!targetMembership) {
        return next(
            new AppError(
                'Member not found in this project',
                404
            )
        );
    }

    if (targetMembership.role === 'project_manager') {
        return next(
            new AppError(
                'Cannot remove the project manager',
                400
            )
        );
    }

    await ProjectMember.findByIdAndDelete(
        targetMembership._id
    );

    res.status(204).json({
        status: 'success',
        data: null
    });

});

exports.changeProjectRole = catchAsync(async (req, res, next) => {

    const requesterMembership =
        await checkProjectMembershipAccepted(
            req.params.projectId,
            req.user._id
        );

    if (
        !requesterMembership ||
        requesterMembership.role !== 'project_manager'
    ) {
        return next(
            new AppError(
                'Only the project manager can change roles',
                403
            )
        );
    }

    const { role } = req.body;

    const allowedRoles = [
        'developer',
        'tester',
        'member'
    ];

    if (!allowedRoles.includes(role)) {
        return next(
            new AppError(
                `Role must be one of: ${allowedRoles.join(', ')}`,
                400
            )
        );
    }

    const targetMembership =
        await ProjectMember.findOneAndUpdate(
            {
                project: req.params.projectId,
                user: req.params.userId
            },
            {
                role
            },
            {
                new: true,
                runValidators: true
            }
        );

    if (!targetMembership) {
        return next(
            new AppError(
                'Member not found in this project',
                404
            )
        );
    }

    res.status(200).json({
        status: 'success',
        data: {
            membership: targetMembership
        }
    });

});

exports.getProjectMembers = catchAsync(async (req, res, next) => {

    const membership =
        await checkProjectMembershipAccepted(
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

    const members = await ProjectMember.find({
        project: req.params.projectId,
        status: 'accepted'
    })
        .populate('user', 'name email')
        .sort('role');

    res.status(200).json({
        status: 'success',
        results: members.length,
        data: {
            members
        }
    });

});
const ProjectMember = require('../models/projectMemberModel');
const WorkspaceMember = require('../models/workspaceMemberModel');
const Workspace = require('../models/workspaceModel');
const Project = require('../models/projectModel');

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const createNotification = require('../utils/notification');

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

// exports.inviteToWorkspace = catchAsync(async (req, res, next) => {

//     const inviterMembership = await checkWorkspaceMembership(
//         req.params.workspaceId,
//         req.user._id
//     );

//     if (!inviterMembership || !['owner', 'admin'].includes(inviterMembership.role)) {
//         return next(
//             new AppError(
//                 'Only owner/admin can invite members',
//                 403
//             )
//         );
//     }
//     const { userId } = req.body;

//     if (!userId) {
//         return next(
//             new AppError(
//                 'userId is required',
//                 400
//             )
//         );
//     }

//     const existing = await WorkspaceMember.findOne({
//         workspace: req.params.workspaceId,
//         user: userId
//     });

//     if (existing) {
//         return next(
//             new AppError(
//                 `User already has status: ${existing.status} in this workspace`,
//                 400
//             )
//         );
//     }

//     const invite = await WorkspaceMember.create({
//         workspace: req.params.workspaceId,
//         user: userId,
//         role: 'member',
//         status: 'accepted'
//     });

//     const workspace = await Workspace.findById(
//         req.params.workspaceId
//     );

//     if (!workspace) {
//         return next(
//             new AppError('Workspace not found', 404)
//         );
//     }



//     const io = req.app.get('io');
//     await createNotification({
//         recipient: userId,
//         sender: req.user._id,
//         type: 'workspace-added',
//         message: `You have been added to workspace "${workspace.name}"`,
//         relatedItem: workspace._id,
//         relatedItemType: 'Workspace'
//     }, io);

//     res.status(201).json({
//         status: 'success',
//         data: {
//             invite
//         }
//     });

// });

exports.inviteToWorkspace = catchAsync(async (req, res, next) => {
    // Check requester permissions
    const inviterMembership = await checkWorkspaceMembership(
        req.params.workspaceId,
        req.user._id
    );

    if (
        !inviterMembership ||
        !['owner', 'admin'].includes(inviterMembership.role)
    ) {
        return next(
            new AppError(
                'Only owner/admin can add members',
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

    // Check workspace exists
    const workspace = await Workspace.findById(
        req.params.workspaceId
    );

    if (!workspace) {
        return next(
            new AppError(
                'Workspace not found',
                404
            )
        );
    }

    // Check if user already exists in workspace
    const existing = await WorkspaceMember.findOne({
        workspace: req.params.workspaceId,
        user: userId
    });

    if (existing) {
        return next(
            new AppError(
                'User is already a member of this workspace',
                400
            )
        );
    }

    // Add user directly as accepted member
    const member = await WorkspaceMember.create({
        workspace: req.params.workspaceId,
        user: userId,
        role: 'member',
        status: 'accepted',
        joinedAt: Date.now()
    });

    // Send notification
    const io = req.app.get('io');

    await createNotification(
        {
            recipient: userId,
            sender: req.user._id,
            type: 'workspace-added',
            message: `You have been added to workspace "${workspace.name}"`,
            relatedItem: workspace._id,
            relatedItemType: 'Workspace'
        },
        io
    );

    res.status(201).json({
        status: 'success',
        data: {
            member
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

// exports.inviteToProject = catchAsync(async (req, res, next) => {

//     const inviterMembership = await checkProjectMembershipAccepted(
//         req.params.projectId,
//         req.user._id
//     );

//     if (
//         !inviterMembership ||
//         inviterMembership.role !== 'project_manager'
//     ) {
//         return next(
//             new AppError(
//                 'Only the project manager can invite members',
//                 403
//             )
//         );
//     }

//     const { userId } = req.body;

//     if (!userId) {
//         return next(
//             new AppError(
//                 'userId is required',
//                 400
//             )
//         );
//     }

//     const existing = await ProjectMember.findOne({
//         project: req.params.projectId,
//         user: userId
//     });

//     if (existing) {
//         return next(
//             new AppError(
//                 `User already has status: ${existing.status} in this project`,
//                 400
//             )
//         );
//     }

//     const invite = await ProjectMember.create({
//         project: req.params.projectId,
//         user: userId,
//         role: 'member',
//         status: 'accepted'
//     });

//     res.status(201).json({
//         status: 'success',
//         data: {
//             invite
//         }
//     });

// });

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
                'Only the project manager can add members',
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

    // Get project
    const project = await Project.findById(
        req.params.projectId
    );

    if (!project) {
        return next(
            new AppError(
                'Project not found',
                404
            )
        );
    }

    // Check that user is an accepted workspace member
    const workspaceMembership = await WorkspaceMember.findOne({
        workspace: project.workspace,
        user: userId,
        status: 'accepted'
    });

    if (!workspaceMembership) {
        return next(
            new AppError(
                'User must be a member of the workspace before being added to the project',
                400
            )
        );
    }

    // Check existing project membership
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

    const member = await ProjectMember.create({
        project: project._id,
        user: userId,
        role: 'member',
        status: 'accepted'
    });

    const io = req.app.get('io');

    await createNotification({
        recipient: userId,
        sender: req.user._id,
        type: 'project-added',
        message: `You have been added to project "${project.name}"`,
        relatedItem: project._id,
        relatedItemType: 'Project'
    }, io);

    res.status(201).json({
        status: 'success',
        data: {
            member
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
const ProjectMember = require('../models/projectMemberModel');
const WorkspaceMember = require('../models/workspaceMemberModel');
const Workspace = require('../models/workspaceModel');


const checkWorkspaceMembership = async (workspaceId, userId) => {
    const workspace = await Workspace.findById(workspaceId);
    if (workspace && workspace.owner.toString() === userId.toString()) {
        return { role: 'owner', isRealOwner: true };
    }

    const membership = await WorkspaceMember.findOne({
        workspace: workspaceId,
        user: userId,
        status: 'accepted'
    });
    return membership;
};

const checkProjectMembershipAccepted = async (projectId, userId) => {
    return await ProjectMember.findOne({
        project: projectId,
        user: userId,
        status: 'accepted'
    });
};


exports.inviteToWorkspace = async (req, res) => {
    try {
        const inviterMembership = await checkWorkspaceMembership(req.params.workspaceId, req.user._id);
        if (!inviterMembership || !['owner', 'admin'].includes(inviterMembership.role)) {
            return res.status(403).json({ status: 'fail', message: 'Only owner/admin can invite members' });
        }

        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({ status: 'fail', message: 'userId is required' });
        }

        const existing = await WorkspaceMember.findOne({ workspace: req.params.workspaceId, user: userId });
        if (existing) {
            return res.status(400).json({ status: 'fail', message: `User already has status: ${existing.status} in this workspace` });
        }

        const invite = await WorkspaceMember.create({
            workspace: req.params.workspaceId,
            user: userId,
            status: 'pending'
        });

        res.status(201).json({ status: 'success', data: { invite } });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};


exports.acceptWorkspaceInvite = async (req, res) => {
    try {
        const membership = await WorkspaceMember.findOne({
            workspace: req.params.workspaceId,
            user: req.user._id,
            status: 'pending'
        });

        if (!membership) {
            return res.status(404).json({ status: 'fail', message: 'No pending invite found for this workspace' });
        }

        membership.status = 'accepted';
        await membership.save();

        res.status(200).json({ status: 'success', data: { membership } });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};


exports.rejectWorkspaceInvite = async (req, res) => {
    try {
        const membership = await WorkspaceMember.findOne({
            workspace: req.params.workspaceId,
            user: req.user._id,
            status: 'pending'
        });

        if (!membership) {
            return res.status(404).json({ status: 'fail', message: 'No pending invite found for this workspace' });
        }

        membership.status = 'rejected';
        await membership.save();

        res.status(200).json({ status: 'success', data: { membership } });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};


exports.removeWorkspaceMember = async (req, res) => {
    try {
        const requesterMembership = await checkWorkspaceMembership(req.params.workspaceId, req.user._id);
        if (!requesterMembership || !['owner', 'admin'].includes(requesterMembership.role)) {
            return res.status(403).json({ status: 'fail', message: 'Only owner/admin can remove members' });
        }

        const targetMembership = await WorkspaceMember.findOne({
            workspace: req.params.workspaceId,
            user: req.params.userId
        });

        if (!targetMembership) {
            return res.status(404).json({ status: 'fail', message: 'Member not found in this workspace' });
        }

        if (targetMembership.role === 'owner') {
            return res.status(400).json({ status: 'fail', message: 'Cannot remove the workspace owner' });
        }

        await WorkspaceMember.findByIdAndDelete(targetMembership._id);

        res.status(204).json({ status: 'success', data: null });
    } catch (err) {
        res.status(500).json({ status: 'fail', message: err.message });
    }
};

exports.changeWorkspaceRole = async (req, res) => {
    try {
        const requesterMembership = await checkWorkspaceMembership(req.params.workspaceId, req.user._id);
        if (!requesterMembership || requesterMembership.role !== 'owner') {
            return res.status(403).json({ status: 'fail', message: 'Only the owner can change roles' });
        }

        const { role } = req.body;
        const allowedRoles = ['owner', 'admin', 'member'];
        if (!allowedRoles.includes(role)) {
            return res.status(400).json({ status: 'fail', message: `Role must be one of: ${allowedRoles.join(', ')}` });
        }

        const targetMembership = await WorkspaceMember.findOneAndUpdate(
            { workspace: req.params.workspaceId, user: req.params.userId },
            { role },
            { new: true, runValidators: true }
        );

        if (!targetMembership) {
            return res.status(404).json({ status: 'fail', message: 'Member not found in this workspace' });
        }

        res.status(200).json({ status: 'success', data: { membership: targetMembership } });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};


exports.getWorkspaceMembers = async (req, res) => {
    try {
        const membership = await checkWorkspaceMembership(req.params.workspaceId, req.user._id);
        if (!membership) {
            return res.status(403).json({ status: 'fail', message: 'You are not a member of this workspace' });
        }

        const members = await WorkspaceMember.find({
            workspace: req.params.workspaceId,
            status: 'accepted'
        }).populate('user', 'name email');

        res.status(200).json({ status: 'success', results: members.length, data: { members } });
    } catch (err) {
        res.status(500).json({ status: 'fail', message: err.message });
    }
};


exports.inviteToProject = async (req, res) => {
    try {
        const inviterMembership = await checkProjectMembershipAccepted(req.params.projectId, req.user._id);
        if (!inviterMembership || inviterMembership.role !== 'project_manager') {
            return res.status(403).json({ status: 'fail', message: 'Only the project manager can invite members' });
        }

        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({ status: 'fail', message: 'userId is required' });
        }

        const existing = await ProjectMember.findOne({ project: req.params.projectId, user: userId });
        if (existing) {
            return res.status(400).json({ status: 'fail', message: `User already has status: ${existing.status} in this project` });
        }

        const invite = await ProjectMember.create({
            project: req.params.projectId,
            user: userId,
            status: 'pending'
        });

        res.status(201).json({ status: 'success', data: { invite } });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};


exports.acceptProjectInvite = async (req, res) => {
    try {
        const membership = await ProjectMember.findOne({
            project: req.params.projectId,
            user: req.user._id,
            status: 'pending'
        });

        if (!membership) {
            return res.status(404).json({ status: 'fail', message: 'No pending invite found for this project' });
        }

        membership.status = 'accepted';
        await membership.save();

        res.status(200).json({ status: 'success', data: { membership } });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};


exports.rejectProjectInvite = async (req, res) => {
    try {
        const membership = await ProjectMember.findOne({
            project: req.params.projectId,
            user: req.user._id,
            status: 'pending'
        });

        if (!membership) {
            return res.status(404).json({ status: 'fail', message: 'No pending invite found for this project' });
        }

        membership.status = 'rejected';
        await membership.save();

        res.status(200).json({ status: 'success', data: { membership } });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};


exports.removeProjectMember = async (req, res) => {
    try {
        const requesterMembership = await checkProjectMembershipAccepted(req.params.projectId, req.user._id);
        if (!requesterMembership || requesterMembership.role !== 'project_manager') {
            return res.status(403).json({ status: 'fail', message: 'Only the project manager can remove members' });
        }

        const targetMembership = await ProjectMember.findOne({
            project: req.params.projectId,
            user: req.params.userId
        });

        if (!targetMembership) {
            return res.status(404).json({ status: 'fail', message: 'Member not found in this project' });
        }

        await ProjectMember.findByIdAndDelete(targetMembership._id);


        res.status(204).json({ status: 'success', data: null });
    } catch (err) {
        res.status(500).json({ status: 'fail', message: err.message });
    }
};


exports.changeProjectRole = async (req, res) => {
    try {
        const requesterMembership = await checkProjectMembershipAccepted(req.params.projectId, req.user._id);
        if (!requesterMembership || requesterMembership.role !== 'project_manager') {
            return res.status(403).json({ status: 'fail', message: 'Only the project manager can change roles' });
        }

        const { role } = req.body;
        const allowedRoles = ['project_manager', 'developer', 'tester', 'member'];
        if (!allowedRoles.includes(role)) {
            return res.status(400).json({ status: 'fail', message: `Role must be one of: ${allowedRoles.join(', ')}` });
        }

        const targetMembership = await ProjectMember.findOneAndUpdate(
            { project: req.params.projectId, user: req.params.userId },
            { role },
            { new: true, runValidators: true }
        );

        if (!targetMembership) {
            return res.status(404).json({ status: 'fail', message: 'Member not found in this project' });
        }

        res.status(200).json({ status: 'success', data: { membership: targetMembership } });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};


exports.getProjectMembers = async (req, res) => {
    try {
        const membership = await checkProjectMembershipAccepted(req.params.projectId, req.user._id);
        if (!membership) {
            return res.status(403).json({ status: 'fail', message: 'You are not a member of this project' });
        }

        const members = await ProjectMember.find({
            project: req.params.projectId,
            status: 'accepted'
        }).populate('user', 'name email');

        res.status(200).json({ status: 'success', results: members.length, data: { members } });
    } catch (err) {
        res.status(500).json({ status: 'fail', message: err.message });
    }
};
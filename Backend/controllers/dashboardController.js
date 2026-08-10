const Project = require('../models/projectModel');
const ProjectMember = require('../models/projectMemberModel');
const WorkspaceMember = require('../models/workspaceMemberModel');
const Task = require('../models/taskModel');
const Issue = require('../models/issueModel');

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getDashboard = catchAsync(async (req, res, next) => {
    const userId = req.user._id;

    const workspaceMemberships = await WorkspaceMember.find({
        user: userId,
        status: 'accepted'
    }).select('workspace');

    const workspaceIds = workspaceMemberships.map(
        membership => membership.workspace
    );

    const projectMemberships = await ProjectMember.find({
        user: userId,
        status: 'accepted'
    }).select('project');

    const projectIds = projectMemberships.map(
        membership => membership.project
    );

    const [
        totalWorkspaces,
        totalProjects,
        totalTasks,
        assignedTasks,
        totalIssues,
        assignedIssues
    ] = await Promise.all([

        WorkspaceMember.countDocuments({
            user: userId,
            status: 'accepted'
        }),

        ProjectMember.countDocuments({
            user: userId,
            status: 'accepted'
        }),

        Task.countDocuments({
            project: { $in: projectIds }
        }),

        Task.countDocuments({
            project: { $in: projectIds },
            assignedTo: userId
        }),

        Issue.countDocuments({
            project: { $in: projectIds }
        }),

        Issue.countDocuments({
            project: { $in: projectIds },
            assignedTo: userId
        })

    ]);

    const taskStats = await Task.aggregate([
        {
            $match: {
                project: { $in: projectIds }
            }
        },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 }
            }
        }
    ]);


    const tasksByStatus = {
        todo: 0,
        'in-progress': 0,
        review: 0,
        testing: 0,
        done: 0
    };

    taskStats.forEach(stat => {
        tasksByStatus[stat._id] = stat.count;
    });

    const issueStats = await Issue.aggregate([
        {
            $match: {
                project: { $in: projectIds }
            }
        },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 }
            }
        }
    ]);


    const issuesByStatus = {
        open: 0,
        'in-progress': 0,
        resolved: 0,
        closed: 0
    };

    issueStats.forEach(stat => {
        issuesByStatus[stat._id] = stat.count;
    });


    const recentTasks = await Task.find({
        project: { $in: projectIds }
    })
        .populate('project', 'name')
        .populate('assignedTo', 'name email')
        .sort('-createdAt')
        .limit(5);
    const recentIssues = await Issue.find({
        project: { $in: projectIds }
    })
        .populate('project', 'name')
        .populate('assignedTo', 'name email')
        .populate('reportedBy', 'name email')
        .sort('-createdAt')
        .limit(5);

    res.status(200).json({
        status: 'success',

        data: {
            overview: {
                totalWorkspaces,
                totalProjects,
                totalTasks,
                assignedTasks,
                totalIssues,
                assignedIssues
            },

            tasks: {
                byStatus: tasksByStatus
            },

            issues: {
                byStatus: issuesByStatus
            },

            recentTasks,

            recentIssues
        }
    });
});
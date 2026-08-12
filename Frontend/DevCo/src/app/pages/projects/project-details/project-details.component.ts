import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { ProjectService } from '../../../core/services/project.service';
import { MemberService } from '../../../core/services/member.service';
import { UserService } from '../../../core/services/user.service';
import { TaskService } from '../../../core/services/task.service';
import { IssueService } from '../../../core/services/issue.service';

import { Project } from '../../../core/models/project.model';
import { ProjectMember } from '../../../core/models/project-member.model';
import { User } from '../../../core/models/user.model';

import {
  Task,
  TaskPriority,
  TaskStatus
} from '../../../core/models/task.model';

import {
  Issue,
  IssuePriority,
  IssueSeverity,
  IssueStatus
} from '../../../core/models/issue.model';

@Component({
  selector: 'app-project-details',
  templateUrl: './project-details.component.html',
  styleUrls: ['./project-details.component.css']
})
export class ProjectDetailsComponent implements OnInit {

  // =========================
  // Project
  // =========================

  project: Project | null = null;

  isLoading = false;
  errorMessage = '';

  // =========================
  // Project Members
  // =========================

  members: ProjectMember[] = [];

  isMembersLoading = false;
  membersError = '';

  // =========================
  // Invite Modal
  // =========================

  showInviteModal = false;

  isInviting = false;

  inviteError = '';
  inviteSuccess = '';

  searchQuery = '';
  searchResults: User[] = [];

  isSearching = false;

  selectedUser: User | null = null;

  // =========================
  // Tasks
  // =========================

  tasks: Task[] = [];

  isTasksLoading = false;
  tasksError = '';

  // =========================
  // Create Task Modal
  // =========================

  showCreateTaskModal = false;

  isCreatingTask = false;

  taskError = '';
  taskSuccess = '';

  newTask = {
    title: '',
    description: '',
    assignedTo: '',
    priority: 'medium' as TaskPriority,
    dueDate: ''
  };

  // =========================
  // Issues
  // =========================

  issues: Issue[] = [];

  isIssuesLoading = false;
  issuesError = '';

  // =========================
  // Create Issue Modal
  // =========================

  showCreateIssueModal = false;

  isCreatingIssue = false;

  issueError = '';
  issueSuccess = '';

  newIssue = {
    title: '',
    description: '',
    assignedTo: '',
    priority: 'medium' as IssuePriority,
    severity: 'major' as IssueSeverity
  };

  // =========================
  // Constructor
  // =========================

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private memberService: MemberService,
    private userService: UserService,
    private taskService: TaskService,
    private issueService: IssueService,
    
  ) {}

  // =========================
  // Init
  // =========================

  ngOnInit(): void {
    this.loadProject();
  }

  // =========================
  // Load Project
  // =========================

  loadProject(): void {

    const projectId =
      this.route.snapshot.paramMap.get('id');

    if (!projectId) {
      this.errorMessage = 'Project ID is missing.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.projectService
      .getProject(projectId)
      .subscribe({

        next: (response) => {

          this.project =
            response.data.project;

          this.isLoading = false;

          this.loadProjectMembers();
          this.loadTasks();
          this.loadIssues();
        },

        error: (error) => {

          this.isLoading = false;

          this.errorMessage =
            error?.error?.message ||
            'Failed to load project.';
        }

      });
  }

  // =========================
  // Load Project Members
  // =========================

  loadProjectMembers(): void {

    if (!this.project) {
      return;
    }

    this.isMembersLoading = true;
    this.membersError = '';

    this.memberService
      .getProjectMembers(this.project._id)
      .subscribe({

        next: (response) => {

          this.members =
            response.data.members;

          this.isMembersLoading = false;
        },

        error: (error) => {

          this.isMembersLoading = false;

          this.membersError =
            error?.error?.message ||
            'Failed to load project members.';
        }

      });
  }

  // =========================
  // Load Tasks
  // =========================

  loadTasks(): void {

    if (!this.project) {
      return;
    }

    this.isTasksLoading = true;
    this.tasksError = '';

    this.taskService
      .getTasksByProject(this.project._id)
      .subscribe({

        next: (response) => {

          this.tasks =
            response.data.tasks;

          this.isTasksLoading = false;
        },

        error: (error) => {

          this.isTasksLoading = false;

          this.tasksError =
            error?.error?.message ||
            'Failed to load project tasks.';
        }

      });
  }

  // =========================
  // Load Issues
  // =========================

  loadIssues(): void {

    if (!this.project) {
      return;
    }

    this.isIssuesLoading = true;
    this.issuesError = '';

    this.issueService
      .getIssuesByProject(this.project._id)
      .subscribe({

        next: (response) => {

          this.issues =
            response.data.issues;

          this.isIssuesLoading = false;
        },

        error: (error) => {

          this.isIssuesLoading = false;

          this.issuesError =
            error?.error?.message ||
            'Failed to load project issues.';
        }

      });
  }

  // =========================
  // Create Task Modal
  // =========================

  openCreateTaskModal(): void {

    this.resetTaskForm();

    this.taskError = '';
    this.taskSuccess = '';

    this.showCreateTaskModal = true;
  }

  closeCreateTaskModal(): void {

    if (this.isCreatingTask) {
      return;
    }

    this.showCreateTaskModal = false;

    this.resetTaskForm();

    this.taskError = '';
    this.taskSuccess = '';
  }

  private resetTaskForm(): void {

    this.newTask = {
      title: '',
      description: '',
      assignedTo: '',
      priority: 'medium',
      dueDate: ''
    };
  }

  // =========================
  // Create Task
  // =========================

  createTask(): void {

    if (!this.project) {
      this.taskError = 'Project not found.';
      return;
    }

    const title =
      this.newTask.title.trim();

    if (!title) {
      this.taskError =
        'Task title is required.';
      return;
    }

    this.isCreatingTask = true;
    this.taskError = '';
    this.taskSuccess = '';

    const payload: {
      title: string;
      description?: string;
      assignedTo?: string;
      priority?: TaskPriority;
      dueDate?: string;
    } = {
      title,
      description:
        this.newTask.description.trim(),
      priority:
        this.newTask.priority
    };

    if (this.newTask.assignedTo) {
      payload.assignedTo =
        this.newTask.assignedTo;
    }

    if (this.newTask.dueDate) {
      payload.dueDate =
        this.newTask.dueDate;
    }

    this.taskService
      .createTask(
        this.project._id,
        payload
      )
      .subscribe({

        next: (response) => {

          this.isCreatingTask = false;

          this.tasks.unshift(
            response.data.task
          );

          this.taskSuccess =
            'Task created successfully.';

          setTimeout(() => {

            this.showCreateTaskModal = false;

            this.resetTaskForm();

            this.taskSuccess = '';

          }, 700);
        },

        error: (error) => {

          this.isCreatingTask = false;

          this.taskError =
            error?.error?.message ||
            'Failed to create task.';
        }

      });
  }

  // =========================
  // Task Priority Label
  // =========================

  getTaskPriorityLabel(
    priority: TaskPriority
  ): string {

    return priority.charAt(0).toUpperCase() +
      priority.slice(1);
  }

  // =========================
  // Get Assigned User
  // =========================

  getAssignedUser(
    task: Task
  ): User | null {

    if (
      !task.assignedTo ||
      typeof task.assignedTo === 'string'
    ) {
      return null;
    }

    return task.assignedTo as User;
  }

  // =========================
  // Get User Name
  // =========================

  getAssignedUserName(
    task: Task
  ): string {

    const user =
      this.getAssignedUser(task);

    return user?.name || 'Unassigned';
  }

  // =========================
  // Change Task Status
  // =========================

  changeTaskStatus(
    task: Task,
    status: TaskStatus
  ): void {

    this.taskService
      .changeStatus(
        task._id,
        status
      )
      .subscribe({

        next: (response) => {

          const index =
            this.tasks.findIndex(
              item =>
                item._id === task._id
            );

          if (index !== -1) {

            this.tasks[index] =
              response.data.task;
          }
        },

        error: (error) => {

          this.tasksError =
            error?.error?.message ||
            'Failed to update task status.';
        }

      });
  }

  // =========================
  // Open Task Details
  // =========================

  openTaskDetails(
    taskId: string
  ): void {

    this.router.navigate([
      '/tasks',
      taskId
    ]);
  }

  // =========================
  // Invite Modal
  // =========================

  openInviteModal(): void {

    this.searchQuery = '';
    this.searchResults = [];

    this.selectedUser = null;

    this.inviteError = '';
    this.inviteSuccess = '';

    this.isSearching = false;
    this.isInviting = false;

    this.showInviteModal = true;
  }

  closeInviteModal(): void {

    if (this.isInviting) {
      return;
    }

    this.showInviteModal = false;

    this.searchQuery = '';
    this.searchResults = [];

    this.selectedUser = null;

    this.inviteError = '';
    this.inviteSuccess = '';

    this.isSearching = false;
  }

  searchUsers(): void {

    const query =
      this.searchQuery.trim();

    this.searchResults = [];
    this.selectedUser = null;
    this.inviteError = '';

    if (query.length < 2) {

      this.isSearching = false;

      return;
    }

    this.isSearching = true;

    this.userService
      .searchUsers(query)
      .subscribe({

        next: (response) => {

          this.searchResults =
            response.data.users;

          this.isSearching = false;
        },

        error: (error) => {

          this.isSearching = false;

          this.inviteError =
            error?.error?.message ||
            'Failed to search users.';
        }

      });
  }

  selectUser(user: User): void {

    this.selectedUser = user;

    this.searchQuery = user.name;

    this.searchResults = [];

    this.inviteError = '';
  }

  inviteProjectMember(): void {

    if (!this.project) {
      this.inviteError =
        'Project not found.';
      return;
    }

    if (!this.selectedUser) {

      this.inviteError =
        'Please select a user first.';

      return;
    }

    this.isInviting = true;

    this.inviteError = '';
    this.inviteSuccess = '';

    const userName =
      this.selectedUser.name;

    this.memberService
      .inviteToProject(
        this.project._id,
        this.selectedUser._id
      )
      .subscribe({

        next: () => {

          this.isInviting = false;

          this.inviteSuccess =
            `Invitation sent to ${userName}.`;

          this.selectedUser = null;

          this.searchQuery = '';
          this.searchResults = [];

          setTimeout(() => {

            this.showInviteModal = false;

            this.inviteSuccess = '';

            this.loadProjectMembers();

          }, 1000);
        },

        error: (error) => {

          this.isInviting = false;

          this.inviteError =
            error?.error?.message ||
            'Failed to send invitation.';
        }

      });
  }

  // =========================
  // Issues
  // =========================

  openCreateIssueModal(): void {

    this.resetIssueForm();

    this.issueError = '';
    this.issueSuccess = '';

    this.showCreateIssueModal = true;
  }

  closeCreateIssueModal(): void {

    if (this.isCreatingIssue) {
      return;
    }

    this.showCreateIssueModal = false;

    this.resetIssueForm();

    this.issueError = '';
    this.issueSuccess = '';
  }

  private resetIssueForm(): void {

    this.newIssue = {
      title: '',
      description: '',
      assignedTo: '',
      priority: 'medium',
      severity: 'major'
    };
  }

  // =========================
  // Create Issue
  // =========================

  createIssue(): void {

    if (!this.project) {
      this.issueError =
        'Project not found.';
      return;
    }

    const title =
      this.newIssue.title.trim();

    if (!title) {
      this.issueError =
        'Issue title is required.';
      return;
    }

    this.isCreatingIssue = true;

    this.issueError = '';
    this.issueSuccess = '';

    const payload: {
      title: string;
      description?: string;
      project: string;
      assignedTo?: string;
      priority?: IssuePriority;
      severity?: IssueSeverity;
    } = {

      title,

      description:
        this.newIssue.description.trim(),

      project:
        this.project._id,

      priority:
        this.newIssue.priority,

      severity:
        this.newIssue.severity
    };

    if (this.newIssue.assignedTo) {

      payload.assignedTo =
        this.newIssue.assignedTo;
    }

    this.issueService
      .createIssue(payload)
      .subscribe({

        next: (response) => {

          this.isCreatingIssue = false;

          this.issues.unshift(
            response.data.issue
          );

          this.issueSuccess =
            'Issue created successfully.';

          setTimeout(() => {

            this.showCreateIssueModal = false;

            this.resetIssueForm();

            this.issueSuccess = '';

          }, 800);
        },

        error: (error) => {

          this.isCreatingIssue = false;

          this.issueError =
            error?.error?.message ||
            'Failed to create issue.';
        }

      });
  }

  // =========================
  // Issue Labels
  // =========================

  getIssueStatusLabel(
    status: IssueStatus
  ): string {

    const labels: Record<IssueStatus, string> = {

      open: 'Open',

      'in-progress': 'In Progress',

      resolved: 'Resolved',

      closed: 'Closed'
    };

    return labels[status];
  }

  getIssuePriorityLabel(
    priority: IssuePriority
  ): string {

    return priority.charAt(0).toUpperCase() +
      priority.slice(1);
  }

  getIssueSeverityLabel(
    severity: IssueSeverity
  ): string {

    return severity.charAt(0).toUpperCase() +
      severity.slice(1);
  }

  // =========================
  // Issue Reporter
  // =========================

  getIssueReporter(
    issue: Issue
  ): User | null {

    if (
      !issue.reportedBy ||
      typeof issue.reportedBy === 'string'
    ) {
      return null;
    }

    return issue.reportedBy as User;
  }

  getIssueReporterName(
    issue: Issue
  ): string {

    const reporter =
      this.getIssueReporter(issue);

    return reporter?.name ||
      'Unknown Reporter';
  }

  // =========================
  // Issue Assignee
  // =========================

  getIssueAssignee(
    issue: Issue
  ): User | null {

    if (
      !issue.assignedTo ||
      typeof issue.assignedTo === 'string'
    ) {
      return null;
    }

    return issue.assignedTo as User;
  }

  getIssueAssigneeName(
    issue: Issue
  ): string {

    const assignee =
      this.getIssueAssignee(issue);

    return assignee?.name ||
      'Unassigned';
  }

  // =========================
  // Open Issue Details
  // =========================

  openIssueDetails(
    issueId: string
  ): void {

    this.router.navigate([
      '/issues',
      issueId
    ]);
  }

  // =========================
  // Back To Workspace
  // =========================

  goBack(): void {

    const workspaceId =
      this.getWorkspaceId();

    if (workspaceId) {

      this.router.navigate([
        '/workspaces',
        workspaceId
      ]);

      return;
    }

    this.router.navigate([
      '/workspaces'
    ]);
  }

  // =========================
  // Get Workspace ID
  // =========================

  private getWorkspaceId(): string | null {

    if (!this.project) {
      return null;
    }

    if (
      typeof this.project.workspace === 'string'
    ) {
      return this.project.workspace;
    }

    return this.project.workspace._id;
  }

  openProjectChat(): void {
  if (!this.project?._id) {
    return;
  }

  this.router.navigate([
    '/projects',
    this.project._id,
    'chat'
  ]);
}
}
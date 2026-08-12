import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { WorkspaceService } from '../../../core/services/workspace.service';
import { MemberService } from '../../../core/services/member.service';

import { Workspace } from '../../../core/models/workspace.model';
import {
  WorkspaceMember
} from '../../../core/models/workspace-member.model';

import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/models/user.model';

import { ProjectService } from '../../../core/services/project.service';
import { Project } from '../../../core/models/project.model';

@Component({
  selector: 'app-workspace-details',
  templateUrl: './workspace-details.component.html',
  styleUrls: ['./workspace-details.component.css']
})
export class WorkspaceDetailsComponent implements OnInit {

  workspace: Workspace | null = null;

  members: WorkspaceMember[] = [];
  projects: Project[] = [];

isProjectsLoading = false;
projectsError = '';

showCreateProjectModal = false;

isCreatingProject = false;
createProjectError = '';
createProjectSuccess = '';

newProject = {
  name: '',
  description: '',
  status: 'planning' as Project['status'],
  startDate: '',
  deadline: ''
};

  searchQuery = '';

searchResults: User[] = [];

selectedUser: User | null = null;

isSearching = false;

  isLoading = false;
  isMembersLoading = false;

  errorMessage = '';
  membersError = '';

  showInviteModal = false;


  isInviting = false;
  inviteError = '';
  inviteSuccess = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private workspaceService: WorkspaceService,
    private memberService: MemberService,
    private userService: UserService,
    private projectService: ProjectService
  ) {}

  ngOnInit(): void {
    this.loadWorkspace();
  }

  loadWorkspace(): void {

    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.errorMessage = 'Workspace ID is missing.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.workspaceService.getWorkspace(id)
      .subscribe({

        next: (response) => {

          this.workspace = response.data.workspace;

          this.isLoading = false;

          this.loadMembers();
          this.loadProjects();

        },

        error: (error) => {

          this.isLoading = false;

          this.errorMessage =
            error?.error?.message ||
            'Failed to load workspace.';

        }

      });
  }

  loadMembers(): void {

    if (!this.workspace) {
      return;
    }

    this.isMembersLoading = true;
    this.membersError = '';

    this.memberService
      .getWorkspaceMembers(this.workspace._id)
      .subscribe({

        next: (response) => {

          this.members = response.data.members;

          this.isMembersLoading = false;

        },

        error: (error) => {

          this.isMembersLoading = false;

          this.membersError =
            error?.error?.message ||
            'Failed to load workspace members.';

        }

      });
  }

  loadProjects(): void {

  if (!this.workspace) {
    return;
  }

  this.isProjectsLoading = true;
  this.projectsError = '';

  this.projectService
    .getAllProjects()
    .subscribe({

      next: (response) => {

        this.projects = response.data.projects
          .filter(project => {

            const workspace =
              typeof project.workspace === 'string'
                ? project.workspace
                : project.workspace._id;

            return workspace === this.workspace?._id;
          });

        this.isProjectsLoading = false;
      },

      error: (error) => {

        this.isProjectsLoading = false;

        this.projectsError =
          error?.error?.message ||
          'Failed to load projects.';
      }

    });
}

  openInviteModal(): void {

  this.searchQuery = '';

  this.searchResults = [];

  this.selectedUser = null;

  this.inviteError = '';

  this.inviteSuccess = '';

  this.showInviteModal = true;
}

  closeInviteModal(): void {

    if (this.isInviting) {
      return;
    }

    this.showInviteModal = false;
  }

  inviteMember(): void {

  if (!this.workspace) {
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

  this.memberService
    .inviteToWorkspace(
      this.workspace._id,
      this.selectedUser._id
    )
    .subscribe({

      next: () => {

        this.isInviting = false;

        this.inviteSuccess =
          `Invitation sent to ${this.selectedUser?.name}.`;

        this.selectedUser = null;
        this.searchQuery = '';
        this.searchResults = [];

        setTimeout(() => {

          this.showInviteModal = false;
          this.inviteSuccess = '';

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

  searchUsers(): void {

  const query = this.searchQuery.trim();

  this.searchResults = [];
  this.selectedUser = null;

  if (query.length < 2) {
    return;
  }

  this.isSearching = true;

  this.userService
    .searchUsers(query)
    .subscribe({

      next: (response) => {

        this.searchResults = response.data.users;

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

openCreateProjectModal(): void {

  this.newProject = {
    name: '',
    description: '',
    status: 'planning',
    startDate: '',
    deadline: ''
  };

  this.createProjectError = '';
  this.createProjectSuccess = '';

  this.showCreateProjectModal = true;
}

closeCreateProjectModal(): void {

  if (this.isCreatingProject) {
    return;
  }

  this.showCreateProjectModal = false;
}

createProject(): void {

  if (!this.workspace) {
    return;
  }

  if (!this.newProject.name.trim()) {

    this.createProjectError =
      'Project name is required.';

    return;
  }

  if (!this.newProject.startDate) {

    this.createProjectError =
      'Start date is required.';

    return;
  }

  if (!this.newProject.deadline) {

    this.createProjectError =
      'Deadline is required.';

    return;
  }

  if (
    new Date(this.newProject.deadline) <=
    new Date(this.newProject.startDate)
  ) {

    this.createProjectError =
      'Deadline must be after start date.';

    return;
  }

  this.isCreatingProject = true;
  this.createProjectError = '';
  this.createProjectSuccess = '';

  this.projectService
    .createProject(
      this.workspace._id,
      this.newProject
    )
    .subscribe({

      next: (response) => {

        this.isCreatingProject = false;

        this.createProjectSuccess =
          'Project created successfully.';

        this.projects.unshift(
          response.data.project
        );

        setTimeout(() => {

          this.showCreateProjectModal = false;
          this.createProjectSuccess = '';

        }, 1000);
      },

      error: (error) => {

        this.isCreatingProject = false;

        this.createProjectError =
          error?.error?.message ||
          'Failed to create project.';
      }

    });
}

openProject(projectId: string): void {
  this.router.navigate(['/projects', projectId]);
}

  goBack(): void {
    this.router.navigate(['/workspaces']);
  }
}
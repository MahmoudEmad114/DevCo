import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { WorkspaceService } from '../../../core/services/workspace.service';
import { Workspace } from '../../../core/models/workspace.model';

@Component({
  selector: 'app-workspace-details',
  templateUrl: './workspace-details.component.html',
  styleUrls: ['./workspace-details.component.css']
})
export class WorkspaceDetailsComponent implements OnInit {

  workspace: Workspace | null = null;

  isLoading = false;
  errorMessage = '';

  // Search users
  searchKeyword = '';
  users: any[] = [];
  isSearching = false;
  searchError = '';

  // Selected user
  selectedUser: any = null;

  // Invite
  isInviting = false;
  inviteMessage = '';
  inviteError = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private workspaceService: WorkspaceService
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

    this.workspaceService.getWorkspace(id)
      .subscribe({

        next: (response) => {
          this.workspace = response.data.workspace;
          this.isLoading = false;
        },

        error: (error) => {
          this.isLoading = false;

          this.errorMessage =
            error?.error?.message ||
            'Failed to load workspace.';
        }

      });
  }

  searchUsers(): void {

    if (!this.searchKeyword.trim()) {
      this.users = [];
      this.searchError = '';
      return;
    }

    this.isSearching = true;
    this.searchError = '';
    this.selectedUser = null;

    this.workspaceService
      .searchUsers(this.searchKeyword.trim())
      .subscribe({

        next: (response) => {

          this.users = response.data.users || [];
          this.isSearching = false;

        },

        error: (error) => {

          this.isSearching = false;

          this.searchError =
            error?.error?.message ||
            'Failed to search users.';

          this.users = [];
        }

      });
  }

  selectUser(user: any): void {
    this.selectedUser = user;
    this.inviteMessage = '';
    this.inviteError = '';
  }

  inviteMember(): void {

    const workspaceId =
      this.route.snapshot.paramMap.get('id');

    if (!workspaceId) {
      this.inviteError = 'Workspace ID is missing.';
      return;
    }

    if (!this.selectedUser) {
      this.inviteError = 'Please select a user first.';
      return;
    }

    this.isInviting = true;
    this.inviteMessage = '';
    this.inviteError = '';

    this.workspaceService
      .inviteToWorkspace(
        workspaceId,
        this.selectedUser._id
      )
      .subscribe({

        next: () => {

          this.isInviting = false;

          this.inviteMessage =
            'Invitation sent successfully!';

          this.selectedUser = null;
          this.searchKeyword = '';
          this.users = [];
        },

        error: (error) => {

          this.isInviting = false;

          this.inviteError =
            error?.error?.message ||
            'Failed to send invitation.';
        }

      });
  }

  goBack(): void {
    this.router.navigate(['/workspaces']);
  }

}
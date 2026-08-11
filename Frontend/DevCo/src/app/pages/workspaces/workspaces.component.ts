import { Component, OnInit } from '@angular/core';

import { WorkspaceService } from '../../core/services/workspace.service';
import { Workspace } from '../../core/models/workspace.model';

@Component({
  selector: 'app-workspaces',
  templateUrl: './workspaces.component.html',
  styleUrls: ['./workspaces.component.css']
})
export class WorkspacesComponent implements OnInit {

  workspaces: Workspace[] = [];

  isLoading = false;
  errorMessage = '';

  showCreateModal = false;

  workspaceName = '';
  workspaceDescription = '';

  isCreating = false;
  createError = '';

  constructor(
    private workspaceService: WorkspaceService
  ) {}

  ngOnInit(): void {
    this.loadWorkspaces();
  }

  loadWorkspaces(): void {

    this.isLoading = true;
    this.errorMessage = '';

    this.workspaceService.getWorkspaces()
      .subscribe({

        next: (response) => {

          this.workspaces = response.data.workspaces;

          this.isLoading = false;
        },

        error: (error) => {

          this.isLoading = false;

          this.errorMessage =
            error?.error?.message ||
            'Failed to load workspaces.';
        }

      });
  }

  openCreateModal(): void {
  this.workspaceName = '';
  this.workspaceDescription = '';
  this.createError = '';
  this.showCreateModal = true;
}

closeCreateModal(): void {
  if (this.isCreating) {
    return;
  }

  this.showCreateModal = false;
}

createWorkspace(): void {

  if (!this.workspaceName.trim()) {
    this.createError = 'Workspace name is required.';
    return;
  }

  this.isCreating = true;
  this.createError = '';

  this.workspaceService.createWorkspace(
    this.workspaceName.trim(),
    this.workspaceDescription.trim()
  ).subscribe({

    next: (response) => {

      this.workspaces.unshift(
        response.data.workspace
      );

      this.isCreating = false;
      this.showCreateModal = false;

    },

    error: (error) => {

      this.isCreating = false;

      this.createError =
        error?.error?.message ||
        'Failed to create workspace.';
    }

  });
}

}
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

  goBack(): void {
    this.router.navigate(['/workspaces']);
  }

}
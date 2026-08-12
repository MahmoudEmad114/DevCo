import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { ProjectService } from '../../core/services/project.service';
import { Project } from '../../core/models/project.model';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent implements OnInit {

  projects: Project[] = [];

  isLoading = false;
  errorMessage = '';

  constructor(
    private projectService: ProjectService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {

    this.isLoading = true;
    this.errorMessage = '';

    this.projectService.getAllProjects().subscribe({

      next: (response) => {
        this.projects = response.data.projects;
        this.isLoading = false;
      },

      error: (error) => {
        this.isLoading = false;

        this.errorMessage =
          error?.error?.message ||
          'Failed to load projects.';
      }

    });
  }

  openProject(projectId: string): void {
    this.router.navigate(['/projects', projectId]);
  }
}
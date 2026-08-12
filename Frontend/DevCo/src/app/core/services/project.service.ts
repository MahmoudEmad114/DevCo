import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from './api.service';

import {
  Project,
  ProjectResponse,
  ProjectsResponse
} from '../models/project.model';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  constructor(
    private api: ApiService
  ) {}
  
  getAllProjects(): Observable<ProjectsResponse> {

    return this.api.get<ProjectsResponse>(
      '/projects'
    );
  }

  getProject(
    projectId: string
  ): Observable<ProjectResponse> {

    return this.api.get<ProjectResponse>(
      `/projects/${projectId}`
    );
  }

  createProject(
    workspaceId: string,
    project: {
      name: string;
      description?: string;
      status?: Project['status'];
      startDate: string;
      deadline: string;
    }
  ): Observable<ProjectResponse> {

    return this.api.post<ProjectResponse>(
      `/projects/workspace/${workspaceId}`,
      project
    );
  }

  updateProject(
    projectId: string,
    updates: Partial<{
      name: string;
      description: string;
      status: Project['status'];
      startDate: string;
      deadline: string;
    }>
  ): Observable<ProjectResponse> {

    return this.api.patch<ProjectResponse>(
      `/projects/${projectId}`,
      updates
    );
  }

  deleteProject(
    projectId: string
  ): Observable<void> {

    return this.api.delete<void>(
      `/projects/${projectId}`
    );
  }

}
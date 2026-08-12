import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Project, CreateProjectDto, UpdateProjectDto } from '../models/project.model';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  private baseUrl = 'http://localhost:3000/api/v1/projects';

  constructor(private http: HttpClient) {}

  getAllProjects(): Observable<Project[]> {
    return this.http
      .get<{ data: { projects: Project[] } }>(this.baseUrl)
      .pipe(map(res => res.data.projects));
  }

  getProjectsByWorkspace(workspaceId: string): Observable<Project[]> {
    return this.http
      .get<{ data: { projects: Project[] } }>(`${this.baseUrl}/workspace/${workspaceId}`)
      .pipe(map(res => res.data.projects));
  }

  getProject(id: string): Observable<Project> {
    return this.http
      .get<{ data: { project: Project } }>(`${this.baseUrl}/${id}`)
      .pipe(map(res => res.data.project));
  }

  createProject(workspaceId: string, dto: CreateProjectDto): Observable<Project> {
    return this.http
      .post<{ data: { project: Project } }>(`${this.baseUrl}/workspace/${workspaceId}`, dto)
      .pipe(map(res => res.data.project));
  }

  updateProject(id: string, dto: UpdateProjectDto): Observable<Project> {
    return this.http
      .patch<{ data: { project: Project } }>(`${this.baseUrl}/${id}`, dto)
      .pipe(map(res => res.data.project));
  }

  deleteProject(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
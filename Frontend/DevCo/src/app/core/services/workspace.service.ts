import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from './api.service';
import {
  Workspace,
  WorkspaceResponse,
  WorkspacesResponse
} from '../models/workspace.model';

@Injectable({
  providedIn: 'root'
})
export class WorkspaceService {

  constructor(private api: ApiService) {}

  getWorkspaces(): Observable<WorkspacesResponse> {
    return this.api.get<WorkspacesResponse>(
      '/workspaces'
    );
  }

  getWorkspace(id: string): Observable<WorkspaceResponse> {
    return this.api.get<WorkspaceResponse>(
      `/workspaces/${id}`
    );
  }

  createWorkspace(
    name: string,
    description: string
  ): Observable<WorkspaceResponse> {

    return this.api.post<WorkspaceResponse>(
      '/workspaces',
      {
        name,
        description
      }
    );
  }

  updateWorkspace(
    id: string,
    data: {
      name?: string;
      description?: string;
    }
  ): Observable<WorkspaceResponse> {

    return this.api.patch<WorkspaceResponse>(
      `/workspaces/${id}`,
      data
    );
  }

  deleteWorkspace(id: string): Observable<any> {
    return this.api.delete(
      `/workspaces/${id}`
    );
  }

   leaveWorkspace(id: string): Observable<any> {
    return this.api.delete(
      `/workspaces/${id}/leave`
    );
  }
  searchUsers(keyword: string): Observable<any> {
  return this.api.get(
    `/users/search?keyword=${encodeURIComponent(keyword)}`
  );
}

  inviteToWorkspace(
    workspaceId: string,
    userId: string
  ): Observable<any> {
    return this.api.post<any>(
      `/workspaces/${workspaceId}/invite`,
      { userId }
    );
  }
}
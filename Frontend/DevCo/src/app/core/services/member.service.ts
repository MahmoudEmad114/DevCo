import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from './api.service';

import {
  WorkspaceMembersResponse,
  WorkspaceInviteResponse,
  WorkspaceMembershipResponse
} from '../models/workspace-member.model';

import {
  ProjectMembersResponse,
  ProjectInviteResponse,
  ProjectMembershipResponse
} from '../models/project-member.model';

@Injectable({
  providedIn: 'root'
})
export class MemberService {

  constructor(
    private api: ApiService
  ) {}

  inviteToWorkspace(
    workspaceId: string,
    userId: string
  ): Observable<WorkspaceInviteResponse> {

    return this.api.post<WorkspaceInviteResponse>(
      `/members/workspaces/${workspaceId}/invite`,
      {
        userId
      }
    );
  }

  acceptWorkspaceInvite(
    workspaceId: string
  ): Observable<WorkspaceMembershipResponse> {

    return this.api.patch<WorkspaceMembershipResponse>(
      `/members/workspaces/${workspaceId}/invite/accept`,
      {}
    );
  }

  rejectWorkspaceInvite(
    workspaceId: string
  ): Observable<WorkspaceMembershipResponse> {

    return this.api.patch<WorkspaceMembershipResponse>(
      `/members/workspaces/${workspaceId}/invite/reject`,
      {}
    );
  }

  getWorkspaceMembers(
    workspaceId: string
  ): Observable<WorkspaceMembersResponse> {

    return this.api.get<WorkspaceMembersResponse>(
      `/members/workspaces/${workspaceId}/members`
    );
  }

  removeWorkspaceMember(
    workspaceId: string,
    userId: string
  ): Observable<any> {

    return this.api.delete(
      `/members/workspaces/${workspaceId}/members/${userId}`
    );
  }

  changeWorkspaceRole(
    workspaceId: string,
    userId: string,
    role: 'admin' | 'member'
  ): Observable<WorkspaceMembershipResponse> {

    return this.api.patch<WorkspaceMembershipResponse>(
      `/members/workspaces/${workspaceId}/members/${userId}/role`,
      {
        role
      }
    );
  }

  // =========================
// Project Members
// =========================

inviteToProject(
  projectId: string,
  userId: string
): Observable<ProjectInviteResponse> {

  return this.api.post<ProjectInviteResponse>(
    `/members/projects/${projectId}/invite`,
    {
      userId
    }
  );
}


acceptProjectInvite(
  projectId: string
): Observable<ProjectMembershipResponse> {

  return this.api.patch<ProjectMembershipResponse>(
    `/members/projects/${projectId}/invite/accept`,
    {}
  );
}


rejectProjectInvite(
  projectId: string
): Observable<ProjectMembershipResponse> {

  return this.api.patch<ProjectMembershipResponse>(
    `/members/projects/${projectId}/invite/reject`,
    {}
  );
}


getProjectMembers(
  projectId: string
): Observable<ProjectMembersResponse> {

  return this.api.get<ProjectMembersResponse>(
    `/members/projects/${projectId}/members`
  );
}


removeProjectMember(
  projectId: string,
  userId: string
): Observable<void> {

  return this.api.delete<void>(
    `/members/projects/${projectId}/members/${userId}`
  );
}


changeProjectRole(
  projectId: string,
  userId: string,
  role: 'developer' | 'tester' | 'member'
): Observable<ProjectMembershipResponse> {

  return this.api.patch<ProjectMembershipResponse>(
    `/members/projects/${projectId}/members/${userId}/role`,
    {
      role
    }
  );
}
}
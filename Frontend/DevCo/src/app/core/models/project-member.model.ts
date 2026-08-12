export type ProjectMemberRole =
  | 'project_manager'
  | 'developer'
  | 'tester'
  | 'member';

export type ProjectMemberStatus =
  | 'pending'
  | 'accepted'
  | 'rejected';

export interface ProjectMemberUser {
  _id: string;
  name: string;
  email: string;
  photo?: string;
}

export interface ProjectMember {
  _id: string;
  project: string;
  user: ProjectMemberUser;
  role: ProjectMemberRole;
  status: ProjectMemberStatus;
  joinedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMembersResponse {
  status: string;
  results: number;
  data: {
    members: ProjectMember[];
  };
}

export interface ProjectInviteResponse {
  status: string;
  data: {
    invite: ProjectMember;
  };
}

export interface ProjectMembershipResponse {
  status: string;
  data: {
    membership: ProjectMember;
  };
}
export type WorkspaceMemberRole =
  | 'owner'
  | 'admin'
  | 'member';

export type WorkspaceMemberStatus =
  | 'pending'
  | 'accepted'
  | 'rejected';

export interface WorkspaceMemberUser {
  _id: string;
  name: string;
  email: string;
  photo?: string;
}

export interface WorkspaceMember {
  _id: string;
  workspace: string;
  user: WorkspaceMemberUser;
  role: WorkspaceMemberRole;
  status: WorkspaceMemberStatus;
  joinedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceMembersResponse {
  status: string;
  results: number;
  data: {
    members: WorkspaceMember[];
  };
}

export interface WorkspaceInviteResponse {
  status: string;
  data: {
    invite: WorkspaceMember;
  };
}

export interface WorkspaceMembershipResponse {
  status: string;
  data: {
    membership: WorkspaceMember;
  };
}
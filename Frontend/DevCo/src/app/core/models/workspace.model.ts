export interface WorkspaceOwner {
  _id: string;
  name: string;
  email: string;
}

export interface Workspace {
  _id: string;
  name: string;
  description: string;
  owner: string | WorkspaceOwner;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceResponse {
  status: string;
  data: {
    workspace: Workspace;
  };
}

export interface WorkspacesResponse {
  status: string;
  results: number;
  data: {
    workspaces: Workspace[];
  };
}
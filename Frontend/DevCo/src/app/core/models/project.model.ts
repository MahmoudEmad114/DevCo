export type ProjectStatus =
  | 'planning'
  | 'active'
  | 'on_hold'
  | 'completed'
  | 'archived';

export interface ProjectWorkspace {
  _id: string;
  name: string;
  owner?: string;
}

export interface ProjectCreator {
  _id: string;
  name: string;
  email: string;
}

export interface Project {
  _id: string;
  workspace: string | ProjectWorkspace;
  name: string;
  description: string;
  status: ProjectStatus;
  startDate: string;
  deadline: string;
  createdBy: string | ProjectCreator;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProjectDto {
  name: string;
  description?: string;
  status?: ProjectStatus;
  startDate: string;
  deadline: string;
}

export interface UpdateProjectDto {
  name?: string;
  description?: string;
  status?: ProjectStatus;
  startDate?: string;
  deadline?: string;
}
export type ProjectStatus =
  | 'planning'
  | 'active'
  | 'on_hold'
  | 'completed'
  | 'archived';

export interface Project {
  _id: string;

  workspace: string | {
    _id: string;
    name: string;
    owner?: string;
  };

  name: string;

  description: string;

  status: ProjectStatus;

  startDate: string;

  deadline: string;

  createdBy: string | {
    _id: string;
    name: string;
    email: string;
  };

  createdAt: string;

  updatedAt: string;
}

export interface ProjectResponse {
  status: string;
  data: {
    project: Project;
  };
}

export interface ProjectsResponse {
  status: string;
  results: number;
  data: {
    projects: Project[];
  };
}
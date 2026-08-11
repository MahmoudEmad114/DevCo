export interface DashboardOverview {
  totalWorkspaces: number;
  totalProjects: number;
  totalTasks: number;
  assignedTasks: number;
  totalIssues: number;
  assignedIssues: number;
}

export interface TaskStatusStats {
  todo: number;
  'in-progress': number;
  review: number;
  testing: number;
  done: number;
}

export interface IssueStatusStats {
  open: number;
  'in-progress': number;
  resolved: number;
  closed: number;
}

export interface DashboardTask {
  _id: string;
  title: string;
  status: string;
  priority: string;
  project: {
    _id: string;
    name: string;
  };
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

export interface DashboardIssue {
  _id: string;
  title: string;
  status: string;
  priority: string;
  severity: string;
  project: {
    _id: string;
    name: string;
  };
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
  };
  reportedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

export interface DashboardData {
  overview: DashboardOverview;

  tasks: {
    byStatus: TaskStatusStats;
  };

  issues: {
    byStatus: IssueStatusStats;
  };

  recentTasks: DashboardTask[];

  recentIssues: DashboardIssue[];
}

export interface DashboardResponse {
  status: string;
  data: DashboardData;
}
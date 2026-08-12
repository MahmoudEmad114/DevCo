export type IssueStatus =
  | 'open'
  | 'in-progress'
  | 'resolved'
  | 'closed';

export type IssuePriority =
  | 'low'
  | 'medium'
  | 'high'
  | 'urgent';

export type IssueSeverity =
  | 'minor'
  | 'major'
  | 'critical'
  | 'blocker';

export interface IssueUser {
  _id: string;
  name: string;
  email: string;
  photo?: string;
}

export interface IssueProject {
  _id: string;
  name: string;
}

export interface Issue {
  _id: string;

  title: string;

  description: string;

  project: string | IssueProject;

  reportedBy: string | IssueUser;

  assignedTo?: string | IssueUser | null;

  status: IssueStatus;

  priority: IssuePriority;

  severity: IssueSeverity;

  createdAt: string;

  updatedAt: string;
}

export interface IssuesResponse {
  status: string;
  results?: number;

  data: {
    issues: Issue[];
  };
}

export interface IssueResponse {
  status: string;

  data: {
    issue: Issue;
  };
}
export type TaskStatus =
  | 'todo'
  | 'in-progress'
  | 'review'
  | 'testing'
  | 'done';

export type TaskPriority =
  | 'low'
  | 'medium'
  | 'high'
  | 'urgent';

export interface TaskUser {
  _id: string;
  name: string;
  email: string;
  photo?: string;
}

export interface TaskProject {
  _id: string;
  name: string;
}

export interface Task {
  _id: string;

  title: string;

  description: string;

  labels: string[];

  project: string | TaskProject;

  createdBy: string | TaskUser;

  assignedTo?: string | TaskUser;

  status: TaskStatus;

  priority: TaskPriority;

  dueDate?: string;

  createdAt: string;

  updatedAt: string;
}

export interface TaskResponse {
  status: string;

  data: {
    task: Task;
  };
}

export interface TasksResponse {
  status: string;

  results: number;

  data: {
    tasks: Task[];
  };
}
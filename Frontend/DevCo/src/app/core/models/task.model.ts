export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'testing' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  _id: string;
  title: string;
  description?: string;
  labels?: string[];
  project: string;
  createdBy: string;
  assignedTo?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  labels?: string[];
  assignedTo?: string;
  priority?: TaskPriority;
  dueDate?: string;
}

export interface Subtask {
  _id: string;
  title: string;
  task: string;
  createdBy: string;
  assignedTo?: string;
  isCompleted: boolean;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSubtaskDto {
  title: string;
  assignedTo?: string;
  order?: number;
}
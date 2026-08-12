export type NotificationType =
  | 'workspace-added'
  | 'project-added'
  | 'task-assigned'
  | 'issue-assigned';

export type NotificationRelatedItem =
  | 'Workspace'
  | 'Project'
  | 'Task'
  | 'Issue'
  | 'Comment';

export interface Notification {
  _id: string;

  recipient: string;

  sender?: {
    _id: string;
    name: string;
    email?: string;
  };

  type: NotificationType;

  message: string;

  relatedItem?: string;

  relatedItemType?: NotificationRelatedItem;

  isRead: boolean;

  createdAt: string;

  updatedAt: string;
}

export interface NotificationsResponse {
  status: string;
  results: number;
  data: {
    notifications: Notification[];
  };
}

export interface NotificationResponse {
  status: string;
  data: {
    notification: Notification;
  };
}
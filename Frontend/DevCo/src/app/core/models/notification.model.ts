export interface Notification {
    _id: string;
    recipient: string;
    sender?: string;
    type:
        | 'task-assigned'
        | 'issue-assigned'
        | 'comment-added'
        | 'mention'
        | 'status-changed'
        | 'workspace-invitation';
    message: string;
    relatedItem?: string;
    relatedItemType?: 'Task' | 'Issue' | 'Comment' | 'Project';
    isRead: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Issue {
    _id: string;
    title: string;
    description: string;
    project: string;
    reportedBy: string;
    assignedTo?: string;
    status: 'open' | 'in-progress' | 'resolved' | 'closed';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    severity: 'minor' | 'major' | 'critical' | 'blocker';
    createdAt: string;
    updatedAt: string;
}

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from './api.service';
import { Issue } from '../models/issue.model';

@Injectable({
    providedIn: 'root',
})
export class IssueService {
    constructor(private api: ApiService) {}

getAllIssues(): Observable<{
    status: string;
    results: number;
    data: { issues: Issue[] };
}> {
    return this.api.get('/issues');
}

getIssue(id: string): Observable<{ status: string; data: { issue: Issue } }> {
    return this.api.get(`/issues/${id}`);
}

createIssue(
    data: Partial<Issue>,
): Observable<{ status: string; data: { issue: Issue } }> {
    return this.api.post('/issues', data);
}

updateIssue(
    id: string,
    data: Partial<Issue>,
): Observable<{ status: string; data: { issue: Issue } }> {
    return this.api.patch(`/issues/${id}`, data);
}

deleteIssue(id: string): Observable<any> {
    return this.api.delete(`/issues/${id}`);
}

assignIssue(
    id: string,
    assignedTo: string,
): Observable<{ status: string; data: { issue: Issue } }> {
    return this.api.patch(`/issues/${id}/assign`, { assignedTo });
}

changeIssueStatus(
    id: string,
    status: string,
): Observable<{ status: string; data: { issue: Issue } }> {
    return this.api.patch(`/issues/${id}/status`, { status });
}
}

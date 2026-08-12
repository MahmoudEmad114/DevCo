import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from './api.service';

import {
  Issue,
  IssuesResponse,
  IssueResponse,
  IssueStatus,
  IssuePriority,
  IssueSeverity
} from '../models/issue.model';

@Injectable({
  providedIn: 'root'
})
export class IssueService {

  constructor(
    private api: ApiService
  ) {}

  // =========================
  // Get All Issues
  // =========================

  getAllIssues(): Observable<IssuesResponse> {
    return this.api.get<IssuesResponse>(
      '/issues'
    );
  }

  // =========================
  // Get Issues By Project
  // =========================

  getIssuesByProject(
    projectId: string
  ): Observable<IssuesResponse> {

    return this.api.get<IssuesResponse>(
      `/issues?project=${projectId}`
    );
  }

  // =========================
  // Get Single Issue
  // =========================

  getIssue(
    issueId: string
  ): Observable<IssueResponse> {

    return this.api.get<IssueResponse>(
      `/issues/${issueId}`
    );
  }

  // =========================
  // Create Issue
  // =========================

  createIssue(data: {
    title: string;
    description?: string;
    project: string;
    assignedTo?: string;
    priority?: IssuePriority;
    severity?: IssueSeverity;
  }): Observable<IssueResponse> {

    return this.api.post<IssueResponse>(
      '/issues',
      data
    );
  }

  // =========================
  // Update Issue
  // =========================

  updateIssue(
    issueId: string,
    data: Partial<{
      title: string;
      description: string;
      assignedTo: string;
      priority: IssuePriority;
      severity: IssueSeverity;
      status: IssueStatus;
    }>
  ): Observable<IssueResponse> {

    return this.api.patch<IssueResponse>(
      `/issues/${issueId}`,
      data
    );
  }

  // =========================
  // Delete Issue
  // =========================

  deleteIssue(
    issueId: string
  ): Observable<any> {

    return this.api.delete<any>(
      `/issues/${issueId}`
    );
  }

  // =========================
  // Assign Issue
  // =========================

  assignIssue(
    issueId: string,
    assignedTo: string
  ): Observable<IssueResponse> {

    return this.api.patch<IssueResponse>(
      `/issues/${issueId}/assign`,
      {
        assignedTo
      }
    );
  }

  // =========================
  // Change Status
  // =========================

  changeIssueStatus(
    issueId: string,
    status: IssueStatus
  ): Observable<IssueResponse> {

    return this.api.patch<IssueResponse>(
      `/issues/${issueId}/status`,
      {
        status
      }
    );
  }
}
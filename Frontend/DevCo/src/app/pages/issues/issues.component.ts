import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { IssueService } from '../../core/services/issue.service';

import {
  Issue,
  IssueStatus,
  IssuePriority,
  IssueSeverity,
  IssueUser
} from '../../core/models/issue.model';

@Component({
  selector: 'app-issues',
  templateUrl: './issues.component.html',
  styleUrls: ['./issues.component.css']
})
export class IssueListComponent implements OnInit {

  // =========================
  // Issues
  // =========================

  issues: Issue[] = [];

  // =========================
  // States
  // =========================

  isLoading = false;
  errorMessage = '';

  // =========================
  // Constructor
  // =========================

  constructor(
    private issueService: IssueService,
    private router: Router
  ) {}

  // =========================
  // Init
  // =========================

  ngOnInit(): void {
    this.loadIssues();
  }

  // =========================
  // Load Issues
  // =========================

  loadIssues(): void {

    this.isLoading = true;
    this.errorMessage = '';

    this.issueService.getAllIssues().subscribe({

      next: (response) => {

        this.issues = response.data.issues;

        this.isLoading = false;
      },

      error: (error) => {

        this.isLoading = false;

        this.errorMessage =
          error?.error?.message ||
          'Failed to load issues.';
      }

    });
  }

  // =========================
  // Open Issue Details
  // =========================

  openIssueDetails(issueId: string): void {

    this.router.navigate([
      '/issues',
      issueId
    ]);
  }

  // =========================
  // Status Label
  // =========================

  getStatusLabel(status: IssueStatus): string {

    const labels: Record<IssueStatus, string> = {

      open: 'Open',

      'in-progress': 'In Progress',

      resolved: 'Resolved',

      closed: 'Closed'

    };

    return labels[status];
  }

  // =========================
  // Priority Label
  // =========================

  getPriorityLabel(priority: IssuePriority): string {

    const labels: Record<IssuePriority, string> = {

      low: 'Low',

      medium: 'Medium',

      high: 'High',

      urgent: 'Urgent'

    };

    return labels[priority];
  }

  // =========================
  // Severity Label
  // =========================

  getSeverityLabel(severity: IssueSeverity): string {

    const labels: Record<IssueSeverity, string> = {

      minor: 'Minor',

      major: 'Major',

      critical: 'Critical',

      blocker: 'Blocker'

    };

    return labels[severity];
  }

  // =========================
  // Reporter
  // =========================

  getReporter(issue: Issue): IssueUser | null {

    if (!issue.reportedBy) {
      return null;
    }

    if (typeof issue.reportedBy === 'string') {
      return null;
    }

    return issue.reportedBy;
  }

  // =========================
  // Reporter Name
  // =========================

  getReporterName(issue: Issue): string {

    if (!issue.reportedBy) {
      return 'Unknown';
    }

    if (typeof issue.reportedBy === 'string') {
      return 'User';
    }

    return issue.reportedBy.name;
  }

  // =========================
  // Assignee
  // =========================

  getAssignee(issue: Issue): IssueUser | null {

    if (!issue.assignedTo) {
      return null;
    }

    if (typeof issue.assignedTo === 'string') {
      return null;
    }

    return issue.assignedTo;
  }

  // =========================
  // Assignee Name
  // =========================

  getAssigneeName(issue: Issue): string {

    if (!issue.assignedTo) {
      return 'Unassigned';
    }

    if (typeof issue.assignedTo === 'string') {
      return 'Assigned User';
    }

    return issue.assignedTo.name;
  }

  // =========================
  // Project Name
  // =========================

  getProjectName(issue: Issue): string {

    if (!issue.project) {
      return 'Unknown Project';
    }

    if (typeof issue.project === 'string') {
      return issue.project;
    }

    return issue.project.name;
  }

}
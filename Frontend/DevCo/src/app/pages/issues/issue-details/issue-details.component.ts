import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { IssueService } from '../../../core/services/issue.service';

import {
  Issue,
  IssueStatus,
  IssuePriority,
  IssueSeverity,
  IssueUser
} from '../../../core/models/issue.model';


@Component({
  selector: 'app-issue-details',
  templateUrl: './issue-details.component.html',
  styleUrls: ['./issue-details.component.css']
})
export class IssueDetailsComponent implements OnInit {

  issue: Issue | null = null;

  isLoading = false;

  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private issueService: IssueService
  ) {}


  ngOnInit(): void {
    this.loadIssue();
  }


  loadIssue(): void {

    const issueId = this.route.snapshot.paramMap.get('id');

    if (!issueId) {

      this.errorMessage = 'Issue ID is missing.';

      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.issueService
      .getIssue(issueId)
      .subscribe({

        next: (response) => {

          this.issue = response.data.issue;

          this.isLoading = false;
        },

        error: (error) => {

          this.isLoading = false;

          this.errorMessage =
            error?.error?.message ||
            'Failed to load issue.';
        }

      });
  }

  getProjectId(): string | null {

    if (!this.issue?.project) {
      return null;
    }

    if (typeof this.issue.project === 'string') {
      return this.issue.project;
    }

    return this.issue.project._id;
  }


  getProjectName(): string {

    if (!this.issue?.project) {
      return '';
    }

    if (typeof this.issue.project === 'string') {
      return this.issue.project;
    }

    return this.issue.project.name;
  }

  goBack(): void {

    const projectId = this.getProjectId();

    if (projectId) {

      this.router.navigate([
        '/projects',
        projectId
      ]);

      return;
    }

    this.router.navigate(['/dashboard']);
  }


  getStatusLabel(status: IssueStatus): string {

    const labels: Record<IssueStatus, string> = {

      'open': 'Open',

      'in-progress': 'In Progress',

      'resolved': 'Resolved',

      'closed': 'Closed'

    };

    return labels[status];
  }

  getPriorityLabel(priority: IssuePriority): string {

    const labels: Record<IssuePriority, string> = {

      low: 'Low',

      medium: 'Medium',

      high: 'High',

      urgent: 'Urgent'

    };

    return labels[priority];
  }

  getSeverityLabel(severity: IssueSeverity): string {

    const labels: Record<IssueSeverity, string> = {

      minor: 'Minor',

      major: 'Major',

      critical: 'Critical',

      blocker: 'Blocker'

    };

    return labels[severity];
  }

  get assignedUser(): IssueUser | null {

    if (!this.issue?.assignedTo) {
      return null;
    }

    if (typeof this.issue.assignedTo === 'string') {
      return null;
    }

    return this.issue.assignedTo;
  }

  getAssigneeName(): string {

    if (!this.issue?.assignedTo) {
      return 'Unassigned';
    }

    if (typeof this.issue.assignedTo === 'string') {
      return 'Assigned User';
    }

    return this.issue.assignedTo.name;
  }

  get reporter(): IssueUser | null {

    if (!this.issue?.reportedBy) {
      return null;
    }

    if (typeof this.issue.reportedBy === 'string') {
      return null;
    }

    return this.issue.reportedBy;
  }

  getReporterName(): string {

    if (!this.issue?.reportedBy) {
      return 'Unknown';
    }

    if (typeof this.issue.reportedBy === 'string') {
      return 'User';
    }

    return this.issue.reportedBy.name;
  }

}
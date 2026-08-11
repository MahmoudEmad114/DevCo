import { Component, OnInit } from '@angular/core';

import { IssueService } from '../../core/services/issue.service';
import { Issue } from '../../core/models/issue.model';

@Component({
  selector: 'app-issues',
  templateUrl: './issues.component.html',
  styleUrls: ['./issues.component.css'],
})
export class IssuesComponent implements OnInit {
  issues: Issue[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(private issueService: IssueService) {}

  ngOnInit(): void {
    this.loadIssues();
  }

  loadIssues(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.issueService.getAllIssues().subscribe({
      next: (response) => {
        this.issues = response.data.issues;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Failed to load issues.';
        this.isLoading = false;
      },
    });
  }

  onStatusChange(issue: Issue, newStatus: string): void {
    this.issueService.changeIssueStatus(issue._id, newStatus).subscribe({
      next: (response) => {
        issue.status = response.data.issue.status;
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Failed to update status.';
      },
    });
  }

  onDelete(issue: Issue): void {
    this.issueService.deleteIssue(issue._id).subscribe({
      next: () => {
        this.issues = this.issues.filter((i) => i._id !== issue._id);
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Failed to delete issue.';
      },
    });
  }
}

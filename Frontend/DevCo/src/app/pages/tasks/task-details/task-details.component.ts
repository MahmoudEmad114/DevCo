import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { TaskService } from '../../../core/services/task.service';

import {
  Task,
  TaskStatus,
  TaskPriority,
  TaskUser
} from '../../../core/models/task.model';

@Component({
  selector: 'app-task-details',
  templateUrl: './task-details.component.html',
  styleUrls: ['./task-details.component.css']
})
export class TaskDetailsComponent implements OnInit {

  // =========================
  // Task
  // =========================

  task: Task | null = null;

  isLoading = false;

  errorMessage = '';

  // =========================
  // Constructor
  // =========================

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private taskService: TaskService
  ) {}

  // =========================
  // Init
  // =========================

  ngOnInit(): void {
    this.loadTask();
  }

  // =========================
  // Load Task
  // =========================

  loadTask(): void {

    const taskId = this.route.snapshot.paramMap.get('id');

    if (!taskId) {

      this.errorMessage = 'Task ID is missing.';

      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.taskService
      .getTask(taskId)
      .subscribe({

        next: (response) => {

          this.task = response.data.task;

          this.isLoading = false;
        },

        error: (error) => {

          this.isLoading = false;

          this.errorMessage =
            error?.error?.message ||
            'Failed to load task.';
        }

      });
  }

  // =========================
  // Get Project ID
  // =========================

  getProjectId(): string | null {

    if (!this.task?.project) {
      return null;
    }

    if (typeof this.task.project === 'string') {
      return this.task.project;
    }

    return this.task.project._id;
  }

  // =========================
  // Get Project Name
  // =========================

  getProjectName(): string {

    if (!this.task?.project) {
      return '';
    }

    if (typeof this.task.project === 'string') {
      return this.task.project;
    }

    return this.task.project.name;
  }

  // =========================
  // Back To Project
  // =========================

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

  // =========================
  // Status Label
  // =========================

  getStatusLabel(status: TaskStatus): string {

    const labels: Record<TaskStatus, string> = {

      'todo': 'To Do',

      'in-progress': 'In Progress',

      'review': 'Review',

      'testing': 'Testing',

      'done': 'Done'

    };

    return labels[status];
  }

  // =========================
  // Priority Label
  // =========================

  getPriorityLabel(priority: TaskPriority): string {

    const labels: Record<TaskPriority, string> = {

      low: 'Low',

      medium: 'Medium',

      high: 'High',

      urgent: 'Urgent'

    };

    return labels[priority];
  }

  // =========================
  // Assigned User
  // =========================

  get assignedUser(): TaskUser | null {

    if (!this.task?.assignedTo) {
      return null;
    }

    if (typeof this.task.assignedTo === 'string') {
      return null;
    }

    return this.task.assignedTo;
  }

  // =========================
  // Assignee Name
  // =========================

  getAssigneeName(): string {

    if (!this.task?.assignedTo) {
      return 'Unassigned';
    }

    if (typeof this.task.assignedTo === 'string') {
      return 'Assigned User';
    }

    return this.task.assignedTo.name;
  }

  // =========================
  // Creator Name
  // =========================

  getCreatorName(): string {

    if (!this.task?.createdBy) {
      return 'Unknown';
    }

    if (typeof this.task.createdBy === 'string') {
      return 'User';
    }

    return this.task.createdBy.name;
  }

}
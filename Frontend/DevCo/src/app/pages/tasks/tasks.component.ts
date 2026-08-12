import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { TaskService } from '../../core/services/task.service';

import {
  Task,
  TaskPriority,
  TaskStatus,
  TaskUser
} from '../../core/models/task.model';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css']
})
export class TasksComponent implements OnInit {

  // =========================
  // Tasks
  // =========================

  tasks: Task[] = [];

  isLoading = false;
  errorMessage = '';

  // =========================
  // Constructor
  // =========================

  constructor(
    private taskService: TaskService,
    private router: Router
  ) {}

  // =========================
  // Init
  // =========================

  ngOnInit(): void {
    this.loadTasks();
  }

  // =========================
  // Load Tasks
  // =========================

  loadTasks(): void {

    this.isLoading = true;
    this.errorMessage = '';

    this.taskService.getAllTasks().subscribe({

      next: (response) => {

        this.tasks = response.data.tasks;

        this.isLoading = false;
      },

      error: (error) => {

        this.isLoading = false;

        this.errorMessage =
          error?.error?.message ||
          'Failed to load tasks.';
      }

    });
  }

  // =========================
  // Status Label
  // =========================

  getStatusLabel(status: TaskStatus): string {

    const labels: Record<TaskStatus, string> = {

      todo: 'To Do',

      'in-progress': 'In Progress',

      review: 'Review',

      testing: 'Testing',

      done: 'Done'

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

  getAssignedUser(task: Task): TaskUser | null {

    if (
      !task.assignedTo ||
      typeof task.assignedTo === 'string'
    ) {
      return null;
    }

    return task.assignedTo;
  }

  // =========================
  // Assigned User Name
  // =========================

  getAssignedUserName(task: Task): string {

    const user = this.getAssignedUser(task);

    return user?.name || 'Unassigned';
  }

  // =========================
  // Project Name
  // =========================

  getProjectName(task: Task): string {

    if (!task.project) {
      return 'Unknown Project';
    }

    if (typeof task.project === 'string') {
      return task.project;
    }

    return task.project.name;
  }

  // =========================
  // Open Task Details
  // =========================

  openTaskDetails(taskId: string): void {

    this.router.navigate([
      '/tasks',
      taskId
    ]);
  }

  // =========================
  // Back
  // =========================

  goBack(): void {

    this.router.navigate([
      '/dashboard'
    ]);
  }
}
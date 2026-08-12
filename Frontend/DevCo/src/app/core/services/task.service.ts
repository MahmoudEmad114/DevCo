import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from './api.service';

import {
  Task,
  TaskResponse,
  TasksResponse,
  TaskStatus,
  TaskPriority
} from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  constructor(
    private api: ApiService
  ) {}

  // =========================
  // Get All Tasks
  // =========================

  getAllTasks(): Observable<TasksResponse> {

    return this.api.get<TasksResponse>(
      '/tasks'
    );

  }


  // =========================
  // Get Tasks By Project
  // =========================

  getTasksByProject(
    projectId: string
  ): Observable<TasksResponse> {

    return this.api.get<TasksResponse>(
      `/tasks/project/${projectId}`
    );

  }


  // =========================
  // Get Single Task
  // =========================

  getTask(
    taskId: string
  ): Observable<TaskResponse> {

    return this.api.get<TaskResponse>(
      `/tasks/${taskId}`
    );

  }


  // =========================
  // Create Task
  // =========================

  createTask(
    projectId: string,
    task: {
      title: string;
      description?: string;
      labels?: string[];
      assignedTo?: string;
      priority?: TaskPriority;
      dueDate?: string;
    }
  ): Observable<TaskResponse> {

    return this.api.post<TaskResponse>(
      `/tasks/project/${projectId}`,
      task
    );

  }


  // =========================
  // Update Task
  // =========================

  updateTask(
    taskId: string,
    updates: Partial<{
      title: string;
      description: string;
      labels: string[];
      assignedTo: string;
      priority: TaskPriority;
      dueDate: string;
    }>
  ): Observable<TaskResponse> {

    return this.api.patch<TaskResponse>(
      `/tasks/${taskId}`,
      updates
    );

  }


  // =========================
  // Assign Task
  // =========================

  assignTask(
    taskId: string,
    assignedTo: string
  ): Observable<TaskResponse> {

    return this.api.patch<TaskResponse>(
      `/tasks/${taskId}/assign`,
      {
        assignedTo
      }
    );

  }


  // =========================
  // Change Status
  // =========================

  changeStatus(
    taskId: string,
    status: TaskStatus
  ): Observable<TaskResponse> {

    return this.api.patch<TaskResponse>(
      `/tasks/${taskId}/status`,
      {
        status
      }
    );

  }


  // =========================
  // Change Priority
  // =========================

  changePriority(
    taskId: string,
    priority: TaskPriority
  ): Observable<TaskResponse> {

    return this.api.patch<TaskResponse>(
      `/tasks/${taskId}/priority`,
      {
        priority
      }
    );

  }


  // =========================
  // Delete Task
  // =========================

  deleteTask(
    taskId: string
  ): Observable<void> {

    return this.api.delete<void>(
      `/tasks/${taskId}`
    );

  }

}
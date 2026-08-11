import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Task, Subtask, CreateTaskDto, CreateSubtaskDto, TaskStatus, TaskPriority } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
private baseUrl = 'http://localhost:3000/api/v1/tasks';
  constructor(private http: HttpClient) {}

  getAllTasks(): Observable<Task[]> {
    return this.http.get<{ data: { tasks: Task[] } }>(this.baseUrl)
      .pipe(map(res => res.data.tasks));
  }

  getTasksByProject(projectId: string): Observable<Task[]> {
    return this.http.get<{ data: { tasks: Task[] } }>(`${this.baseUrl}/project/${projectId}`)
      .pipe(map(res => res.data.tasks));
  }

  getTask(id: string): Observable<Task> {
    return this.http.get<{ data: { task: Task } }>(`${this.baseUrl}/${id}`)
      .pipe(map(res => res.data.task));
  }

  createTask(projectId: string, dto: CreateTaskDto): Observable<Task> {
    return this.http.post<{ data: { task: Task } }>(`${this.baseUrl}/project/${projectId}`, dto)
      .pipe(map(res => res.data.task));
  }

  updateTask(id: string, dto: Partial<CreateTaskDto>): Observable<Task> {
    return this.http.patch<{ data: { task: Task } }>(`${this.baseUrl}/${id}`, dto)
      .pipe(map(res => res.data.task));
  }

  assignTask(id: string, assignedTo: string): Observable<Task> {
    return this.http.patch<{ data: { task: Task } }>(`${this.baseUrl}/${id}/assign`, { assignedTo })
      .pipe(map(res => res.data.task));
  }

  changePriority(id: string, priority: TaskPriority): Observable<Task> {
    return this.http.patch<{ data: { task: Task } }>(`${this.baseUrl}/${id}/priority`, { priority })
      .pipe(map(res => res.data.task));
  }

  changeStatus(id: string, status: TaskStatus): Observable<Task> {
    return this.http.patch<{ data: { task: Task } }>(`${this.baseUrl}/${id}/status`, { status })
      .pipe(map(res => res.data.task));
  }

  deleteTask(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getSubtasks(taskId: string): Observable<Subtask[]> {
    return this.http.get<{ data: { subtasks: Subtask[] } }>(`${this.baseUrl}/${taskId}/subtasks`)
      .pipe(map(res => res.data.subtasks));
  }

  createSubtask(taskId: string, dto: CreateSubtaskDto): Observable<Subtask> {
    return this.http.post<{ data: { subtask: Subtask } }>(`${this.baseUrl}/${taskId}/subtasks`, dto)
      .pipe(map(res => res.data.subtask));
  }

  updateSubtask(taskId: string, subtaskId: string, dto: Partial<CreateSubtaskDto>): Observable<Subtask> {
    return this.http.patch<{ data: { subtask: Subtask } }>(`${this.baseUrl}/${taskId}/subtasks/${subtaskId}`, dto)
      .pipe(map(res => res.data.subtask));
  }

  completeSubtask(taskId: string, subtaskId: string, isCompleted?: boolean): Observable<Subtask> {
    const body = isCompleted !== undefined ? { isCompleted } : {};
    return this.http.patch<{ data: { subtask: Subtask } }>(`${this.baseUrl}/${taskId}/subtasks/${subtaskId}/complete`, body)
      .pipe(map(res => res.data.subtask));
  }

  deleteSubtask(taskId: string, subtaskId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${taskId}/subtasks/${subtaskId}`);
  }
}
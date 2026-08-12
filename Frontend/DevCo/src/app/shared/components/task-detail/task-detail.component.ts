import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { TaskService } from '../../../core/services/task.service';
import { MemberService, ProjectMember } from '../../../core/services/member.service';
import { Task, Subtask } from '../../../core/models/task.model';

@Component({
  selector: 'app-task-detail',
  templateUrl: './task-detail.component.html',
  styleUrls: ['./task-detail.component.css']
})
export class TaskDetailComponent implements OnChanges {
  @Input() taskId: string | null = null;
  @Input() projectId!: string;
  @Output() closed = new EventEmitter<void>();
  @Output() taskUpdated = new EventEmitter<void>();

  task: Task | null = null;
  subtasks: Subtask[] = [];
  projectMembers: ProjectMember[] = [];

  isLoading = false;
  errorMessage = '';

  newSubtaskTitle = '';
  isAddingSubtask = false;

  constructor(
    private taskService: TaskService,
    private memberService: MemberService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['taskId'] && this.taskId) {
      this.loadTaskDetails();
    }
  }

  loadTaskDetails(): void {
    if (!this.taskId) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.taskService.getTask(this.taskId).subscribe({
      next: (task) => {
        this.task = task;
        this.isLoading = false;
        this.loadSubtasks();
        this.loadProjectMembers();
      },
      error: (err) => {
        this.errorMessage = 'Failed to load task details';
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  loadSubtasks(): void {
    if (!this.taskId) return;

    this.taskService.getSubtasks(this.taskId).subscribe({
      next: (subtasks) => (this.subtasks = subtasks),
      error: (err) => console.error('Failed to load subtasks', err)
    });
  }

  loadProjectMembers(): void {
    this.memberService.getProjectMembers(this.projectId).subscribe({
      next: (members) => (this.projectMembers = members),
      error: (err) => console.error('Failed to load project members', err)
    });
  }

  getAssigneeName(): string {
    if (!this.task?.assignedTo) return 'Unassigned';
    const member = this.projectMembers.find(m => m.user._id === this.task?.assignedTo);
    return member ? member.user.name : 'Unknown';
  }

  addSubtask(): void {
    if (!this.newSubtaskTitle.trim() || !this.taskId) return;

    this.isAddingSubtask = true;

    this.taskService.createSubtask(this.taskId, { title: this.newSubtaskTitle.trim() }).subscribe({
      next: (subtask) => {
        this.subtasks.push(subtask);
        this.newSubtaskTitle = '';
        this.isAddingSubtask = false;
      },
      error: (err) => {
        this.isAddingSubtask = false;
        console.error('Failed to add subtask', err);
      }
    });
  }

  toggleSubtaskComplete(subtask: Subtask): void {
    if (!this.taskId) return;

    const newValue = !subtask.isCompleted;
    subtask.isCompleted = newValue; // Optimistic update

    this.taskService.completeSubtask(this.taskId, subtask._id, newValue).subscribe({
      error: (err) => {
        subtask.isCompleted = !newValue; // رجّع القيمة القديمة لو فشل
        console.error('Failed to update subtask', err);
      }
    });
  }

  deleteSubtask(subtask: Subtask): void {
    if (!this.taskId) return;

    this.taskService.deleteSubtask(this.taskId, subtask._id).subscribe({
      next: () => {
        this.subtasks = this.subtasks.filter(s => s._id !== subtask._id);
      },
      error: (err) => console.error('Failed to delete subtask', err)
    });
  }

  close(): void {
    this.closed.emit();
  }
}
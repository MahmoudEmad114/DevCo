import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TaskService } from '../../../core/services/task.service';
import { CreateTaskDto, TaskPriority } from '../../../core/models/task.model';

@Component({
  selector: 'app-create-task-modal',
  templateUrl: './create-task-modal.component.html',
  styleUrls: ['./create-task-modal.component.css']
})
export class CreateTaskModalComponent {
  @Input() projectId!: string;
  @Input() projectMembers: { _id: string; name: string }[] = [];
  @Output() taskCreated = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  title = '';
  description = '';
  assignedTo = '';
  priority: TaskPriority = 'medium';
  dueDate = '';
  labelsInput = '';

  errorMessage = '';
  isSubmitting = false;

  constructor(private taskService: TaskService) {}

  submit(): void {
    if (!this.title.trim()) {
      this.errorMessage = 'Title is required';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const dto: CreateTaskDto = {
      title: this.title.trim(),
      description: this.description.trim() || undefined,
      assignedTo: this.assignedTo || undefined,
      priority: this.priority,
      dueDate: this.dueDate || undefined,
      labels: this.labelsInput
        ? this.labelsInput.split(',').map(l => l.trim()).filter(l => l)
        : undefined
    };

    this.taskService.createTask(this.projectId, dto).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.taskCreated.emit();
        this.closed.emit();
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err?.error?.message || 'Failed to create task';
      }
    });
  }

  cancel(): void {
    this.closed.emit();
  }
}
import { Component, OnInit, Input } from '@angular/core';
import { CdkDragDrop, transferArrayItem } from '@angular/cdk/drag-drop';
import { TaskService } from '../../../core/services/task.service';
import { Task, TaskStatus } from '../../../core/models/task.model';

interface TaskColumn {
  status: TaskStatus;
  title: string;
  tasks: Task[];
}

@Component({
  selector: 'app-task-board',
  templateUrl: './task-board.component.html',
  styleUrls: ['./task-board.component.css']
})
export class TaskBoardComponent implements OnInit {
  @Input() projectId!: string;

  columns: TaskColumn[] = [
    { status: 'todo', title: 'To Do', tasks: [] },
    { status: 'in-progress', title: 'In Progress', tasks: [] },
    { status: 'review', title: 'Review', tasks: [] },
    { status: 'testing', title: 'Testing', tasks: [] },
    { status: 'done', title: 'Done', tasks: [] }
  ];

  get connectedLists(): string[] {
    return this.columns.map(c => 'list-' + c.status);
  }

  isLoading = true;
  errorMessage = '';

  constructor(private taskService: TaskService) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.taskService.getTasksByProject(this.projectId).subscribe({
      next: (tasks) => {
        this.distributeTasksToColumns(tasks);
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load tasks. Please try again.';
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  private distributeTasksToColumns(tasks: Task[]): void {
    this.columns.forEach(column => (column.tasks = []));

    tasks.forEach(task => {
      const column = this.columns.find(c => c.status === task.status);
      if (column) {
        column.tasks.push(task);
      }
    });
  }

  drop(event: CdkDragDrop<Task[]>, targetStatus: TaskStatus): void {
    const task = event.previousContainer.data[event.previousIndex];
    const previousStatus = task.status;

    if (event.previousContainer === event.container) {
      return;
    }

    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );

    task.status = targetStatus;

    this.taskService.changeStatus(task._id, targetStatus).subscribe({
      error: (err) => {
        const fromColumn = this.columns.find(c => c.status === targetStatus);
        const toColumn = this.columns.find(c => c.status === previousStatus);

        if (fromColumn && toColumn) {
          const index = fromColumn.tasks.findIndex(t => t._id === task._id);
          if (index > -1) {
            fromColumn.tasks.splice(index, 1);
            task.status = previousStatus;
            toColumn.tasks.push(task);
          }
        }

        console.error('Failed to update status', err);
      }
    });
  }
}
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.component.html',
})
export class ModalComponent {
  @Input() isOpen = false;
  @Input() title = '';
  /** Set false to hide the built-in footer (e.g. when the parent has its own buttons) */
  @Input() showCloseButton = true;
  @Output() closed = new EventEmitter<void>();

  close(): void {
    this.closed.emit();
  }

  // Prevent clicks inside the modal card from bubbling up and closing it
  stopPropagation(event: MouseEvent): void {
    event.stopPropagation();
  }
}

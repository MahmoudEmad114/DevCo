import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading.component.html',
})
export class LoadingComponent {
  /** 'sm' for inline buttons, 'md' default, 'lg' for full-page loading states */
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() label = 'Loading...';
  /** Set true to center it in the full viewport (e.g. page-level load) */
  @Input() fullscreen = false;
}

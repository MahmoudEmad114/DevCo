import { Component } from '@angular/core';

import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {

  user: User | null = null;

  constructor(
    private authService: AuthService
  ) {
    this.user = this.authService.getCurrentUser();
  }

  logout(): void {

    this.authService.logout().subscribe({
      next: () => {
        window.location.href = '/login';
      },
      error: () => {
        window.location.href = '/login';
      }
    });

  }

}
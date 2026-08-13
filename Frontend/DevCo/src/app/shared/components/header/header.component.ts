import {
  Component,
  OnInit
} from '@angular/core';

import {
  AuthService
} from '../../../core/services/auth.service';

import {
  NotificationService
} from '../../../core/services/notification.service';

import {
  User
} from '../../../core/models/user.model';

import {
  environment
} from '../../../../environments/environment';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  user: User | null = null;

  unreadCount = 0;

  isDarkMode = false;

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService
  ) {

    this.user =
      this.authService.getCurrentUser();

  }

  ngOnInit(): void {

    this.notificationService
      .unreadCount$
      .subscribe(count => {

        this.unreadCount = count;

      });

    const savedTheme =
      localStorage.getItem('theme');

    this.isDarkMode =
      savedTheme === 'dark';

    this.applyTheme();

  }

  getUserPhoto(photo?: string): string {

    return `${environment.socketUrl}/img/users/${
      photo || 'default-avatar.jpg'
    }`;

  }

  toggleTheme(): void {

    this.isDarkMode =
      !this.isDarkMode;

    localStorage.setItem(
      'theme',
      this.isDarkMode
        ? 'dark'
        : 'light'
    );

    this.applyTheme();

  }

  private applyTheme(): void {

    document.body.classList.toggle(
      'dark-mode',
      this.isDarkMode
    );

  }

  logout(): void {

    this.authService
      .logout()
      .subscribe({

        next: () => {

          window.location.href =
            '/login';

        },

        error: () => {

          window.location.href =
            '/login';

        }

      });

  }

}
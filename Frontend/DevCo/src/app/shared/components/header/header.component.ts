import {
  Component,
  OnInit
} from '@angular/core';

import { AuthService }
  from '../../../core/services/auth.service';

import { NotificationService }
  from '../../../core/services/notification.service';

import { User }
  from '../../../core/models/user.model';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent
  implements OnInit {

  user: User | null = null;

  unreadCount = 0;

  constructor(
    private authService: AuthService,
    private notificationService:
      NotificationService
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
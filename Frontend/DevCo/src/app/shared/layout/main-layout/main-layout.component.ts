import {
  Component,
  OnInit,
  OnDestroy
} from '@angular/core';

import { SocketService }
  from '../../../core/services/socket.service';

import { NotificationService }
  from '../../../core/services/notification.service';

import { Subscription }
  from 'rxjs';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css']
})
export class MainLayoutComponent
  implements OnInit, OnDestroy {

  private notificationSubscription?: Subscription;

  constructor(
    private socketService: SocketService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {

    // Load existing notifications
    this.notificationService
      .loadNotifications();

    // Connect Socket
    this.socketService.connect();

    // Listen for real-time notifications
    this.notificationSubscription =
      this.socketService
        .onNewNotification()
        .subscribe({

          next: notification => {

            console.log(
              '🔔 New notification:',
              notification
            );

            this.notificationService
              .addNotification(notification);

          },

          error: error => {

            console.error(
              'Notification socket error:',
              error
            );

          }

        });

  }

  ngOnDestroy(): void {

    this.notificationSubscription?.unsubscribe();

    this.socketService.disconnect();

  }

}
import {
  Component,
  OnInit
} from '@angular/core';

import { Router } from '@angular/router';

import {
  Notification
} from '../../core/models/notification.model';

import {
  NotificationService
} from '../../core/services/notification.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {

  notifications: Notification[] = [];

  loading = true;

  constructor(
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {

    this.notificationService
      .notifications$
      .subscribe(notifications => {

        this.notifications = notifications;

        this.loading = false;

      });

    this.notificationService
      .loadNotifications();
  }

  openNotification(
    notification: Notification
  ): void {

    // Mark as read first if needed
    if (!notification.isRead) {

      this.notificationService
        .markAsRead(notification._id)
        .subscribe({

          next: response => {

            this.notificationService
              .updateNotificationLocally(
                response.data.notification
              );

          },

          error: err => {

            console.error(
              'Failed to mark notification as read',
              err
            );

          }

        });
    }

    // Navigate according to notification type
    switch (notification.type) {

      case 'workspace-added':

        this.router.navigate([
          '/workspaces',
          notification.relatedItem
        ]);

        break;

      case 'project-added':

        this.router.navigate([
          '/projects',
          notification.relatedItem
        ]);

        break;

      case 'task-assigned':

        this.router.navigate([
          '/tasks',
          notification.relatedItem
        ]);

        break;

      case 'issue-assigned':

        this.router.navigate([
          '/issues',
          notification.relatedItem
        ]);

        break;

      default:

        console.warn(
          'Unknown notification type:',
          notification.type
        );

        break;
    }
  }

  markAllAsRead(): void {

    this.notificationService
      .markAllAsRead()
      .subscribe({

        next: () => {

          this.notificationService
            .markAllAsReadLocally();

        },

        error: err => {

          console.error(
            'Failed to mark all notifications as read',
            err
          );

        }

      });
  }

  deleteNotification(
    notification: Notification
  ): void {

    this.notificationService
      .deleteNotification(notification._id)
      .subscribe({

        next: () => {

          this.notificationService
            .removeNotificationLocally(
              notification._id
            );

        },

        error: err => {

          console.error(
            'Failed to delete notification',
            err
          );

        }

      });
  }

  getNotificationIcon(
    type: Notification['type']
  ): string {

    switch (type) {

      case 'workspace-added':
        return '▦';

      case 'project-added':
        return '◈';

      case 'task-assigned':
        return '✓';

      case 'issue-assigned':
        return '!';

      default:
        return '◔';
    }
  }

}
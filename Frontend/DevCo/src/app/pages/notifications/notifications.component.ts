import { Component, OnInit } from '@angular/core';

import { NotificationService } from '../../core/services/notification.service';
import { Notification } from '../../core/models/notification.model';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css'],
})
export class NotificationsComponent implements OnInit {
  notifications: Notification[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.notificationService.getMyNotifications().subscribe({
      next: (response) => {
        this.notifications = response.data.notifications;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage =
          error?.error?.message || 'Failed to load notifications.';
        this.isLoading = false;
      },
    });
  }

  onMarkAsRead(notification: Notification): void {
    if (notification.isRead) {
      return;
    }

    this.notificationService.markAsRead(notification._id).subscribe({
      next: () => {
        notification.isRead = true;
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Failed to mark as read.';
      },
    });
  }

  onMarkAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notifications.forEach((n) => (n.isRead = true));
      },
      error: (error) => {
        this.errorMessage =
          error?.error?.message || 'Failed to mark all as read.';
      },
    });
  }

  onDelete(notification: Notification): void {
    this.notificationService.deleteNotification(notification._id).subscribe({
      next: () => {
        this.notifications = this.notifications.filter(
          (n) => n._id !== notification._id,
        );
      },
      error: (error) => {
        this.errorMessage =
          error?.error?.message || 'Failed to delete notification.';
      },
    });
  }
}

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { ApiService } from './api.service';

import {
  Notification,
  NotificationsResponse,
  NotificationResponse
} from '../models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private notificationsSubject =
    new BehaviorSubject<Notification[]>([]);

  notifications$ =
    this.notificationsSubject.asObservable();

  private unreadCountSubject =
    new BehaviorSubject<number>(0);

  unreadCount$ =
    this.unreadCountSubject.asObservable();

  constructor(
    private api: ApiService
  ) {}

  getNotifications(): Observable<NotificationsResponse> {

    return this.api.get<NotificationsResponse>(
      '/notifications'
    );
  }

  loadNotifications(): void {

    this.getNotifications().subscribe({

      next: response => {

        const notifications =
          response.data.notifications;

        this.notificationsSubject.next(
          notifications
        );

        this.updateUnreadCount(
          notifications
        );
      },

      error: err => {

        console.error(
          'Failed to load notifications',
          err
        );

      }

    });
  }

  addNotification(
    notification: Notification
  ): void {

    const current =
      this.notificationsSubject.value;

    this.notificationsSubject.next([
      notification,
      ...current
    ]);

    this.updateUnreadCount([
      notification,
      ...current
    ]);
  }

  markAsRead(
    notificationId: string
  ): Observable<NotificationResponse> {

    return this.api.patch<NotificationResponse>(
      `/notifications/${notificationId}/mark-read`
    );
  }

  markAllAsRead(): Observable<any> {

    return this.api.patch(
      '/notifications/mark-all-read'
    );
  }

  deleteNotification(
    notificationId: string
  ): Observable<any> {

    return this.api.delete(
      `/notifications/${notificationId}`
    );
  }

  updateNotificationLocally(
    notification: Notification
  ): void {

    const updated =
      this.notificationsSubject.value.map(n =>
        n._id === notification._id
          ? notification
          : n
      );

    this.notificationsSubject.next(updated);

    this.updateUnreadCount(updated);
  }

  removeNotificationLocally(
    notificationId: string
  ): void {

    const updated =
      this.notificationsSubject.value.filter(
        n => n._id !== notificationId
      );

    this.notificationsSubject.next(updated);

    this.updateUnreadCount(updated);
  }

  markAllAsReadLocally(): void {

    const updated =
      this.notificationsSubject.value.map(
        notification => ({
          ...notification,
          isRead: true
        })
      );

    this.notificationsSubject.next(updated);

    this.updateUnreadCount(updated);
  }

  private updateUnreadCount(
    notifications: Notification[]
  ): void {

    const unread =
      notifications.filter(
        notification => !notification.isRead
      ).length;

    this.unreadCountSubject.next(unread);
  }
}
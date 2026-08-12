import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from './api.service';
import { Notification } from '../models/notification.model';

@Injectable({
    providedIn: 'root',
})
export class NotificationService {
    constructor(private api: ApiService) {}

getMyNotifications(): Observable<{
    status: string;
    results: number;
    data: { notifications: Notification[] };
}> {
    return this.api.get('/notifications');
}

markAsRead(id: string): Observable<any> {
    return this.api.patch(`/notifications/${id}/read`, {});
}

markAllAsRead(): Observable<any> {
    return this.api.patch('/notifications/read-all', {});
}

deleteNotification(id: string): Observable<any> {
    return this.api.delete(`/notifications/${id}`);
}
}

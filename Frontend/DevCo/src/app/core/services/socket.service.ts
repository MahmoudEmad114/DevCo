import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';

import { Notification } from '../models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  private socket: Socket | null = null;

  private socketUrl = 'http://localhost:3000';

  connect(): void {

    const token = localStorage.getItem('devcollab_token');

    if (!token) {
      console.warn('No DevCollab token found');
      return;
    }

    if (this.socket?.connected) {
      return;
    }

    this.socket = io(this.socketUrl, {
      auth: {
        token
      },
      transports: ['websocket']
    });

    this.socket.on('connect', () => {
      console.log(
        'Socket connected:',
        this.socket?.id
      );
    });

    this.socket.on('connect_error', error => {
      console.error(
        'Socket connection error:',
        error.message
      );
    });

    this.socket.on('disconnect', reason => {
      console.log(
        'Socket disconnected:',
        reason
      );
    });
  }

  onNewNotification(): Observable<Notification> {

    return new Observable<Notification>(observer => {

      if (!this.socket) {
        observer.error(
          new Error('Socket is not connected')
        );
        return;
      }

      const handler = (
        notification: Notification
      ) => {
        observer.next(notification);
      };

      this.socket.on(
        'newNotification',
        handler
      );

      return () => {
        this.socket?.off(
          'newNotification',
          handler
        );
      };

    });
  }

  disconnect(): void {

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

  }

  isConnected(): boolean {
    return !!this.socket?.connected;
  }
}
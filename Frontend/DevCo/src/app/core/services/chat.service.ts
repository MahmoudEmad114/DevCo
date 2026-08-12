import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';

import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { ApiService } from './api.service';

export interface ChatUser {
  _id: string;
  name: string;
  email: string;
  photo?: string;
}

export interface ChatMessage {
  _id: string;
  project: string;
  sender: ChatUser;
  text: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

interface MessagesResponse {
  status: string;
  results: number;
  data: {
    messages: ChatMessage[];
  };
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private socket: Socket | null = null;

  private newMessageSubject =
    new Subject<ChatMessage>();

  private typingSubject =
    new Subject<{
      userId: string;
      userName: string;
    }>();

  private stopTypingSubject =
    new Subject<{
      userId: string;
      userName: string;
    }>();

  private socketErrorSubject =
    new Subject<{
      message: string;
    }>();

  constructor(
    private api: ApiService,
    private authService: AuthService
  ) {}

  // =========================
  // Connect
  // =========================

  connect(): void {

    if (this.socket?.connected) {
      return;
    }

    const token = this.authService.getToken();

    if (!token) {
      console.error('No authentication token found.');
      return;
    }

    this.socket = io(environment.socketUrl, {
      auth: {
        token
      },
      transports: ['websocket']
    });

    this.registerSocketEvents();
  }

  // =========================
  // Disconnect
  // =========================

  disconnect(): void {

    if (!this.socket) {
      return;
    }

    this.socket.disconnect();
    this.socket = null;
  }

  // =========================
  // Socket Events
  // =========================

  private registerSocketEvents(): void {

    if (!this.socket) {
      return;
    }

    this.socket.on(
      'newMessage',
      (message: ChatMessage) => {

        this.newMessageSubject.next(message);

      }
    );

    this.socket.on(
      'typing',
      (data: {
        userId: string;
        userName: string;
      }) => {

        this.typingSubject.next(data);

      }
    );

    this.socket.on(
      'stopTyping',
      (data: {
        userId: string;
        userName: string;
      }) => {

        this.stopTypingSubject.next(data);

      }
    );

    this.socket.on(
      'socketError',
      (error: { message: string }) => {

        this.socketErrorSubject.next(error);

      }
    );

    this.socket.on(
      'connect',
      () => {

        console.log(
          'Chat socket connected:',
          this.socket?.id
        );

      }
    );

    this.socket.on(
      'connect_error',
      error => {

        console.error(
          'Chat socket connection error:',
          error.message
        );

      }
    );

    this.socket.on(
      'disconnect',
      reason => {

        console.log(
          'Chat socket disconnected:',
          reason
        );

      }
    );
  }

  // =========================
  // Observables
  // =========================

  get newMessage$(): Observable<ChatMessage> {

    return this.newMessageSubject
      .asObservable();

  }

  get typing$(): Observable<{
    userId: string;
    userName: string;
  }> {

    return this.typingSubject
      .asObservable();

  }

  get stopTyping$(): Observable<{
    userId: string;
    userName: string;
  }> {

    return this.stopTypingSubject
      .asObservable();

  }

  get socketError$(): Observable<{
    message: string;
  }> {

    return this.socketErrorSubject
      .asObservable();

  }

  // =========================
  // REST
  // =========================

  getMessages(
    projectId: string
  ): Observable<MessagesResponse> {

    return this.api.get<MessagesResponse>(
      `/chat/${projectId}/messages`
    );

  }

  // =========================
  // Send Message
  // =========================

  sendMessage(
    projectId: string,
    text: string
  ): void {

    if (!this.socket?.connected) {

      console.error(
        'Socket is not connected.'
      );

      return;
    }

    this.socket.emit(
      'sendMessage',
      {
        projectId,
        text
      }
    );

  }

  // =========================
  // Join Project
  // =========================

  joinProject(
    projectId: string
  ): void {

    if (!this.socket) {
      return;
    }

    this.socket.emit(
      'joinProject',
      projectId
    );

  }

  // =========================
  // Leave Project
  // =========================

  leaveProject(
    projectId: string
  ): void {

    if (!this.socket) {
      return;
    }

    this.socket.emit(
      'leaveProject',
      projectId
    );

  }

  // =========================
  // Start Typing
  // =========================

  startTyping(
    projectId: string
  ): void {

    if (!this.socket) {
      return;
    }

    this.socket.emit(
      'typing',
      {
        projectId
      }
    );

  }

  // =========================
  // Stop Typing
  // =========================

  stopTyping(
    projectId: string
  ): void {

    if (!this.socket) {
      return;
    }

    this.socket.emit(
      'stopTyping',
      {
        projectId
      }
    );

  }
}
import {
  Component,
  Input,
  OnDestroy,
  OnInit
} from '@angular/core';

import {
  Subscription,
  Subject
} from 'rxjs';

import {
  ChatMessage,
  ChatService
} from '../../core/services/chat.service';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent
  implements OnInit, OnDestroy {

  @Input() projectId!: string;

  messages: ChatMessage[] = [];

  messageText = '';

  isLoading = false;

  isTyping = false;

  typingUserName = '';

  errorMessage = '';

  private subscriptions: Subscription[] = [];

  private typingTimeout: any;

  constructor(
    private chatService: ChatService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {

    this.loadMessages();

    this.chatService.connect();

    this.chatService.joinProject(
      this.projectId
    );

    this.listenForMessages();

    this.listenForTyping();

    this.listenForSocketErrors();
  }

  // =========================
  // Load Messages
  // =========================

  loadMessages(): void {

    this.isLoading = true;

    this.errorMessage = '';

    this.chatService
      .getMessages(this.projectId)
      .subscribe({

        next: response => {

          this.messages =
            response.data.messages;

          this.isLoading = false;

          this.scrollToBottom();

        },

        error: error => {

          this.isLoading = false;

          this.errorMessage =
            error?.error?.message ||
            error?.message ||
            'Failed to load messages.';

        }

      });

  }

  // =========================
  // New Messages
  // =========================

  private listenForMessages(): void {

    this.subscriptions.push(

      this.chatService.newMessage$
        .subscribe(message => {

          if (
            message.project !==
            this.projectId
          ) {
            return;
          }

          this.messages.push(message);

          setTimeout(() => {
            this.scrollToBottom();
          });

        })

    );

  }

  // =========================
  // Typing
  // =========================

  private listenForTyping(): void {

    this.subscriptions.push(

      this.chatService.typing$
        .subscribe(data => {

          const currentUser =
            this.authService.getCurrentUser();

          if (
            data.userId ===
            currentUser?._id
          ) {
            return;
          }

          this.isTyping = true;

          this.typingUserName =
            data.userName;

        })

    );

    this.subscriptions.push(

      this.chatService.stopTyping$
        .subscribe(data => {

          const currentUser =
            this.authService.getCurrentUser();

          if (
            data.userId ===
            currentUser?._id
          ) {
            return;
          }

          this.isTyping = false;

          this.typingUserName = '';

        })

    );

  }

  // =========================
  // Socket Errors
  // =========================

  private listenForSocketErrors(): void {

    this.subscriptions.push(

      this.chatService.socketError$
        .subscribe(error => {

          this.errorMessage =
            error.message;

        })

    );

  }

  // =========================
  // Send Message
  // =========================

  sendMessage(): void {

    const text =
      this.messageText.trim();

    if (!text) {
      return;
    }

    this.chatService.sendMessage(
      this.projectId,
      text
    );

    this.messageText = '';

    this.chatService.stopTyping(
      this.projectId
    );

    this.clearTypingTimeout();

  }

  // =========================
  // Typing Input
  // =========================

  onTyping(): void {

    if (!this.messageText.trim()) {

      this.chatService.stopTyping(
        this.projectId
      );

      this.clearTypingTimeout();

      return;
    }

    this.chatService.startTyping(
      this.projectId
    );

    this.clearTypingTimeout();

    this.typingTimeout =
      setTimeout(() => {

        this.chatService.stopTyping(
          this.projectId
        );

      }, 1500);

  }

  // =========================
  // Enter
  // =========================

  onKeyDown(
    event: KeyboardEvent
  ): void {

    if (
      event.key === 'Enter' &&
      !event.shiftKey
    ) {

      event.preventDefault();

      this.sendMessage();

    }

  }

  // =========================
  // Current User
  // =========================

  isOwnMessage(
    message: ChatMessage
  ): boolean {

    return (
      message.sender?._id ===
      this.authService
        .getCurrentUser()?._id
    );

  }

  // =========================
  // Scroll
  // =========================

  private scrollToBottom(): void {

    setTimeout(() => {

      const container =
        document.querySelector(
          '.messages-container'
        ) as HTMLElement;

      if (!container) {
        return;
      }

      container.scrollTop =
        container.scrollHeight;

    });

  }

  // =========================
  // Clear Typing Timeout
  // =========================

  private clearTypingTimeout(): void {

    if (this.typingTimeout) {

      clearTimeout(
        this.typingTimeout
      );

      this.typingTimeout = null;

    }

  }

  // =========================
  // Destroy
  // =========================

  ngOnDestroy(): void {

    this.chatService.stopTyping(
      this.projectId
    );

    this.chatService.leaveProject(
      this.projectId
    );

    this.clearTypingTimeout();

    this.subscriptions.forEach(
      subscription =>
        subscription.unsubscribe()
    );

    this.chatService.disconnect();

  }

}
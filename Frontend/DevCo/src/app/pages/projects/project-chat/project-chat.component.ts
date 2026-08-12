import {
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import { Subscription } from 'rxjs';

import {
  ChatMessage,
  ChatService
} from '../../../core/services/chat.service';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-project-chat',
  templateUrl: './project-chat.component.html',
  styleUrls: ['./project-chat.component.css']
})
export class ProjectChatComponent
  implements OnInit, OnDestroy {

  projectId!: string;

  messages: ChatMessage[] = [];

  messageText = '';

  isLoading = false;

  errorMessage = '';

  isTyping = false;

  typingUserName = '';

  private subscriptions: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private chatService: ChatService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {

    this.projectId =
      this.route.snapshot.paramMap.get('id') || '';

    if (!this.projectId) {
      this.errorMessage = 'Invalid project ID.';
      return;
    }

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

    this.chatService
      .getMessages(this.projectId)
      .subscribe({

        next: response => {

          this.messages =
            response.data.messages;

          this.isLoading = false;

          setTimeout(() => {
            this.scrollToBottom();
          });

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
            message.project === this.projectId
          ) {

            this.messages.push(message);

            setTimeout(() => {
              this.scrollToBottom();
            });

          }

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
            data.userId === currentUser?._id
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
            data.userId === currentUser?._id
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
  }

  // =========================
  // Typing
  // =========================

  onTyping(): void {

    if (!this.messageText.trim()) {

      this.chatService.stopTyping(
        this.projectId
      );

      return;
    }

    this.chatService.startTyping(
      this.projectId
    );
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
  // Own Message
  // =========================

  isOwnMessage(
    message: ChatMessage
  ): boolean {

    return (
      message.sender?._id ===
      this.authService.getCurrentUser()?._id
    );
  }

  // =========================
  // Back
  // =========================

  goBack(): void {

    this.router.navigate([
      '/projects',
      this.projectId
    ]);

  }

  // =========================
  // Scroll
  // =========================

  private scrollToBottom(): void {

    const container =
      document.querySelector(
        '.messages-container'
      ) as HTMLElement;

    if (!container) {
      return;
    }

    container.scrollTop =
      container.scrollHeight;
  }

  // =========================
  // Destroy
  // =========================

  ngOnDestroy(): void {

    if (this.projectId) {

      this.chatService.leaveProject(
        this.projectId
      );

    }

    this.subscriptions.forEach(
      subscription =>
        subscription.unsubscribe()
    );

    this.chatService.disconnect();
  }

}
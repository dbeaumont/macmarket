import { Component, inject, signal, OnInit, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { ChatService } from '../../core/services/chat.service';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-chat-widget',
  standalone: true,
  imports: [RouterLink, FormsModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './chat-widget.component.html',
  styleUrl: './chat-widget.component.css',
})
export class ChatWidgetComponent implements OnInit, AfterViewChecked {
  @ViewChild('messagesEnd') messagesEnd!: ElementRef<HTMLDivElement>;

  readonly chatService = inject(ChatService);
  readonly cartService = inject(CartService);
  private readonly oidc = inject(OidcSecurityService);

  readonly isOpen = signal(false);
  inputMessage = '';
  private userId: string | undefined;
  private shouldScroll = false;

  ngOnInit(): void {
    this.oidc.userData$.subscribe(({ userData }) => {
      if (userData) {
        const newUserId = userData['sub'] as string;
        if (newUserId !== this.userId) {
          this.userId = newUserId;
          this.chatService.loadHistory(newUserId);
        }
      }
    });
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.messagesEnd?.nativeElement?.scrollIntoView({ behavior: 'smooth' });
      this.shouldScroll = false;
    }
  }

  toggle(): void {
    this.isOpen.update((v) => !v);
  }

  async send(): Promise<void> {
    const msg = this.inputMessage.trim();
    if (!msg) return;
    this.inputMessage = '';
    this.shouldScroll = true;
    await this.chatService.sendMessage(msg, this.userId);
    this.shouldScroll = true;
  }

  stop(): void {
    this.chatService.stopStreaming();
  }

  async addSuggestionToCart(productId: string): Promise<void> {
    await this.cartService.addItem(productId, 1);
  }

  clearChat(): void {
    if (this.userId) {
      this.chatService.clearHistory(this.userId);
    }
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void this.send();
    }
  }
}

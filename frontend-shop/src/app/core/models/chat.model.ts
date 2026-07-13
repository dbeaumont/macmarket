export interface ChatMessage {
  readonly role: 'user' | 'assistant';
  readonly content: string;
}

export interface SuggestedProduct {
  readonly slug: string;
  readonly name: string;
  readonly price: string;
  readonly imageUrl: string;
  readonly category: string;
}

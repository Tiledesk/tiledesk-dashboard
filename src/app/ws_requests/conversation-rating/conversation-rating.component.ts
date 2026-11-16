import { Component, Input } from '@angular/core';
import { cleanAiSentiment, cleanRatingMessage, parseRatingScore } from './conversation-rating.util';

@Component({
  selector: 'app-conversation-rating',
  templateUrl: './conversation-rating.component.html',
  styleUrls: ['./conversation-rating.component.scss'],
})
export class ConversationRatingComponent {
  /** List: compact bars and tooltips. Detail: labels, score, review and sentiment. */
  @Input() mode: 'list' | 'detail' = 'list';
  @Input() request: any;

  readonly segments = [1, 2, 3, 4, 5];

  get detail(): boolean {
    return this.mode === 'detail';
  }

  get userScore(): number | null {
    return parseRatingScore(this.request?.rating);
  }

  get aiScore(): number | null {
    return parseRatingScore(this.request?.attributes?.ai_rating);
  }

  get sentiment(): string | null {
    return cleanAiSentiment(this.request?.attributes?.ai_sentiment);
  }

  get ratingMessage(): string | null {
    return cleanRatingMessage(this.request?.rating_message);
  }

  userSegmentOn(index: number): boolean {
    return this.userScore !== null && index <= this.userScore;
  }

  aiSegmentOn(index: number): boolean {
    return this.aiScore !== null && index <= this.aiScore;
  }
}

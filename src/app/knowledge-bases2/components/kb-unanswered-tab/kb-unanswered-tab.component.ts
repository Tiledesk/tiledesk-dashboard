import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import type { UnansweredQuestion } from 'app/services/unanswered-questions.service';
import type { KbNamespace } from '../../models/kb-types';

@Component({
  selector: 'appdashboard-kb-unanswered-tab',
  templateUrl: './kb-unanswered-tab.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KbUnansweredTabComponent {
  @Input() unansweredQuestions: UnansweredQuestion[] | null = null;
  @Input() unansweredQuestionsCount: number | null = null;
  @Input() hasMore: boolean | null = null;
  @Input() isLoadingMore: boolean | null = null;
  @Input() showUQTableSpinner: boolean | null = null;
  @Input() namespace: KbNamespace | null = null;
  @Input() id_project: string | null = null;

  @Output() refresh = new EventEmitter<void>();
  @Output() loadMore = new EventEmitter<void>();
  @Output() addFaqFromUnanswered = new EventEmitter<any>();
}


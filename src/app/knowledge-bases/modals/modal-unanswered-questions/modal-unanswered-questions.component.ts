import { ChangeDetectorRef, Component, Input, Output, EventEmitter, OnInit, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LoggerService } from 'app/services/logger/logger.service';
import { UnansweredQuestionsService, UnansweredQuestion } from 'app/services/unanswered-questions.service';
import { ModalConfirmActionComponent } from '../modal-confirm-action/modal-confirm-action.component';
import { BrandService } from 'app/services/brand.service';
import { TranslateService } from '@ngx-translate/core';

/**
 * Componente per la gestione delle domande senza risposta (unanswered questions)
 * Permette di aggiungere una domanda alla knowledge base o scartarla.
 */
@Component({
  selector: 'modal-unanswered-questions',
  templateUrl: './modal-unanswered-questions.component.html',
  styleUrls: ['./modal-unanswered-questions.component.scss']
})
export class ModalUnansweredQuestionsComponent implements OnInit, OnChanges, OnDestroy {
  /** Anteprima risposta in lista; oltre → "…"; Mostra tutto / Mostra meno (come prima; Mostra tutto visibile in hover sulla riga via CSS). */
  private static readonly ANSWER_PREVIEW_MAX_CHARS = 60;
  /** `_id` delle righe answered con risposta espansa. */
  private expandedAnswerIds = new Set<string>();
  /** Namespace attivo */
  @Input() namespace: any;
  /** ID del progetto */
  @Input() id_project: string = '';
  /** Lista delle domande senza risposta */
  @Input() unansweredQuestions: UnansweredQuestion[] = [];
  /** Totale delle domande senza risposta */
  @Input() unansweredQuestionsCount: number = 0;
  /** Se ci sono più domande da caricare */
  @Input() hasMore: boolean = false;
  /** Se sta caricando più domande */
  @Input() isLoadingMore: boolean = false;
  /** Se mostrare lo spinner al posto della lista (refresh completo) */
  @Input() showUQTableSpinner: boolean = false;
  /** answered: solo lettura (niente aggiungi a KB / scarta). unanswered: comportamento precedente. */
  @Input() listMode: 'answered' | 'unanswered' = 'unanswered';
  /** Direzione ordinamento data (-1 | 1), stessa convenzione di Activities. */
  @Input() questionsSortDirection: number = -1;
  /** Testo ricerca full-text della sotto-tab attiva (per messaggio “nessuna corrispondenza”). */
  @Input() questionsSearchQuery = '';

  get hasActiveQuestionsSearch(): boolean {
    return (this.questionsSearchQuery || '').trim().length > 0;
  }
  /** Evento per aprire la modale di aggiunta KB */
  @Output() openAddKnowledgeBaseModal = new EventEmitter<any>();
  /** Evento per aggiungere una FAQ dalla unanswered question */
  @Output() addFaqFromUnanswered = new EventEmitter<{q: UnansweredQuestion, done: (success: boolean) => void}>();
  @Output() refresh = new EventEmitter<void>();
  /** Evento per caricare più domande */
  @Output() loadMore = new EventEmitter<void>();
  /** Apre la conversazione (lista KB Domande) */
  @Output() openConversation = new EventEmitter<{ requestId: string; listMode: 'answered' | 'unanswered' }>();
  /** Toggle ordinamento per data (gestito dal parent che richiama l’API). */
  @Output() toggleQuestionsDateSort = new EventEmitter<void>();

  /** Domanda in fase di lavorazione */
  pendingQuestion: UnansweredQuestion | null = null;
  hideHelpLink: boolean;

  constructor(
    private dialog: MatDialog,
    private logger: LoggerService,
    private unansweredQuestionsService: UnansweredQuestionsService,
    public brandService: BrandService,
    private translate: TranslateService,
    private cdr: ChangeDetectorRef
  ) {
    const brand = brandService.getBrand(); 
    this.hideHelpLink= brand['DOCS'];
  }

  ngOnInit(): void {
    // La lista delle domande viene fornita dal componente padre
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['listMode'] && !changes['listMode'].firstChange) {
      this.clearExpandedAnswers();
    }
    if (changes['unansweredQuestions'] && !changes['unansweredQuestions'].firstChange) {
      this.clearExpandedAnswers();
    }
  }

  ngOnDestroy(): void {
    this.clearExpandedAnswers();
  }

  private clearExpandedAnswers(): void {
    this.expandedAnswerIds.clear();
  }

  getAnswerText(q: UnansweredQuestion): string {
    const row = q as unknown as Record<string, unknown>;
    let raw: unknown =
      q.answer ??
      row['Answer'] ??
      row['response'] ??
      row['responseText'];
    if (raw == null && typeof row['text'] === 'string') {
      raw = row['text'];
    }
    if (raw != null && typeof raw === 'object') {
      const o = raw as Record<string, unknown>;
      raw = o['text'] ?? o['content'] ?? o['body'];
    }
    if (raw == null) {
      return '';
    }
    return String(raw).trim();
  }

  shouldTruncateAnswer(q: UnansweredQuestion): boolean {
    const t = this.getAnswerText(q);
    return t.length > ModalUnansweredQuestionsComponent.ANSWER_PREVIEW_MAX_CHARS;
  }

  /** Testo mostrato in lista: troncato se chiuso, intero se espanso. */
  getAnswerDisplayText(q: UnansweredQuestion): string {
    const full = this.getAnswerText(q);
    if (!full) {
      return '';
    }
    if (this.isAnswerExpanded(q)) {
      return full;
    }
    const max = ModalUnansweredQuestionsComponent.ANSWER_PREVIEW_MAX_CHARS;
    if (full.length <= max) {
      return full;
    }
    return full.slice(0, max) + '…';
  }

  isAnswerExpanded(q: UnansweredQuestion): boolean {
    const id = q._id;
    return id != null && this.expandedAnswerIds.has(String(id));
  }

  shouldOfferAnswerToggle(q: UnansweredQuestion): boolean {
    const t = this.getAnswerText(q);
    if (!t) {
      return false;
    }
    return t.length > ModalUnansweredQuestionsComponent.ANSWER_PREVIEW_MAX_CHARS || this.isAnswerExpanded(q);
  }

  toggleAnswerExpand(ev: MouseEvent, q: UnansweredQuestion): void {
    ev.preventDefault();
    ev.stopPropagation();
    const id = q._id != null ? String(q._id) : '';
    if (!id) {
      return;
    }
    if (this.expandedAnswerIds.has(id)) {
      this.expandedAnswerIds.delete(id);
    } else {
      this.expandedAnswerIds.add(id);
    }
    this.cdr.detectChanges();
  }

  refreshList() {
    this.refresh.emit();
  }

  loadMoreData() {
    if (!this.isLoadingMore && this.hasMore) {
      this.loadMore.emit();
    }
  }

  onToggleDateSort(ev?: Event): void {
    ev?.preventDefault();
    ev?.stopPropagation();
    this.toggleQuestionsDateSort.emit();
  }

  onRowClick(ev: MouseEvent, q: UnansweredQuestion): void {
    if ((ev.target as HTMLElement).closest('button')) {
      return;
    }
    const requestId = q.request_id || q.requestId;
    if (!requestId) {
      return;
    }
    this.openConversation.emit({ requestId, listMode: this.listMode });
  }

  /**
   * Apre la modale per aggiungere una domanda alla knowledge base
   * @param q domanda selezionata
   */
  onOpenAddKnowledgeBaseModal(q: UnansweredQuestion): void {
    this.logger.log('[ModalUnansweredQuestions] Opening detail modal for:', q);
    this.pendingQuestion = q;
    this.addFaqFromUnanswered.emit({
      q,
      done: (success: boolean) => {
        if (success) {
          this.discardQuestionConfirmed(q);
        }
        this.pendingQuestion = null;
      }
    });
  }

  /**
   * Mostra un dialog di conferma prima di scartare una domanda
   * @param q domanda da scartare
   */
  onDiscardQuestion(q: UnansweredQuestion): void {
    const dialogRef = this.dialog.open(ModalConfirmActionComponent, {
      width: '400px',
      data: {
        title: this.translate.instant('DiscardQuestion'), //'Discard Question',
        message: this.translate.instant('AreYouSureYouWantToDiscard') + '?', // 'Are you sure you want to discard this question?',
        confirmText: this.translate.instant('Discard'), //'Discard',
        cancelText: this.translate.instant('Cancel') //'Cancel'
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.discardQuestionConfirmed(q);
      }
    });
  }

  onDeleteAnsweredQuestion(q: UnansweredQuestion): void {
    const dialogRef = this.dialog.open(ModalConfirmActionComponent, {
      width: '400px',
      data: {
        title: this.translate.instant('KbPage.DeleteAnsweredQuestionTitle'),
        message: this.translate.instant('KbPage.AreYouSureDeleteAnsweredQuestion'),
        confirmText: this.translate.instant('Delete'),
        cancelText: this.translate.instant('Cancel')
      }
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.deleteAnsweredQuestionConfirmed(q);
      }
    });
  }

  /**
   * Elimina la domanda senza popup di conferma (usata dopo salvataggio o conferma)
   * @param q domanda da eliminare
   */
  discardQuestionConfirmed(q: UnansweredQuestion): void {
    this.logger.log('[ModalUnansweredQuestions] Discard question:', q);
    const prevQuestions = [...this.unansweredQuestions];
    this.unansweredQuestionsService.deleteUnansweredQuestion(this.id_project, q._id!).subscribe({
      next: () => {
        this.logger.log('[ModalUnansweredQuestions] Question deleted successfully');
        // Remove from local array - parent will handle count update if needed
        this.unansweredQuestions = this.unansweredQuestions.filter(item => item._id !== q._id);
        // Emit refresh to update count in parent
        this.refresh.emit();
      },
      error: (err) => {
        this.logger.error('[ModalUnansweredQuestions] Error deleting question', err);
        this.unansweredQuestions = prevQuestions;
      }
    });
  }

  deleteAnsweredQuestionConfirmed(q: UnansweredQuestion): void {
    const id = q._id;
    if (!id) {
      this.logger.error('[ModalUnansweredQuestions] deleteAnsweredQuestion: missing _id', q);
      return;
    }
    this.logger.log('[ModalUnansweredQuestions] Delete answered question:', id);
    const prevQuestions = [...this.unansweredQuestions];
    this.unansweredQuestionsService.deleteAnsweredQuestion(this.id_project, id).subscribe({
      next: () => {
        this.unansweredQuestions = this.unansweredQuestions.filter((item) => item._id !== id);
        this.refresh.emit();
      },
      error: (err) => {
        this.logger.error('[ModalUnansweredQuestions] Error deleting answered question', err);
        this.unansweredQuestions = prevQuestions;
      }
    });
  }
} 

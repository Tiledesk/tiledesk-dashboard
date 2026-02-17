import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LoggerService } from 'app/services/logger/logger.service';
import { UnansweredQuestionsService } from 'app/services/unanswered-questions.service';
import { ModalConfirmActionComponent } from '../modal-confirm-action/modal-confirm-action.component';
import { BrandService } from 'app/services/brand.service';
import { TranslateService } from '@ngx-translate/core';

/**
 * Interfaccia per una domanda senza risposta
 */
export interface UnansweredQuestion {
  id: string;
  text: string;
  _id?: string; // opzionale per compatibilità con backend
}

/**
 * Componente per la gestione delle domande senza risposta (unanswered questions)
 * Permette di aggiungere una domanda alla knowledge base o scartarla.
 */
@Component({
  selector: 'modal-unanswered-questions',
  templateUrl: './modal-unanswered-questions.component.html',
  styleUrls: ['./modal-unanswered-questions.component.scss']
})
export class ModalUnansweredQuestionsComponent implements OnInit {
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
  /** Evento per aprire la modale di aggiunta KB */
  @Output() openAddKnowledgeBaseModal = new EventEmitter<any>();
  /** Evento per aggiungere una FAQ dalla unanswered question */
  @Output() addFaqFromUnanswered = new EventEmitter<{q: UnansweredQuestion, done: (success: boolean) => void}>();
  @Output() refresh = new EventEmitter<void>();
   /** Evento per caricare più domande */
  @Output() loadMore = new EventEmitter<void>();

  /** Domanda in fase di lavorazione */
  pendingQuestion: UnansweredQuestion | null = null;
  hideHelpLink: boolean;

  constructor(
    private dialog: MatDialog,
    private logger: LoggerService,
    private unansweredQuestionsService: UnansweredQuestionsService,
    public brandService: BrandService,
    private translate: TranslateService
  ) {
    const brand = brandService.getBrand(); 
    this.hideHelpLink= brand['DOCS'];
  }

  ngOnInit(): void {
    // La lista delle domande viene fornita dal componente padre
  }

  refreshList() {
    this.refresh.emit();
  }

  loadMoreData() {
    if (!this.isLoadingMore && this.hasMore) {
      this.loadMore.emit();
    }
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
        message: this.translate.instant('AreYouSureYouWantToDiscard')  + '?', // 'Are you sure you want to discard this question?',
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
} 
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LoggerService } from 'app/services/logger/logger.service';
import { UnansweredQuestionsService } from 'app/services/unanswered-questions.service';
import { ModalConfirmActionComponent } from '../modal-confirm-action/modal-confirm-action.component';

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
  /** Evento per aprire la modale di aggiunta KB */
  @Output() openAddKnowledgeBaseModal = new EventEmitter<any>();
  /** Evento per aggiungere una FAQ dalla unanswered question */
  @Output() addFaqFromUnanswered = new EventEmitter<{q: UnansweredQuestion, done: (success: boolean) => void}>();

  /** Domanda in fase di lavorazione */
  pendingQuestion: UnansweredQuestion | null = null;

  constructor(
    private dialog: MatDialog,
    private logger: LoggerService,
    private unansweredQuestionsService: UnansweredQuestionsService
  ) {}

  ngOnInit(): void {
    // La lista delle domande viene fornita dal componente padre
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
        title: 'Discard Question',
        message: 'Are you sure you want to discard this question?',
        confirmText: 'Discard',
        cancelText: 'Cancel'
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
        this.unansweredQuestions = this.unansweredQuestions.filter(item => item._id !== q._id);
      },
      error: (err) => {
        this.logger.error('[ModalUnansweredQuestions] Error deleting question', err);
        this.unansweredQuestions = prevQuestions;
      }
    });
  }
} 
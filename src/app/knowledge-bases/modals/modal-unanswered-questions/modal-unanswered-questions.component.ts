import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ModalDetailKnowledgeBaseComponent } from '../modal-detail-knowledge-base/modal-detail-knowledge-base.component';
import { LoggerService } from 'app/services/logger/logger.service';
import { UnansweredQuestionsService } from 'app/services/unanswered-questions.service';

interface UnansweredQuestion {
  id: string;
  text: string;
}

@Component({
  selector: 'modal-unanswered-questions',
  templateUrl: './modal-unanswered-questions.component.html',
  styleUrls: ['./modal-unanswered-questions.component.scss']
})
export class ModalUnansweredQuestionsComponent implements OnInit {
  @Input() namespace: any;
  @Input() id_project: string = '';
  @Output() openAddKnowledgeBaseModal = new EventEmitter<any>();
  @Output() addFaqFromUnanswered = new EventEmitter<{question: UnansweredQuestion, done: (success: boolean) => void}>();
  @Input() unansweredQuestions: UnansweredQuestion[] = [];

  pendingQuestion: UnansweredQuestion | null = null;

  constructor(private dialog: MatDialog, private logger: LoggerService, private unansweredQuestionsService: UnansweredQuestionsService) {}

  ngOnInit(): void {
    // Nessun caricamento qui, la lista arriva dal padre
  }

  onOpenAddKnowledgeBaseModal(q: UnansweredQuestion) {
    this.logger.log('[ModalUnansweredQuestions] Opening detail modal for:', q);
    this.unansweredQuestions = this.unansweredQuestions.filter(item => item.id !== q.id);
    this.pendingQuestion = q;
    let kb = {
        name: q.text,
        content: '',
        type: 'faq',
        source: q.text,
        id_project: this.id_project,
        namespace: this.namespace.id,
        _id: ''
      }
    this.addFaqFromUnanswered.emit({question: q, done: (success: boolean) => {
      if (!success && this.pendingQuestion) {
        this.unansweredQuestions = [this.pendingQuestion, ...this.unansweredQuestions];
      }
      this.pendingQuestion = null;
    }});
  }

  onDiscardQuestion(q: UnansweredQuestion) {
    this.logger.log('[ModalUnansweredQuestions] Discard question:', q);
    // Rimuovi subito la domanda
    const prevQuestions = [...this.unansweredQuestions];
    this.unansweredQuestions = this.unansweredQuestions.filter(item => item.id !== q.id);
    this.unansweredQuestionsService.deleteUnansweredQuestion(this.id_project, q['_id']).subscribe({
      next: () => {
        this.logger.log('[ModalUnansweredQuestions] Question deleted successfully');
      },
      error: (err) => {
        this.logger.error('[ModalUnansweredQuestions] Error deleting question', err);
        // Ripristina la domanda se errore
        this.unansweredQuestions = prevQuestions;
      }
    });
  }
} 
import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

import { ModalNsLimitReachedComponent } from '../modals/modal-ns-limit-reached/modal-ns-limit-reached.component';
import { ModalChatbotNameComponent } from '../modals/modal-chatbot-name/modal-chatbot-name.component';
import { ModalHookBotComponent } from '../modals/modal-hook-bot/modal-hook-bot.component';
import { ChatbotModalComponent } from 'app/bots/bots-list/chatbot-modal/chatbot-modal.component';
import { ModalConfirmGotoCdsComponent } from '../modals/modal-confirm-goto-cds/modal-confirm-goto-cds.component';
import { ModalAddNamespaceComponent } from '../modals/modal-add-namespace/modal-add-namespace.component';
import { ModalInstallWidgetComponent } from '../modals/modal-install-widget/modal-install-widget.component';
import { ModalPreviewKnowledgeBaseComponent } from '../modals/modal-preview-knowledge-base/modal-preview-knowledge-base.component';
import { ModalPreviewSettingsComponent } from '../modals/modal-preview-settings/modal-preview-settings.component';
import { ModalDeleteNamespaceComponent } from '../modals/modal-delete-namespace/modal-delete-namespace.component';
import { ModalDetailKnowledgeBaseComponent } from '../modals/modal-detail-knowledge-base/modal-detail-knowledge-base.component';
import { ModalDeleteKnowledgeBaseComponent } from '../modals/modal-delete-knowledge-base/modal-delete-knowledge-base.component';
import { ModalAddContentComponent } from '../modals/modal-add-content/modal-add-content.component';
import { ModalFaqsComponent } from '../modals/modal-faqs/modal-faqs.component';
import { ModalTextFileComponent } from '../modals/modal-text-file/modal-text-file.component';
import { ModalUrlsKnowledgeBaseComponent } from '../modals/modal-urls-knowledge-base/modal-urls-knowledge-base.component';
import { ModalSiteMapComponent } from '../modals/modal-site-map/modal-site-map.component';
import { ModalUploadFileComponent } from '../modals/modal-upload-file/modal-upload-file.component';

@Injectable({ providedIn: 'root' })
/**
 * Layer UI per l’area Knowledge Bases: centralizza tutte le aperture di modali (MatDialog).
 *
 * Obiettivo:
 * - tenere `KnowledgeBasesComponent` libero da dettagli di configurazione delle modali (width/backdrop/data)
 * - fornire un punto unico dove cambiare componenti/modali senza toccare i chiamanti
 *
 * Invocato da:
 * - `KnowledgeBasesFacadeService.dialogs.*`
 * - `KnowledgeBasesComponent` tramite `kbFacade.dialogs.*`
 *
 * Nota:
 * - questo service è “presentational”: non fa fetch dati, riceve già `data` pronto dai workflow/facade.
 */
export class KbDialogsService {
  constructor(private dialog: MatDialog) {}

  /** Modale mostrata quando si raggiunge un limite di piano (es. max agenti/contenuti). */
  openNsLimitReached(data: { planName: string; planLimit: number; planType: string; id_project: string }) {
    return this.dialog.open(ModalNsLimitReachedComponent, {
      backdropClass: 'cdk-overlay-transparent-backdrop',
      hasBackdrop: true,
      width: '400px',
      data,
    });
  }

  /** Modale per editare/confermare il nome del chatbot prima dell’import. */
  openChatbotName(data: { chatbot: any }) {
    return this.dialog.open(ModalChatbotNameComponent, {
      backdropClass: 'cdk-overlay-transparent-backdrop',
      hasBackdrop: true,
      width: '600px',
      data,
    });
  }

  /** Modale per scegliere a quale dipartimento agganciare un bot (quando non c’è un default univoco). */
  openHookBot(data: { deptsWithoutBotArray: any[]; chatbot: any }) {
    return this.dialog.open(ModalHookBotComponent, {
      backdropClass: 'cdk-overlay-transparent-backdrop',
      hasBackdrop: true,
      width: '700px',
      data,
    });
  }

  /** Modale con i dettagli del chatbot (read-only/gestione). */
  openChatbotDetails(data: { chatbot: any }) {
    return this.dialog.open(ChatbotModalComponent, {
      backdropClass: 'cdk-overlay-transparent-backdrop',
      hasBackdrop: true,
      width: '600px',
      data,
    });
  }

  /** Modale “limite chatbot raggiunto” (stesso componente `ChatbotModalComponent` con dati diversi). */
  openReachedChatbotLimit(data: {
    projectProfile: string;
    subscriptionIsActive: boolean;
    prjctProfileType: string;
    trialExpired: boolean;
    chatBotLimit: number;
  }) {
    return this.dialog.open(ChatbotModalComponent, {
      backdropClass: 'cdk-overlay-transparent-backdrop',
      hasBackdrop: true,
      data,
    });
  }

  /** Modale di conferma per apertura CDS (blocks/settings). */
  openConfirmGotoCds(data: { chatbot: any }) {
    return this.dialog.open(ModalConfirmGotoCdsComponent, {
      width: '700px',
      data,
    });
  }

  /** Modale per creazione di un nuovo namespace (agente). */
  openAddNamespace(data: { pay: boolean; hybridActive: boolean }) {
    return this.dialog.open(ModalAddNamespaceComponent, {
      width: '600px',
      data,
    });
  }

  /** Modale che mostra lo snippet JS per installare il widget sul sito (presentational). */
  openInstallWidget(data: { projectId?: string; participants?: string; departmentID?: string }) {
    return this.dialog.open(ModalInstallWidgetComponent, { width: '700px', data });
  }

  /** Modale di anteprima KB (chat/ask) legata al namespace selezionato. */
  openPreviewKnowledgeBase(data: { selectedNamespace: any; askBody?: any }) {
    return this.dialog.open(ModalPreviewKnowledgeBaseComponent, {
      backdropClass: 'cdk-overlay-transparent-backdrop',
      hasBackdrop: true,
      disableClose: true,
      width: '400px',
      id: 'kb-test',
      data,
    });
  }

  /** Modale impostazioni preview (AI settings) del namespace selezionato. */
  openPreviewSettings(data: any) {
    return this.dialog.open(ModalPreviewSettingsComponent, {
      backdropClass: 'overlay-backdrop',
      hasBackdrop: true,
      disableClose: true,
      width: '360px',
      data,
    });
  }

  /** Modale conferma eliminazione namespace. */
  openDeleteNamespace(data: any) {
    return this.dialog.open(ModalDeleteNamespaceComponent, {
      backdropClass: 'cdk-overlay-transparent-backdrop',
      hasBackdrop: true,
      width: '600px',
      data,
    });
  }

  /** Modale dettagli KB (resource detail). */
  openDetailKnowledgeBase(data: any) {
    return this.dialog.open(ModalDetailKnowledgeBaseComponent, {
      backdropClass: 'cdk-overlay-transparent-backdrop',
      hasBackdrop: true,
      width: '400px',
      data,
    });
  }

  /** Modale conferma eliminazione di una risorsa (KB). */
  openDeleteKnowledgeBase(data: any) {
    return this.dialog.open(ModalDeleteKnowledgeBaseComponent, {
      backdropClass: 'cdk-overlay-transparent-backdrop',
      hasBackdrop: true,
      width: '400px',
      data,
    });
  }

  /** Modale scelta tipo contenuto da aggiungere (entrypoint “Add content”). */
  openAddContent(data: any) {
    return this.dialog.open(ModalAddContentComponent, {
      backdropClass: 'cdk-overlay-transparent-backdrop',
      hasBackdrop: true,
      width: '900px',
      data,
    });
  }

  /** Modale aggiunta/gestione FAQs. */
  openFaqs(data: any) {
    return this.dialog.open(ModalFaqsComponent, {
      backdropClass: 'cdk-overlay-transparent-backdrop',
      hasBackdrop: true,
      width: '600px',
      data,
    });
  }

  /** Modale aggiunta testo (text-file). */
  openTextFile(data: any) {
    return this.dialog.open(ModalTextFileComponent, {
      backdropClass: 'cdk-overlay-transparent-backdrop',
      hasBackdrop: true,
      width: '600px',
      data,
    });
  }

  /** Modale aggiunta URLs. */
  openUrlsKnowledgeBase(data: any) {
    return this.dialog.open(ModalUrlsKnowledgeBaseComponent, {
      backdropClass: 'cdk-overlay-transparent-backdrop',
      hasBackdrop: true,
      width: '600px',
      data,
    });
  }

  /** Modale import sitemap. */
  openSiteMap(data: any) {
    return this.dialog.open(ModalSiteMapComponent, {
      backdropClass: 'cdk-overlay-transparent-backdrop',
      hasBackdrop: true,
      width: '600px',
      data,
    });
  }

  /** Modale upload file (pdf/docx/txt). */
  openUploadFile(data: any) {
    return this.dialog.open(ModalUploadFileComponent, {
      backdropClass: 'cdk-overlay-transparent-backdrop',
      hasBackdrop: true,
      width: '600px',
      data,
    });
  }
}


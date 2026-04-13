import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { KbStateService } from './kb-state.service';
import { KbDialogsService } from './kb-dialogs.service';
import { KbWidgetInstallationService } from './kb-widget-installation.service';
import { KbNamespacesWorkflowService } from './kb-namespaces-workflow.service';
import { KbContentsWorkflowService } from './kb-contents-workflow.service';
import { KbScrapingWorkflowService } from './kb-scraping-workflow.service';
import { KbUnansweredWorkflowService } from './kb-unanswered-workflow.service';
import { KbProjectWorkflowService } from './kb-project-workflow.service';
import { KbChatbotWorkflowsService } from './kb-chatbot-workflows.service';
import { KbChatbotTemplateWorkflowService } from './kb-chatbot-template-workflow.service';
import { KbChatbotsUsingNamespaceWorkflowService } from './kb-chatbots-using-namespace-workflow.service';
import { KbDepartmentsWorkflowService } from './kb-departments-workflow.service';
import { KbBotDepartmentHookWorkflowService } from './kb-bot-department-hook-workflow.service';
import { OnboardingChatbotSetupService } from 'app/services/onboarding-chatbot-setup.service';
import { FaqKbService } from 'app/services/faq-kb.service';
import { Chatbot } from 'app/models/faq_kb-model';

@Injectable({ providedIn: 'root' })
/**
 * Facade di dominio per l’area Knowledge Bases.
 *
 * Obiettivo:
 * - esporre al componente una sola dipendenza (thin component)
 * - centralizzare l’accesso ai workflow (namespace, contenuti, scraping, unanswered, install widget, chatbot)
 * - fornire uno state condiviso (`KbStateService`) come single source of truth
 *
 * Invocazioni tipiche:
 * - `KnowledgeBasesComponent`: usa questa facade per leggere/scrivere state e avviare workflow,
 *   evitando dipendenze sparse verso molti service.
 */
export class KnowledgeBasesFacadeService {
  readonly state$ = {
    projectId$: this.kbState.projectId$,
    namespaces$: this.kbState.namespaces$,
    selectedNamespace$: this.kbState.selectedNamespace$,
    kbsList$: this.kbState.kbsList$,
  };

  get snapshot() {
    return this.kbState.snapshot;
  }

  constructor(
    private kbState: KbStateService,

    // UI / dialogs
    public dialogs: KbDialogsService,

    // Domain workflows
    public widgetInstallation: KbWidgetInstallationService,
    public namespaces: KbNamespacesWorkflowService,
    public contents: KbContentsWorkflowService,
    public scraping: KbScrapingWorkflowService,
    public unanswered: KbUnansweredWorkflowService,
    public project: KbProjectWorkflowService,
    public chatbots: KbChatbotWorkflowsService,
    public chatbotTemplates: KbChatbotTemplateWorkflowService,
    public chatbotsUsingNamespace: KbChatbotsUsingNamespaceWorkflowService,
    public departments: KbDepartmentsWorkflowService,
    public botDeptHook: KbBotDepartmentHookWorkflowService,
    private onboardingChatbotSetupService: OnboardingChatbotSetupService,
    private faqKbService: FaqKbService,
  ) {}

  setProjectId(projectId?: string) {
    this.kbState.setProjectId(projectId);
  }

  setNamespaces(namespaces?: any[]) {
    this.kbState.setNamespaces(namespaces);
  }

  setSelectedNamespace(namespace?: any) {
    this.kbState.setSelectedNamespace(namespace);
  }

  setKbsList(kbsList?: any[]) {
    this.kbState.setKbsList(kbsList);
  }

  /**
   * Helper usato dal componente per sincronizzare il view-model col single state.
   * Usalo quando vuoi aggiornare più “slice” di state con un’unica chiamata.
   *
   * Invocato da:
   * - `KnowledgeBasesComponent` (inizializzazione / refresh locali).
   */
  syncViewModel(params: { projectId?: string; namespaces?: any[]; selectedNamespace?: any; kbsList?: any[] }) {
    if (params?.projectId !== undefined) this.setProjectId(params.projectId);
    if (params?.namespaces !== undefined) this.setNamespaces(params.namespaces);
    if (params?.selectedNamespace !== undefined) this.setSelectedNamespace(params.selectedNamespace);
    if (params?.kbsList !== undefined) this.setKbsList(params.kbsList);
  }

  resolveWidgetInstallTarget(params: { projectId: string; namespaceId?: string; namespaceName?: string }) {
    return this.widgetInstallation.resolveWidgetInstallTarget(params);
  }

  loadUnansweredQuestions(params: Parameters<KbUnansweredWorkflowService['load']>[0]) {
    return this.unanswered.load(params);
  }

  loadNamespaces() {
    return this.namespaces.loadNamespaces();
  }

  resolveInitialNamespaceSelection(params: Parameters<KbNamespacesWorkflowService['resolveInitialSelection']>[0]) {
    return this.namespaces.resolveInitialSelection(params);
  }

  createNamespace(projectId: string, namespaceName: string, hybrid: boolean) {
    return this.namespaces.createNamespace(projectId, namespaceName, hybrid);
  }

  updateNamespace(projectId: string, namespaceId: string, body: any) {
    return this.namespaces.updateNamespace(projectId, namespaceId, body);
  }

  deleteNamespace(namespaceId: string, removeAlsoNamespace?: boolean) {
    return this.namespaces.deleteNamespace(namespaceId, removeAlsoNamespace);
  }

  /**
   * Update namespace e, se il namespace viene rinominato, rinomina anche il chatbot associato.
   *
   * Regola di associazione (conservativa):
   * - se esiste un solo bot che usa il namespace -> quello
   * - altrimenti, se tra i bot ce n’è uno con `name === oldNamespaceName` -> quello
   * - altrimenti: non rinomina nulla (evita di rinominare bot “sbagliati”)
   *
   * Nota: eventuali errori di rename bot non bloccano l’update del namespace.
   */
  updateNamespaceAndSyncAssociatedChatbotName(params: {
    projectId: string;
    namespaceId: string;
    body: any;
    oldNamespaceName?: string;
  }) {
    return this.updateNamespace(params.projectId, params.namespaceId, params.body).pipe(
      switchMap((namespace: any) => {
        const renamedTo = namespace?.name;
        const requestedName = params.body?.name;
        if (!requestedName || !renamedTo) return of(namespace);
        if (!params.oldNamespaceName || params.oldNamespaceName === renamedTo) return of(namespace);
        return this.renameAssociatedChatbotForNamespace({
          namespaceId: params.namespaceId,
          oldNamespaceName: params.oldNamespaceName,
          newNamespaceName: renamedTo,
        }).pipe(
          map(() => namespace),
          catchError(() => of(namespace)),
        );
      }),
    );
  }

  /**
   * Delete namespace e, se richiesto (`removeAlsoNamespace === true`),
   * elimina (trashed=true) anche il chatbot associato.
   *
   * Nota: eventuali errori su bot deletion non bloccano l’eliminazione del namespace.
   */
  deleteNamespaceAndAssociatedChatbot(params: {
    namespaceId: string;
    removeAlsoNamespace?: boolean;
    namespaceName?: string;
  }) {
    if (!params.removeAlsoNamespace) {
      return this.deleteNamespace(params.namespaceId, params.removeAlsoNamespace);
    }
    return this.trashAssociatedChatbotForNamespace({
      namespaceId: params.namespaceId,
      namespaceName: params.namespaceName,
    }).pipe(
      catchError(() => of(undefined)),
      switchMap(() => this.deleteNamespace(params.namespaceId, params.removeAlsoNamespace)),
    );
  }

  listContents(params: any) {
    return this.contents.list(params);
  }

  exportContents(namespaceId: string) {
    return this.contents.exportContents(namespaceId);
  }

  importContents(namespaceId: string, formData: FormData) {
    return this.contents.importContents(namespaceId, formData);
  }

  addKb(body: any) {
    return this.contents.addKb(body);
  }

  updateKbContent(kb: any) {
    return this.contents.updateKbContent(kb);
  }

  addMultiKb(namespaceId: string, body: any) {
    return this.contents.addMultiKb(namespaceId, body);
  }

  deleteKb(data: any) {
    return this.contents.deleteKb(data);
  }

  importSitemap(namespaceId: string, body: any) {
    return this.contents.importSitemap(namespaceId, body);
  }

  addSitemap(body: any) {
    return this.contents.addSitemap(body);
  }

  modalPreviewKbHasBeenClosed() {
    return this.contents.modalPreviewKbHasBeenClosed();
  }

  checkScrapingStatus(params: Parameters<KbScrapingWorkflowService['checkStatus']>[0]) {
    return this.scraping.checkStatus(params);
  }

  startScraping(params: Parameters<KbScrapingWorkflowService['start']>[0]) {
    return this.scraping.start(params);
  }

  loadProjectById(projectId: string) {
    return this.project.loadProjectById(projectId);
  }

  loadQuotas(projectId: string) {
    return this.project.loadQuotas(projectId);
  }

  /**
   * Workflow “template -> JSON patchato” per la creazione bot nella sezione Chatbots della KB:
   * - trova template certificato `kb-official-responder`
   * - esporta JSON
   * - patcha `askgptv2.namespace = namespaceId`
   *
   * Invocato da:
   * - `KnowledgeBasesComponent.findKbOfficialResponderAndThenExportToJSON()`
   */
  exportKbOfficialResponderPatchedJson(
    params: Parameters<KbChatbotTemplateWorkflowService['exportKbOfficialResponderPatchedJson']>[0],
  ) {
    return this.chatbotTemplates.exportKbOfficialResponderPatchedJson(params);
  }

  /**
   * Workflow “new theme”: dopo la creazione di un namespace (agente),
   * crea automaticamente un chatbot associato usando il template certificato.
   *
   * Invocato da:
   * - `KnowledgeBasesComponent.createNewNamespace()` quando `cssTheme === 'new'`.
   */
  createKbOfficialResponderChatbotForNamespace(params: {
    projectId: string;
    namespaceId: string;
    chatbotName: string;
  }) {
    return this.onboardingChatbotSetupService.createKbOfficialResponderChatbotForNamespace(params);
  }

  getChatbotsUsingNamespace(namespaceId: string) {
    return this.chatbotsUsingNamespace.getChatbotsUsingNamespace(namespaceId);
  }

  loadDepartments() {
    return this.departments.loadDepartments();
  }

  hookBotToDept(deptId: string, botId: string) {
    return this.departments.hookBotToDept(deptId, botId);
  }

  resolveAndHookBotToDepartmentIfPossible(botId: string) {
    return this.botDeptHook.resolveAndHookIfPossible(botId);
  }

  private normalizeChatbotsResponse(res: any): any[] {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (Array.isArray(res.chatbots)) return res.chatbots;
    if (Array.isArray(res.data)) return res.data;
    return [];
  }

  private resolveAssociatedChatbotForNamespace(params: {
    namespaceId: string;
    namespaceName?: string;
  }): Observable<Chatbot | undefined> {
    return this.getChatbotsUsingNamespace(params.namespaceId).pipe(
      map((res: any) => this.normalizeChatbotsResponse(res) as Chatbot[]),
      map((bots: Chatbot[]) => {
        if (!bots?.length) return undefined;
        if (bots.length === 1) return bots[0];
        if (params.namespaceName) {
          const exactMatch = bots.find((b) => (b as any)?.name === params.namespaceName);
          if (exactMatch) return exactMatch;
        }
        return undefined;
      }),
      catchError(() => of(undefined)),
    );
  }

  private renameAssociatedChatbotForNamespace(params: {
    namespaceId: string;
    oldNamespaceName: string;
    newNamespaceName: string;
  }) {
    return this.resolveAssociatedChatbotForNamespace({
      namespaceId: params.namespaceId,
      namespaceName: params.oldNamespaceName,
    }).pipe(
      switchMap((bot) => {
        if (!bot?._id) return of(undefined);
        const updated: Chatbot = { ...(bot as any), name: params.newNamespaceName };
        return this.faqKbService.updateChatbot(updated).pipe(
          catchError(() => of(undefined)),
        );
      }),
    );
  }

  private trashAssociatedChatbotForNamespace(params: { namespaceId: string; namespaceName?: string }) {
    return this.resolveAssociatedChatbotForNamespace(params).pipe(
      switchMap((bot) => {
        if (!bot?._id) return of(undefined);
        return this.faqKbService.updateFaqKbAsTrashed(bot._id, true).pipe(
          catchError(() => of(undefined)),
        );
      }),
    );
  }
}


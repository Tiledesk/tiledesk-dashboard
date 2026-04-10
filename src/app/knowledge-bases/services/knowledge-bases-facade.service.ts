import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

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

@Injectable({ providedIn: 'root' })
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

  /** Helper usato dal componente per sincronizzare view-model col single state */
  syncViewModel(params: { projectId?: string; namespaces?: any[]; selectedNamespace?: any; kbsList?: any[] }) {
    if (params?.projectId !== undefined) this.setProjectId(params.projectId);
    if (params?.namespaces !== undefined) this.setNamespaces(params.namespaces);
    if (params?.selectedNamespace !== undefined) this.setSelectedNamespace(params.selectedNamespace);
    if (params?.kbsList !== undefined) this.setKbsList(params.kbsList);
  }

  resolveWidgetInstallTarget(projectId: string) {
    return this.widgetInstallation.resolveWidgetInstallTarget(projectId);
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
}


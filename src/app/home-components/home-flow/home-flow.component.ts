import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Chatbot } from 'app/models/faq_kb-model';
import { KnowledgeBaseService } from 'app/services/knowledge-base.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { getLastUpdatedChatbot } from 'app/utils/chatbot-sort.util';
import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import { GridComponent, TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { forkJoin, Observable, of, Subject } from 'rxjs';
import { catchError, map, switchMap, takeUntil, timeout } from 'rxjs/operators';
import {
  alignSeriesToLast10Days,
  computePercentChangeVsPrevious,
  formatSignedPercent,
  HomeFlowModelUsage,
  HomeFlowTimeSeriesPoint,
  parseAiModelUsageResponse,
  parseMostEngagedAgentId,
  parseTimeSeriesResponse,
  sumSeriesValues,
} from './home-flow-analytics.util';
import {
  buildConversationsLineChartOption,
} from './home-flow-charts.util';

echarts.use([LineChart, GridComponent, TooltipComponent, CanvasRenderer]);

interface HomeFlowNamespaceWithChatbots {
  id: string;
  name: string;
  updatedAt?: string;
  chatbots: Array<{ _id: string; name?: string }>;
}

@Component({
  selector: 'home-flow',
  templateUrl: './home-flow.component.html',
  styleUrls: ['./home-flow.component.scss'],
})
export class HomeFlowComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  @ViewChild('conversationsChart') conversationsChartRef?: ElementRef<HTMLDivElement>;
  @ViewChild('kbListEl') kbListEl?: ElementRef<HTMLOListElement>;
  @ViewChild('modelsListEl') modelsListEl?: ElementRef<HTMLDivElement>;

  @Input() chatbots: Chatbot[] = [];
  @Input() chatbotsLoading = false;
  @Input() project: any;
  @Input() PERMISSION_TO_VIEW_FLOWS: boolean;
  @Output() featuredChatbotIdChange = new EventEmitter<string | null>();

  projectId: string;
  lastUpdatedChatbot: Chatbot;
  chatbotPublished = false;
  /** Why this flow is featured in the home card. */
  featuredFlowSource: 'most_engaged' | 'last_edited' | null = null;

  namespacesWithChatbots: HomeFlowNamespaceWithChatbots[] = [];
  chatbotUsedNamespaces: HomeFlowNamespaceWithChatbots[] = [];
  totalNamespacesCount = 0;
  kbListExpanded = false;
  kbListFlash = false;
  kbListCanScrollDown = false;
  private kbListFlashTimer: ReturnType<typeof setTimeout> | null = null;

  modelUsage: HomeFlowModelUsage[] = [];
  modelsListExpanded = false;
  modelsListFlash = false;
  modelsListCanScrollDown = false;
  private modelsListFlashTimer: ReturnType<typeof setTimeout> | null = null;
  conversationsSeries: HomeFlowTimeSeriesPoint[] = [];
  conversationsTotalLabel = '0';
  conversationsPreviousTotalLabel = '0';
  conversationsTrendPercent: number | null = null;
  conversationsTotal = 0;

  analyticsLoading = false;
  chartsReady = false;
  private featuredResolving = false;

  private conversationsChart?: echarts.ECharts;
  private loadedNamespacesProjectId: string | null = null;
  private namespacesLoadRequestId = 0;
  private namespacesReady = false;
  private analyticsAgentId: string | null = null;
  private featuredChatbotRequestId = 0;
  private viewInitialized = false;
  private chartResizeObserver?: ResizeObserver;
  private chartRenderToken = 0;
  private chartRenderTimer: ReturnType<typeof setTimeout> | null = null;
  private chartResizeTimer: ReturnType<typeof setTimeout> | null = null;
  private unsubscribe$ = new Subject<void>();

  constructor(
    private kbService: KnowledgeBaseService,
    private logger: LoggerService,
    private translate: TranslateService,
  ) {}

  ngOnInit(): void {
    if (this.project?._id) {
      this.projectId = this.project._id;
      this.loadNamespacesWithChatbots();
    }
  }

  ngAfterViewInit(): void {
    this.viewInitialized = true;
    this.scheduleFlowChartsRender();
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.resizeFlowCharts();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.project?._id) {
      this.projectId = this.project._id;
    }

    if (changes.project && this.projectId && this.loadedNamespacesProjectId !== this.projectId) {
      this.analyticsAgentId = null;
      this.disposeFlowCharts();
      this.loadNamespacesWithChatbots();
    }

    if (changes.chatbots) {
      this.resolveFeaturedChatbot();
    }

  }

  ngOnDestroy(): void {
    if (this.kbListFlashTimer) {
      clearTimeout(this.kbListFlashTimer);
      this.kbListFlashTimer = null;
    }
    if (this.modelsListFlashTimer) {
      clearTimeout(this.modelsListFlashTimer);
      this.modelsListFlashTimer = null;
    }
    this.chartResizeObserver?.disconnect();
    this.disposeFlowCharts();
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  get hasChatbot(): boolean {
    return !!(this.chatbots?.length && this.lastUpdatedChatbot);
  }

  get showFlowSkeleton(): boolean {
    if (this.PERMISSION_TO_VIEW_FLOWS === false) {
      return false;
    }
    // Full-card skeleton only while chatbots list is loading.
    // Analytics hang must not block the whole card (see analyticsLoading section skels).
    return this.chatbotsLoading;
  }

  get featuredFlowReasonKey(): string | null {
    if (this.featuredFlowSource === 'most_engaged') {
      return 'HomeFlow.MostEngagedAiAgent';
    }
    if (this.featuredFlowSource === 'last_edited') {
      return 'HomeFlow.LastEditedAiAgent';
    }
    return null;
  }

  get activeModelsCount(): number {
    return this.modelUsage.length;
  }

  get displayedModelUsage(): HomeFlowModelUsage[] {
    if (this.modelsListExpanded) {
      return this.modelUsage;
    }
    // Up to 3 fit without growing the card. Beyond that: 2 models + inline "+N".
    if (this.modelUsage.length <= 3) {
      return this.modelUsage;
    }
    return this.modelUsage.slice(0, 2);
  }

  /** Remaining models when collapsed with 4+ (shown as inline "+N" in the 3rd slot). */
  get modelsOverflowCount(): number {
    if (this.modelsListExpanded || this.modelUsage.length <= 3) {
      return 0;
    }
    return this.modelUsage.length - 2;
  }

  get hiddenModelsCount(): number {
    return this.modelsOverflowCount;
  }

  get displayedChatbotUsedNamespaces(): HomeFlowNamespaceWithChatbots[] {
    if (this.kbListExpanded) {
      return this.chatbotUsedNamespaces;
    }
    return this.chatbotUsedNamespaces.slice(0, 2);
  }

  get hiddenKbCount(): number {
    return Math.max(0, this.chatbotUsedNamespaces.length - 2);
  }

  get showKbSkeleton(): boolean {
    return !this.namespacesReady;
  }

  private resolveFeaturedChatbot(): void {
    if (!this.chatbots?.length) {
      this.lastUpdatedChatbot = null;
      this.chatbotPublished = false;
      this.featuredFlowSource = null;
      this.chatbotUsedNamespaces = [];
      this.analyticsAgentId = null;
      this.featuredResolving = false;
      this.resetAnalytics();
      this.featuredChatbotIdChange.emit(null);
      return;
    }

    const requestId = ++this.featuredChatbotRequestId;

    // Paint last-edited identity immediately; wait for agentDistribution before analytics
    // so we don't load last-edited then reload most-engaged (skeleton → chart → skeleton).
    const lastEdited = getLastUpdatedChatbot(this.chatbots);
    this.lastUpdatedChatbot = lastEdited;
    this.featuredFlowSource = lastEdited ? 'last_edited' : null;
    this.chatbotPublished = this.isChatbotPublished(this.lastUpdatedChatbot);
    this.applyChatbotNamespacesFilter();
    this.featuredResolving = false;
    this.featuredChatbotIdChange.emit(lastEdited?._id ?? null);

    if (!this.analyticsAgentId) {
      this.analyticsLoading = true;
    }

    this.kbService.agentDistribution().pipe(
      timeout(8000),
      map((res) => parseMostEngagedAgentId(res)),
      catchError((err) => {
        this.logger.error('[HOME-FLOW] agentDistribution error', err);
        return of(null);
      }),
      takeUntil(this.unsubscribe$),
    ).subscribe((mostEngagedAgentId) => {
      if (requestId !== this.featuredChatbotRequestId) { return; }

      let featuredChatbot: Chatbot | null = null;
      let source: 'most_engaged' | 'last_edited' = 'last_edited';
      if (mostEngagedAgentId) {
        featuredChatbot = this.chatbots.find((bot) => bot._id === mostEngagedAgentId) ?? null;
        if (featuredChatbot) {
          source = 'most_engaged';
        }
      }
      if (!featuredChatbot) {
        featuredChatbot = lastEdited;
        source = 'last_edited';
      }

      this.lastUpdatedChatbot = featuredChatbot;
      this.featuredFlowSource = featuredChatbot ? source : null;
      this.chatbotPublished = this.isChatbotPublished(this.lastUpdatedChatbot);
      this.applyChatbotNamespacesFilter();
      this.featuredChatbotIdChange.emit(featuredChatbot?._id ?? null);
      this.loadFlowAnalytics();
    });
  }

  private isChatbotPublished(bot: Chatbot): boolean {
    if (!bot?.url) { return false; }
    const parts = bot.url.split('/');
    const deployId = parts[parts.length - 1];
    return deployId !== bot._id;
  }

  private loadNamespacesWithChatbots(): void {
    if (!this.projectId) { return; }

    const requestId = ++this.namespacesLoadRequestId;
    this.namespacesReady = false;

    this.kbService.getAllNamespaces().pipe(
      takeUntil(this.unsubscribe$),
      switchMap((namespaces: any[]) => {
        const list = Array.isArray(namespaces) ? [...namespaces] : [];
        list.sort((a, b) => {
          if (a?.updatedAt > b?.updatedAt) { return -1; }
          if (a?.updatedAt < b?.updatedAt) { return 1; }
          return 0;
        });

        if (!list.length) {
          return of([] as HomeFlowNamespaceWithChatbots[]);
        }

        return forkJoin(
          list.map((namespace) =>
            this.kbService.getChatbotsUsingNamespace(namespace.id).pipe(
              map((chatbots: any[]) => ({
                id: namespace.id,
                name: namespace.name,
                updatedAt: namespace.updatedAt,
                chatbots: Array.isArray(chatbots) ? chatbots : [],
              } as HomeFlowNamespaceWithChatbots)),
              catchError((err) => {
                if (err?.status === 0) {
                  this.logger.log('[HOME-FLOW] getChatbotsUsingNamespace cancelled', namespace?.id);
                } else {
                  this.logger.error('[HOME-FLOW] getChatbotsUsingNamespace error', namespace?.id, err);
                }
                return of({
                  id: namespace.id,
                  name: namespace.name,
                  updatedAt: namespace.updatedAt,
                  chatbots: [],
                } as HomeFlowNamespaceWithChatbots);
              })
            )
          )
        );
      })
    ).subscribe({
      next: (enriched) => {
        if (requestId !== this.namespacesLoadRequestId) { return; }
        this.namespacesWithChatbots = enriched;
        this.loadedNamespacesProjectId = this.projectId;
        this.applyChatbotNamespacesFilter();
        this.namespacesReady = true;
      },
      error: (err) => {
        if (requestId !== this.namespacesLoadRequestId) { return; }
        this.namespacesWithChatbots = [];
        this.chatbotUsedNamespaces = [];
        this.totalNamespacesCount = 0;
        this.namespacesReady = true;
        if (err?.status === 0) {
          this.logger.log('[HOME-FLOW] loadNamespacesWithChatbots cancelled');
        } else {
          this.logger.error('[HOME-FLOW] loadNamespacesWithChatbots error', err);
        }
      },
    });
  }

  private applyChatbotNamespacesFilter(): void {
    const agentId = this.lastUpdatedChatbot?._id;
    const all = this.namespacesWithChatbots || [];
    this.totalNamespacesCount = all.length;
    this.kbListExpanded = false;

    if (!agentId) {
      this.chatbotUsedNamespaces = [];
      return;
    }

    this.chatbotUsedNamespaces = all.filter((namespace) =>
      (namespace.chatbots || []).some((bot) => bot._id === agentId)
    );
  }

  private resetAnalytics(): void {
    this.modelUsage = [];
    this.modelsListExpanded = false;
    this.modelsListFlash = false;
    this.modelsListCanScrollDown = false;
    this.conversationsSeries = alignSeriesToLast10Days([], this.kbService.getProjectTimezone());
    this.conversationsTotalLabel = '0';
    this.conversationsPreviousTotalLabel = '0';
    this.conversationsTrendPercent = null;
    this.conversationsTotal = 0;
    this.analyticsLoading = false;
    this.scheduleFlowChartsRender();
  }

  private loadFlowAnalytics(): void {
    const agentId = this.lastUpdatedChatbot?._id;
    if (!this.projectId || !agentId) {
      this.resetAnalytics();
      return;
    }
    if (this.analyticsAgentId === agentId) {
      // Already loaded (or in flight) for this agent — clear resolve-time skeleton if needed.
      if (this.analyticsLoading && this.chartsReady) {
        this.analyticsLoading = false;
      }
      return;
    }

    const softRefresh = this.analyticsAgentId != null;
    this.analyticsAgentId = agentId;

    // First load: section skeleton. Agent switch later: keep current UI until new data arrives.
    if (!softRefresh) {
      this.analyticsLoading = true;
      this.disposeFlowCharts();
    }

    const analyticsTimeoutMs = 12000;
    const withTimeout = <T>(source$: Observable<T>) =>
      source$.pipe(
        timeout(analyticsTimeoutMs),
        catchError((err) => {
          this.logger.error('[HOME-FLOW] analytics request failed/timed out', err);
          return of(null);
        }),
      );

    forkJoin({
      models: withTimeout(this.kbService.aiModelCallCountsAndTokenTotals(agentId)),
      conversations: withTimeout(this.kbService.agentConversazionsOverTime(agentId)),
      conversationsPrevious: withTimeout(
        this.kbService.agentConversazionsOverTime(agentId, this.kbService.getPrevious10DaysChartRange())
      ),
    }).pipe(takeUntil(this.unsubscribe$)).subscribe({
      next: ({ models, conversations, conversationsPrevious }) => {
        if (this.analyticsAgentId !== agentId) { return; }
        const allModels = parseAiModelUsageResponse(models);
        this.modelUsage = allModels;
        this.modelsListExpanded = false;
        this.modelsListCanScrollDown = false;
        const timeZone = this.kbService.getProjectTimezone();
        this.conversationsSeries = alignSeriesToLast10Days(
          parseTimeSeriesResponse(conversations, ['ops', 'conversations', 'count', 'value'], timeZone),
          timeZone,
        );
        const previousConversationPoints = parseTimeSeriesResponse(
          conversationsPrevious,
          ['ops', 'conversations', 'count', 'value'],
          timeZone,
        );
        const currentConversationsTotal = sumSeriesValues(this.conversationsSeries);
        const previousConversationsTotal = sumSeriesValues(previousConversationPoints);
        this.conversationsTrendPercent = computePercentChangeVsPrevious(
          currentConversationsTotal,
          previousConversationsTotal,
        );
        this.conversationsTotal = currentConversationsTotal;
        this.conversationsTotalLabel = this.conversationsTotal.toLocaleString();
        this.conversationsPreviousTotalLabel = previousConversationsTotal.toLocaleString();
        this.analyticsLoading = false;
        this.scheduleFlowChartsRender();
      },
      error: (err) => {
        this.logger.error('[HOME-FLOW] loadFlowAnalytics error', err);
        if (this.analyticsAgentId !== agentId) { return; }
        this.analyticsLoading = false;
        this.conversationsTrendPercent = null;
        this.conversationsPreviousTotalLabel = '0';
        this.conversationsTotal = 0;
        this.conversationsSeries = alignSeriesToLast10Days([], this.kbService.getProjectTimezone());
        this.scheduleFlowChartsRender();
      },
    });
  }

  private scheduleFlowChartsRender(): void {
    if (!this.viewInitialized) { return; }
    // Chart host is absent during full-card or analytics section skeleton.
    if (this.showFlowSkeleton || this.analyticsLoading) { return; }

    if (this.chartRenderTimer) {
      clearTimeout(this.chartRenderTimer);
      this.chartRenderTimer = null;
    }

    const token = ++this.chartRenderToken;
    // Debounce concurrent callers (analytics / view init) into one paint.
    this.chartRenderTimer = setTimeout(() => {
      this.chartRenderTimer = null;
      this.tryRenderFlowCharts(token, 0);
    }, 40);
  }

  private tryRenderFlowCharts(token: number, attempt: number): void {
    if (token !== this.chartRenderToken) { return; }
    if (this.showFlowSkeleton || this.analyticsLoading) { return; }

    const maxAttempts = 20;
    const conversationsEl = this.conversationsChartRef?.nativeElement;

    if (!conversationsEl) {
      if (attempt < maxAttempts) {
        setTimeout(() => this.tryRenderFlowCharts(token, attempt + 1), 50);
      }
      return;
    }

    const layoutReady =
      (conversationsEl.clientWidth ?? 0) > 0 && (conversationsEl.clientHeight ?? 0) > 0;
    if (!layoutReady && attempt < maxAttempts) {
      setTimeout(() => this.tryRenderFlowCharts(token, attempt + 1), 50);
      return;
    }

    this.renderFlowCharts();
  }

  private renderFlowCharts(): void {
    const conversationsEl = this.conversationsChartRef?.nativeElement;
    if (!conversationsEl) { return; }

    const conversationPoints = this.conversationsSeries?.length
      ? this.conversationsSeries
      : alignSeriesToLast10Days([], this.kbService.getProjectTimezone());

    const option = buildConversationsLineChartOption(
      conversationPoints,
      this.translate.instant('HomeFlow.ConversationsLaunched'),
    );

    const existing = echarts.getInstanceByDom(conversationsEl);
    if (existing && !existing.isDisposed()) {
      this.conversationsChart = existing;
      existing.setOption(option, { notMerge: true, lazyUpdate: true });
    } else {
      this.disposeChartOnElement(conversationsEl);
      this.conversationsChart = echarts.init(conversationsEl);
      this.conversationsChart.setOption(option, { notMerge: true });
    }

    this.chartsReady = true;
    this.observeChartContainers();
    requestAnimationFrame(() => {
      this.conversationsChart?.resize();
    });
  }

  private observeChartContainers(): void {
    if (typeof ResizeObserver === 'undefined') {
      return;
    }

    const conversationsEl = this.conversationsChartRef?.nativeElement;
    if (!conversationsEl) {
      return;
    }

    this.chartResizeObserver?.disconnect();
    this.chartResizeObserver = new ResizeObserver(() => {
      if (this.chartResizeTimer) {
        clearTimeout(this.chartResizeTimer);
      }
      this.chartResizeTimer = setTimeout(() => {
        this.chartResizeTimer = null;
        this.resizeFlowCharts();
      }, 80);
    });

    this.chartResizeObserver.observe(conversationsEl);
  }

  private resizeFlowCharts(): void {
    if (!this.chartsReady || !this.conversationsChart || this.conversationsChart.isDisposed()) {
      return;
    }

    requestAnimationFrame(() => {
      this.conversationsChart?.resize();
    });
  }

  private disposeFlowCharts(): void {
    this.chartRenderToken++;
    if (this.chartRenderTimer) {
      clearTimeout(this.chartRenderTimer);
      this.chartRenderTimer = null;
    }
    if (this.chartResizeTimer) {
      clearTimeout(this.chartResizeTimer);
      this.chartResizeTimer = null;
    }
    this.chartResizeObserver?.disconnect();
    this.conversationsChart?.dispose();
    this.conversationsChart = undefined;
    this.disposeChartOnElement(this.conversationsChartRef?.nativeElement);
    this.chartsReady = false;
  }

  private disposeChartOnElement(el?: HTMLDivElement | null): void {
    if (!el) { return; }
    const existing = echarts.getInstanceByDom(el);
    existing?.dispose();
  }

  toggleKbListExpand(event?: Event): void {
    event?.preventDefault();
    event?.stopPropagation();
    if (this.hiddenKbCount <= 0 && !this.kbListExpanded) {
      return;
    }
    this.kbListExpanded = !this.kbListExpanded;
    if (this.kbListExpanded) {
      this.triggerKbListFlash();
      setTimeout(() => this.updateKbListScrollState(), 0);
    } else {
      this.kbListCanScrollDown = false;
    }
  }

  toggleModelsListExpand(event?: Event): void {
    event?.preventDefault();
    event?.stopPropagation();
    if (this.hiddenModelsCount <= 0 && !this.modelsListExpanded) {
      return;
    }
    this.modelsListExpanded = !this.modelsListExpanded;
    if (this.modelsListExpanded) {
      this.triggerModelsListFlash();
      setTimeout(() => this.updateModelsListScrollState(), 0);
    } else {
      this.modelsListCanScrollDown = false;
    }
  }

  scrollKbListDown(event?: Event): void {
    event?.preventDefault();
    event?.stopPropagation();
    const list = this.kbListEl?.nativeElement;
    if (!list || !this.kbListExpanded) {
      return;
    }
    const firstItem = list.querySelector('.home-flow__kb-item') as HTMLElement | null;
    const step = firstItem?.offsetHeight || 22;
    list.scrollBy({ top: step, behavior: 'smooth' });
    setTimeout(() => this.updateKbListScrollState(), 220);
  }

  scrollModelsListDown(event?: Event): void {
    event?.preventDefault();
    event?.stopPropagation();
    const list = this.modelsListEl?.nativeElement;
    if (!list || !this.modelsListExpanded) {
      return;
    }
    const firstItem = list.querySelector('.home-flow__model-row') as HTMLElement | null;
    const step = firstItem?.offsetHeight || 36;
    list.scrollBy({ top: step + 12, behavior: 'smooth' });
    setTimeout(() => this.updateModelsListScrollState(), 220);
  }

  onKbListScroll(): void {
    this.updateKbListScrollState();
  }

  onModelsListScroll(): void {
    this.updateModelsListScrollState();
  }

  private updateKbListScrollState(): void {
    const list = this.kbListEl?.nativeElement;
    if (!list || !this.kbListExpanded) {
      this.kbListCanScrollDown = false;
      return;
    }
    const remaining = list.scrollHeight - list.scrollTop - list.clientHeight;
    this.kbListCanScrollDown = remaining > 1;
  }

  private updateModelsListScrollState(): void {
    const list = this.modelsListEl?.nativeElement;
    if (!list || !this.modelsListExpanded) {
      this.modelsListCanScrollDown = false;
      return;
    }
    const remaining = list.scrollHeight - list.scrollTop - list.clientHeight;
    this.modelsListCanScrollDown = remaining > 1;
  }

  private triggerKbListFlash(): void {
    if (this.kbListFlashTimer) {
      clearTimeout(this.kbListFlashTimer);
      this.kbListFlashTimer = null;
    }
    // Retrigger animation if the user expands again quickly
    this.kbListFlash = false;
    setTimeout(() => {
      this.kbListFlash = true;
      this.kbListFlashTimer = setTimeout(() => {
        this.kbListFlash = false;
        this.kbListFlashTimer = null;
      }, 1400);
    }, 0);
  }

  private triggerModelsListFlash(): void {
    if (this.modelsListFlashTimer) {
      clearTimeout(this.modelsListFlashTimer);
      this.modelsListFlashTimer = null;
    }
    this.modelsListFlash = false;
    setTimeout(() => {
      this.modelsListFlash = true;
      this.modelsListFlashTimer = setTimeout(() => {
        this.modelsListFlash = false;
        this.modelsListFlashTimer = null;
      }, 1400);
    }, 0);
  }

  modelBarColor(index: number): string {
    const colors = ['#111111', '#9aa0a6', '#e8a4b8'];
    return colors[index] ?? '#d0d0d0';
  }

  conversationsTrendLabel(percent: number): string {
    return formatSignedPercent(percent);
  }
}

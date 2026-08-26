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
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Chatbot } from 'app/models/faq_kb-model';
import { AppConfigService } from 'app/services/app-config.service';
import { DepartmentService } from 'app/services/department.service';
import { KnowledgeBaseService } from 'app/services/knowledge-base.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { NotifyService } from 'app/core/notify.service';
import { goToCDSVersion } from 'app/utils/util';
import { getLastUpdatedChatbot } from 'app/utils/chatbot-sort.util';
import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import { GridComponent, TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { forkJoin, of, Subject } from 'rxjs';
import { catchError, map, switchMap, takeUntil } from 'rxjs/operators';
import {
  alignSeriesToLast10Days,
  computePercentChangeVsPrevious,
  formatSignedPercent,
  formatTokenCountCompact,
  HomeFlowModelUsage,
  HomeFlowTimeSeriesPoint,
  parseAiModelUsageResponse,
  parseMostEngagedAgentId,
  parseTimeSeriesResponse,
  sumSeriesValues,
} from './home-flow-analytics.util';
import {
  buildConversationsLineChartOption,
  buildTokenLineChartOption,
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
  @ViewChild('tokenChart') tokenChartRef?: ElementRef<HTMLDivElement>;
  @ViewChild('conversationsChart') conversationsChartRef?: ElementRef<HTMLDivElement>;

  @Output() goToCreateChatbot = new EventEmitter<void>();
  @Input() chatbots: Chatbot[] = [];
  @Input() project: any;
  @Input() USER_ROLE: string;
  @Input() PERMISSION_TO_VIEW_FLOWS: boolean;
  @Input() PERMISSION_TO_EDIT_FLOWS: boolean;
  @Input() PERMISSION_TO_TEST_FLOW: boolean;

  projectId: string;
  lastUpdatedChatbot: Chatbot;
  chatbotPublished = false;

  namespacesWithChatbots: HomeFlowNamespaceWithChatbots[] = [];
  chatbotUsedNamespaces: HomeFlowNamespaceWithChatbots[] = [];
  totalNamespacesCount = 0;

  modelUsage: HomeFlowModelUsage[] = [];
  activeModelsTotalCount = 0;
  tokenSeries: HomeFlowTimeSeriesPoint[] = [];
  conversationsSeries: HomeFlowTimeSeriesPoint[] = [];
  tokenTotalLabel = '0';
  tokenTrendPercent: number | null = null;
  conversationsTotalLabel = '0';
  conversationsTrendPercent: number | null = null;
  conversationsTotal = 0;

  analyticsLoading = false;
  chartsReady = false;

  private tokenChart?: echarts.ECharts;
  private conversationsChart?: echarts.ECharts;
  private defaultDeptId: string;
  private loadedNamespacesProjectId: string | null = null;
  private namespacesLoadRequestId = 0;
  private analyticsAgentId: string | null = null;
  private featuredChatbotRequestId = 0;
  private viewInitialized = false;
  private chartResizeObserver?: ResizeObserver;
  private unsubscribe$ = new Subject<void>();

  constructor(
    private kbService: KnowledgeBaseService,
    private departmentService: DepartmentService,
    private router: Router,
    private appConfigService: AppConfigService,
    private notify: NotifyService,
    private logger: LoggerService,
    private translate: TranslateService,
  ) {}

  ngOnInit(): void {
    if (this.project?._id) {
      this.projectId = this.project._id;
      this.loadNamespacesWithChatbots();
    }
    this.getDefaultDeptId();
  }

  ngAfterViewInit(): void {
    this.viewInitialized = true;
    this.observeChartContainers();
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
      this.loadNamespacesWithChatbots();
    }

    if (changes.chatbots) {
      this.resolveFeaturedChatbot();
    }
  }

  ngOnDestroy(): void {
    this.chartResizeObserver?.disconnect();
    this.disposeFlowCharts();
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  get hasChatbot(): boolean {
    return !!(this.chatbots?.length && this.lastUpdatedChatbot);
  }

  get activeModelsCount(): number {
    return this.activeModelsTotalCount;
  }

  private resolveFeaturedChatbot(): void {
    if (!this.chatbots?.length) {
      this.lastUpdatedChatbot = null;
      this.chatbotPublished = false;
      this.chatbotUsedNamespaces = [];
      this.analyticsAgentId = null;
      this.resetAnalytics();
      return;
    }

    const requestId = ++this.featuredChatbotRequestId;

    this.kbService.agentDistribution().pipe(
      map((res) => parseMostEngagedAgentId(res)),
      catchError((err) => {
        this.logger.error('[HOME-FLOW] agentDistribution error', err);
        return of(null);
      }),
      takeUntil(this.unsubscribe$),
    ).subscribe((mostEngagedAgentId) => {
      if (requestId !== this.featuredChatbotRequestId) { return; }

      let featuredChatbot: Chatbot | null = null;
      if (mostEngagedAgentId) {
        featuredChatbot = this.chatbots.find((bot) => bot._id === mostEngagedAgentId) ?? null;
      }
      if (!featuredChatbot) {
        featuredChatbot = getLastUpdatedChatbot(this.chatbots);
      }

      this.lastUpdatedChatbot = featuredChatbot;
      this.chatbotPublished = this.isChatbotPublished(this.lastUpdatedChatbot);
      this.applyChatbotNamespacesFilter();
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
                this.logger.error('[HOME-FLOW] getChatbotsUsingNamespace error', namespace?.id, err);
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
      },
      error: (err) => {
        if (requestId !== this.namespacesLoadRequestId) { return; }
        this.namespacesWithChatbots = [];
        this.chatbotUsedNamespaces = [];
        this.totalNamespacesCount = 0;
        this.logger.error('[HOME-FLOW] loadNamespacesWithChatbots error', err);
      },
    });
  }

  private applyChatbotNamespacesFilter(): void {
    const agentId = this.lastUpdatedChatbot?._id;
    const all = this.namespacesWithChatbots || [];
    this.totalNamespacesCount = all.length;

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
    this.activeModelsTotalCount = 0;
    this.tokenSeries = alignSeriesToLast10Days([]);
    this.conversationsSeries = alignSeriesToLast10Days([]);
    this.tokenTotalLabel = '0';
    this.tokenTrendPercent = null;
    this.conversationsTotalLabel = '0';
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
      return;
    }
    this.analyticsAgentId = agentId;
    this.analyticsLoading = true;

    forkJoin({
      models: this.kbService.aiModelCallCountsAndTokenTotals(agentId).pipe(catchError(() => of(null))),
      tokens: this.kbService.tokenUsagePerAgentOverTime(agentId).pipe(catchError(() => of(null))),
      tokensPrevious: this.kbService
        .tokenUsagePerAgentOverTime(agentId, this.kbService.getPrevious10DaysChartRange())
        .pipe(catchError(() => of(null))),
      conversations: this.kbService.agentConversazionsOverTime(agentId).pipe(catchError(() => of(null))),
      conversationsPrevious: this.kbService
        .agentConversazionsOverTime(agentId, this.kbService.getPrevious10DaysChartRange())
        .pipe(catchError(() => of(null))),
    }).pipe(takeUntil(this.unsubscribe$)).subscribe({
      next: ({ models, tokens, tokensPrevious, conversations, conversationsPrevious }) => {
        if (this.analyticsAgentId !== agentId) { return; }
        const allModels = parseAiModelUsageResponse(models);
        this.modelUsage = allModels.slice(0, 3);
        this.activeModelsTotalCount = allModels.length;
        this.tokenSeries = alignSeriesToLast10Days(
          parseTimeSeriesResponse(tokens, ['total_tokens'])
        );
        const previousTokenPoints = parseTimeSeriesResponse(
          tokensPrevious,
          ['total_tokens'],
        );
        const currentTokenTotal = sumSeriesValues(this.tokenSeries);
        const previousTokenTotal = sumSeriesValues(previousTokenPoints);
        this.tokenTrendPercent = computePercentChangeVsPrevious(currentTokenTotal, previousTokenTotal);
        this.conversationsSeries = alignSeriesToLast10Days(
          parseTimeSeriesResponse(conversations, ['ops', 'conversations', 'count', 'value'])
        );
        const previousConversationPoints = parseTimeSeriesResponse(
          conversationsPrevious,
          ['ops', 'conversations', 'count', 'value'],
        );
        const currentConversationsTotal = sumSeriesValues(this.conversationsSeries);
        const previousConversationsTotal = sumSeriesValues(previousConversationPoints);
        this.conversationsTrendPercent = computePercentChangeVsPrevious(
          currentConversationsTotal,
          previousConversationsTotal,
        );
        this.tokenTotalLabel = formatTokenCountCompact(currentTokenTotal);
        this.conversationsTotal = currentConversationsTotal;
        this.conversationsTotalLabel = this.conversationsTotal.toLocaleString();
        this.analyticsLoading = false;
        this.scheduleFlowChartsRender();
      },
      error: (err) => {
        this.logger.error('[HOME-FLOW] loadFlowAnalytics error', err);
        this.analyticsLoading = false;
        this.tokenTrendPercent = null;
        this.conversationsTrendPercent = null;
        this.tokenSeries = alignSeriesToLast10Days([]);
        this.conversationsSeries = alignSeriesToLast10Days([]);
        this.scheduleFlowChartsRender();
      },
    });
  }

  private scheduleFlowChartsRender(attempt = 0): void {
    if (!this.viewInitialized) { return; }

    const maxAttempts = 15;
    const tokenEl = this.tokenChartRef?.nativeElement;
    const conversationsEl = this.conversationsChartRef?.nativeElement;

    if (!tokenEl || !conversationsEl) {
      if (attempt < maxAttempts) {
        requestAnimationFrame(() => this.scheduleFlowChartsRender(attempt + 1));
      }
      return;
    }

    const layoutReady = [tokenEl, conversationsEl].every(
      (el) => (el?.clientWidth ?? 0) > 0 && (el?.clientHeight ?? 0) > 0,
    );
    if (!layoutReady && attempt < maxAttempts) {
      requestAnimationFrame(() => this.scheduleFlowChartsRender(attempt + 1));
      return;
    }

    this.renderFlowCharts();
  }

  private renderFlowCharts(): void {
    const tokenEl = this.tokenChartRef?.nativeElement;
    const conversationsEl = this.conversationsChartRef?.nativeElement;
    if (!tokenEl || !conversationsEl) { return; }

    this.observeChartContainers();

    const tokenPoints = this.tokenSeries?.length
      ? this.tokenSeries
      : alignSeriesToLast10Days([]);
    const conversationPoints = this.conversationsSeries?.length
      ? this.conversationsSeries
      : alignSeriesToLast10Days([]);

    this.disposeChartOnElement(tokenEl);
    this.disposeChartOnElement(conversationsEl);

    this.tokenChart = echarts.init(tokenEl);
    this.tokenChart.setOption(
      buildTokenLineChartOption(tokenPoints, this.translate.instant('HomeFlow.Token10Days')),
      { notMerge: true },
    );

    this.conversationsChart = echarts.init(conversationsEl);
    this.conversationsChart.setOption(
      buildConversationsLineChartOption(
        conversationPoints,
        this.translate.instant('HomeFlow.ConversationsLaunched'),
      ),
      { notMerge: true },
    );

    this.chartsReady = true;
    this.resizeFlowCharts();
  }

  private observeChartContainers(): void {
    if (typeof ResizeObserver === 'undefined') {
      return;
    }

    const tokenEl = this.tokenChartRef?.nativeElement;
    const conversationsEl = this.conversationsChartRef?.nativeElement;
    if (!tokenEl && !conversationsEl) {
      return;
    }

    this.chartResizeObserver?.disconnect();
    this.chartResizeObserver = new ResizeObserver(() => {
      this.resizeFlowCharts();
    });

    if (tokenEl) {
      this.chartResizeObserver.observe(tokenEl);
    }
    if (conversationsEl) {
      this.chartResizeObserver.observe(conversationsEl);
    }
  }

  private resizeFlowCharts(): void {
    if (!this.chartsReady) {
      return;
    }

    requestAnimationFrame(() => {
      this.tokenChart?.resize();
      this.conversationsChart?.resize();
    });
  }

  private disposeFlowCharts(): void {
    this.tokenChart?.dispose();
    this.conversationsChart?.dispose();
    this.tokenChart = undefined;
    this.conversationsChart = undefined;
    this.disposeChartOnElement(this.tokenChartRef?.nativeElement);
    this.disposeChartOnElement(this.conversationsChartRef?.nativeElement);
    this.chartsReady = false;
  }

  private disposeChartOnElement(el?: HTMLDivElement | null): void {
    if (!el) { return; }
    const existing = echarts.getInstanceByDom(el);
    existing?.dispose();
  }

  private getDefaultDeptId(): void {
    this.departmentService.getDeptsByProjectId().pipe(takeUntil(this.unsubscribe$)).subscribe({
      next: (depts: any[]) => {
        (depts || []).forEach((dept) => {
          if (dept?.default === true) {
            this.defaultDeptId = dept._id;
          }
        });
      },
      error: (err) => this.logger.error('[HOME-FLOW] getDefaultDeptId error', err),
    });
  }

  onSimulateFlow(): void {
    if (!this.PERMISSION_TO_TEST_FLOW) {
      this.notify.presentDialogNoPermissionToPermomfAction();
      return;
    }
    if (!this.lastUpdatedChatbot?._id || !this.projectId) { return; }

    const widgetBaseUrl = this.appConfigService.getConfig().WIDGET_BASE_URL;
    const testUrl = `${widgetBaseUrl}assets/twp/chatbot-panel.html?tiledesk_projectid=${this.projectId}&tiledesk_participants=bot_${this.lastUpdatedChatbot._id}&tiledesk_departmentID=${this.defaultDeptId}`;
    const left = (screen.width - 830) / 2;
    const top = (screen.height - 727) / 4;
    const params = `toolbar=no,menubar=no,width=830,height=727,left=${left},top=${top}`;
    window.open(testUrl, '_blank', params);
  }

  onEditFlow(): void {
    if (!this.PERMISSION_TO_EDIT_FLOWS) {
      this.notify.presentDialogNoPermissionToPermomfAction();
      return;
    }
    if (this.USER_ROLE === 'agent') {
      this.notify.presentModalOnlyOwnerCanManageTheAccountPlan(
        'Agents can\'t manage chatbots',
        'Learn more about default roles'
      );
      return;
    }

    if (this.chatbots?.length > 0) {
      if (this.lastUpdatedChatbot.type === 'external') {
        this.router.navigate(['project/' + this.project._id + '/bots', this.lastUpdatedChatbot._id, 'external']);
      } else {
        goToCDSVersion(
          this.router,
          this.lastUpdatedChatbot,
          this.projectId,
          this.appConfigService.getConfig().cdsBaseUrl
        );
      }
      return;
    }

    this.goToCreateChatbot.emit();
  }

  modelBarColor(index: number): string {
    const colors = ['#111111', '#9aa0a6', '#e8a4b8'];
    return colors[index] ?? '#d0d0d0';
  }

  tokenTrendLabel(percent: number): string {
    return formatSignedPercent(percent);
  }

  conversationsTrendLabel(percent: number): string {
    return formatSignedPercent(percent);
  }
}

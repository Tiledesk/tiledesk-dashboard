import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { KnowledgeBaseService } from 'app/services/knowledge-base.service';
import { LoggerService } from 'app/services/logger/logger.service';
import * as echarts from 'echarts/core';
import { BarChart, LineChart } from 'echarts/charts';
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { forkJoin, of, Subject } from 'rxjs';
import { catchError, switchMap, takeUntil } from 'rxjs/operators';
import {
  buildConversationsOverviewChartOption,
  // buildTokensOverviewChartOption, // Step 1: tokens card replaced by KB queries
  computeOverviewPercentChange,
  formatOverviewSignedPercent,
  OverviewConversationsSeries,
  parseConversationsOverviewResponse,
  // parseTokensOverviewResponse, // Step 1: tokens card replaced by KB queries
} from './home-overview.util';
// import { HomeFlowTimeSeriesPoint } from '../home-flow/home-flow-analytics.util'; // Step 1: tokens
import {
  buildEmptyKbAnalyticsLast10Days,
  buildKbLegend,
  buildKbGroupedBarChartOption,
  ensureKbAnalyticsLast10Days,
  KbAnalyticsParsed,
  KbLegendItem,
  parseKbPerKbOverTimeResponse,
} from '../home-kb-analytics/home-kb-analytics.util';

echarts.use([BarChart, LineChart, GridComponent, LegendComponent, TooltipComponent, CanvasRenderer]);

@Component({
  selector: 'home-overview',
  templateUrl: './home-overview.component.html',
  styleUrls: ['./home-overview.component.scss'],
})
export class HomeOverviewComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  @ViewChild('conversationsChart') conversationsChartRef?: ElementRef<HTMLDivElement>;
  // @ViewChild('tokensChart') tokensChartRef?: ElementRef<HTMLDivElement>; // Step 1: tokens
  @ViewChild('kbQueriesChart') kbQueriesChartRef?: ElementRef<HTMLDivElement>;

  @Input() project: any;
  @Input() PERMISSION_TO_VIEW_ANALYTICS = false;

  projectId: string;
  loading = true;

  conversationsTotal = 0;
  conversationsPreviousTotal = 0;
  conversationsTrendPercent: number | null = null;

  // Step 1: Token Consumption Over Time — kept for restore
  // tokensTotal = 0;
  // tokensAverageDaily = 0;
  // tokensPreviousTotal = 0;
  // tokensTrendPercent: number | null = null;

  kbQueriesTotal = 0;
  kbQueriesPreviousTotal = 0;
  kbQueriesTrendPercent: number | null = null;
  kbLegendItems: KbLegendItem[] = [];

  private conversationsParsed: OverviewConversationsSeries | null = null;
  // private tokensSeries: HomeFlowTimeSeriesPoint[] = []; // Step 1: tokens
  private kbQueriesParsed: KbAnalyticsParsed | null = null;
  private conversationsChart?: echarts.ECharts;
  // private tokensChart?: echarts.ECharts; // Step 1: tokens
  private kbQueriesChart?: echarts.ECharts;
  private loadRequestId = 0;
  private viewReady = false;
  private readonly unsubscribe$ = new Subject<void>();

  constructor(
    private kbService: KnowledgeBaseService,
    private logger: LoggerService,
    private translate: TranslateService,
  ) {}

  ngOnInit(): void {
    this.projectId = this.project?._id;
    this.loadAnalytics();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['project'] && !changes['project'].firstChange) {
      this.projectId = this.project?._id;
      this.loadAnalytics();
    }
  }

  ngAfterViewInit(): void {
    this.viewReady = true;
    this.scheduleChartsRender();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.disposeCharts();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.conversationsChart?.resize();
    // this.tokensChart?.resize(); // Step 1: tokens
    this.kbQueriesChart?.resize();
  }

  conversationsTrendLabel(percent: number): string {
    return formatOverviewSignedPercent(percent);
  }

  // tokensTrendLabel(percent: number): string {
  //   return formatOverviewSignedPercent(percent);
  // }

  private queriesTotalFromParsed(parsed: KbAnalyticsParsed): number {
    if (parsed.series?.length) {
      return parsed.series.reduce((sum, item) => sum + (item.totalSum || 0), 0);
    }
    return (parsed.answeredTotal || 0) + (parsed.unansweredTotal || 0);
  }

  private loadAnalytics(): void {
    if (!this.PERMISSION_TO_VIEW_ANALYTICS || !this.projectId) { return; }

    const requestId = ++this.loadRequestId;
    this.loading = true;

    const currentRange = this.kbService.getLast10DaysChartRange();
    const previousRange = this.kbService.getPrevious10DaysChartRange();

    forkJoin({
      conversations: this.kbService.projectConversationsOverTime(currentRange).pipe(
        catchError((err) => {
          this.logger.error('[HOME-OVERVIEW] conversations current error', err);
          return of(null);
        }),
      ),
      conversationsPrevious: this.kbService.projectConversationsOverTime(previousRange).pipe(
        catchError((err) => {
          this.logger.error('[HOME-OVERVIEW] conversations previous error', err);
          return of(null);
        }),
      ),
      // Step 1: tokens replaced by KB queries
      // tokens: this.kbService.projectTokensOverTime(currentRange).pipe(
      //   catchError((err) => {
      //     this.logger.error('[HOME-OVERVIEW] tokens current error', err);
      //     return of(null);
      //   }),
      // ),
      // tokensPrevious: this.kbService.projectTokensOverTime(previousRange).pipe(
      //   catchError((err) => {
      //     this.logger.error('[HOME-OVERVIEW] tokens previous error', err);
      //     return of(null);
      //   }),
      // ),
      kbQueries: this.kbService.getAllNamespaces().pipe(
        switchMap((namespaces: any[]) => {
          const list = Array.isArray(namespaces) ? namespaces : [];
          const kbIds = list
            .map((namespace) => String(namespace?.id || '').trim())
            .filter(Boolean);
          if (!kbIds.length) {
            return of({ current: null, previous: null });
          }
          const kbParam = kbIds.join(',');
          return forkJoin({
            current: this.kbService.getAnwseredUnansweredQuestionsForCharts(
              currentRange.from,
              currentRange.to,
              kbParam,
            ).pipe(catchError((err) => {
              this.logger.error('[HOME-OVERVIEW] kb queries current error', err);
              return of(null);
            })),
            previous: this.kbService.getAnwseredUnansweredQuestionsForCharts(
              previousRange.from,
              previousRange.to,
              kbParam,
            ).pipe(catchError((err) => {
              this.logger.error('[HOME-OVERVIEW] kb queries previous error', err);
              return of(null);
            })),
          });
        }),
        catchError((err) => {
          this.logger.error('[HOME-OVERVIEW] namespaces error', err);
          return of({ current: null, previous: null });
        }),
      ),
    }).pipe(
      takeUntil(this.unsubscribe$),
    ).subscribe({
      next: ({ conversations, conversationsPrevious, kbQueries }) => {
        if (requestId !== this.loadRequestId) { return; }

        this.logger.log('[HOME-OVERVIEW] conversations raw', conversations);
        this.logger.log('[HOME-OVERVIEW] kb queries raw', kbQueries);

        const timeZone = this.kbService.getProjectTimezone();
        const currentConv = parseConversationsOverviewResponse(conversations, timeZone);
        const previousConv = parseConversationsOverviewResponse(conversationsPrevious, timeZone);
        this.conversationsParsed = currentConv;
        this.conversationsTotal = currentConv.totalSum;
        this.conversationsPreviousTotal = previousConv.totalSum;
        this.conversationsTrendPercent = computeOverviewPercentChange(
          currentConv.totalSum,
          previousConv.totalSum,
        );

        // Step 1: tokens parsing commented
        // const currentTokens = parseTokensOverviewResponse(tokens, timeZone);
        // const previousTokens = parseTokensOverviewResponse(tokensPrevious, timeZone);
        // this.tokensSeries = currentTokens.points;
        // const tokensSum = currentTokens.totalSum;
        // const previousTokensSum = previousTokens.totalSum;
        // this.tokensTotal = tokensSum;
        // this.tokensAverageDaily = Math.round(tokensSum / 10);
        // this.tokensPreviousTotal = previousTokensSum;
        // this.tokensTrendPercent = computeOverviewPercentChange(tokensSum, previousTokensSum);

        const currentKb = ensureKbAnalyticsLast10Days(
          parseKbPerKbOverTimeResponse(kbQueries?.current, timeZone),
          timeZone,
        );
        const previousKb = parseKbPerKbOverTimeResponse(kbQueries?.previous, timeZone);
        this.kbQueriesParsed = currentKb;
        this.kbQueriesTotal = this.queriesTotalFromParsed(currentKb);
        this.kbQueriesPreviousTotal = this.queriesTotalFromParsed(previousKb);
        this.kbQueriesTrendPercent = computeOverviewPercentChange(
          this.kbQueriesTotal,
          this.kbQueriesPreviousTotal,
        );
        this.kbLegendItems = buildKbLegend(currentKb.series);

        this.loading = false;
        this.scheduleChartsRender();
      },
      error: (err) => {
        if (requestId !== this.loadRequestId) { return; }
        this.logger.error('[HOME-OVERVIEW] load error', err);
        this.resetState();
      },
    });
  }

  private resetState(): void {
    this.conversationsParsed = null;
    // this.tokensSeries = []; // Step 1: tokens
    this.kbQueriesParsed = buildEmptyKbAnalyticsLast10Days(this.kbService.getProjectTimezone());
    this.conversationsTotal = 0;
    // this.tokensTotal = 0;
    // this.tokensAverageDaily = 0;
    this.conversationsPreviousTotal = 0;
    // this.tokensPreviousTotal = 0;
    this.conversationsTrendPercent = null;
    // this.tokensTrendPercent = null;
    this.kbQueriesTotal = 0;
    this.kbQueriesPreviousTotal = 0;
    this.kbQueriesTrendPercent = null;
    this.kbLegendItems = [];
    this.loading = false;
    this.disposeCharts();
    this.scheduleChartsRender();
  }

  private scheduleChartsRender(attempt = 0): void {
    if (!this.viewReady || this.loading || !this.conversationsParsed || !this.kbQueriesParsed) { return; }
    const conversationsEl = this.conversationsChartRef?.nativeElement;
    const kbQueriesEl = this.kbQueriesChartRef?.nativeElement;
    if (
      !conversationsEl ||
      !kbQueriesEl ||
      conversationsEl.clientWidth < 8 ||
      kbQueriesEl.clientWidth < 8 ||
      conversationsEl.clientHeight < 8 ||
      kbQueriesEl.clientHeight < 8
    ) {
      if (attempt < 20) {
        setTimeout(() => this.scheduleChartsRender(attempt + 1), 50);
      }
      return;
    }
    this.renderCharts();
  }

  private renderCharts(): void {
    if (!this.conversationsParsed || !this.kbQueriesParsed) { return; }

    const conversationsEl = this.conversationsChartRef?.nativeElement;
    const kbQueriesEl = this.kbQueriesChartRef?.nativeElement;
    if (!conversationsEl || !kbQueriesEl) { return; }

    this.disposeCharts();

    this.conversationsChart = echarts.init(conversationsEl);
    this.conversationsChart.setOption(
      buildConversationsOverviewChartOption(this.conversationsParsed, {
        total: this.translate.instant('HomeOverview.Total'),
        withAi: this.translate.instant('HomeOverview.WithAiAgent'),
        withoutAi: this.translate.instant('HomeOverview.WithoutAiAgent'),
      }),
    );

    // Step 1: tokens chart commented
    // this.tokensChart = echarts.init(tokensEl);
    // this.tokensChart.setOption(
    //   buildTokensOverviewChartOption(
    //     this.tokensSeries,
    //     this.translate.instant('HomeOverview.TokenConsumptionOverTime'),
    //   ),
    // );

    this.kbQueriesChart = echarts.init(kbQueriesEl);
    this.kbQueriesChart.setOption(
      buildKbGroupedBarChartOption(
        this.kbQueriesParsed.dayKeys,
        this.kbQueriesParsed.series,
        {
          answered: this.translate.instant('HomeKbAnalytics.Answered'),
          unanswered: this.translate.instant('HomeKbAnalytics.Unanswered'),
        },
      ),
    );

    setTimeout(() => {
      this.conversationsChart?.resize();
      this.kbQueriesChart?.resize();
    }, 0);
  }

  private disposeCharts(): void {
    this.conversationsChart?.dispose();
    // this.tokensChart?.dispose();
    this.kbQueriesChart?.dispose();
    this.conversationsChart = undefined;
    // this.tokensChart = undefined;
    this.kbQueriesChart = undefined;
    this.disposeOnElement(this.conversationsChartRef?.nativeElement);
    // this.disposeOnElement(this.tokensChartRef?.nativeElement);
    this.disposeOnElement(this.kbQueriesChartRef?.nativeElement);
  }

  private disposeOnElement(el?: HTMLDivElement | null): void {
    if (!el) { return; }
    echarts.getInstanceByDom(el)?.dispose();
  }
}

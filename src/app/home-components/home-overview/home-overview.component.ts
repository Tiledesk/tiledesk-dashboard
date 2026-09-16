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
import { LineChart } from 'echarts/charts';
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { forkJoin, of, Subject } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';
import {
  buildConversationsOverviewChartOption,
  buildTokensOverviewChartOption,
  computeOverviewPercentChange,
  formatOverviewSignedPercent,
  OverviewConversationsSeries,
  parseConversationsOverviewResponse,
  parseTokensOverviewResponse,
} from './home-overview.util';
import { HomeFlowTimeSeriesPoint } from '../home-flow/home-flow-analytics.util';

echarts.use([LineChart, GridComponent, LegendComponent, TooltipComponent, CanvasRenderer]);

@Component({
  selector: 'home-overview',
  templateUrl: './home-overview.component.html',
  styleUrls: ['./home-overview.component.scss'],
})
export class HomeOverviewComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  @ViewChild('conversationsChart') conversationsChartRef?: ElementRef<HTMLDivElement>;
  @ViewChild('tokensChart') tokensChartRef?: ElementRef<HTMLDivElement>;

  @Input() project: any;
  @Input() PERMISSION_TO_VIEW_ANALYTICS = false;

  projectId: string;
  loading = false;

  conversationsTotal = 0;
  tokensTotal = 0;
  tokensAverageDaily = 0;
  conversationsPreviousTotal = 0;
  tokensPreviousTotal = 0;
  conversationsTrendPercent: number | null = null;
  tokensTrendPercent: number | null = null;

  private conversationsParsed: OverviewConversationsSeries | null = null;
  private tokensSeries: HomeFlowTimeSeriesPoint[] = [];
  private conversationsChart?: echarts.ECharts;
  private tokensChart?: echarts.ECharts;
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
    this.tokensChart?.resize();
  }

  conversationsTrendLabel(percent: number): string {
    return formatOverviewSignedPercent(percent);
  }

  tokensTrendLabel(percent: number): string {
    return formatOverviewSignedPercent(percent);
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
      tokens: this.kbService.projectTokensOverTime(currentRange).pipe(
        catchError((err) => {
          this.logger.error('[HOME-OVERVIEW] tokens current error', err);
          return of(null);
        }),
      ),
      tokensPrevious: this.kbService.projectTokensOverTime(previousRange).pipe(
        catchError((err) => {
          this.logger.error('[HOME-OVERVIEW] tokens previous error', err);
          return of(null);
        }),
      ),
    }).pipe(
      takeUntil(this.unsubscribe$),
    ).subscribe({
      next: ({ conversations, conversationsPrevious, tokens, tokensPrevious }) => {
        if (requestId !== this.loadRequestId) { return; }

        this.logger.log('[HOME-OVERVIEW] conversations raw', conversations);
        this.logger.log('[HOME-OVERVIEW] tokens raw', tokens);

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

        const currentTokens = parseTokensOverviewResponse(tokens, timeZone);
        const previousTokens = parseTokensOverviewResponse(tokensPrevious, timeZone);
        this.tokensSeries = currentTokens.points;
        const tokensSum = currentTokens.totalSum;
        const previousTokensSum = previousTokens.totalSum;
        this.tokensTotal = tokensSum;
        this.tokensAverageDaily = Math.round(tokensSum / 10);
        this.tokensPreviousTotal = previousTokensSum;
        this.tokensTrendPercent = computeOverviewPercentChange(tokensSum, previousTokensSum);

        this.logger.log('[HOME-OVERVIEW] conversations parsed', currentConv);
        this.logger.log('[HOME-OVERVIEW] tokens parsed', { tokensSum, previousTokensSum });

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
    this.tokensSeries = [];
    this.conversationsTotal = 0;
    this.tokensTotal = 0;
    this.tokensAverageDaily = 0;
    this.conversationsPreviousTotal = 0;
    this.tokensPreviousTotal = 0;
    this.conversationsTrendPercent = null;
    this.tokensTrendPercent = null;
    this.loading = false;
    this.disposeCharts();
  }

  private scheduleChartsRender(attempt = 0): void {
    if (!this.viewReady || this.loading || !this.conversationsParsed) { return; }
    const conversationsEl = this.conversationsChartRef?.nativeElement;
    const tokensEl = this.tokensChartRef?.nativeElement;
    if (
      !conversationsEl ||
      !tokensEl ||
      conversationsEl.clientWidth < 8 ||
      tokensEl.clientWidth < 8 ||
      conversationsEl.clientHeight < 8 ||
      tokensEl.clientHeight < 8
    ) {
      if (attempt < 20) {
        setTimeout(() => this.scheduleChartsRender(attempt + 1), 50);
      }
      return;
    }
    this.renderCharts();
  }

  private renderCharts(): void {
    if (!this.conversationsParsed) { return; }

    const conversationsEl = this.conversationsChartRef?.nativeElement;
    const tokensEl = this.tokensChartRef?.nativeElement;
    if (!conversationsEl || !tokensEl) { return; }

    this.disposeCharts();

    this.conversationsChart = echarts.init(conversationsEl);
    this.conversationsChart.setOption(
      buildConversationsOverviewChartOption(this.conversationsParsed, {
        total: this.translate.instant('HomeOverview.Total'),
        withAi: this.translate.instant('HomeOverview.WithAiAgent'),
        withoutAi: this.translate.instant('HomeOverview.WithoutAiAgent'),
      }),
    );

    this.tokensChart = echarts.init(tokensEl);
    this.tokensChart.setOption(
      buildTokensOverviewChartOption(
        this.tokensSeries,
        this.translate.instant('HomeOverview.TokenConsumptionOverTime'),
      ),
    );

    setTimeout(() => {
      this.conversationsChart?.resize();
      this.tokensChart?.resize();
    }, 0);
  }

  private disposeCharts(): void {
    this.conversationsChart?.dispose();
    this.tokensChart?.dispose();
    this.conversationsChart = undefined;
    this.tokensChart = undefined;
    this.disposeOnElement(this.conversationsChartRef?.nativeElement);
    this.disposeOnElement(this.tokensChartRef?.nativeElement);
  }

  private disposeOnElement(el?: HTMLDivElement | null): void {
    if (!el) { return; }
    echarts.getInstanceByDom(el)?.dispose();
  }
}

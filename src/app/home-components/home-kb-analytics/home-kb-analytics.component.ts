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
  buildEmptyKbAnalyticsLast10Days,
  buildKbLegend,
  buildKbResponseRateLineChartOption,
  buildKbStackedBarChartOption,
  computePercentChange,
  computeResponseRatePercent,
  ensureKbAnalyticsLast10Days,
  hasKbUsage,
  KbAnalyticsParsed,
  KbLegendItem,
  parseKbPerKbOverTimeResponse,
} from './home-kb-analytics.util';

echarts.use([BarChart, LineChart, GridComponent, LegendComponent, TooltipComponent, CanvasRenderer]);

@Component({
  selector: 'home-kb-analytics',
  templateUrl: './home-kb-analytics.component.html',
  styleUrls: ['./home-kb-analytics.component.scss'],
})
export class HomeKbAnalyticsComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  @ViewChild('stackedChart') stackedChartRef?: ElementRef<HTMLDivElement>;
  @ViewChild('answersChart') answersChartRef?: ElementRef<HTMLDivElement>;

  @Input() project: any;
  @Input() PERMISSION_TO_VIEW_KB = false;

  projectId: string;
  loading = true;
  hasData = false;

  responseRatePercent: number | null = null;
  responseRateDeltaPercent: number | null = null;
  answeredTotal = 0;
  unansweredTotal = 0;
  answeredTotalLabel = '0';
  answeredPreviousTotalLabel = '0';
  queriesTotal = 0;
  queriesPreviousTotal = 0;
  queriesDeltaPercent: number | null = null;
  legendItems: KbLegendItem[] = [];

  private stackedChart?: echarts.ECharts;
  private answersChart?: echarts.ECharts;
  private currentParsed: KbAnalyticsParsed | null = null;
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
    this.stackedChart?.resize();
    this.answersChart?.resize();
  }

  get responseRateLabel(): string {
    if (this.responseRatePercent == null) { return '—'; }
    return `${this.responseRatePercent.toLocaleString(undefined, {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    })}%`;
  }

  get deltaLabel(): string {
    return this.formatSignedPercent(this.responseRateDeltaPercent);
  }

  get queriesDeltaLabel(): string {
    return this.formatSignedPercent(this.queriesDeltaPercent);
  }

  private formatSignedPercent(value: number | null): string {
    if (value == null) { return '—'; }
    const abs = Math.abs(value).toLocaleString(undefined, {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    });
    const sign = value > 0 ? '+' : value < 0 ? '−' : '';
    return `${sign}${abs}%`;
  }

  private queriesTotalFromParsed(parsed: KbAnalyticsParsed): number {
    if (parsed.series?.length) {
      return parsed.series.reduce((sum, item) => sum + (item.totalSum || 0), 0);
    }
    return (parsed.answeredTotal || 0) + (parsed.unansweredTotal || 0);
  }

  private loadAnalytics(): void {
    if (!this.PERMISSION_TO_VIEW_KB || !this.projectId) { return; }

    const requestId = ++this.loadRequestId;
    this.loading = true;

    this.kbService.getAllNamespaces().pipe(
      takeUntil(this.unsubscribe$),
      switchMap((namespaces: any[]) => {
        const list = Array.isArray(namespaces) ? namespaces : [];
        const kbIds = list
          .map((namespace) => String(namespace?.id || '').trim())
          .filter(Boolean);

        if (!kbIds.length) {
          return of({ current: null, previous: null });
        }

        const currentRange = this.kbService.getLast10DaysChartRange();
        const previousRange = this.kbService.getPrevious10DaysChartRange();
        const kbParam = kbIds.join(',');

        return forkJoin({
          current: this.kbService.getAnwseredUnansweredQuestionsForCharts(
            currentRange.from,
            currentRange.to,
            kbParam,
          ).pipe(catchError((err) => {
            this.logger.error('[HOME-KB-ANALYTICS] current period error', err);
            return of(null);
          })),
          previous: this.kbService.getAnwseredUnansweredQuestionsForCharts(
            previousRange.from,
            previousRange.to,
            kbParam,
          ).pipe(catchError((err) => {
            this.logger.error('[HOME-KB-ANALYTICS] previous period error', err);
            return of(null);
          })),
        });
      }),
      catchError((err) => {
        this.logger.error('[HOME-KB-ANALYTICS] namespaces error', err);
        return of({ current: null, previous: null });
      }),
    ).subscribe({
      next: ({ current, previous }) => {
        if (requestId !== this.loadRequestId) { return; }

        const timeZone = this.kbService.getProjectTimezone();
        const currentParsed = ensureKbAnalyticsLast10Days(parseKbPerKbOverTimeResponse(current, timeZone), timeZone);
        // Previous window must keep its own day keys — remapping onto current last-10 days
        // would drop all values and show answeredPreviousTotal = 0.
        const previousParsed = parseKbPerKbOverTimeResponse(previous, timeZone);

        this.currentParsed = currentParsed;
        this.answeredTotal = currentParsed.answeredTotal;
        this.unansweredTotal = currentParsed.unansweredTotal;
        this.answeredTotalLabel = currentParsed.answeredTotal.toLocaleString();
        this.answeredPreviousTotalLabel = previousParsed.answeredTotal.toLocaleString();

        this.queriesTotal = this.queriesTotalFromParsed(currentParsed);
        this.queriesPreviousTotal = this.queriesTotalFromParsed(previousParsed);
        this.queriesDeltaPercent = computePercentChange(this.queriesTotal, this.queriesPreviousTotal) ?? 0;

        this.hasData = hasKbUsage(currentParsed);
        this.legendItems = this.hasData ? buildKbLegend(currentParsed.series) : [];

        const currentRate = computeResponseRatePercent(
          currentParsed.answeredTotal,
          currentParsed.unansweredTotal,
        );
        const previousRate = computeResponseRatePercent(
          previousParsed.answeredTotal,
          previousParsed.unansweredTotal,
        );
        // Zero-usage: still show 0% + flat chart like home-flow token/conversations cards.
        this.responseRatePercent = currentRate ?? 0;
        this.responseRateDeltaPercent = computePercentChange(currentRate ?? 0, previousRate) ?? 0;
        this.loading = false;
        this.scheduleChartsRender();
      },
      error: (err) => {
        if (requestId !== this.loadRequestId) { return; }
        this.logger.error('[HOME-KB-ANALYTICS] load error', err);
        this.resetState();
      },
    });
  }

  private resetState(): void {
    this.currentParsed = buildEmptyKbAnalyticsLast10Days(this.kbService.getProjectTimezone());
    this.answeredTotal = 0;
    this.unansweredTotal = 0;
    this.answeredTotalLabel = '0';
    this.answeredPreviousTotalLabel = '0';
    this.queriesTotal = 0;
    this.queriesPreviousTotal = 0;
    this.queriesDeltaPercent = 0;
    this.legendItems = [];
    this.responseRatePercent = 0;
    this.responseRateDeltaPercent = 0;
    this.hasData = false;
    this.loading = false;
    this.disposeCharts();
    this.scheduleChartsRender();
  }

  private scheduleChartsRender(attempt = 0): void {
    if (!this.viewReady || this.loading || !this.currentParsed) { return; }
    const stackedEl = this.stackedChartRef?.nativeElement;
    const answersEl = this.answersChartRef?.nativeElement;
    if (
      !answersEl ||
      answersEl.clientWidth < 8 ||
      answersEl.clientHeight < 8 ||
      !stackedEl ||
      stackedEl.clientWidth < 8 ||
      stackedEl.clientHeight < 8
    ) {
      if (attempt < 20) {
        setTimeout(() => this.scheduleChartsRender(attempt + 1), 50);
      }
      return;
    }
    this.renderCharts();
  }

  private renderCharts(): void {
    if (!this.currentParsed) { return; }

    const stackedEl = this.stackedChartRef?.nativeElement;
    const answersEl = this.answersChartRef?.nativeElement;
    if (!stackedEl || !answersEl) { return; }

    this.disposeCharts();

    this.stackedChart = echarts.init(stackedEl);
    this.stackedChart.setOption(
      buildKbStackedBarChartOption(
        this.currentParsed.dayKeys,
        this.currentParsed.series,
      ),
    );

    const rateLabel = this.translate.instant('HomeKbAnalytics.ResponseRate');
    this.answersChart = echarts.init(answersEl);
    this.answersChart.setOption(
      buildKbResponseRateLineChartOption(
        this.currentParsed.dayKeys,
        this.currentParsed.answeredByDay,
        this.currentParsed.unansweredByDay,
        rateLabel,
      ),
    );

    // Legend/HTML footer can change flex space after paint; resize so canvas
    // does not overflow over labels below the chart.
    setTimeout(() => {
      this.stackedChart?.resize();
      this.answersChart?.resize();
    }, 0);
  }

  private disposeCharts(): void {
    this.stackedChart?.dispose();
    this.answersChart?.dispose();
    this.stackedChart = undefined;
    this.answersChart = undefined;
    this.disposeOnElement(this.stackedChartRef?.nativeElement);
    this.disposeOnElement(this.answersChartRef?.nativeElement);
  }

  private disposeOnElement(el?: HTMLDivElement | null): void {
    if (!el) { return; }
    echarts.getInstanceByDom(el)?.dispose();
  }
}

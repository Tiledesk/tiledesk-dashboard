import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { FlowWebhooksLogsService } from '../../services/flow-webhooks-logs.service';
import { AuthService } from '../../core/auth.service';

interface LogRow {
  text: string;
  level: string;
  nlevel: number;
  _id: string;
  timestamp: string;
}

interface LogEntry {
  _id: string;
  request_id: string;
  __v: number;
  createdAt: string;
  id_project: string;
  rows: LogRow;
  shortExp: string;
  updatedAt: string;
}

@Component({
  selector: 'appdashboard-flow-webhooks-logs',
  templateUrl: './flow-webhooks-logs.component.html',
  styleUrls: ['./flow-webhooks-logs.component.scss']
})
export class FlowWebhooksLogsComponent implements OnInit {
  isChromeVerGreaterThan100: boolean;
  IS_OPEN_SETTINGS_SIDEBAR: boolean = true;
  SERVER_BASE_PATH: string;

  listOfLogs: LogEntry[] = [];
  filteredLogs: LogEntry[] = [];
  expandedLogId: string | null = null;
  logLevels = [
    { value: 'info', label: 'Info', nlevel: 2 },
    { value: 'warn', label: 'Warn', nlevel: 1 },
    { value: 'error', label: 'Error', nlevel: 3 }
  ];
  selectedLevel = 'info';

  constructor(
    private logsService: FlowWebhooksLogsService, 
    private auth: AuthService) { }

  ngOnInit(): void {
    this.getBrowserVersion();
    this.fetchLogs();
  }

  getBrowserVersion() {
    this.auth.isChromeVerGreaterThan100.subscribe((isChromeVerGreaterThan100: boolean) => {
      this.isChromeVerGreaterThan100 = isChromeVerGreaterThan100;
    })
  }

  fetchLogs() {
    this.logsService.getLogs().subscribe((logs: LogEntry[]) => {
      this.listOfLogs = logs;
      this.applyFilter();
    });
  }

  applyFilter() {
    const selected = this.logLevels.find(l => l.value === this.selectedLevel);
    if (selected) {
      this.filteredLogs = this.listOfLogs.filter(log => log.rows.nlevel >= selected.nlevel);
    } else {
      this.filteredLogs = this.listOfLogs;
    }
  }

  onLevelChange(level: string) {
    this.selectedLevel = level;
    this.applyFilter();
  }

  toggleExpand(logId: string) {
    this.expandedLogId = this.expandedLogId === logId ? null : logId;
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleString();
  }
}

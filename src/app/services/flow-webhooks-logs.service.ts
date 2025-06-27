import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from 'app/core/auth.service';
import { AppConfigService } from './app-config.service';
import { LoggerService } from './logger/logger.service';
import { ActivatedRoute } from '@angular/router';

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

@Injectable({ providedIn: 'root' })
export class FlowWebhooksLogsService {
  private SERVER_BASE_PATH: string;
  private LOG_URL: string;
  private projectID: string;
  private TOKEN: string;

  constructor(
    private readonly http: HttpClient,
    private readonly route: ActivatedRoute,
    public auth: AuthService,
    public appConfigService: AppConfigService,
    private readonly logger: LoggerService
  ) {
    this.initStaticServices();
  }

  /**
   * Inizializza le variabili di configurazione e token
   */
  private initStaticServices(): void {
    this.SERVER_BASE_PATH = this.appConfigService.getConfig().SERVER_BASE_URL;
    this.getToken();
    this.getCurrentProject();
  }

  /**
   * Recupera il token utente
   */
  private getToken(): void {
    this.auth.user_bs.subscribe((user) => {
      if (user) {
        this.TOKEN = user.token;
        this.logger.log('[WEBHOOK-SERV] User is signed in');
      }
    });
  }

  /**
   * Recupera l'ID del progetto corrente
   */
  private getCurrentProject(): void {
    this.auth.project_bs.subscribe((project) => {
      if (project) {
        this.projectID = project._id;
        this.logger.log('[WEBHOOK-SERV] ID PROJECT ', this.projectID);
      }
    });
  }

  /**
   * Recupera i log reali da backend (REST API)
   * @param webhook_id ID del webhook
   * @param direction direzione (opzionale)
   * @param timestamp timestamp (opzionale)
   * @param logLevel livello di log (opzionale)
   */
  public getStaticLastLogs(
    webhook_id: string,
    direction?: string,
    timestamp?: string,
    logLevel?: string
  ): Observable<any> {
    this.LOG_URL = `${this.SERVER_BASE_PATH}${this.projectID}/logs/flows/${webhook_id}`;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };
    let url = this.LOG_URL + '?type=webhook';
    if (direction) url += `&direction=${direction}`;
    if (timestamp) url += `&timestamp=${timestamp}`;
    if (logLevel) url += `&logLevel=${logLevel}`;
    this.logger.log('[LOG-SERV] - GET LOG - URL', url);
    return this.http.get<any>(url, httpOptions);
  }

  /**
   * Restituisce log mock (per test/local dev)
   * @param direction direzione (opzionale, ignorato nel mock)
   */
  public getLogs(direction?: string): Observable<LogEntry[]> {
    return of([
      {
        _id: '1',
        request_id: 'req-1',
        __v: 0,
        createdAt: '2025-05-08T09:28:06.009Z',
        id_project: 'project-1',
        rows: {
          text: '[Capture User Reply] Action completed',
          level: 'info',
          nlevel: 2,
          _id: 'row-1',
          timestamp: '2025-05-08T09:28:06.587Z'
        },
        shortExp: '2025-05-08T09:28:06.586Z',
        updatedAt: '2025-05-08T09:28:06.586Z'
      },
      {
        _id: '2',
        request_id: 'req-2',
        __v: 0,
        createdAt: '2025-05-08T09:29:06.009Z',
        id_project: 'project-1',
        rows: {
          text: 'Warning: something might be wrong in the flow execution. Please check the configuration.',
          level: 'warn',
          nlevel: 1,
          _id: 'row-2',
          timestamp: '2025-05-08T09:29:06.587Z'
        },
        shortExp: '2025-05-08T09:29:06.586Z',
        updatedAt: '2025-05-08T09:29:06.586Z'
      },
      {
        _id: '3',
        request_id: 'req-3',
        __v: 0,
        createdAt: '2025-05-08T09:30:06.009Z',
        id_project: 'project-1',
        rows: {
          text: 'Error: failed to execute webhook due to missing parameters in the payload.',
          level: 'error',
          nlevel: 3,
          _id: 'row-3',
          timestamp: '2025-05-08T09:30:06.587Z'
        },
        shortExp: '2025-05-08T09:30:06.586Z',
        updatedAt: '2025-05-08T09:30:06.586Z'
      }
    ]);
  }
} 
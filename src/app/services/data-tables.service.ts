import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from 'app/core/auth.service';
import { AppConfigService } from './app-config.service';
import { LoggerService } from './logger/logger.service';
import {
  ApiSuccessMessage,
  CreateTableRequest,
  DataTable,
  DataTableWithRows,
  InsertRowRequest,
  RowData,
  TableRow,
  UpdateTableRequest,
  UpsertRowRequest,
  RowMutationRequest,
} from 'app/models/data-tables.model';

@Injectable({
  providedIn: 'root'
})
export class DataTablesService {

  private SERVER_BASE_PATH: string;
  private TOKEN: string;
  private user: any;
  private projectId: string;

  constructor(
    private httpClient: HttpClient,
    private auth: AuthService,
    private appConfigService: AppConfigService,
    private logger: LoggerService,
  ) {
    this.auth.user_bs.subscribe((user) => {
      this.user = user;
      this.checkIfUserExistAndGetToken();
    });
    this.getCurrentProject();
    this.getAppConfig();
  }

  // ─── Tables ────────────────────────────────────────────────────────────────

  listTables(projectId?: string): Observable<DataTable[]> {
    const url = this.tablesBaseUrl(projectId);
    this.logger.log('[DATA-TABLES-SERV] listTables URL', url);
    return this.httpClient.get<DataTable[]>(url, this.httpOptions());
  }

  createTable(body: CreateTableRequest, projectId?: string): Observable<DataTable> {
    const url = this.tablesBaseUrl(projectId);
    this.logger.log('[DATA-TABLES-SERV] createTable URL', url, body);
    return this.httpClient.post<DataTable>(url, body, this.httpOptions());
  }

  getTable(tableId: string, projectId?: string): Observable<DataTableWithRows> {
    const url = `${this.tablesBaseUrl(projectId)}/${tableId}`;
    this.logger.log('[DATA-TABLES-SERV] getTable URL', url);
    return this.httpClient.get<DataTableWithRows>(url, this.httpOptions());
  }

  updateTable(tableId: string, body: UpdateTableRequest, projectId?: string): Observable<DataTable> {
    const url = `${this.tablesBaseUrl(projectId)}/${tableId}`;
    this.logger.log('[DATA-TABLES-SERV] updateTable URL', url, body);
    return this.httpClient.put<DataTable>(url, body, this.httpOptions());
  }

  deleteTable(tableId: string, projectId?: string): Observable<ApiSuccessMessage> {
    const url = `${this.tablesBaseUrl(projectId)}/${tableId}/delete`;
    this.logger.log('[DATA-TABLES-SERV] deleteTable URL', url);
    return this.httpClient.delete<ApiSuccessMessage>(url, this.httpOptions());
  }

  // ─── Rows ──────────────────────────────────────────────────────────────────

  listRows(tableId: string, projectId?: string): Observable<RowData[]> {
    const url = `${this.tablesBaseUrl(projectId)}/${tableId}/rows`;
    this.logger.log('[DATA-TABLES-SERV] listRows URL', url);
    return this.httpClient.get<RowData[]>(url, this.httpOptions());
  }

  /** Placeholder endpoint (not yet implemented on server). */
  getRow(tableId: string, projectId?: string): Observable<{ success?: boolean; message?: string }> {
    const url = `${this.tablesBaseUrl(projectId)}/${tableId}/row`;
    this.logger.log('[DATA-TABLES-SERV] getRow URL', url);
    return this.httpClient.get<{ success?: boolean; message?: string }>(url, this.httpOptions());
  }

  insertRow(tableId: string, body: InsertRowRequest, projectId?: string): Observable<TableRow> {
    const url = `${this.tablesBaseUrl(projectId)}/${tableId}/insert`;
    this.logger.log('[DATA-TABLES-SERV] insertRow URL', url, body);
    return this.httpClient.put<TableRow>(url, body, this.httpOptions());
  }

  updateRow(tableId: string, body: RowMutationRequest, projectId?: string): Observable<TableRow> {
    const url = `${this.tablesBaseUrl(projectId)}/${tableId}/update`;
    this.logger.log('[DATA-TABLES-SERV] updateRow URL', url, body);
    return this.httpClient.put<TableRow>(url, body, this.httpOptions());
  }

  upsertRow(tableId: string, body: UpsertRowRequest, projectId?: string): Observable<TableRow | TableRow[]> {
    const url = `${this.tablesBaseUrl(projectId)}/${tableId}/upsert`;
    this.logger.log('[DATA-TABLES-SERV] upsertRow URL', url, body);
    return this.httpClient.put<TableRow | TableRow[]>(url, body, this.httpOptions());
  }

  deleteRow(tableId: string, body: InsertRowRequest, projectId?: string): Observable<TableRow | null> {
    const url = `${this.tablesBaseUrl(projectId)}/${tableId}/delete`;
    this.logger.log('[DATA-TABLES-SERV] deleteRow URL', url, body);
    return this.httpClient.put<TableRow | null>(url, body, this.httpOptions());
  }

  // ─── Init / helpers ──────────────────────────────────────────────────────

  private checkIfUserExistAndGetToken(): void {
    if (this.user) {
      this.TOKEN = this.user.token;
    } else {
      this.logger.log('[DATA-TABLES-SERV] No user signed in');
    }
  }

  private getAppConfig(): void {
    this.SERVER_BASE_PATH = this.appConfigService.getConfig().SERVER_BASE_URL;
  }

  private getCurrentProject(): void {
    this.auth.project_bs.subscribe((project) => {
      if (project) {
        this.projectId = project._id;
      }
    });
  }

  private tablesBaseUrl(projectId?: string): string {
    return `${this.SERVER_BASE_PATH}${this.resolveProjectId(projectId)}/tables`;
  }

  private resolveProjectId(projectId?: string): string {
    const id = projectId || this.projectId;
    if (!id) {
      throw new Error('[DATA-TABLES-SERV] projectId is required');
    }
    return id;
  }

  private httpOptions(): { headers: HttpHeaders } {
    return {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN,
      }),
    };
  }
}

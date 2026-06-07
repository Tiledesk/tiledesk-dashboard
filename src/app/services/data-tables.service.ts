import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from 'app/core/auth.service';
import { AppConfigService } from './app-config.service';
import { LoggerService } from './logger/logger.service';
import {
  ApiSuccessMessage,
  ColumnInput,
  CreateTableRequest,
  DataTable,
  DeleteRowRequest,
  InsertRowRequest,
  RenameColumnRequest,
  RowDocument,
  RowListItem,
  RowSearchRequest,
  TableWithRows,
  UpdateRowRequest,
  UpdateTableRequest,
  UpsertRowRequest,
} from 'app/models/data-tables.model';

@Injectable({
  providedIn: 'root',
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

  getTable(tableId: string, projectId?: string): Observable<TableWithRows> {
    const url = `${this.tablesBaseUrl(projectId)}/${tableId}`;
    this.logger.log('[DATA-TABLES-SERV] getTable URL', url);
    return this.httpClient.get<TableWithRows>(url, this.httpOptions());
  }

  updateTable(tableId: string, body: UpdateTableRequest, projectId?: string): Observable<DataTable> {
    const url = `${this.tablesBaseUrl(projectId)}/${tableId}`;
    this.logger.log('[DATA-TABLES-SERV] updateTable URL', url, body);
    return this.httpClient.put<DataTable>(url, body, this.httpOptions());
  }

  deleteTable(tableId: string, projectId?: string): Observable<ApiSuccessMessage> {
    const url = `${this.tablesBaseUrl(projectId)}/${tableId}`;
    this.logger.log('[DATA-TABLES-SERV] deleteTable URL', url);
    return this.httpClient.delete<ApiSuccessMessage>(url, this.httpOptions());
  }

  // ─── Columns ─────────────────────────────────────────────────────────────

  addColumn(tableId: string, body: ColumnInput, projectId?: string): Observable<DataTable> {
    const url = `${this.tablesBaseUrl(projectId)}/${tableId}/columns`;
    this.logger.log('[DATA-TABLES-SERV] addColumn URL', url, body);
    return this.httpClient.post<DataTable>(url, body, this.httpOptions());
  }

  renameColumn(
    tableId: string,
    columnId: string,
    body: RenameColumnRequest,
    projectId?: string,
  ): Observable<DataTable> {
    const url = `${this.tablesBaseUrl(projectId)}/${tableId}/columns/${columnId}`;
    this.logger.log('[DATA-TABLES-SERV] renameColumn URL', url, body);
    return this.httpClient.patch<DataTable>(url, body, this.httpOptions());
  }

  deleteColumn(tableId: string, columnId: string, projectId?: string): Observable<DataTable> {
    const url = `${this.tablesBaseUrl(projectId)}/${tableId}/columns/${columnId}`;
    this.logger.log('[DATA-TABLES-SERV] deleteColumn URL', url);
    return this.httpClient.delete<DataTable>(url, this.httpOptions());
  }

  // ─── Rows ────────────────────────────────────────────────────────────────

  listRows(
    tableId: string,
    search?: RowSearchRequest,
    projectId?: string,
  ): Observable<RowListItem[]> {
    const url = `${this.tablesBaseUrl(projectId)}/${tableId}/rows/list`;
    let params = new HttpParams();
    if (search?.must_match) {
      params = params.set('must_match', search.must_match);
    } else if (search?.match) {
      params = params.set('match', search.match);
    }
    if (search?.conditions?.length) {
      params = params.set('conditions', JSON.stringify(search.conditions));
    }
    this.logger.log('[DATA-TABLES-SERV] listRows URL', url, search);
    return this.httpClient.get<RowListItem[]>(url, {
      ...this.httpOptions(),
      params,
    });
  }

  insertRow(tableId: string, body: InsertRowRequest, projectId?: string): Observable<RowDocument> {
    const url = `${this.tablesBaseUrl(projectId)}/${tableId}/row/insert`;
    this.logger.log('[DATA-TABLES-SERV] insertRow URL', url, body);
    return this.httpClient.post<RowDocument>(url, body, this.httpOptions());
  }

  updateRow(tableId: string, body: UpdateRowRequest, projectId?: string): Observable<RowDocument> {
    const url = `${this.tablesBaseUrl(projectId)}/${tableId}/row/update`;
    this.logger.log('[DATA-TABLES-SERV] updateRow URL', url, body);
    return this.httpClient.put<RowDocument>(url, body, this.httpOptions());
  }

  upsertRow(tableId: string, body: UpsertRowRequest, projectId?: string): Observable<RowDocument | RowDocument[]> {
    const url = `${this.tablesBaseUrl(projectId)}/${tableId}/row/upsert`;
    this.logger.log('[DATA-TABLES-SERV] upsertRow URL', url, body);
    return this.httpClient.put<RowDocument | RowDocument[]>(url, body, this.httpOptions());
  }

  deleteRow(tableId: string, body: DeleteRowRequest, projectId?: string): Observable<RowDocument> {
    const url = `${this.tablesBaseUrl(projectId)}/${tableId}/row/delete`;
    this.logger.log('[DATA-TABLES-SERV] deleteRow URL', url, body);
    return this.httpClient.put<RowDocument>(url, body, this.httpOptions());
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
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.TOKEN,
      }),
    };
  }
}

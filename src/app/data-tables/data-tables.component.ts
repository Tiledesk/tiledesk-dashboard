import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { ConnectedPosition } from '@angular/cdk/overlay';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'app/core/auth.service';
import { NotifyService } from 'app/core/notify.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { LocalDbService } from 'app/services/users-local-db.service';
import { DataTablesService } from 'app/services/data-tables.service';
import {
  Column,
  ColumnInput,
  ColumnType,
  DataTable,
  isValidColumnName,
  RowData,
  RowDocument,
  RowListItem,
  RowSearchRequest,
  sortColumns,
} from 'app/models/data-tables.model';
import {
  CreateTableModalComponent,
  CreateTableModalData,
  CreateTableModalResult,
} from './modals/create-table-modal.component';
import {
  DATA_TABLE_COLUMN_TYPE_OPTIONS,
  DataTableColumnTypeOption,
  datetimeLocalToIso,
  finalizeNumberCellValue,
  formatNumberCellDisplay,
  isValidNumberInputDraft,
  isoToDatetimeLocal,
  normalizeNumberDecimalSeparator,
  parseNumberCellValue,
} from './data-tables-column-types.util';

const Swal = require('sweetalert2');

interface ColumnView {
  id: string;
  name: string;
  type: ColumnType;
}

interface EditableRow {
  localId: string;
  _id?: string;
  data: RowData;
  isSaving?: boolean;
  pendingCellSave?: boolean;
}

@Component({
  selector: 'appdashboard-data-tables',
  templateUrl: './data-tables.component.html',
  styleUrls: ['./data-tables.component.scss', './data-tables-type-select.shared.scss'],
})
export class DataTablesComponent implements OnInit {

  /** Row bulk-delete checkboxes — hidden until feature is ready. */
  readonly showRowSelectionColumn = false;

  tables: DataTable[] = [];
  selectedTable: DataTable | null = null;
  selectedTableId: string | null = null;
  rows: EditableRow[] = [];
  columnMenuTarget: ColumnView | null = null;
  isRenamingTableTitle = false;
  renameTableDraft = '';
  renameTableError = '';
  isRenamingTableSaving = false;
  renamingColumnId: string | null = null;
  renameColumnDraft = '';
  isRenamingColumnSaving = false;
  selectedRowIds = new Set<string>();

  isLoadingTables = true;
  isLoadingRows = false;
  rowSearchQuery = '';
  private rowSearchDebounceTimer: ReturnType<typeof setTimeout> | null = null;
  isDeletingRows = false;
  isDeletingTable = false;

  isAddColumnPopoverOpen = false;
  isSavingColumn = false;
  isDeletingColumn = false;
  newColumnName = '';
  newColumnType: ColumnType = 'string';

  readonly columnTypes: DataTableColumnTypeOption[] = DATA_TABLE_COLUMN_TYPE_OPTIONS;

  readonly addColumnPopoverPositions: ConnectedPosition[] = [
    {
      originX: 'end',
      originY: 'bottom',
      overlayX: 'end',
      overlayY: 'top',
      offsetY: 8,
    },
    {
      originX: 'start',
      originY: 'bottom',
      overlayX: 'start',
      overlayY: 'top',
      offsetY: 8,
    },
  ];

  private localIdCounter = 0;
  private id_project = '';
  private shouldFocusFirstColumnCell = false;
  private isAutoFocusingFirstCell = false;

  constructor(
    private dialog: MatDialog,
    private dataTablesService: DataTablesService,
    private logger: LoggerService,
    private notify: NotifyService,
    private translate: TranslateService,
    private auth: AuthService,
    private route: ActivatedRoute,
    private localDbService: LocalDbService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.id_project = this.route.snapshot.paramMap.get('projectid') || '';
    this.auth.project_bs.subscribe((project) => {
      if (project?._id) {
        this.id_project = project._id;
      }
    });
    this.loadTables();
  }

  // ─── Data loading ────────────────────────────────────────────────────────

  private loadTables(): void {
    this.isLoadingTables = true;
    this.dataTablesService.listTables().subscribe({
      next: (tables) => {
        this.tables = tables || [];
        this.isLoadingTables = false;
        this.selectInitialTable();
        this.logger.log('[DATA-TABLES] loaded tables', this.tables);
      },
      error: (err) => {
        this.isLoadingTables = false;
        this.logger.error('[DATA-TABLES] listTables error', err);
      },
    });
  }

  private loadTableRows(table: DataTable, search?: RowSearchRequest): void {
    this.clearRowSelection();

    if (!table._id) {
      this.rows = this.buildRowsFromLoaded(table.schema, []);
      this.maybeFocusFirstColumnCell();
      return;
    }

    this.isLoadingRows = true;
    this.dataTablesService.listRows(table._id, search).subscribe({
      next: (loadedRows) => {
        this.rows = this.buildRowsFromLoaded(table.schema, loadedRows || []);
        this.isLoadingRows = false;
        this.maybeFocusFirstColumnCell();
      },
      error: (err) => {
        this.isLoadingRows = false;
        this.rows = this.buildRowsFromLoaded(table.schema, []);
        this.logger.error('[DATA-TABLES] listRows error', err);
        this.maybeFocusFirstColumnCell();
      },
    });
  }

  private buildRowsFromLoaded(schema: Column[] | undefined, loaded: RowListItem[]): EditableRow[] {
    const columns = sortColumns(schema);
    if (!columns.length) {
      return [];
    }
    if (!loaded.length) {
      return [];
    }
    return loaded.map((item, index) => this.toEditableRow(item, columns, index));
  }

  private toEditableRow(item: RowListItem, schema: Column[], index: number): EditableRow {
    const rowId = item._id;
    const payload: RowData = { ...item };
    delete payload._id;

    return {
      localId: rowId || `row-${index}-${this.newLocalId()}`,
      _id: rowId,
      data: this.normalizeRowData(payload, schema),
    };
  }

  private createEmptyRow(schema: Column[]): EditableRow {
    const data: RowData = {};
    schema.forEach((col) => {
      data[col.name] = this.defaultCellValue(col.type);
    });
    return { localId: this.newLocalId(), data };
  }

  private defaultCellValue(type: ColumnType): unknown {
    switch (type) {
      case 'boolean':
        return false;
      case 'number':
        return null;
      default:
        return '';
    }
  }

  private normalizeRowData(data: RowData, schema: Column[]): RowData {
    const normalized: RowData = {};
    schema.forEach((col) => {
      const value = data?.[col.name];
      normalized[col.name] = value ?? this.defaultCellValue(col.type);
    });
    return normalized;
  }

  private serializeRowData(data: RowData, schema: Column[]): RowData {
    const serialized: RowData = {};
    schema.forEach((col) => {
      serialized[col.name] = this.serializeCellValue(data[col.name], col.type);
    });
    return serialized;
  }

  private serializeCellValue(value: unknown, type: ColumnType): unknown {
    if (value === '' || value === undefined) {
      return null;
    }
    if (type === 'number') {
      if (value === null) { return null; }
      const num = typeof value === 'number' ? value : Number(value);
      return Number.isNaN(num) ? null : num;
    }
    if (type === 'boolean') {
      return !!value;
    }
    if (type === 'datetime') {
      if (value === null || value === undefined || value === '') {
        return null;
      }
      const date = new Date(String(value));
      return Number.isNaN(date.getTime()) ? null : date.toISOString();
    }
    return value;
  }

  private mergeRowDataFromServer(local: RowData, server: RowData | undefined, schema: Column[]): RowData {
    const merged = this.normalizeRowData(server, schema);
    schema.forEach((col) => {
      const localValue = local[col.name];
      if (this.cellHasValue(localValue, col.type)) {
        merged[col.name] = localValue;
      }
    });
    return merged;
  }

  private newLocalId(): string {
    this.localIdCounter += 1;
    return `local-${Date.now()}-${this.localIdCounter}`;
  }

  private rowHasAnyValue(row: EditableRow): boolean {
    const schema = sortColumns(this.selectedTable?.schema);
    return schema.some((col) => this.cellHasValue(row.data[col.name], col.type));
  }

  private cellHasValue(value: unknown, type: ColumnType): boolean {
    if (type === 'boolean') {
      return value === true || value === false;
    }
    if (type === 'number') {
      return value !== null && value !== undefined && value !== '';
    }
    return value !== '' && value != null;
  }

  private applyTableUpdate(tableId: string, updated: DataTable): DataTable {
    const merged: DataTable = {
      ...(this.selectedTable || {}),
      ...updated,
      schema: updated.schema || this.selectedTable?.schema,
    };
    const index = this.tables.findIndex((t) => t._id === tableId);
    if (index >= 0) {
      this.tables[index] = merged;
      this.tables = [...this.tables];
    }
    this.selectedTable = merged;
    this.selectedTableId = merged._id || null;
    return merged;
  }

  // ─── Sidebar / last-table persistence ───────────────────────────────────

  private lastTableStorageKey(): string {
    return `last_datatable-${this.id_project}`;
  }

  private persistLastTable(table: DataTable): void {
    if (!this.id_project || !table._id) { return; }
    this.localDbService.setInStorage(this.lastTableStorageKey(), table._id);
  }

  private getStoredTableId(): string | null {
    if (!this.id_project) { return null; }
    return this.localDbService.getFromStorage(this.lastTableStorageKey()) || null;
  }

  private selectInitialTable(): void {
    if (!this.tables.length) {
      this.selectedTable = null;
      this.selectedTableId = null;
      this.rows = [];
      return;
    }

    const storedId = this.getStoredTableId();
    const fromStorage = storedId
      ? this.tables.find((t) => t._id === storedId)
      : null;
    const tableToSelect = fromStorage || this.tables[0];

    if (storedId && !fromStorage) {
      this.localDbService.removeFromStorage(this.lastTableStorageKey());
    }

    this.selectTable(tableToSelect);
  }

  private selectTable(table: DataTable, options?: { focusFirstColumnCell?: boolean }): void {
    this.cancelRenameTableTitle();
    this.cancelRenameColumn();
    this.rowSearchQuery = '';
    this.selectedTableId = table._id || null;
    this.selectedTable = table;
    this.persistLastTable(table);
    this.shouldFocusFirstColumnCell = !!options?.focusFirstColumnCell;
    this.loadTableRows(table);
  }

  onRefreshTable(): void {
    const table = this.selectedTable;
    if (!table) { return; }
    this.loadTableRows(table, this.buildRowSearchRequest());
  }

  onRowSearchChange(): void {
    if (this.rowSearchDebounceTimer) {
      clearTimeout(this.rowSearchDebounceTimer);
    }
    this.rowSearchDebounceTimer = setTimeout(() => {
      const table = this.selectedTable;
      if (!table) { return; }
      this.loadTableRows(table, this.buildRowSearchRequest());
    }, 300);
  }

  private buildRowSearchRequest(): RowSearchRequest | undefined {
    const query = (this.rowSearchQuery || '').trim();
    if (!query) { return undefined; }
    const stringColumns = sortColumns(this.selectedTable?.schema)
      .filter((col) => col.type === 'string')
      .map((col) => col.name);
    if (!stringColumns.length) { return undefined; }
    return {
      must_match: 'any',
      conditions: stringColumns.map((column) => ({
        column,
        operator: 'contains',
        value: query,
      })),
    };
  }

  onSelectTable(table: DataTable): void {
    this.selectTable(table);
  }

  isTableSelected(table: DataTable): boolean {
    if (!this.selectedTableId || !table._id) {
      return table === this.selectedTable;
    }
    return table._id === this.selectedTableId;
  }

  trackByTableId = (_: number, t: DataTable): string => t._id || t.name || '';

  // ─── Columns view ────────────────────────────────────────────────────────

  getColumns(table: DataTable | null): ColumnView[] {
    return sortColumns(table?.schema).map((col) => ({
      id: col.id,
      name: col.name,
      type: col.type,
    }));
  }

  getTableBodyColspan(): number {
    const dataCols = this.getColumns(this.selectedTable).length;
    const cols = dataCols || 1;
    return this.showRowSelectionColumn ? cols + 1 : cols;
  }

  canDeleteColumn(): boolean {
    return this.getColumns(this.selectedTable).length > 1;
  }

  trackByColumnId = (_: number, c: ColumnView): string => c.id || c.name;

  trackByRowId = (_: number, row: EditableRow): string => row._id || row.localId;

  // ─── Create table modal ─────────────────────────────────────────────────

  openCreateTableModal(): void {
    const ref = this.dialog.open<CreateTableModalComponent, CreateTableModalData, CreateTableModalResult>(
      CreateTableModalComponent,
      {
        width: '520px',
        autoFocus: false,
        disableClose: true,
        data: {
          existingTableNames: this.tables.map((t) => t.name || ''),
        },
      },
    );

    ref.afterClosed().subscribe((result) => {
      if (!result) { return; }
      this.createTable(result.name, result.schema);
    });
  }

  private createTable(name: string, schema: ColumnInput[]): void {
    if (!schema.length) {
      return;
    }
    this.dataTablesService.createTable({ name, schema }).subscribe({
      next: (table) => {
        this.logger.log('[DATA-TABLES] table created', table);
        this.tables = [...this.tables, table];
        this.insertInitialRowAndSelect(table);
      },
      error: (err) => {
        this.logger.error('[DATA-TABLES] createTable error', err);
      },
    });
  }

  private insertInitialRowAndSelect(table: DataTable): void {
    const tableId = table._id;
    const schema = sortColumns(table.schema);
    if (!tableId || !schema.length) {
      this.selectTable(table, { focusFirstColumnCell: true });
      return;
    }

    const rowData = this.createEmptyRow(schema).data;
    this.dataTablesService.insertRow(tableId, {
      data: this.serializeRowData(rowData, schema),
    }).subscribe({
      next: () => {
        this.logger.log('[DATA-TABLES] initial row created');
        this.selectTable(table, { focusFirstColumnCell: true });
      },
      error: (err) => {
        this.logger.error('[DATA-TABLES] insertInitialRow error', err);
        this.selectTable(table, { focusFirstColumnCell: true });
      },
    });
  }

  private maybeFocusFirstColumnCell(): void {
    if (!this.shouldFocusFirstColumnCell) {
      return;
    }
    this.shouldFocusFirstColumnCell = false;
    this.cdr.detectChanges();
    requestAnimationFrame(() => {
      setTimeout(() => this.focusFirstColumnCell(), 0);
    });
  }

  private focusBooleanCell(cellEl: HTMLElement): void {
    cellEl.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    const checkbox = cellEl.querySelector<HTMLElement>('mat-checkbox.dt-cell-checkbox');
    const input = checkbox?.querySelector<HTMLInputElement>('.mat-checkbox-input')
      || checkbox?.querySelector<HTMLInputElement>('input[type="checkbox"]');
    const layout = checkbox?.querySelector<HTMLElement>('.mat-checkbox-layout');
    const focusTarget = input || layout;
    if (!focusTarget) {
      return;
    }
    this.isAutoFocusingFirstCell = true;
    focusTarget.focus();
    setTimeout(() => {
      this.isAutoFocusingFirstCell = false;
    });
  }

  private focusFirstColumnCell(): void {
    const columns = this.getColumns(this.selectedTable);
    const firstCol = columns[0];
    if (!firstCol || !this.rows.length) {
      return;
    }

    const cellEl = document.querySelector<HTMLElement>('[data-dt-first-cell="true"]');
    if (!cellEl) {
      return;
    }

    if (firstCol.type === 'boolean') {
      this.focusBooleanCell(cellEl);
      return;
    }

    const input = cellEl.querySelector<HTMLInputElement>('.dt-cell-input');
    if (!input) {
      return;
    }

    cellEl.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    this.isAutoFocusingFirstCell = true;
    input.focus();
    setTimeout(() => {
      this.isAutoFocusingFirstCell = false;
    });
  }

  getRenameTableTitleInputSize(): number {
    return Math.max((this.renameTableDraft || '').length, 1);
  }

  onStartRenameTableTitle(): void {
    const table = this.selectedTable;
    if (!table || this.isRenamingTableSaving || this.isDeletingTable) { return; }
    this.isRenamingTableTitle = true;
    this.renameTableDraft = table.name || '';
    this.renameTableError = '';
    setTimeout(() => {
      const input = document.querySelector<HTMLInputElement>('.dt-title-input');
      input?.focus();
      input?.select();
    });
  }

  onRenameTableDraftChange(): void {
    this.renameTableError = '';
  }

  onRenameTableTitleBlur(): void {
    if (!this.isRenamingTableTitle || this.isRenamingTableSaving) { return; }
    this.commitRenameTableTitle();
  }

  onRenameTableTitleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.commitRenameTableTitle();
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      this.cancelRenameTableTitle();
    }
  }

  cancelRenameTableTitle(): void {
    this.isRenamingTableTitle = false;
    this.renameTableDraft = '';
    this.renameTableError = '';
    this.isRenamingTableSaving = false;
  }

  private commitRenameTableTitle(): void {
    const table = this.selectedTable;
    const tableId = table?._id;
    if (!table || !tableId || this.isRenamingTableSaving) { return; }

    const newName = (this.renameTableDraft || '').trim();
    const currentName = (table.name || '').trim();

    if (!newName) {
      this.renameTableError = 'required';
      return;
    }

    const normalizedNewName = newName.toLowerCase();
    const duplicate = this.tables.some(
      (t) => t._id !== tableId && (t.name || '').trim().toLowerCase() === normalizedNewName,
    );
    if (duplicate) {
      this.showRenameTableNotification('DataTables.DuplicateTableName');
      this.refocusRenameTableTitleInput();
      return;
    }

    if (newName === currentName) {
      this.cancelRenameTableTitle();
      return;
    }

    this.isRenamingTableSaving = true;
    this.dataTablesService.updateTable(tableId, { name: newName }).subscribe({
      next: (updated) => {
        this.isRenamingTableSaving = false;
        this.applyTableUpdate(tableId, { ...table, ...(updated || {}), name: updated?.name || newName });
        this.cancelRenameTableTitle();
      },
      error: (err) => {
        this.isRenamingTableSaving = false;
        this.logger.error('[DATA-TABLES] updateTable (rename table) error', err);
        this.handleRenameTableApiError(err);
      },
    });
  }

  private handleRenameTableApiError(err: unknown): void {
    const httpErr = err as { status?: number; error?: { message?: string; error?: string } };
    const status = httpErr?.status;

    if (status === 409) {
      this.showRenameTableNotification('DataTables.DuplicateTableName');
      this.refocusRenameTableTitleInput();
      return;
    }

    if (status === 400) {
      const serverMessage = httpErr?.error?.message || httpErr?.error?.error;
      this.showRenameTableNotification(
        serverMessage || this.translate.instant('DataTables.RenameTableValidationError'),
        !!serverMessage,
      );
      this.refocusRenameTableTitleInput();
      return;
    }

    this.showRenameTableError();
  }

  private showRenameTableNotification(messageKeyOrText: string, isRawMessage = false): void {
    const message = isRawMessage ? messageKeyOrText : this.translate.instant(messageKeyOrText);
    this.notify.showWidgetStyleUpdateNotification(message, 4, 'report_problem');
  }

  private refocusRenameTableTitleInput(): void {
    setTimeout(() => {
      const input = document.querySelector<HTMLInputElement>('.dt-title-input');
      input?.focus();
      input?.select();
    });
  }

  private showRenameTableError(): void {
    this.cancelRenameTableTitle();
    this.showRenameTableNotification('DataTables.RenameTableError');
  }

  onDeleteTable(): void {
    const table = this.selectedTable;
    if (!table?._id || this.isDeletingTable) { return; }

    const tableName = table.name || '';
    Swal.fire({
      title: this.translate.instant('DataTables.DeleteTable'),
      text: this.translate.instant('DataTables.DeleteTableConfirmMessage', { table_name: tableName }),
      icon: 'warning',
      showCloseButton: false,
      showCancelButton: true,
      showConfirmButton: true,
      confirmButtonText: this.translate.instant('Delete'),
      cancelButtonText: this.translate.instant('Cancel'),
      reverseButtons: true,
      focusCancel: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteTable(table);
      }
    });
  }

  private deleteTable(table: DataTable): void {
    const tableId = table._id;
    if (!tableId || this.isDeletingTable) { return; }

    this.isDeletingTable = true;
    this.cancelRenameTableTitle();
    this.closeAddColumnPopover();
    this.cancelRenameColumn();
    this.clearRowSelection();

    this.dataTablesService.deleteTable(tableId).subscribe({
      next: () => {
        this.isDeletingTable = false;
        this.tables = this.tables.filter((t) => t._id !== tableId);
        if (this.getStoredTableId() === tableId) {
          this.localDbService.removeFromStorage(this.lastTableStorageKey());
        }
        this.selectInitialTable();
        this.logger.log('[DATA-TABLES] table deleted', tableId);
      },
      error: (err) => {
        this.isDeletingTable = false;
        this.logger.error('[DATA-TABLES] deleteTable error', err);
        this.showDeleteTableError();
      },
    });
  }

  private showDeleteTableError(): void {
    this.notify.showWidgetStyleUpdateNotification(
      this.translate.instant('DataTables.DeleteTableError'),
      4,
      'report_problem',
    );
  }

  get hasActiveRowSearch(): boolean {
    return !!this.rowSearchQuery.trim();
  }

  get showNoSearchResultsState(): boolean {
    return !this.isLoadingRows
      && this.getColumns(this.selectedTable).length > 0
      && this.rows.length === 0
      && this.hasActiveRowSearch;
  }

  get showNoRowsState(): boolean {
    return !this.isLoadingRows
      && this.getColumns(this.selectedTable).length > 0
      && this.rows.length === 0
      && !this.hasActiveRowSearch;
  }

  get isHeaderRowCheckboxDisabled(): boolean {
    return this.isLoadingRows || this.rows.length === 0;
  }

  // ─── Grid actions ───────────────────────────────────────────────────────

  onAddRow(): void {
    const schema = sortColumns(this.selectedTable?.schema);
    if (!schema.length) { return; }
    this.rows = [...this.rows, this.createEmptyRow(schema)];
  }

  // ─── Row selection ─────────────────────────────────────────────────────

  get selectedRowsCount(): number {
    return this.selectedRowIds.size;
  }

  get hasRowSelection(): boolean {
    return this.selectedRowIds.size > 0;
  }

  get selectedRowsLabelParams(): { count: number } {
    return { count: this.selectedRowsCount };
  }

  isRowSelected(row: EditableRow): boolean {
    return this.selectedRowIds.has(row.localId);
  }

  isAllRowsSelected(): boolean {
    return this.rows.length > 0 && this.rows.every((r) => this.selectedRowIds.has(r.localId));
  }

  isSomeRowsSelected(): boolean {
    return this.selectedRowIds.size > 0 && !this.isAllRowsSelected();
  }

  onToggleSelectAll(checked: boolean): void {
    if (checked) {
      this.selectedRowIds = new Set(this.rows.map((r) => r.localId));
    } else {
      this.clearRowSelection();
    }
  }

  onToggleRowSelection(row: EditableRow, checked: boolean): void {
    if (checked) {
      this.selectedRowIds.add(row.localId);
    } else {
      this.selectedRowIds.delete(row.localId);
    }
    this.selectedRowIds = new Set(this.selectedRowIds);
  }

  clearRowSelection(): void {
    this.selectedRowIds = new Set();
  }

  deleteSelectedRows(): void {
    const tableId = this.selectedTable?._id;
    const selected = this.rows.filter((r) => this.selectedRowIds.has(r.localId));
    if (!selected.length || this.isDeletingRows) { return; }

    const removeIds = new Set(selected.map((r) => r.localId));
    const toDeleteOnServer = selected.filter((r) => r._id);

    const removeLocally = (): void => {
      this.rows = this.rows.filter((r) => !removeIds.has(r.localId));
      this.clearRowSelection();
    };

    if (!tableId || !toDeleteOnServer.length) {
      removeLocally();
      return;
    }

    this.isDeletingRows = true;
    forkJoin(
      toDeleteOnServer.map((row) =>
        this.dataTablesService.deleteRow(tableId, { id_row: row._id! }).pipe(
          catchError((err) => {
            this.logger.error('[DATA-TABLES] deleteRow error', err);
            return of(null);
          }),
        ),
      ),
    ).pipe(finalize(() => { this.isDeletingRows = false; }))
      .subscribe({
        next: () => {
          removeLocally();
          this.logger.log('[DATA-TABLES] selected rows deleted');
        },
        error: (err) => {
          this.logger.error('[DATA-TABLES] deleteSelectedRows error', err);
          this.showDeleteRowsError();
        },
      });
  }

  private showDeleteRowsError(): void {
    this.notify.showWidgetStyleUpdateNotification(
      this.translate.instant('DataTables.DeleteRowsError'),
      4,
      'report_problem',
    );
  }

  focusedDatetimeCellKey: string | null = null;
  focusedNumberCellKey: string | null = null;
  private numberCellEditDrafts = new Map<string, string>();
  private datetimeOpenedByPointer = false;
  private datetimePickerOpen = false;
  private datetimeClosingPicker = false;

  getDatetimeLocalValue(row: EditableRow, columnName: string): string {
    return isoToDatetimeLocal(row.data[columnName]);
  }

  setDatetimeLocalValue(row: EditableRow, columnName: string, value: string): void {
    row.data[columnName] = datetimeLocalToIso(value) ?? '';
  }

  getDatetimeCellKey(row: EditableRow, columnName: string): string {
    return `${row.localId}:${columnName}`;
  }

  isDatetimeCellFocused(row: EditableRow, columnName: string): boolean {
    return this.focusedDatetimeCellKey === this.getDatetimeCellKey(row, columnName);
  }

  hasDatetimeValue(row: EditableRow, columnName: string): boolean {
    return !!this.getDatetimeLocalValue(row, columnName);
  }

  onDatetimeMouseDown(): void {
    this.datetimeOpenedByPointer = true;
  }

  getColumnHeaderId(col: ColumnView): string {
    return `dt-col-${col.id}`;
  }

  getCellAutocomplete(row: EditableRow, col: ColumnView): string {
    return `nope-${row.localId}-${col.id}`;
  }

  getNumberCellKey(row: EditableRow, columnName: string): string {
    return `${row.localId}:${columnName}`;
  }

  getNumberCellDisplayValue(row: EditableRow, columnName: string): string {
    const key = this.getNumberCellKey(row, columnName);
    if (this.focusedNumberCellKey === key) {
      const draft = this.numberCellEditDrafts.get(key);
      if (draft !== undefined) {
        return draft;
      }
      return formatNumberCellDisplay(row.data[columnName], true);
    }
    return formatNumberCellDisplay(row.data[columnName], false);
  }

  onNumberCellFocus(row: EditableRow, columnName: string, event: FocusEvent): void {
    this.onCellInputFocus(event);
    const key = this.getNumberCellKey(row, columnName);
    this.focusedNumberCellKey = key;
    this.numberCellEditDrafts.set(key, formatNumberCellDisplay(row.data[columnName], true));
  }

  onNumberCellBlur(row: EditableRow, columnName: string): void {
    const key = this.getNumberCellKey(row, columnName);
    this.numberCellEditDrafts.delete(key);
    this.focusedNumberCellKey = null;
    this.onCellBlur(row, columnName);
  }

  onCellInputFocus(event: FocusEvent): void {
    const input = event.target as HTMLInputElement | null;
    if (!input) { return; }
    if (input.hasAttribute('readonly')) {
      input.removeAttribute('readonly');
    }
    input.setAttribute('autocomplete', 'one-time-code');
    input.setAttribute('autocorrect', 'off');
    input.setAttribute('autocapitalize', 'off');
    input.setAttribute('spellcheck', 'false');
  }

  onNumberCellChange(row: EditableRow, col: ColumnView, value: string): void {
    const key = this.getNumberCellKey(row, col.name);
    this.numberCellEditDrafts.set(key, value);
    const parsed = parseNumberCellValue(value);
    if (parsed === undefined) {
      return;
    }
    row.data[col.name] = parsed;
  }

  onNumberCellKeydown(event: KeyboardEvent): void {
    if (event.ctrlKey || event.metaKey || event.altKey) {
      return;
    }
    const allowedKeys = [
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End',
    ];
    if (allowedKeys.includes(event.key)) {
      return;
    }
    if (/^\d$/.test(event.key)) {
      return;
    }
    const input = event.target as HTMLInputElement;
    const { value, selectionStart, selectionEnd } = input;
    const next =
      value.slice(0, selectionStart ?? value.length)
      + event.key
      + value.slice(selectionEnd ?? value.length);
    if (isValidNumberInputDraft(next)) {
      return;
    }
    event.preventDefault();
  }

  onNumberCellPaste(event: ClipboardEvent, row: EditableRow, col: ColumnView): void {
    event.preventDefault();
    const pasted = event.clipboardData?.getData('text') ?? '';
    const input = event.target as HTMLInputElement;
    const start = input.selectionStart ?? input.value.length;
    const end = input.selectionEnd ?? input.value.length;
    const next = input.value.slice(0, start) + pasted + input.value.slice(end);
    if (!isValidNumberInputDraft(next)) {
      return;
    }
    this.onNumberCellChange(row, col, next);
  }

  onDatetimeFocus(row: EditableRow, columnName: string, event: FocusEvent): void {
    this.onCellInputFocus(event);
    this.focusedDatetimeCellKey = this.getDatetimeCellKey(row, columnName);
    if (this.datetimeClosingPicker) {
      return;
    }
    const openedByPointer = this.datetimeOpenedByPointer;
    this.datetimeOpenedByPointer = false;
    if (!this.isAutoFocusingFirstCell && !openedByPointer && !this.datetimePickerOpen) {
      this.openDatetimePicker(event.target as HTMLInputElement);
    }
  }

  onDatetimeClick(event: MouseEvent): void {
    const input = event.target as HTMLInputElement;
    if (this.datetimePickerOpen) {
      this.closeDatetimePicker(input);
      return;
    }
    this.openDatetimePicker(input);
  }

  onDatetimePickerDismissed(): void {
    this.datetimePickerOpen = false;
  }

  private openDatetimePicker(input: HTMLInputElement | null): void {
    if (!input || typeof input.showPicker !== 'function') {
      return;
    }
    try {
      input.showPicker();
      this.datetimePickerOpen = true;
    } catch {
      // Some browsers reject showPicker outside a direct user gesture.
    }
  }

  private closeDatetimePicker(input: HTMLInputElement): void {
    this.datetimePickerOpen = false;
    this.datetimeClosingPicker = true;
    input.blur();
    requestAnimationFrame(() => {
      input.focus();
      setTimeout(() => {
        this.datetimeClosingPicker = false;
      }, 0);
    });
  }

  onDatetimeBlur(row: EditableRow, columnName: string): void {
    if (this.datetimeClosingPicker) {
      return;
    }
    this.datetimePickerOpen = false;
    this.focusedDatetimeCellKey = null;
    this.onCellBlur(row, columnName);
  }

  clearDatetimeCell(row: EditableRow, column: ColumnView, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    row.data[column.name] = '';
    this.onCellBlur(row, column.name);
  }

  onBooleanCellChange(row: EditableRow, column: ColumnView, checked: boolean): void {
    row.data[column.name] = checked;
    this.onCellBlur(row, column.name);
  }

  onCellBlur(row: EditableRow, columnName: string): void {
    const tableId = this.selectedTable?._id;
    const schema = sortColumns(this.selectedTable?.schema);
    if (!tableId || !schema.length) { return; }

    const column = schema.find((c) => c.name === columnName);
    if (!column) { return; }

    if (column.type === 'number') {
      row.data[columnName] = finalizeNumberCellValue(row.data[columnName]);
    }

    if (row._id) {
      this.updateRowCell(tableId, row, column);
      return;
    }

    if (!this.rowHasAnyValue(row)) { return; }

    if (row.isSaving) {
      row.pendingCellSave = true;
      return;
    }

    this.insertNewRow(tableId, row, schema);
  }

  private updateRowCell(tableId: string, row: EditableRow, column: Column): void {
    this.dataTablesService.updateRow(tableId, {
      id_row: row._id!,
      data: { [column.name]: this.serializeCellValue(row.data[column.name], column.type) },
    }).subscribe({
      error: (err) => {
        this.logger.error('[DATA-TABLES] updateRow error', err);
      },
    });
  }

  private insertNewRow(tableId: string, row: EditableRow, schema: Column[]): void {
    row.isSaving = true;
    const localSnapshot = { ...row.data };
    this.dataTablesService.insertRow(tableId, {
      data: this.serializeRowData(row.data, schema),
    }).subscribe({
      next: (saved: RowDocument) => {
        row._id = saved._id;
        row.data = this.mergeRowDataFromServer(localSnapshot, saved.data, schema);
        row.isSaving = false;
        if (row.pendingCellSave) {
          row.pendingCellSave = false;
          this.syncFullRow(tableId, row, schema);
        }
      },
      error: (err) => {
        row.isSaving = false;
        row.pendingCellSave = false;
        this.logger.error('[DATA-TABLES] insertRow error', err);
      },
    });
  }

  private syncFullRow(tableId: string, row: EditableRow, schema: Column[]): void {
    if (!row._id) { return; }
    const localSnapshot = { ...row.data };
    this.dataTablesService.updateRow(tableId, {
      id_row: row._id,
      data: this.serializeRowData(row.data, schema),
    }).subscribe({
      next: (saved) => {
        if (saved.data) {
          row.data = this.mergeRowDataFromServer(localSnapshot, saved.data, schema);
        }
      },
      error: (err) => {
        this.logger.error('[DATA-TABLES] syncFullRow error', err);
      },
    });
  }

  toggleAddColumnPopover(): void {
    if (this.isAddColumnPopoverOpen) {
      this.closeAddColumnPopover();
    } else {
      this.resetAddColumnForm();
      this.isAddColumnPopoverOpen = true;
    }
  }

  closeAddColumnPopover(): void {
    this.isAddColumnPopoverOpen = false;
  }

  resetAddColumnForm(): void {
    this.newColumnName = '';
    this.newColumnType = 'string';
    this.isSavingColumn = false;
  }

  private getAddColumnNameTrimmed(): string {
    return (this.newColumnName || '').trim();
  }

  showAddColumnNameRequiredError(): boolean {
    return this.isAddColumnPopoverOpen && !this.getAddColumnNameTrimmed();
  }

  showAddColumnInvalidNameError(): boolean {
    const name = this.getAddColumnNameTrimmed();
    return !!name && !isValidColumnName(name);
  }

  showAddColumnDuplicateNameError(): boolean {
    const name = this.getAddColumnNameTrimmed();
    if (!name || !isValidColumnName(name)) { return false; }
    return sortColumns(this.selectedTable?.schema).some(
      (c) => c.name.toLowerCase() === name.toLowerCase(),
    );
  }

  showAddColumnNameInputError(): boolean {
    return this.showAddColumnNameRequiredError()
      || this.showAddColumnInvalidNameError()
      || this.showAddColumnDuplicateNameError();
  }

  canSubmitAddColumn(): boolean {
    const name = this.getAddColumnNameTrimmed();
    return !!name
      && isValidColumnName(name)
      && !this.showAddColumnDuplicateNameError()
      && !this.isSavingColumn;
  }

  submitAddColumn(): void {
    const columnName = this.getAddColumnNameTrimmed();
    const table = this.selectedTable;
    if (!columnName || !table?._id) { return; }
    if (!isValidColumnName(columnName) || this.showAddColumnDuplicateNameError()) { return; }

    this.isSavingColumn = true;
    this.dataTablesService.addColumn(table._id, {
      name: columnName,
      type: this.newColumnType,
    }).subscribe({
      next: (updated) => {
        this.isSavingColumn = false;
        const added = sortColumns(updated?.schema).find((c) => c.name === columnName);
        if (!added) {
          this.showCreateColumnError();
          return;
        }

        this.applyTableUpdate(table._id!, updated);
        this.rows = this.rows.map((row) => ({
          ...row,
          data: { ...row.data, [columnName]: this.defaultCellValue(added.type) },
        }));
        this.closeAddColumnPopover();
        this.logger.log('[DATA-TABLES] column added', columnName);
      },
      error: (err) => {
        this.isSavingColumn = false;
        this.logger.error('[DATA-TABLES] addColumn error', err);
        this.showCreateColumnError();
      },
    });
  }

  private showColumnNameValidationNotification(messageKey: string): void {
    this.notify.showWidgetStyleUpdateNotification(
      this.translate.instant(messageKey),
      4,
      'report_problem',
    );
  }

  private showCreateColumnError(): void {
    this.closeAddColumnPopover();
    this.showColumnNameValidationNotification('DataTables.CreateColumnError');
  }

  isRenamingColumn(col: ColumnView): boolean {
    return this.renamingColumnId === col.id;
  }

  onRenameColumn(col: ColumnView | null): void {
    if (!col) { return; }
    this.renamingColumnId = col.id;
    this.renameColumnDraft = col.name;
    setTimeout(() => {
      const input = document.querySelector<HTMLInputElement>('.dt-col-name-input');
      input?.focus();
      input?.select();
    });
  }

  onRenameColumnBlur(): void {
    if (!this.renamingColumnId || this.isRenamingColumnSaving) { return; }
    this.commitRenameColumn();
  }

  onRenameColumnKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.commitRenameColumn();
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      this.cancelRenameColumn();
    }
  }

  cancelRenameColumn(): void {
    this.renamingColumnId = null;
    this.renameColumnDraft = '';
  }

  private refocusRenameColumnInput(): void {
    setTimeout(() => {
      const input = document.querySelector<HTMLInputElement>('.dt-col-name-input');
      input?.focus();
      input?.select();
    });
  }

  commitRenameColumn(): void {
    const columnId = this.renamingColumnId;
    const table = this.selectedTable;
    const schema = sortColumns(table?.schema);
    const currentColumn = schema.find((c) => c.id === columnId);
    if (!columnId || !table?._id || !currentColumn || this.isRenamingColumnSaving) { return; }

    const newName = (this.renameColumnDraft || '').trim();
    if (!newName || newName === currentColumn.name) {
      this.cancelRenameColumn();
      return;
    }

    if (!isValidColumnName(newName)) {
      this.showColumnNameValidationNotification('DataTables.InvalidColumnName');
      this.refocusRenameColumnInput();
      return;
    }

    const duplicate = schema.some(
      (c) => c.id !== columnId && c.name.toLowerCase() === newName.toLowerCase(),
    );
    if (duplicate) {
      this.showColumnNameValidationNotification('DataTables.DuplicateColumnName');
      this.refocusRenameColumnInput();
      return;
    }

    const oldName = currentColumn.name;
    this.isRenamingColumnSaving = true;
    this.dataTablesService.renameColumn(table._id, columnId, { name: newName }).subscribe({
      next: (updated) => {
        this.isRenamingColumnSaving = false;
        const renamed = sortColumns(updated?.schema).find((c) => c.id === columnId);
        if (!renamed) {
          this.showRenameColumnError();
          return;
        }

        this.applyTableUpdate(table._id!, updated);
        this.rows = this.rows.map((row) => {
          const migrated = { ...row.data };
          if (Object.prototype.hasOwnProperty.call(migrated, oldName)) {
            migrated[newName] = migrated[oldName];
            delete migrated[oldName];
          }
          return {
            ...row,
            data: this.normalizeRowData(migrated, sortColumns(updated.schema)),
          };
        });
        this.cancelRenameColumn();
        this.logger.log('[DATA-TABLES] column renamed', oldName, '→', newName);
      },
      error: (err) => {
        this.isRenamingColumnSaving = false;
        this.logger.error('[DATA-TABLES] renameColumn error', err);
        this.showRenameColumnError();
      },
    });
  }

  private showRenameColumnError(): void {
    this.cancelRenameColumn();
    this.showColumnNameValidationNotification('DataTables.RenameColumnError');
  }

  onDeleteColumn(col: ColumnView | null): void {
    if (!col || this.isDeletingColumn || !this.canDeleteColumn()) { return; }

    Swal.fire({
      title: this.translate.instant('DataTables.DeleteColumn'),
      text: this.translate.instant('DataTables.DeleteColumnConfirmMessage', { column_name: col.name }),
      icon: 'warning',
      showCloseButton: false,
      showCancelButton: true,
      showConfirmButton: true,
      confirmButtonText: this.translate.instant('Delete'),
      cancelButtonText: this.translate.instant('Cancel'),
      reverseButtons: true,
      focusCancel: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteColumn(col);
      }
    });
  }

  private deleteColumn(col: ColumnView): void {
    const table = this.selectedTable;
    if (!table?._id || !col.id || this.isDeletingColumn) {
      return;
    }

    if (this.renamingColumnId === col.id) {
      this.cancelRenameColumn();
    }

    this.isDeletingColumn = true;
    this.dataTablesService.deleteColumn(table._id, col.id).subscribe({
      next: (updated) => {
        this.isDeletingColumn = false;
        const stillExists = sortColumns(updated?.schema).some((c) => c.id === col.id);
        if (stillExists) {
          this.showDeleteColumnError();
          return;
        }

        this.applyTableUpdate(table._id!, updated);
        const schema = sortColumns(updated.schema);
        if (!schema.length) {
          this.rows = [];
        } else {
          this.rows = this.rows.map((row) => {
            const migrated = { ...row.data };
            delete migrated[col.name];
            return { ...row, data: this.normalizeRowData(migrated, schema) };
          });
        }
        this.logger.log('[DATA-TABLES] column deleted', col.name);
      },
      error: (err) => {
        this.isDeletingColumn = false;
        this.logger.error('[DATA-TABLES] deleteColumn error', err);
        this.showDeleteColumnError();
      },
    });
  }

  private showDeleteColumnError(): void {
    this.notify.showWidgetStyleUpdateNotification(
      this.translate.instant('DataTables.DeleteColumnError'),
      4,
      'report_problem',
    );
  }
}

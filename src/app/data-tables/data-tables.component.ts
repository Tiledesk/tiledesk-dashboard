import { Component, OnInit } from '@angular/core';
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
import { DataTable, RowData, TableRow, TableSchema } from 'app/models/data-tables.model';
import { CreateTableModalComponent, CreateTableModalResult } from './modals/create-table-modal.component';

const Swal = require('sweetalert2');

/** Visual column model for the table view (derived from DataTable.schema). */
interface ColumnView {
  name: string;
  type: string;
}

/** Editable grid row — localId for trackBy; _id after first save to API. */
interface EditableRow {
  localId: string;
  _id?: string;
  data: RowData;
  isSaving?: boolean;
  /** Prevents duplicate insertRow when blur fires on multiple cells before _id is set. */
  insertInFlight?: boolean;
}

/** UI labels for the column type select; API expects the lowercase value. */
interface ColumnTypeOption {
  label: string;
  value: string;
  disabled: boolean;
}

@Component({
  selector: 'appdashboard-data-tables',
  templateUrl: './data-tables.component.html',
  styleUrls: ['./data-tables.component.scss'],
})
export class DataTablesComponent implements OnInit {

  tables: DataTable[] = [];
  selectedTable: DataTable | null = null;
  /** Stable id for sidebar highlight — avoids reference mismatch after getTable(). */
  selectedTableId: string | null = null;
  rows: EditableRow[] = [];
  columnMenuTarget: ColumnView | null = null;
  isRenamingTableTitle = false;
  renameTableDraft = '';
  renameTableError = '';
  isRenamingTableSaving = false;
  renamingColumnName: string | null = null;
  renameColumnDraft = '';
  renameColumnError = '';
  isRenamingColumnSaving = false;
  selectedRowIds = new Set<string>();

  isLoadingTables = false;
  isLoadingRows = false;
  isDeletingRows = false;
  isDeletingTable = false;

  // Add Column popover (toolbar)
  isAddColumnPopoverOpen = false;
  isSavingColumn = false;
  isDeletingColumn = false;
  newColumnName = '';
  newColumnType = 'string';
  addColumnNameError = '';

  readonly columnTypes: ColumnTypeOption[] = [
    { label: 'String',  value: 'string',  disabled: false },
    { label: 'Boolean', value: 'boolean', disabled: true  },
    { label: 'Date',    value: 'date',    disabled: true  },
    { label: 'Number',  value: 'number',  disabled: true  },
  ];

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

  constructor(
    private dialog: MatDialog,
    private dataTablesService: DataTablesService,
    private logger: LoggerService,
    private notify: NotifyService,
    private translate: TranslateService,
    private auth: AuthService,
    private route: ActivatedRoute,
    private localDbService: LocalDbService,
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

  private loadTableRows(table: DataTable): void {
    this.clearRowSelection();

    if (!table._id) {
      this.rows = this.buildRowsFromLoaded(table.schema, []);
      return;
    }

    this.isLoadingRows = true;
    this.dataTablesService.getTable(table._id).subscribe({
      next: (full) => {
        if (!full) {
          this.isLoadingRows = false;
          this.rows = this.buildRowsFromLoaded(table.schema, []);
          return;
        }
        const merged: DataTable = { ...table, ...full, schema: full.schema || table.schema };
        const index = this.tables.findIndex((t) => t._id === table._id);
        if (index >= 0) {
          this.tables[index] = merged;
        }
        this.selectedTable = merged;
        this.selectedTableId = merged._id || null;
        this.rows = this.buildRowsFromLoaded(full.schema || table.schema, full.rows || []);
        this.isLoadingRows = false;
      },
      error: (err) => {
        this.isLoadingRows = false;
        this.rows = this.buildRowsFromLoaded(table.schema, []);
        this.logger.error('[DATA-TABLES] getTable error', err);
      },
    });
  }

  private buildRowsFromLoaded(
    schema: TableSchema | undefined,
    loaded: Array<RowData | TableRow>,
  ): EditableRow[] {
    if (!schema || !Object.keys(schema).length) {
      return [];
    }
    if (!loaded.length) {
      return [this.createEmptyRow(schema)];
    }
    return loaded.map((item, index) => this.toEditableRow(item, schema, index));
  }

  private toEditableRow(
    item: RowData | TableRow,
    schema: TableSchema,
    index: number,
  ): EditableRow {
    const tableRow = item as TableRow;
    let rowId = tableRow._id;
    let payload: RowData;

    if (
      tableRow.data != null
      && typeof tableRow.data === 'object'
      && !Array.isArray(tableRow.data)
    ) {
      payload = tableRow.data;
    } else {
      const raw = { ...(item as RowData) };
      delete raw._id;
      delete raw.id_project;
      delete raw.id_table;
      delete raw.createdAt;
      delete raw.updatedAt;
      delete raw.data;
      if (!rowId && typeof (item as RowData)._id === 'string') {
        rowId = (item as RowData)._id as string;
      }
      payload = raw;
    }

    return {
      localId: rowId || `row-${index}-${this.newLocalId()}`,
      _id: rowId,
      data: this.normalizeRowData(payload, schema),
    };
  }

  private createEmptyRow(schema: TableSchema): EditableRow {
    const data: RowData = {};
    Object.keys(schema).forEach((key) => {
      data[key] = '';
    });
    return { localId: this.newLocalId(), data };
  }

  private normalizeRowData(data: RowData, schema: TableSchema): RowData {
    const normalized: RowData = {};
    Object.keys(schema).forEach((key) => {
      normalized[key] = data?.[key] ?? '';
    });
    return normalized;
  }

  private newLocalId(): string {
    this.localIdCounter += 1;
    return `local-${Date.now()}-${this.localIdCounter}`;
  }

  private rowHasAnyValue(row: EditableRow): boolean {
    return Object.values(row.data).some((v) => v !== '' && v != null);
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

  /** Restore last opened table from storage, or select the first in the list. */
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

  private selectTable(table: DataTable): void {
    this.cancelRenameTableTitle();
    this.cancelRenameColumn();
    this.selectedTableId = table._id || null;
    this.selectedTable = table;
    this.persistLastTable(table);
    this.loadTableRows(table);
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
    if (!table || !table.schema) { return []; }
    return Object.keys(table.schema).map((name) => ({
      name,
      type: table.schema![name],
    }));
  }

  trackByColumnName = (_: number, c: ColumnView): string => c.name;

  trackByRowId = (_: number, row: EditableRow): string => row._id || row.localId;

  // ─── Create table modal ─────────────────────────────────────────────────

  openCreateTableModal(): void {
    const ref = this.dialog.open<CreateTableModalComponent, undefined, CreateTableModalResult>(
      CreateTableModalComponent,
      {
        width: '520px',
        autoFocus: false,
        disableClose: true,
      },
    );

    ref.afterClosed().subscribe((result) => {
      if (!result) { return; }
      this.createTable(result.name, result.schema);
    });
  }

  private createTable(name: string, schema: TableSchema): void {
    this.dataTablesService.createTable({ name, schema }).subscribe({
      next: (table) => {
        this.logger.log('[DATA-TABLES] table created', table);
        this.tables = [...this.tables, table];
        this.selectTable(table);
      },
      error: (err) => {
        this.logger.error('[DATA-TABLES] createTable error', err);
      },
    });
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
      this.renameTableError = 'duplicate';
      return;
    }

    if (newName === currentName) {
      this.cancelRenameTableTitle();
      return;
    }

    this.isRenamingTableSaving = true;
    this.dataTablesService.updateTable(tableId, {
      name: newName,
      schema: table.schema,
    }).subscribe({
      next: (updated) => {
        this.isRenamingTableSaving = false;

        const merged: DataTable = {
          ...table,
          ...(updated || {}),
          name: (updated?.name || newName),
        };
        const index = this.tables.findIndex((t) => t._id === tableId);
        if (index >= 0) {
          this.tables[index] = merged;
          this.tables = [...this.tables];
        }
        this.selectedTable = merged;
        this.cancelRenameTableTitle();
      },
      error: (err) => {
        this.isRenamingTableSaving = false;
        this.logger.error('[DATA-TABLES] updateTable (rename table) error', err);
        this.showRenameTableError();
      },
    });
  }

  private showRenameTableError(): void {
    this.cancelRenameTableTitle();
    this.notify.showWidgetStyleUpdateNotification(
      this.translate.instant('DataTables.RenameTableError'),
      4,
      'report_problem',
    );
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

  // ─── Grid actions ───────────────────────────────────────────────────────

  onAddRow(): void {
    if (!this.selectedTable?.schema) { return; }
    this.rows = [...this.rows, this.createEmptyRow(this.selectedTable.schema)];
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
    const toDeleteOnServer = selected.filter((r) => this.rowHasAnyValue(r));

    const removeLocally = (): void => {
      this.rows = this.rows.filter((r) => !removeIds.has(r.localId));
      if (!this.rows.length && this.selectedTable?.schema) {
        this.rows = [this.createEmptyRow(this.selectedTable.schema)];
      }
      this.clearRowSelection();
    };

    if (!tableId || !toDeleteOnServer.length) {
      removeLocally();
      return;
    }

    this.isDeletingRows = true;
    forkJoin(
      toDeleteOnServer.map((row) =>
        this.dataTablesService.deleteRow(tableId, { data: { ...row.data } }).pipe(
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

  onCellBlur(row: EditableRow, columnName: string): void {
    const tableId = this.selectedTable?._id;
    if (!tableId || row.isSaving) { return; }

    if (row._id) {
      row.isSaving = true;
      this.dataTablesService.updateRow(tableId, {
        id_row: row._id,
        data: { [columnName]: row.data[columnName] ?? '' },
      }).subscribe({
        next: () => { row.isSaving = false; },
        error: (err) => {
          row.isSaving = false;
          this.logger.error('[DATA-TABLES] updateRow error', err);
        },
      });
      return;
    }

    if (!this.rowHasAnyValue(row)) { return; }

    row.isSaving = true;
    this.dataTablesService.insertRow(tableId, { data: { ...row.data } }).subscribe({
      next: (saved) => {
        row._id = saved._id;
        row.isSaving = false;
        if (saved.data && this.selectedTable?.schema) {
          row.data = this.normalizeRowData(saved.data, this.selectedTable.schema);
        }
      },
      error: (err) => {
        row.isSaving = false;
        this.logger.error('[DATA-TABLES] insertRow error', err);
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
    this.addColumnNameError = '';
    this.isSavingColumn = false;
  }

  showAddColumnNameRequiredError(): boolean {
    return this.isAddColumnPopoverOpen && !(this.newColumnName || '').trim();
  }

  canSubmitAddColumn(): boolean {
    return !!this.newColumnName?.trim() && !this.isSavingColumn;
  }

  onNewColumnNameChange(): void {
    this.addColumnNameError = '';
  }

  // Adds ccolumn from the popover form; on success updates the table schema and adds the new column to all rows with empty value.
  submitAddColumn(): void {
    const columnName = (this.newColumnName || '').trim();
    const table = this.selectedTable;
    if (!columnName || !table?._id || !table.schema) { return; }

    const existingKeys = Object.keys(table.schema).map((k) => k.toLowerCase());
    if (existingKeys.includes(columnName.toLowerCase())) {
      this.addColumnNameError = 'duplicate';
      return;
    }

    const newSchema: TableSchema = {
      ...table.schema,
      [columnName]: this.newColumnType,
    };

    this.isSavingColumn = true;
    this.dataTablesService.updateTable(table._id, { schema: newSchema }).subscribe({
      next: (updated) => {
        this.isSavingColumn = false;

        if (!updated?.schema || !(columnName in updated.schema)) {
          this.showCreateColumnError();
          return;
        }

        const merged: DataTable = {
          ...table,
          ...updated,
          schema: updated.schema,
        };
        const index = this.tables.findIndex((t) => t._id === table._id);
        if (index >= 0) {
          this.tables[index] = merged;
        }
        this.selectedTable = merged;
        this.rows = this.rows.map((row) => ({
          ...row,
          data: { ...row.data, [columnName]: '' },
        }));
        this.closeAddColumnPopover();
        this.logger.log('[DATA-TABLES] column added', columnName);
      },
      error: (err) => {
        this.isSavingColumn = false;
        this.logger.error('[DATA-TABLES] updateTable (add column) error', err);
        this.showCreateColumnError();
      },
    });
  }

  private showCreateColumnError(): void {
    this.closeAddColumnPopover();
    this.notify.showWidgetStyleUpdateNotification(
      this.translate.instant('DataTables.CreateColumnError'),
      4,
      'report_problem',
    );
  }

  isRenamingColumn(col: ColumnView): boolean {
    return this.renamingColumnName === col.name;
  }

  onRenameColumn(col: ColumnView | null): void {
    if (!col) { return; }
    this.renamingColumnName = col.name;
    this.renameColumnDraft = col.name;
    this.renameColumnError = '';
    setTimeout(() => {
      const input = document.querySelector<HTMLInputElement>('.dt-col-name-input');
      input?.focus();
      input?.select();
    });
  }

  onRenameColumnDraftChange(): void {
    this.renameColumnError = '';
  }

  onRenameColumnBlur(): void {
    if (!this.renamingColumnName || this.isRenamingColumnSaving) { return; }
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
    this.renamingColumnName = null;
    this.renameColumnDraft = '';
    this.renameColumnError = '';
  }

  commitRenameColumn(): void {
    const oldName = this.renamingColumnName;
    const table = this.selectedTable;
    if (!oldName || !table?._id || !table.schema || this.isRenamingColumnSaving) { return; }

    const newName = (this.renameColumnDraft || '').trim();
    if (!newName || newName === oldName) {
      this.cancelRenameColumn();
      return;
    }

    const existingKeys = Object.keys(table.schema)
      .filter((k) => k !== oldName)
      .map((k) => k.toLowerCase());
    if (existingKeys.includes(newName.toLowerCase())) {
      this.renameColumnError = 'duplicate';
      return;
    }

    const newSchema = this.buildRenamedSchema(table.schema, oldName, newName);

    this.isRenamingColumnSaving = true;
    this.dataTablesService.updateTable(table._id, { schema: newSchema }).subscribe({
      next: (updated) => {
        if (!updated?.schema || !(newName in updated.schema)) {
          this.isRenamingColumnSaving = false;
          this.showRenameColumnError();
          return;
        }

        const merged: DataTable = {
          ...table,
          ...updated,
          schema: updated.schema,
        };
        const index = this.tables.findIndex((t) => t._id === table._id);
        if (index >= 0) {
          this.tables[index] = merged;
        }
        this.selectedTable = merged;
        this.rows = this.rows.map((row) => ({
          ...row,
          data: this.remapRowDataForRenamedColumn(row.data, oldName, newName, updated.schema!),
        }));
        this.cancelRenameColumn();
        this.isRenamingColumnSaving = false;
        this.persistRenamedColumnInRows(table._id!, oldName, newName);
        this.logger.log('[DATA-TABLES] column renamed', oldName, '→', newName);
      },
      error: (err) => {
        this.isRenamingColumnSaving = false;
        this.logger.error('[DATA-TABLES] updateTable (rename column) error', err);
        this.showRenameColumnError();
      },
    });
  }

  private buildRenamedSchema(schema: TableSchema, oldName: string, newName: string): TableSchema {
    const result: TableSchema = {};
    Object.keys(schema).forEach((key) => {
      if (key === oldName) {
        result[newName] = schema[key];
      } else {
        result[key] = schema[key];
      }
    });
    return result;
  }

  private remapRowDataForRenamedColumn(
    data: RowData,
    oldName: string,
    newName: string,
    schema: TableSchema,
  ): RowData {
    const migrated = { ...data };
    if (Object.prototype.hasOwnProperty.call(migrated, oldName)) {
      migrated[newName] = migrated[oldName];
      delete migrated[oldName];
    } else if (!Object.prototype.hasOwnProperty.call(migrated, newName)) {
      migrated[newName] = '';
    }
    return this.normalizeRowData(migrated, schema);
  }

  /** Sync persisted rows after schema key rename (best-effort). */
  private persistRenamedColumnInRows(tableId: string, oldName: string, newName: string): void {
    const rowsToSync = this.rows.filter(
      (r) => r._id && this.rowHasAnyValue(r) && Object.prototype.hasOwnProperty.call(r.data, newName),
    );
    if (!rowsToSync.length) { return; }

    forkJoin(
      rowsToSync.map((row) =>
        this.dataTablesService.updateRow(tableId, {
          id_row: row._id,
          data: { ...row.data },
        }).pipe(
          catchError((err) => {
            this.logger.error('[DATA-TABLES] updateRow after rename error', err);
            return of(null);
          }),
        ),
      ),
    ).subscribe();
  }

  private showRenameColumnError(): void {
    this.cancelRenameColumn();
    this.notify.showWidgetStyleUpdateNotification(
      this.translate.instant('DataTables.RenameColumnError'),
      4,
      'report_problem',
    );
  }

  onDeleteColumn(col: ColumnView | null): void {
    if (!col || this.isDeletingColumn) { return; }

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
    const columnName = col.name;
    const table = this.selectedTable;
    if (!table?._id || !table.schema || !(columnName in table.schema) || this.isDeletingColumn) {
      return;
    }

    if (this.renamingColumnName === columnName) {
      this.cancelRenameColumn();
    }

    const newSchema = this.buildSchemaWithoutColumn(table.schema, columnName);

    this.isDeletingColumn = true;
    this.dataTablesService.updateTable(table._id, { schema: newSchema }).subscribe({
      next: (updated) => {
        this.isDeletingColumn = false;

        if (!updated?.schema || columnName in updated.schema) {
          this.showDeleteColumnError();
          return;
        }

        const merged: DataTable = {
          ...table,
          ...updated,
          schema: updated.schema,
        };
        const index = this.tables.findIndex((t) => t._id === table._id);
        if (index >= 0) {
          this.tables[index] = merged;
        }
        this.selectedTable = merged;

        const schemaKeys = Object.keys(updated.schema);
        if (!schemaKeys.length) {
          this.rows = [];
        } else {
          this.rows = this.rows.map((row) => ({
            ...row,
            data: this.removeColumnFromRowData(row.data, columnName, updated.schema!),
          }));
        }

        this.persistDeletedColumnInRows(table._id!, columnName);
        this.logger.log('[DATA-TABLES] column deleted', columnName);
      },
      error: (err) => {
        this.isDeletingColumn = false;
        this.logger.error('[DATA-TABLES] updateTable (delete column) error', err);
        this.showDeleteColumnError();
      },
    });
  }

  private buildSchemaWithoutColumn(schema: TableSchema, columnName: string): TableSchema {
    const result: TableSchema = {};
    Object.keys(schema).forEach((key) => {
      if (key !== columnName) {
        result[key] = schema[key];
      }
    });
    return result;
  }

  private removeColumnFromRowData(
    data: RowData,
    columnName: string,
    schema: TableSchema,
  ): RowData {
    const migrated = { ...data };
    delete migrated[columnName];
    return this.normalizeRowData(migrated, schema);
  }

  /** Sync persisted rows after schema column removal (best-effort). */
  private persistDeletedColumnInRows(tableId: string, columnName: string): void {
    const rowsToSync = this.rows.filter(
      (r) => r._id && this.rowHasAnyValue(r) && !Object.prototype.hasOwnProperty.call(r.data, columnName),
    );
    if (!rowsToSync.length) { return; }

    forkJoin(
      rowsToSync.map((row) =>
        this.dataTablesService.updateRow(tableId, {
          id_row: row._id,
          data: { ...row.data },
        }).pipe(
          catchError((err) => {
            this.logger.error('[DATA-TABLES] updateRow after delete column error', err);
            return of(null);
          }),
        ),
      ),
    ).subscribe();
  }

  private showDeleteColumnError(): void {
    this.notify.showWidgetStyleUpdateNotification(
      this.translate.instant('DataTables.DeleteColumnError'),
      4,
      'report_problem',
    );
  }
}


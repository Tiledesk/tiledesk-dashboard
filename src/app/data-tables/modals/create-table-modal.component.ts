import { AfterViewInit, Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ColumnInput, ColumnType, isValidColumnName } from 'app/models/data-tables.model';
import { DATA_TABLE_COLUMN_TYPE_OPTIONS, DataTableColumnTypeOption } from '../data-tables-column-types.util';

/** Closed dialog payload returned to the caller (Create Table). */
export interface CreateTableModalResult {
  name: string;
  schema: ColumnInput[];
}

export interface CreateTableModalData {
  existingTableNames?: string[];
}

@Component({
  selector: 'appdashboard-create-table-modal',
  templateUrl: './create-table-modal.component.html',
  styleUrls: ['./create-table-modal.component.scss', '../data-tables-type-select.shared.scss'],
})
export class CreateTableModalComponent implements AfterViewInit {

  readonly columnTypes: DataTableColumnTypeOption[] = DATA_TABLE_COLUMN_TYPE_OPTIONS;

  @ViewChild('tableNameInput') tableNameInput!: ElementRef<HTMLInputElement>;

  form: FormGroup;
  submitted = false;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<CreateTableModalComponent, CreateTableModalResult>,
    @Inject(MAT_DIALOG_DATA) private data: CreateTableModalData = {},
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(1)]],
      columns: this.fb.array([]),
    });
    this.addColumn();
  }

  ngAfterViewInit(): void {
    this.focusTableName();
  }

  get columns(): FormArray {
    return this.form.get('columns') as FormArray;
  }

  addColumn(): void {
    this.columns.push(this.fb.group({
      name: ['', [Validators.required, Validators.minLength(1)]],
      type: ['string' as ColumnType, Validators.required],
    }));
  }

  private focusTableName(): void {
    setTimeout(() => {
      this.tableNameInput?.nativeElement?.focus();
    });
  }

  removeColumn(index: number): void {
    this.columns.removeAt(index);
  }

  hasColumns(): boolean {
    return this.columns.length > 0;
  }

  showNoColumnsError(): boolean {
    return !this.hasColumns();
  }

  isDuplicateName(index: number): boolean {
    const value = (this.columns.at(index).get('name')?.value || '').trim().toLowerCase();
    if (!value) { return false; }
    let count = 0;
    for (let i = 0; i < this.columns.length; i++) {
      const other = (this.columns.at(i).get('name')?.value || '').trim().toLowerCase();
      if (other === value) { count++; }
    }
    return count > 1;
  }

  isInvalidColumnName(index: number): boolean {
    const name = this.getColumnName(index);
    return !!name && !isValidColumnName(name);
  }

  hasTableName(): boolean {
    return !!(this.form.get('name')?.value || '').trim();
  }

  showTableNameRequiredError(): boolean {
    return !this.hasTableName();
  }

  isDuplicateTableName(): boolean {
    const value = (this.form.get('name')?.value || '').trim().toLowerCase();
    if (!value) { return false; }
    const names = this.data.existingTableNames || [];
    return names.some((name) => (name || '').trim().toLowerCase() === value);
  }

  getColumnName(index: number): string {
    return (this.columns.at(index).get('name')?.value || '').trim();
  }

  showColumnNameRequiredError(index: number): boolean {
    return !this.getColumnName(index);
  }

  hasEmptyColumnNames(): boolean {
    for (let i = 0; i < this.columns.length; i++) {
      if (!this.getColumnName(i)) { return true; }
    }
    return false;
  }

  hasInvalidColumnNames(): boolean {
    for (let i = 0; i < this.columns.length; i++) {
      if (this.isInvalidColumnName(i)) { return true; }
    }
    return false;
  }

  isCreateDisabled(): boolean {
    return !this.hasTableName()
      || this.isDuplicateTableName()
      || !this.hasColumns()
      || this.hasEmptyColumnNames()
      || this.hasInvalidColumnNames();
  }

  canSubmit(): boolean {
    if (!this.hasTableName()) { return false; }
    if (this.isDuplicateTableName()) { return false; }
    if (!this.hasColumns()) { return false; }
    if (this.hasEmptyColumnNames()) { return false; }
    if (this.hasInvalidColumnNames()) { return false; }
    for (let i = 0; i < this.columns.length; i++) {
      if (this.isDuplicateName(i)) { return false; }
    }
    return true;
  }

  onSubmit(): void {
    this.submitted = true;
    this.form.markAllAsTouched();
    if (!this.canSubmit()) { return; }

    const name = (this.form.value.name || '').trim();
    const schema: ColumnInput[] = this.columns.controls.map((col, index) => ({
      name: (col.value.name || '').trim(),
      type: (col.value.type || 'string') as ColumnType,
      index,
    }));

    this.dialogRef.close({ name, schema });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}

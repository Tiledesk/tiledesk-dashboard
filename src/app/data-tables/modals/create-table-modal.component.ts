import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { TableSchema } from 'app/models/data-tables.model';

/** Closed dialog payload returned to the caller (Create Table). */
export interface CreateTableModalResult {
  name: string;
  schema: TableSchema;
}

/** UI labels for the column type select; API expects the lowercase value. */
interface ColumnTypeOption {
  label: string;
  /** API value (sent to backend in the schema map). */
  value: string;
  /** Disabled in this iteration: only String is enabled. */
  disabled: boolean;
}

@Component({
  selector: 'appdashboard-create-table-modal',
  templateUrl: './create-table-modal.component.html',
  styleUrls: ['./create-table-modal.component.scss'],
})
export class CreateTableModalComponent {

  // Only String is selectable for now; other types are intentionally disabled
  // to keep server-side schema validation aligned with current backend support.
  readonly columnTypes: ColumnTypeOption[] = [
    { label: 'String',  value: 'string',  disabled: false },
    { label: 'Boolean', value: 'boolean', disabled: true  },
    { label: 'Date',    value: 'date',    disabled: true  },
    { label: 'Number',  value: 'number',  disabled: true  },
  ];

  form: FormGroup;
  submitted = false;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<CreateTableModalComponent, CreateTableModalResult>,
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(1)]],
      columns: this.fb.array([]),
    });
  }

  get columns(): FormArray {
    return this.form.get('columns') as FormArray;
  }

  addColumn(): void {
    this.columns.push(this.fb.group({
      name: ['', [Validators.required, Validators.minLength(1)]],
      type: ['string', Validators.required],
    }));
  }

  removeColumn(index: number): void {
    this.columns.removeAt(index);
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

  hasTableName(): boolean {
    return !!(this.form.get('name')?.value || '').trim();
  }

  /** Table name: show required state immediately when the modal opens. */
  showTableNameRequiredError(): boolean {
    return !this.hasTableName();
  }

  getColumnName(index: number): string {
    return (this.columns.at(index).get('name')?.value || '').trim();
  }

  /** Column name: show required state as soon as the row is added. */
  showColumnNameRequiredError(index: number): boolean {
    return !this.getColumnName(index);
  }

  hasEmptyColumnNames(): boolean {
    for (let i = 0; i < this.columns.length; i++) {
      if (!this.getColumnName(i)) { return true; }
    }
    return false;
  }

  isCreateDisabled(): boolean {
    return !this.hasTableName() || this.hasEmptyColumnNames();
  }

  canSubmit(): boolean {
    if (!this.hasTableName()) { return false; }
    if (this.hasEmptyColumnNames()) { return false; }
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
    const schema: TableSchema = {};
    for (const col of this.columns.controls) {
      const colName = (col.value.name || '').trim();
      const colType = col.value.type || 'string';
      schema[colName] = colType;
    }

    this.dialogRef.close({ name, schema });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}

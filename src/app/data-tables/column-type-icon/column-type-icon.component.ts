import { Component, Input } from '@angular/core';
import { ColumnType } from 'app/models/data-tables.model';

@Component({
  selector: 'appdashboard-dt-column-type-icon',
  templateUrl: './column-type-icon.component.html',
  styleUrls: ['./column-type-icon.component.scss'],
})
export class ColumnTypeIconComponent {
  @Input() type: ColumnType = 'string';
  @Input() size: 'sm' | 'md' = 'sm';
}

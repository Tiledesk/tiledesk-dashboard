import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'appdashboard-kb-header-actions',
  templateUrl: './kb-header-actions.component.html',
  styleUrls: ['./kb-header-actions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KbHeaderActionsComponent {
  @Input() permissionToExportContents = false;
  @Input() permissionToAddContents = false;
  @Input() permissionToDelete = false;

  @Input() selectedNamespaceIsDefault = false;

  @Output() exportContents = new EventEmitter<void>();
  @Output() importContents = new EventEmitter<void>();
  @Output() deleteNamespace = new EventEmitter<void>();
}


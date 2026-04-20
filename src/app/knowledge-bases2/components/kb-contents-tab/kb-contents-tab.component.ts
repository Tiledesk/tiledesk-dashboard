import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import type { KbListItem } from '../../models/kb-types';

@Component({
  selector: 'appdashboard-kb-contents-tab',
  templateUrl: './kb-contents-tab.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KbContentsTabComponent {
  @Input() kbsList: KbListItem[] | null = null;
  @Input() kbsListCount: number | null = null;
  @Input() refresh: any;
  @Input() hasRemovedKb: any;
  @Input() hasUpdatedKb: any;
  @Input() getKbCompleted: any;
  @Input() selectedNamespaceName: string | null = null;
  @Input() hasAlreadyVisitedKb: any;
  @Input() isAvailableRefreshRateFeature: any;
  @Input() t_params: any;
  @Input() refreshRateIsEnabled: any;
  @Input() payIsVisible: any;
  @Input() salesEmail: any;
  @Input() project_name: any;
  @Input() id_project: string | null = null;
  @Input() showKBTableSpinner: boolean | null = null;
  @Input() currentSortParams: any;

  @Output() openBaseModalDetail = new EventEmitter<any>();
  @Output() openBaseModalDelete = new EventEmitter<any>();
  @Output() openBaseModalNamespaceDelete = new EventEmitter<void>();
  @Output() openBaseModalPreview = new EventEmitter<void>();
  @Output() onOpenAddContents = new EventEmitter<void>();
  @Output() openBaseModalPreviewSettings = new EventEmitter<void>();
  @Output() openAddKnowledgeBaseModal = new EventEmitter<any>();
  @Output() checkStatus = new EventEmitter<any>();
  @Output() runIndexing = new EventEmitter<any>();
  @Output() loadPage = new EventEmitter<any>();
  @Output() loadByFilter = new EventEmitter<any>();
}


import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import type { KbNamespace } from '../../models/kb-types';

@Component({
  selector: 'appdashboard-kb-namespace-sidebar',
  templateUrl: './kb-namespace-sidebar.component.html',
  styleUrls: ['./kb-namespace-sidebar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KbNamespaceSidebarComponent {
  @Input() permissionToAddKb = false;
  @Input() isAgentsPage = false;
  @Input() isLoadingNamespaces = false;
  @Input() namespaces: KbNamespace[] | null = null;
  @Input() selectedNamespace: KbNamespace | null = null;

  @Input() totalCount: number | null = null;
  @Input() quotasKbs: number | null = null;

  @Output() addNamespace = new EventEmitter<void>();
  @Output() selectNamespace = new EventEmitter<KbNamespace>();

  onAddNamespaceClick(): void {
    this.addNamespace.emit();
  }

  onSelectNamespace(ns: KbNamespace): void {
    this.selectNamespace.emit(ns);
  }

  trackByNamespaceId(_: number, ns: KbNamespace): string | number {
    return ns?.id ?? ns?._id ?? ns?.name ?? _;
  }
}


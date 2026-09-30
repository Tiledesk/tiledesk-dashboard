import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ConnectorItemSummary, ConnectorGroupSummary } from '../../connector-integration/connector-integration.component';

export interface ConnectorItemsModalGroup {
  groupName: string;
  items: ConnectorItemSummary[];
}

@Component({
  selector: 'connector-items-modal',
  templateUrl: './connector-items-modal.component.html',
  styleUrls: ['./connector-items-modal.component.scss']
})
export class ConnectorItemsModalComponent {
  title: string = '';
  items: ConnectorItemSummary[] = [];
  groupedItems: ConnectorItemsModalGroup[] = [];

  constructor(
    public dialogRef: MatDialogRef<ConnectorItemsModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      title: string;
      items: ConnectorItemSummary[];
      groups?: ConnectorGroupSummary[];
    }
  ) {
    if (data) {
      this.title = data.title || '';
      this.items = data.items || [];
      this.groupedItems = this.buildGroups(this.items, data.groups || []);
    }
  }

  private buildGroups(items: ConnectorItemSummary[], groups: ConnectorGroupSummary[]): ConnectorItemsModalGroup[] {
    const groupNameById = new Map<string, string>();
    groups.forEach((g) => groupNameById.set(g.id, g.name));

    const order: string[] = [];
    const byGroupId = new Map<string, ConnectorItemSummary[]>();
    items.forEach((item) => {
      const groupId = item.group || '';
      if (!byGroupId.has(groupId)) {
        byGroupId.set(groupId, []);
        order.push(groupId);
      }
      byGroupId.get(groupId).push(item);
    });

    return order.map((groupId) => ({
      groupName: groupNameById.get(groupId) || groupId || 'Other',
      items: byGroupId.get(groupId)
    }));
  }

  onClose(): void {
    this.dialogRef.close();
  }
}

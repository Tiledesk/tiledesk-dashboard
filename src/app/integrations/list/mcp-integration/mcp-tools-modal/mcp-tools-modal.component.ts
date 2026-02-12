import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { McpTool } from '../mcp-server-table/mcp-server-table.component';

@Component({
  selector: 'mcp-tools-modal',
  templateUrl: './mcp-tools-modal.component.html',
  styleUrls: ['./mcp-tools-modal.component.scss']
})
export class McpToolsModalComponent implements OnInit {
  tools: McpTool[] = [];
  serverUrl: string = '';

  constructor(
    public dialogRef: MatDialogRef<McpToolsModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      tools: McpTool[];
      serverUrl: string;
    }
  ) {
    if (data) {
      this.tools = data.tools || [];
      this.serverUrl = data.serverUrl || '';
    }
  }

  ngOnInit(): void {
  }

  onClose(): void {
    this.dialogRef.close();
  }
}

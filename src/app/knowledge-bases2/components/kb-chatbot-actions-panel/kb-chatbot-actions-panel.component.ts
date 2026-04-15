import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'appdashboard-kb-chatbot-actions-panel',
  templateUrl: './kb-chatbot-actions-panel.component.html',
  styleUrls: ['./kb-chatbot-actions-panel.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KbChatbotActionsPanelComponent {
  @Input() chatbotsUsingNamespace: any[] | null = null;
  @Input() userRole: string | null = null;

  @Input() uploadEngineIsFirebase = false;
  @Input() storageBucket: string | null = null;
  @Input() baseUrl: string | null = null;

  @Input() permissionToAddFlows = false;
  @Input() exportingTemplate = false;

  @Input() hoveredChatbot: any | null = null;

  @Output() openChatbot = new EventEmitter<any>();
  @Output() createChatbotOneClick = new EventEmitter<void>();
}


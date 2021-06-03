import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'appdashboard-widget-chat',
  templateUrl: './widget-chat.component.html',
  styleUrls: ['./widget-chat.component.scss']
})
export class WidgetChatComponent implements OnInit {

  @Input() primaryColor: string;
  @Input() secondaryColor: string;
  @Input() HAS_FOCUSED_ONLINE_MSG: boolean;
  @Input() HAS_FOCUSED_OFFLINE_MSG: boolean;
  @Input() HAS_FOCUSED_OFFICE_CLOSED_MSG: boolean;
  @Input() selected_translation: any;
  @Input() officeClosedMsg: string;
  @Input() onlineMsg: string;
  @Input() offlineMsg: string;
  @Input() projectName: string;
  @Input() UPLOAD_ENGINE_IS_FIREBASE: boolean;
  @Input() imageUrl: string;
  @Input() currentUserId: string;
  @Input() current_user_name: string;
  
  constructor() { }

  ngOnInit() {
  }

}

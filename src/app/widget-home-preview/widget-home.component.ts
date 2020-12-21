import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'appdashboard-widget-home',
  templateUrl: './widget-home.component.html',
  styleUrls: ['./widget-home.component.scss']
})
export class WidgetHomeComponent implements OnInit {
  colorBck: string;
  g:any
  public userProfileImageurl: string;
  @Input() primaryColorGradiend: string;
  @Input() LOGO_IS_ON: boolean;
  @Input() hasOwnLogo: boolean;
  @Input() logoUrl: string;
  @Input() secondaryColor: string;
  @Input() welcomeTitle: string;
  @Input() welcomeMsg: string;
  @Input() primaryColorBorder: string;
  @Input() company_name: string;
  @Input() primaryColor: string;
  @Input() selected_translation: any;
  @Input() company_site_url: any;
  @Input() newInnerWidth: any;
  @Input() hasSelectedLeftAlignment: boolean;
  @Input() hasSelectedRightAlignment: boolean;
  @Input() C21_BODY_HOME: boolean;
  @Input() waitingTimeNotFoundMsg: string;
  @Input() waitingTimeFoundMsg: string;
  @Input() currentUserId: string;
  @Input() storageBucket: string;
  @Input() newConversation: string;
  @Input() HAS_SELECT_DYMANIC_REPLY_TIME_MSG: boolean;
  @Input() HAS_SELECT_STATIC_REPLY_TIME_MSG: boolean;
  
  constructor() { }

  ngOnInit() {
    this.colorBck = '#000000';

    console.log('WIDGET CLONE COMPONENT ', this.primaryColorGradiend)

    this.userProfileImageurl = 'https://firebasestorage.googleapis.com/v0/b/' + this.storageBucket + '/o/profiles%2F' + this.currentUserId + '%2Fphoto.jpg?alt=media';
  }

}

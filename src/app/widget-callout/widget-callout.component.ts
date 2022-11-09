import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'appdashboard-widget-callout',
  templateUrl: './widget-callout.component.html',
  styleUrls: ['./widget-callout.component.scss']
})
export class WidgetCalloutComponent implements OnInit, OnChanges {

  @Input() newInnerWidth: any;
  @Input() callout_emoticon: string;
  @Input() calloutTitleForPreview: string;
  @Input() calloutMsg: string;
  @Input() primaryColor: string;
  @Input() secondaryColor: string;

  @Input() hasSelectedLeftAlignment: boolean;
  @Input() hasSelectedRightAlignment: boolean;
  @Input() hasOwnLauncherBtn: boolean;
  @Input() customLauncherURL: string;
  @Input() featureIsAvailable: boolean

  @Input() hasOwnLauncherLogo: boolean;
  @Input() id_project: string;
  @Input() imageStorage: string;

  constructor() { }

  ngOnInit() {
  }
  ngOnChanges(){
    // console.log('widget-callout hasOwnLauncherBtn ', this.hasOwnLauncherBtn) 
    // console.log('widget-callout customLauncherURL ', this.customLauncherURL) 
    // console.log('widget-callout customLauncherURL ', this.featureIsAvailable) 
  }

}

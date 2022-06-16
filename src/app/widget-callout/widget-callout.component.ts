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
  @Input() hasOwnLauncherLogo: boolean;
  @Input() customLauncherURL: string;
  @Input() featureIsAvailable: boolean

  constructor() { }

  ngOnInit() {
  }
  ngOnChanges(){
    // console.log('widget-callout hasOwnLauncherLogo ', this.hasOwnLauncherLogo) 
    // console.log('widget-callout customLauncherURL ', this.customLauncherURL) 
    // console.log('widget-callout customLauncherURL ', this.featureIsAvailable) 
  }

}

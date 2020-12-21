import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'appdashboard-widget-callout',
  templateUrl: './widget-callout.component.html',
  styleUrls: ['./widget-callout.component.scss']
})
export class WidgetCalloutComponent implements OnInit {

  @Input() newInnerWidth: any;
  @Input() callout_emoticon: string;
  @Input() calloutTitleForPreview: string;
  @Input() calloutMsg: string;
  @Input() primaryColor: string;
  @Input() secondaryColor: string;

  @Input() hasSelectedLeftAlignment: boolean;
  @Input() hasSelectedRightAlignment: boolean;
  
  

  constructor() { }

  ngOnInit() {
  }

}

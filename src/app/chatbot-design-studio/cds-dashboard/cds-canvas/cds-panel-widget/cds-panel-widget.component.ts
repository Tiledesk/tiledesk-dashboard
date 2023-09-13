import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { IntentService } from 'app/chatbot-design-studio/services/intent.service';
import { AppConfigService } from 'app/services/app-config.service';
import { ENETDOWN } from 'constants';
import { ObserveOnMessage } from 'rxjs/internal/operators/observeOn';

// SERVICES //
import { DashboardService } from 'app/chatbot-design-studio/services/dashboard.service';

function getWindow(): any {
  return window;
}

@Component({
  selector: 'cds-panel-widget',
  templateUrl: './cds-panel-widget.component.html',
  styleUrls: ['./cds-panel-widget.component.scss']
})
export class CdsPanelWidgetComponent implements OnInit {

  @ViewChild('widgetIframe', {static:true}) widgetIframe:ElementRef;

  // @Input() projectID: string;
  // @Input() id_faq_kb: string;
  // @Input() defaultDepartmentId: string;
  // @Input() intentName: string;

  intentName: string;
  projectID: string;
  id_faq_kb: string;
  defaultDepartmentId: string;

  public iframeVisibility: boolean = false
  private window;
  public loading:boolean = true;

  TESTSITE_BASE_URL: string = ''
  widgetTestSiteUrl: SafeResourceUrl = null
  constructor( 
    public appConfigService: AppConfigService,
    private sanitizer: DomSanitizer,
    private elementRef: ElementRef,
    private intentService: IntentService,
    private dashboardService: DashboardService
  ) { 
    this.window = getWindow();
    
  }

  ngOnInit(): void {
    // this.initTiledesk();
    if(!this.intentService.intentSelected){
      this.intentService.setDefaultIntentSelected();
    }
    this.intentName = this.intentService.intentSelected.intent_display_name;
    // this.intentService.setLiveActiveIntent(this.intentName);
    // console.log('****[cds-panel-widget] ngOnInit **** ',this.intentName, this.widgetIframe)
    this.projectID = this.dashboardService.projectID;
    this.id_faq_kb = this.dashboardService.id_faq_kb;
    this.defaultDepartmentId = this.dashboardService.defaultDepartmentId;
    this.setIframeUrl()
  }


  setIframeUrl(){
    this.TESTSITE_BASE_URL = this.appConfigService.getConfig().testsiteBaseUrl;
    const testItOutBaseUrl = this.TESTSITE_BASE_URL.substring(0, this.TESTSITE_BASE_URL.lastIndexOf('/'));
    // const testItOutUrl = testItOutBaseUrl + '/chatbot-panel.html'
    const testItOutUrl = 'http://localhost:4203/assets/twp'+ '/chatbot-panel.html'
    let url = testItOutUrl + '?tiledesk_projectid=' + this.projectID + 
    // const url = testItOutUrl + '?tiledesk_projectid=' + this.projectID + 
                                '&tiledesk_participants=bot_' + this.id_faq_kb + 
                                "&tiledesk_departmentID=" + this.defaultDepartmentId + 
                                "&tiledesk_hideHeaderCloseButton=true" +
                                '&tiledesk_fullscreenMode=true&td_draft=true'
                                if(this.intentName && this.intentName !== '') 
                                url += '&tiledesk_hiddenMessage=' + this.intentName
                          
    this.widgetTestSiteUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url)
    let params = `toolbar=no,menubar=no,width=815,height=727,left=100,top=100`;
    // window.open(url, '_blank', params);
  }

  onLoaded(event){
    this.loading= false
    // this.widgetIframe.nativeElement.contentWindow.postMessage(this.intentName, "*");
    // console.log('iframeeeeeee', this.elementRef.nativeElement.querySelector('.content'))
    window.addEventListener('message', (event_data)=> {
      if(event_data && event_data.origin.includes('widget')){
        let message = event_data.data.message
        if(message && message.attributes && message.attributes.intentName){
          let intentName = message.attributes.intentName
          this.intentService.setLiveActiveIntent(intentName)
        }else{
          this.intentService.setLiveActiveIntent(null)
        }
      }
    })
  }

  startTest(){
    this.iframeVisibility = !this.iframeVisibility
  }

  initTiledesk() {
    console.log("initTiledesk", this.elementRef.nativeElement.querySelector('#content'));

    let script = document.createElement('script')
    script.type = 'application/javascript'
    script.text = 'window.tiledeskSettings = { marginX: "100px", marginY: "50px", projectid: "63d540d370133e00128d6e59", fullscreenMode: true };'
                + '(function(d, s, id) {'
                +  'var w=window; var d=document;'
                +  'var i=function() { '
                +  '   i.c(arguments);'
                +  '};'
                +  'i.q=[];'
                +  'i.c=function(args){' 
                +  '  i.q.push(args);'
                +  '};'
                +  'w.Tiledesk=i;'
                +  'var js, fjs = d.getElementsByTagName(s)[0];'
                +  'if (d.getElementById(id)) return;'
                +  'js = d.createElement(s);'
                +  'js.id = id; js.async = true; js.src = "https://widget.tiledesk.com/v6/launch.js";'
                +  'fjs.parentNode.insertBefore(js, fjs);'
              +'}(document, "script", "tiledesk-jssdk"));'
      this.elementRef.nativeElement.appendChild(script);
  }

}

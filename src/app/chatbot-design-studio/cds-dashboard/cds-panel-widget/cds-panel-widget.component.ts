import { Component, ElementRef, Input, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AppConfigService } from 'app/services/app-config.service';

function getWindow(): any {
  return window;
}

@Component({
  selector: 'cds-panel-widget',
  templateUrl: './cds-panel-widget.component.html',
  styleUrls: ['./cds-panel-widget.component.scss']
})
export class CdsPanelWidgetComponent implements OnInit {

  @Input() projectID: string;
  @Input() id_faq_kb: string;
  @Input() defaultDepartmentId: string;
  private window;
  public loading:boolean = true;

  TESTSITE_BASE_URL: string = ''
  widgetTestSiteUrl: SafeResourceUrl = null
  constructor( 
    public appConfigService: AppConfigService,
    private sanitizer: DomSanitizer,
    private elementRef: ElementRef) { 
    this.window = getWindow();
    
  }

  ngOnInit(): void {
    // this.initTiledesk();
    this.setIframeUrl()
  }


  setIframeUrl(){
    this.TESTSITE_BASE_URL = this.appConfigService.getConfig().testsiteBaseUrl;
    const testItOutBaseUrl = this.TESTSITE_BASE_URL.substring(0, this.TESTSITE_BASE_URL.lastIndexOf('/'));
    const testItOutUrl = testItOutBaseUrl + '/chatbot-panel.html'
    const url = testItOutUrl + '?tiledesk_projectid=' + this.projectID + '&tiledesk_participants=bot_' + this.id_faq_kb + "&tiledesk_departmentID=" + this.defaultDepartmentId + '&tiledesk_fullscreenMode=true&td_draft=true'
    this.widgetTestSiteUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url)
    let params = `toolbar=no,menubar=no,width=815,height=727,left=100,top=100`;
    // window.open(url, '_blank', params);
  }

  onLoaded(event){
    this.loading= false
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

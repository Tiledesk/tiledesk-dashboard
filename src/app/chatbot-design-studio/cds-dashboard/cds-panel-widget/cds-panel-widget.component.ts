import { Component, ElementRef, OnInit } from '@angular/core';

function getWindow(): any {
  return window;
}

@Component({
  selector: 'cds-panel-widget',
  templateUrl: './cds-panel-widget.component.html',
  styleUrls: ['./cds-panel-widget.component.scss']
})
export class CdsPanelWidgetComponent implements OnInit {

  private window;
  private initialized = false;

  constructor( private elementRef: ElementRef) { 
    this.window = getWindow();
    
  }

  ngOnInit(): void {
    // this.initTiledesk();
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

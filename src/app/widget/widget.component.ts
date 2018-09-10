import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { AuthService } from '../core/auth.service';
import { Project } from '../models/project-model';
import { Http, Headers, RequestOptions } from '@angular/http';

@Component({
  selector: 'app-widget',
  templateUrl: './widget.component.html',
  styleUrls: ['./widget.component.scss']
})
export class WidgetComponent implements OnInit {
  @ViewChild('testwidgetbtn') private elementRef: ElementRef;

  project: Project;

  projectId: string;
  preChatForm = false;
  projectName: string;
  calloutTimer: string;
  hasSelectedCalloutTimer = false;
  preChatFormValue = 'false';
  http: Http;
  calloutTimerSecondSelected = -1;
  alignmentSelected = 'right'
  // preChatForm = 'preChatForm'
  calloutTimerOptions = [
    { seconds: 'disabled', value: -1 },
    { seconds: 'immediately', value: 0 },
    { seconds: '5', value: 5 },
    { seconds: '10', value: 10 },
    { seconds: '15', value: 15 },
    { seconds: '20', value: 20 },
    { seconds: '25', value: 25 },
    { seconds: '30', value: 30 }
  ]

  alignmentOptions = [
    { alignTo: 'bottom right', value: 'right' },
    { alignTo: 'bottom left', value: 'left'}
  ]
  constructor(
    http: Http,
    private auth: AuthService
  ) { this.http = http }

  ngOnInit() {
    this.auth.checkRoleForCurrentProject();
    this.auth.project_bs.subscribe((project) => {
      this.project = project
      console.log('00 -> RESOURCES COMP project from AUTH service subscription  ', project)

      if (project) {
        this.projectId = project._id;
        this.projectName = project.name;
      }
    });

  }

  setSelectedCalloutTimer() {
    console.log('»»» CALLOUT TIMER', this.calloutTimerSecondSelected)
    // if (timer === 'immediately') {
    //   this.calloutTimerSecondSelected = 0;
    //   console.log('»»» CALLOUT TIMER', this.calloutTimerSecondSelected)

    // } else if (timer === 'disabled') {
    //   this.calloutTimerSecondSelected = -1
    //   console.log('»»» CALLOUT TIMER', this.calloutTimerSecondSelected)

    // } else {
    //   this.calloutTimerSecondSelected = timer
    //   console.log('»»» CALLOUT TIMER', this.calloutTimerSecondSelected)

    // }
  }

  setSelectedAlignment() {
    console.log('»»» ALIGNMENT SELECTED ', this.alignmentSelected)
    // if (align === 'bottom right') {
    //   this.alignmentSelected = 'right'
    //   console.log('»»» ALIGNMENT SELECTED ', this.alignmentSelected)
    // } else if (align === 'bottom left') {
    //   this.alignmentSelected = 'left'
    //   console.log('»»» ALIGNMENT SELECTED ', this.alignmentSelected)

    // }
  }

  copyToClipboard() {
    document.querySelector('textarea').select();
    document.execCommand('copy');
  }

  toggleCheckBox(event) {
    if (event.target.checked) {
      this.preChatForm = true;
      this.preChatFormValue = 'true'
      console.log('INCLUDE PRE CHAT FORM ', this.preChatForm)
    } else {
      this.preChatForm = false;
      this.preChatFormValue = 'false'
      console.log('INCLUDE PRE CHAT FORM ', this.preChatForm)
    }
  }

  // !! NO MORE USED
  // toggleCheckBoxCalloutTimer(event) {
  //   if (event.target.checked) {
  //     console.log('INCLUDE CALLOUT TIMER ', event.target.checked)
  //     this.calloutTimer = 'calloutTimer: 5';
  //     this.hasSelectedCalloutTimer = true
  //     console.log('CALLOUT TIMER VALUE  ', this.calloutTimer)
  //   } else {
  //     console.log('INCLUDE CALLOUT TIMER ', event.target.checked)
  //     this.calloutTimer = '';
  //     this.hasSelectedCalloutTimer = false
  //     console.log('CALLOUT TIMER VALUE ', this.calloutTimer)
  //   }
  // }

  // testWidget() {
  //   const headers = new Headers();
  //   headers.append('Content-Type', 'application/x-www-form-urlencoded');
  //   const options = new RequestOptions({ headers });
  //   // const url = 'http://support.chat21.org/testsite/?projectid=' + this.projectId + '&prechatform=' + this.preChatForm;
  //   const url = 'http://support.tiledesk.com/testsite/?projectid=' + this.projectId + '&prechatform=' + this.preChatForm;


  //   this.http.post(url, options).subscribe(data => {
  //     console.log('===== > POST WIDGET PAGE ', data);
  //   });
  // }

  testWidgetPage() {
    this.elementRef.nativeElement.blur();
    // http://testwidget.tiledesk.com/testsite/?projectid=5ad069b123c415001469574f&prechatform=false
    // + '&projectname=' + this.projectName
    // tslint:disable-next-line:max-line-length
    const url = 'http://testwidget.tiledesk.com/testsite?projectid=' + this.projectId + '&prechatform=' + this.preChatForm  + '&callout_timer=' + this.calloutTimerSecondSelected + '&align=' + this.alignmentSelected;
    window.open(url, '_blank');
  }

}

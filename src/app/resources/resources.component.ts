import { Component, OnInit } from '@angular/core';
import { AuthService } from '../core/auth.service';
import { Project } from '../models/project-model';
import { Http, Headers, RequestOptions } from '@angular/http';

@Component({
  selector: 'app-resources',
  templateUrl: './resources.component.html',
  styleUrls: ['./resources.component.scss']
})
export class ResourcesComponent implements OnInit {

  project: Project;

  projectId: string;
  preChatForm = false;
  projectName: string;
  calloutTimer: string;
  hasSelectedCalloutTimer = false;
  preChatFormValue = 'false';
  http: Http;

  // preChatForm = 'preChatForm'


  constructor(
    http: Http,
    private auth: AuthService
  ) { this.http = http }

  ngOnInit() {
    this.auth.checkRole();
    this.auth.project_bs.subscribe((project) => {
      this.project = project
      console.log('00 -> RESOURCES COMP project from AUTH service subscription  ', project)

      if (project) {
        this.projectId = project._id;
        this.projectName = project.name;
      }
    });

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

  toggleCheckBoxCalloutTimer(event) {
    if (event.target.checked) {
      console.log('INCLUDE CALLOUT TIMER ', event.target.checked)
      this.calloutTimer = 'calloutTimer: 5';
      this.hasSelectedCalloutTimer = true
      console.log('CALLOUT TIMER VALUE  ', this.calloutTimer)
    } else {
      console.log('INCLUDE CALLOUT TIMER ', event.target.checked)
      this.calloutTimer = '';
      this.hasSelectedCalloutTimer = false
      console.log('CALLOUT TIMER VALUE ', this.calloutTimer)
    }
  }

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
    // http://testwidget.tiledesk.com/testsite/?projectid=5ad069b123c415001469574f&prechatform=false
    // tslint:disable-next-line:max-line-length
    const url = 'http://testwidget.tiledesk.com/testsite?projectid=' + this.projectId + '&prechatform=' + this.preChatForm + '&projectname=' + this.projectName + '&callout_timer=' + this.hasSelectedCalloutTimer;
    window.open(url, '_blank');
  }

}

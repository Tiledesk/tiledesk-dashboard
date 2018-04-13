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
  http: Http;

  // preChatForm = 'preChatForm'


  constructor(
    http: Http,
    private auth: AuthService
  ) { this.http = http }

  ngOnInit() {

    this.auth.project_bs.subscribe((project) => {
      this.project = project
      console.log('00 -> RESOURCES COMP project from AUTH service subscription  ', project)

      if (project) {
        this.projectId = project._id
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
      console.log('INCLUDE PRE CHAT FORM ', this.preChatForm)
    } else {
      this.preChatForm = false;
      console.log('INCLUDE PRE CHAT FORM ', this.preChatForm)
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
    const url = 'http://testwidget.tiledesk.com/testsite/?projectid=' + this.projectId + '&prechatform=' + this.preChatForm;
    window.open(url, '_blank');
  }

}

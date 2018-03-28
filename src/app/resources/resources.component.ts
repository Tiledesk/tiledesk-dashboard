import { Component, OnInit } from '@angular/core';
import { AuthService } from '../core/auth.service';
import { Project } from '../models/project-model';

@Component({
  selector: 'app-resources',
  templateUrl: './resources.component.html',
  styleUrls: ['./resources.component.scss']
})
export class ResourcesComponent implements OnInit {

  project: Project;

  projectId: string;


  constructor(
    private auth: AuthService
  ) { }

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

}

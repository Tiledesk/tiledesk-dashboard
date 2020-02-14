import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { Location } from '@angular/common';

@Component({
  selector: 'appdashboard-bot-type-select',
  templateUrl: './bot-type-select.component.html',
  styleUrls: ['./bot-type-select.component.scss']
})
export class BotTypeSelectComponent implements OnInit {

  projectId: string;

  constructor(
    private router: Router,
    public location: Location,
    public auth: AuthService
  ) { }

  ngOnInit() {
    this.getCurrentProject()
  }



  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
     
      if (project) {
        this.projectId = project._id;
      }
    });
  }

  goToCreateBot(type: string) {
    console.log('Bot Type Selected type ', type)
    this.router.navigate(['project/' + this.projectId + '/bots/create/' + type]);
  }

  goBack() {
    this.location.back();
  }

}

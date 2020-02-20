import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { Location } from '@angular/common';
import { environment } from '../../../../environments/environment';
import brand from 'assets/brand/brand.json';

@Component({
  selector: 'appdashboard-bot-type-select',
  templateUrl: './bot-type-select.component.html',
  styleUrls: ['./bot-type-select.component.scss']
})
export class BotTypeSelectComponent implements OnInit {
  public_Key = environment.t2y12PruGU9wUtEGzBJfolMIgK;
  projectId: string;
  dgfIsVisible: boolean;
  natIsVisible: boolean;
  tparams = brand;

  constructor(
    private router: Router,
    public location: Location,
    public auth: AuthService
  ) { }

  ngOnInit() {
    this.getCurrentProject()
    this.getOSCODE();
  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {

      if (project) {
        this.projectId = project._id;
      }
    });
  }


  getOSCODE() {
    let keys = this.public_Key.split("-");
    console.log('PUBLIC-KEY (SIDEBAR) - public_Key keys', keys)

    keys.forEach(key => {
      // console.log('NavbarComponent public_Key key', key)
      if (key.includes("DGF")) {
        // console.log('PUBLIC-KEY (SIDEBAR) - key', key);
        let dgf = key.split(":");
        console.log('PUBLIC-KEY (BOT-TYPE-SELECT) - dgf key&value', dgf);

        if (dgf[1] === "F") {
          this.dgfIsVisible = false;
          console.log('PUBLIC-KEY (BOT-TYPE-SELECT) - dgf dgfIsVisible', this.dgfIsVisible);
        } else {
          this.dgfIsVisible = true;
          console.log('PUBLIC-KEY (BOT-TYPE-SELECT) - dgf dgfIsVisible', this.dgfIsVisible);
        }
      }
      if (key.includes("NAT")) {
        // console.log('PUBLIC-KEY (SIDEBAR) - key', key);
        let nat = key.split(":");
        console.log('PUBLIC-KEY (BOT-TYPE-SELECT) - nat key&value', nat);

        if (nat[1] === "F") {
          this.natIsVisible = false;
          console.log('PUBLIC-KEY (BOT-TYPE-SELECT) - nat natIsVisible', this.natIsVisible);
        } else {
          this.natIsVisible = true;
          console.log('PUBLIC-KEY (BOT-TYPE-SELECT) - nat natIsVisible', this.natIsVisible);
        }
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

  openExternalBotIntegrationTutorial() {
    const url = 'https://developer.tiledesk.com/apis/tutorials/connect-your-own-chatbot';
    window.open(url, '_blank');
  }

}

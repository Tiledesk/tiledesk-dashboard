import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from 'app/core/auth.service';
@Component({
  selector: 'appdashboard-native-bot-select-type',
  templateUrl: './native-bot-select-type.component.html',
  styleUrls: ['./native-bot-select-type.component.scss']
})
export class NativeBotSelectTypeComponent implements OnInit {
  
  projectId: string;
  isChromeVerGreaterThan100: boolean;

  constructor(
    public location: Location,
    private router: Router,
    public auth: AuthService
  ) { }

  ngOnInit() {
    this.getBrowserVersion();
    this.getCurrentProject();
  }

  getBrowserVersion() {
    this.auth.isChromeVerGreaterThan100.subscribe((isChromeVerGreaterThan100: boolean) => { 
     this.isChromeVerGreaterThan100 = isChromeVerGreaterThan100;
    //  console.log("[NATIVE-BOT-SELECT] isChromeVerGreaterThan100 ",this.isChromeVerGreaterThan100);
    })
   } 

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {

      if (project) {
        this.projectId = project._id;
      }
    });
  }

 

  goToCreateBot(template) {
    // console.log('[NATIVE-BOT-SELECT-TYPE] template ', template)

     this.router.navigate(['project/' + this.projectId + '/bots/create/' + 'native/' + template]);
 
   }


   goBack() {
    this.location.back();
  }


}

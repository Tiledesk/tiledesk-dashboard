import { Component, OnInit } from '@angular/core';
import { AuthService } from 'app/core/auth.service';
import { AppStoreService } from 'app/services/app-store.service';
import { LoggerService } from '../../services/logger/logger.service';
import { Location } from '@angular/common';
@Component({
  selector: 'appdashboard-app-create',
  templateUrl: './app-create.component.html',
  styleUrls: ['./app-create.component.scss']
})


export class AppCreateComponent implements OnInit {
  TOKEN: string;
  isChromeVerGreaterThan100: boolean;

  app_icon_url: string;
  app_name: string;
  app_installation_url: string;
  app_description: string;
  app_learn_more_url: string;
  selectedClient: string = 'dashboard';
  user_id: string;
  // install_action_type: string = "internal"
  install_action_type: string = "internal"
  app_status:string = "private"
  where_items = [
    { id: 'dashboard', name: 'Dashboard' },
    { id: 'webchat', name: 'Webchat' },
    { id: 'widget', name: 'Widget' },
  ]



  constructor(
    public auth: AuthService,
    public logger: LoggerService,
    private appStoreService: AppStoreService,
    public location: Location,
  ) { }

  ngOnInit() {
    this.getBrowserVersion();
    this.getToken();
    this.getLoggedUser();
  }


  getLoggedUser() {
    this.auth.user_bs.subscribe((user) => {
      if (user) {
        console.log('[APP-CREATE] »»» »»» USER  ', user)
        this.user_id = user._id
      }
    })
  }

  getBrowserVersion() {
    this.auth.isChromeVerGreaterThan100.subscribe((isChromeVerGreaterThan100: boolean) => {
      this.isChromeVerGreaterThan100 = isChromeVerGreaterThan100;

    })
  }

  getToken() {
    this.auth.user_bs.subscribe((user) => {
      if (user) {
        this.TOKEN = user.token
      }
    });
  }

  onChangeWhere(selectedClient) {
    console.log('[APP-CREATE] onChangeWhere - selectedClient ', selectedClient)
  }


  saveNewApp() {
    console.log('[APP-CREATE] SAVE NEW APP app_icon_url', this.app_icon_url)
    console.log('[APP-CREATE] SAVE NEW APP app_name', this.app_name)
    console.log('[APP-CREATE] SAVE NEW APP app_description ', this.app_description)
    console.log('[APP-CREATE] SAVE NEW APP install_action_type ', this.install_action_type)

    console.log('[APP-CREATE] SAVE NEW APP app_installation_url', this.app_installation_url)
 
    console.log('[APP-CREATE] SAVE NEW APP app_learn_more_url', this.app_learn_more_url)
    console.log('[APP-CREATE] SAVE NEW APP app_status', this.app_status)
    console.log('[APP-CREATE] SAVE NEW APP user_id', this.user_id )
    console.log('[APP-CREATE] SAVE NEW APP selectedClient', this.selectedClient) // where
   
    this.appStoreService.createNewApp(
      this.app_icon_url, 
      this.app_name, 
      this.app_description, 
      this.install_action_type, 
      this.app_installation_url , 
      this.app_learn_more_url,
      this.app_status,
      this.user_id,
      this.selectedClient)
    .subscribe((res) => {
      this.logger.log("[APP-CREATE] SAVE NEW APP RESULT: ", res);
     
    }, (error) => {
     
     console.error('[APP-CREATE] SAVE NEW APP - ERROR ', error);
    }, () => {
      console.log('[APP-CREATE] SAVE NEW APP * COMPLETE *');
     
    });
  }

 
    goBack() {
      this.location.back();
    }
  

}

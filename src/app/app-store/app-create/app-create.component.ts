import { Component, OnInit } from '@angular/core';
import { AuthService } from 'app/core/auth.service';
import { AppStoreService } from 'app/services/app-store.service';
import { LoggerService } from '../../services/logger/logger.service';
import { Location } from '@angular/common';
import { NotifyService } from 'app/core/notify.service';
import { ActivatedRoute, Router } from '@angular/router';
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
  app_run_url: string;
  install_action_type: string = "internal"
  app_status: string = "private"
  // selectedClient: string = 'dashboard';
  user_id: string;
  // install_action_type: string = "internal"

  IMAGE_NOT_FOUND: boolean = false;

  CREATE_VIEW = false;
  EDIT_VIEW = false;
  APP_ID: string;
  NO_CLIENTS_SELECTED: boolean;
  diplayErrorRunUrlIsNoValid: boolean = false;
  diplayErrorAppInstallationUrlIsNoValid: boolean = false;
  currentApp: any;
  // no more used
  // where_items = [
  //   { id: 'dashboard', name: 'Dashboard' },
  //   { id: 'webchat', name: 'Webchat' },
  //   { id: 'widget', name: 'Widget' },
  // ]

  clients = { dashboard: false, webchat: false, widget: false, appsstore: false }

  constructor(
    public auth: AuthService,
    public logger: LoggerService,
    private appStoreService: AppStoreService,
    public location: Location,
    private notify: NotifyService,
    private router: Router,
    public route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.getBrowserVersion();
    this.getToken();
    this.getLoggedUser();

    if (this.router.url.indexOf('/app-create') !== -1) {
      this.CREATE_VIEW = true;
      this.logger.log('[APP-CREATE] is CREATE_VIEW', this.CREATE_VIEW);
      this.clients.dashboard = true

    } else if (this.router.url.indexOf('/app-edit') !== -1) {
      this.EDIT_VIEW = true;
      this.logger.log('[APP-CREATE] is EDIT_VIEW', this.EDIT_VIEW)
      this.getRouteParamsAndPopulateField();
    }
  }


  getRouteParamsAndPopulateField() {
    this.route.params.subscribe((params) => {
      this.logger.log('[APP-CREATE] - is EDIT_VIEW GET ROUTE PARAMS ', params);
      this.APP_ID = params.appid
      this.appStoreService.getAppDetail(params.appid).subscribe((res) => {
        this.logger.log("[APP-STORE-INSTALL] - GET APP DETAIL RESULT - res: ", res);
        if (res) {
          this.currentApp = res;
          if (this.currentApp && this.currentApp.logo) {
            this.app_icon_url = this.currentApp.logo
          }

          if (this.currentApp && this.currentApp.installActionURL) {
            this.app_installation_url = this.currentApp.installActionURL
          }

          if (this.currentApp && this.currentApp.runURL) {
            this.app_run_url = this.currentApp.runURL
          }

          if (this.currentApp && this.currentApp.title) {
            this.app_name = this.currentApp.title
          }

          if (this.currentApp && this.currentApp.description) {
            this.app_description = this.currentApp.description
          }

          if (this.currentApp && this.currentApp.learnMore) {
            this.app_learn_more_url = this.currentApp.learnMore
          }

          if (this.currentApp && this.currentApp.status === 'public') {
            this.app_status = 'public'
          }

          if (this.currentApp && this.currentApp.where) {

            if (this.currentApp.where.dashboard === true) {
              this.clients.dashboard = true
            }
            if (this.currentApp.where.webchat === true) {
              this.clients.webchat = true
            }

            if (this.currentApp.where.widget === true) {
              this.clients.widget = true
            }

            if (this.currentApp.where.appsstore === true) {
              this.clients.appsstore = true
            }
          }
        }
      });
    });
  }



  changeClientSelection($event) {
    // console.log($event.target.checked)
    var dashboard = document.getElementById("checkbox-dashboard") as HTMLInputElement
    var webchat = document.getElementById("checkbox-webchat") as HTMLInputElement
    var widget = document.getElementById("checkbox-widget") as HTMLInputElement
    var appsstore = document.getElementById("checkbox-appsstore") as HTMLInputElement

    if (dashboard.checked) {
      this.logger.log('dashboard is checked', dashboard.checked)
      this.clients.dashboard = true
    } else if (!dashboard.checked) {
      this.logger.log('dashboard is checked', dashboard.checked)
      this.clients.dashboard = false
    }

    if (appsstore.checked) {
      this.logger.log('appsstore is checked', appsstore.checked)
      this.clients.appsstore = true
    } else if (!appsstore.checked) {
      this.logger.log('appsstore is checked', appsstore.checked)
      this.clients.appsstore = false
    }

    if (webchat.checked) {
      this.logger.log('webchat is checked', webchat.checked)
      this.clients.webchat = true
    } else if (!webchat.checked) {
      this.logger.log('webchat is checked', webchat.checked)
      this.clients.webchat = false
    }


    if (widget.checked) {
      this.logger.log('widget is checked', widget.checked)
      this.clients.widget = true
    } else if (!widget.checked) {
      this.logger.log('widget is checked', widget.checked)
      this.clients.widget = false
    }

    this.logger.log('clients ', this.clients)

    this.NO_CLIENTS_SELECTED = Object.keys(this.clients).every((k) => {

      return this.clients[k] === false

    });
    this.logger.log('[APP-CREATE] ALL CLIENTS ARE UNCHECKED ', this.NO_CLIENTS_SELECTED)
  }


  getLoggedUser() {
    this.auth.user_bs.subscribe((user) => {
      if (user) {
        this.logger.log('[APP-CREATE] »»» »»» USER  ', user)
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

  // onChangeWhere(selectedClient) {
  //   this.logger.log('[APP-CREATE] onChangeWhere - selectedClient ', selectedClient)
  // }
  saveOrUpdateNewApp() {
    if (this.CREATE_VIEW === true) {
      this.saveNewApp()
    } else if (this.EDIT_VIEW === true) {
      this.updateNewApp()
    }
  }


  updateNewApp() {

    // console.log('[APP-CREATE] UPDATE NEW APP app_icon_url', this.app_icon_url)
    // console.log('[APP-CREATE] UPDATE NEW APP app_name', this.app_name)
    // console.log('[APP-CREATE] UPDATE NEW APP app_description ', this.app_description)
    // console.log('[APP-CREATE] UPDATE NEW APP install_action_type ', this.install_action_type)
    // console.log('[APP-CREATE] UPDATE NEW APP app_installation_url', this.app_installation_url)
    // console.log('[APP-CREATE] UPDATE NEW APP app_run_url', this.app_run_url)
    // console.log('[APP-CREATE] UPDATE NEW APP app_learn_more_url', this.app_learn_more_url)
    // console.log('[APP-CREATE] UPDATE NEW APP app_status', this.app_status)
    // console.log('[APP-CREATE] UPDATE NEW APP user_id', this.user_id)
    // console.log('[APP-CREATE] UPDATE NEW APP APP ID', this.APP_ID)
  

    this.appStoreService.updateNewApp(
      this.APP_ID,
      this.app_icon_url,
      this.app_name,
      this.app_description,
      this.install_action_type,
      this.app_installation_url,
      this.app_run_url,
      this.app_learn_more_url,
      this.app_status,
      this.user_id,
      this.clients)
      .subscribe((res) => {
      //  console.log("[APP-CREATE] UPDATE NEW APP RESULT: ", res);

      }, (error) => {

        this.notify.showWidgetStyleUpdateNotification("An error occurred while updating the app", 4, 'report_problem');
        this.logger.error('[APP-CREATE] UPDATE NEW APP - ERROR ', error);
      }, () => {
        this.logger.log('[APP-CREATE] UPDATE NEW APP * COMPLETE *');
        this.notify.showWidgetStyleUpdateNotification("App updated successfully", 2, 'done');
        this.goBack()
      });
  }



  saveNewApp() {
    // console.log('[APP-CREATE] SAVE NEW APP app_icon_url', this.app_icon_url)
    // console.log('[APP-CREATE] SAVE NEW APP app_name', this.app_name)
    // console.log('[APP-CREATE] SAVE NEW APP app_description ', this.app_description)
    // console.log('[APP-CREATE] SAVE NEW APP install_action_type ', this.install_action_type)
    // console.log('[APP-CREATE] SAVE NEW APP app_installation_url', this.app_installation_url)
    // console.log('[APP-CREATE] SAVE NEW APP app_run_url', this.app_run_url)
    // console.log('[APP-CREATE] SAVE NEW APP app_learn_more_url', this.app_learn_more_url)
    // console.log('[APP-CREATE] SAVE NEW APP app_status', this.app_status)
    // console.log('[APP-CREATE] SAVE NEW APP user_id', this.user_id)


    this.appStoreService.createNewApp(
      this.app_icon_url,
      this.app_name,
      this.app_description,
      this.install_action_type,
      this.app_installation_url,
      this.app_run_url,
      this.app_learn_more_url,
      this.app_status,
      this.user_id,
      this.clients)
      .subscribe((res) => {
        this.logger.log("[APP-CREATE] SAVE NEW APP RESULT: ", res);

      }, (error) => {

        this.notify.showWidgetStyleUpdateNotification("An error occurred while creating the app", 4, 'report_problem');
        this.logger.error('[APP-CREATE] SAVE NEW APP - ERROR ', error);
      }, () => {
        this.logger.log('[APP-CREATE] SAVE NEW APP * COMPLETE *');
        this.notify.showWidgetStyleUpdateNotification("App created successfully", 2, 'done');
        this.goBack()
      });
  }


  goBack() {
    this.location.back();
  }

  errorHandler($event) {
    // console.log('[APP-CREATE] IMAGE ERROR HANDLER $event', $event);
    // console.log('[APP-CREATE] IMAGE ERROR HANDLER $event TYPE', $event.type);
    if ($event.type === 'error') {
      this.IMAGE_NOT_FOUND = true;
    } else {
      this.IMAGE_NOT_FOUND = false;
    }
  }

  // http://tiledesk-helloworld-webchat-example-app.nicolan74.repl.co
  onChangeRunUrl($event) {
    this.logger.log('onChangeRunUrl $event', $event)
    if ($event.length > 4) {
      this.validateRunURL($event);
    }
  }
  validateRunURL(link) {
    if (link.indexOf("https://") == 0) {
      this.logger.log("The link https.");
      this.diplayErrorRunUrlIsNoValid = false
    }
    else {
      this.logger.log("The link doesn't have https.");
      this.diplayErrorRunUrlIsNoValid = true
    }
  }

  onChangeAppInstalaltionUrl($event) {
    // console.log('onChangeAppInstalaltionUrl $event', $event)
    // console.log('onChangeAppInstalaltionUrl $event length', $event.length)
    // console.log('onChangeAppInstalaltionUrl this.currentApp', this.currentApp)

    if ($event.length > 4) {
      this.validateAppInstallationURL($event);
    }
  }
  validateAppInstallationURL(link) {
    if (link.indexOf("https://") == 0) {
      this.logger.log("The link https.");
      this.diplayErrorAppInstallationUrlIsNoValid = false
    }
    else {
      this.logger.log("The link doesn't have https.");
      this.diplayErrorAppInstallationUrlIsNoValid = true
    }
  }



  goToCreateNewAppDocs() {
    const url = "https://developer.tiledesk.com/apps/create-app-quick-start"
    window.open(url, '_blank');
  }


}

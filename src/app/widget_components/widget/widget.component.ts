import { Component, OnInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { AuthService } from '../../core/auth.service';
import { Project } from '../../models/project-model';
import { Http, Headers, RequestOptions } from '@angular/http';
import { Router } from '@angular/router';
import { WidgetService } from '../../services/widget.service';
import { NotifyService } from '../../core/notify.service';
import { ProjectService } from '../../services/project.service';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs/Subscription';
import { AppConfigService } from '../../services/app-config.service';
// import { public_Key } from './../utils/util';
import { environment } from '../../../environments/environment';
// import brand from 'assets/brand/brand.json';
import { BrandService } from '../../services/brand.service';

@Component({
  selector: 'appdashboard-widget',
  templateUrl: './widget.component.html',
  styleUrls: ['./widget.component.scss']
})
export class WidgetComponent implements OnInit, OnDestroy {
  @ViewChild('testwidgetbtn') private elementRef: ElementRef;

  // tparams = brand;
  tparams: any;

  // public_Key = environment.t2y12PruGU9wUtEGzBJfolMIgK; // now get from appconfig 
  public_Key: string;

  // TESTSITE_BASE_URL = environment.testsite.testsiteBaseUrl; // moved
  // TESTSITE_BASE_URL = environment.testsiteBaseUrl; // now get from appconfig
  TESTSITE_BASE_URL: string;

  // WIDGET_URL = environment.widgetUrl; // now get from appconfig
  WIDGET_URL: string;

  project: Project;

  projectId: string;
  // preChatForm = false;
  preChatForm: boolean;
  // preChatFormValue = 'false';
  preChatFormValue: string;

  projectName: string;
  calloutTimer: string;
  hasSelectedCalloutTimer = false;

  http: Http;
  // calloutTimerSecondSelected = -1;
  calloutTimerSecondSelected: any;
  paramCalloutTimer: string;

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

  calloutTitle: string;
  calloutTitleText: string;
  // _calloutTitle: string;
  escaped_calloutTitle: string;

  calloutMsg: string;
  calloutMsgText: string;
  escaped_calloutMsg: string;

  primaryColor: string;
  secondaryColor: string;

  themeColor: string;
  themeForegroundColor: string;
  // primaryColor = 'rgb(159, 70, 183)';
  // secondaryColor = 'rgb(38, 171, 221)';

  // alignmentSelected = 'right'
  alignmentSelected: string;
  alignmentOptions = [
    { alignTo: 'bottom right', value: 'right' },
    { alignTo: 'bottom left', value: 'left' }
  ]

  public widgetObj = {};

  logoChatValue: string;
  wellcomeTitleValue: string;
  wellcomeMsgValue: string;

  calloutTimerSecondSelectedValue: any;
  alignmentValue: any;
  browserLang: string;

  callOutMsgValue: string;

  paramWellcomeTitle: string;
  paramWellcomeMsg: string;
  paramLogoChat: string;
  sub: Subscription;
  showSpinner = true;
  has_copied = false;
  isVisible: boolean;
  
  constructor(
    http: Http,
    private auth: AuthService,
    private router: Router,
    private widgetService: WidgetService,
    private notify: NotifyService,
    private projectService: ProjectService,
    private translate: TranslateService,
    public appConfigService: AppConfigService,
    public brandService: BrandService
  ) { 
    this.http = http; 
  
    const brand = brandService.getBrand();
    this.tparams = brand;
  }

  ngOnInit() {
    this.auth.checkRoleForCurrentProject();
    this.getBrowserLang();
    this.getCurrentProject();
    this.getOSCODE();
    this.getWidgetUrl();
    this.getTestSiteUrl();
    // this.subscribeToSelectedPrimaryColor();
    // this.subscribeToSelectedSecondaryColor();
    // this.subscribeToSelectedCalloutTimer();
    // this.subscribeToTypedCalloutTitle();
    // this.subscribeToTypedCalloutMsg();
    // this.subscribeToCheckedPrechatform();
    // this.subscribeToWidgetAlignment();
    console.log('**** ON INIT ALIGNMENT SELECTED ', this.alignmentSelected)
  }

  getTestSiteUrl() {
    this.TESTSITE_BASE_URL = this.appConfigService.getConfig().testsiteBaseUrl;
    console.log('AppConfigService getAppConfig (Widget) TESTSITE_BASE_URL', this.TESTSITE_BASE_URL);
  }

  getWidgetUrl() {
    this.WIDGET_URL = this.appConfigService.getConfig().widgetUrl;
    console.log('AppConfigService getAppConfig (Widget) WIDGET_URL ', this.WIDGET_URL)

  }

  getOSCODE() { 

    this.public_Key = this.appConfigService.getConfig().t2y12PruGU9wUtEGzBJfolMIgK;
    console.log('AppConfigService getAppConfig (Widget) public_Key', this.public_Key);

    let keys = this.public_Key.split("-");
    console.log('PUBLIC-KEY (Widget) keys', keys)
    keys.forEach(key => {
      // console.log('NavbarComponent public_Key key', key)
      if (key.includes("MTL")) {
        // console.log('PUBLIC-KEY (Widget) - mlt', key);
        let mlt = key.split(":");
        // console.log('PUBLIC-KEY (Widget) - mlt key&value', mlt);
        if (mlt[1] === "F") {
          this.isVisible = false;
        } else {
          this.isVisible = true;
        }
      }
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  getBrowserLang() {
    this.browserLang = this.translate.getBrowserLang();
    console.log('WIDGET DESIGN - BROWSER LANG ', this.browserLang)
  }
  getCurrentProject() {
    this.sub = this.auth.project_bs
      .subscribe((project) => {
        this.project = project
        console.log('00 -> WIDGET COMP project from AUTH service subscription  ', project)

        if (project) {
          this.projectId = project._id;
          this.projectName = project.name;

          if (this.projectId) {
            this.getProjectById();
          }
        }
      });
  }

  getProjectById() {
    this.projectService.getProjectById(this.projectId).subscribe((project: any) => {
      // console.log('WIDGET DESIGN - GET PROJECT BY ID - PROJECT OBJECT: ', project);

      console.log('»» WIDGET - PRJCT-WIDGET (onInit): ', project.widget);

      if (project.widget) {

        this.widgetObj = project.widget;

        if (project.widget.wellcomeTitle) {
          // tslint:disable-next-line:max-line-length
          const escapedWellcomeTitle = project.widget.wellcomeTitle.replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0')
          this.wellcomeTitleValue = `\n      wellcomeTitle: "${escapedWellcomeTitle}",`
          console.log('»» WIDGET - PRJCT-WIDGET WELCOME TITLE : ', this.wellcomeTitleValue);

          // used for TEST WIDGET
          this.paramWellcomeTitle = '&wellcomeTitle=' + escapedWellcomeTitle
        } else {
          this.paramWellcomeTitle = '';
        }

        if (project.widget.wellcomeMsg) {
          // tslint:disable-next-line:max-line-length
          const escapedWellcomeMsgValue = project.widget.wellcomeMsg.replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0')
          this.wellcomeMsgValue = `\n      wellcomeMsg: "${escapedWellcomeMsgValue}",`
          console.log('»» WIDGET - PRJCT-WIDGET WELCOME MSG : ', this.wellcomeMsgValue);
          this.paramWellcomeMsg = '&wellcomeMsg=' + escapedWellcomeMsgValue
        } else {
          this.paramWellcomeMsg = ''
        }

        if (project.widget.logoChat) {
          this.logoChatValue = `\n      logoChat: "${project.widget.logoChat}",`
          console.log('»» WIDGET - PRJCT-WIDGET LOGO CHAT : ', this.logoChatValue);
          this.paramLogoChat = '&logoChat=' + project.widget.logoChat
        } else {
          this.paramLogoChat = ''
        }

        if (project.widget.preChatForm) {
          this.preChatFormValue = `\n      preChatForm: ${project.widget.preChatForm},`
          console.log('»» WIDGET - PRJCT-WIDGET PRECHAT FORM : ', this.preChatFormValue);
          this.preChatForm = true;
        } else {
          this.preChatForm = false;
        }

        if (project.widget.calloutTimer) {
          this.calloutTimerSecondSelected = `\n      calloutTimer: ${project.widget.calloutTimer},`
          this.calloutTimerSecondSelectedValue = project.widget.calloutTimer;
          console.log('»» WIDGET - PRJCT-WIDGET CALLOUT TIMER : ', this.calloutTimerSecondSelected);
        }

        if (project.widget.calloutTitle) {
          this.calloutTitle = `\n      calloutTitle: "${project.widget.calloutTitle.replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0')}",`
          // used for TEST WIDGET
          this.escaped_calloutTitle = project.widget.calloutTitle.replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
          console.log('»» WIDGET - PRJCT-WIDGET CALLOUT TITLE : ', this.calloutTitle);
        }

        if (project.widget.calloutMsg) {
          this.calloutMsg = `\n      calloutMsg: "${project.widget.calloutMsg.replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0')}",`;
          // used for TEST WIDGET
          this.escaped_calloutMsg = project.widget.calloutMsg.replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
          console.log('»» WIDGET - PRJCT-WIDGET CALLOUT MSG : ', this.calloutMsg);
        }

        if (project.widget.align) {
          this.alignmentSelected = `\n      align: "${project.widget.align}",`
          // used for TEST WIDGET
          this.alignmentValue = project.widget.align
          console.log('»» WIDGET - PRJCT-WIDGET ALIGNMENT : ', this.alignmentSelected);
        } else {
          this.alignmentValue = 'right'
        }

        if (project.widget.themeColor) {
          this.themeColor = `\n      themeColor: "${project.widget.themeColor}",`;
          // used for TEST WIDGET
          this.primaryColor = this.hexToRgb(project.widget.themeColor);
        }

        if (project.widget.themeForegroundColor) {
          this.themeForegroundColor = `\n      themeForegroundColor: "${project.widget.themeForegroundColor}",`;
          // used for TEST WIDGET
          this.secondaryColor = this.hexToRgb(project.widget.themeForegroundColor);
        }
      } else {
        // used for TEST WIDGET
        this.paramWellcomeTitle = '';
        this.paramWellcomeMsg = '';
        this.paramLogoChat = '';
      }

    }, (error) => {
      this.showSpinner = false;
      console.log('»» WIDGET - PRJCT-WIDGET - ERROR ', error);
    }, () => {
      this.showSpinner = false;
      console.log('»» WIDGET - PRJCT-WIDGET * COMPLETE *');
    });
  }

  hexToRgb(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function (m, r, g, b) {
      return r + r + g + g + b + b;
    });

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

    const resultR = parseInt(result[1], 16);
    const resultG = parseInt(result[2], 16);
    const resultB = parseInt(result[3], 16)

    return result ? 'rgb' + '(' + resultR + ',' + resultG + ',' + resultB + ')' : null;

    // return result ? {
    //   r: parseInt(result[1], 16),
    //   g: parseInt(result[2], 16),
    //   b: parseInt(result[3], 16)
    // } : null;
  }

  // subscribeToWidgetAlignment() {
  //   this.widgetService.widgetAlignmentBs
  //     .subscribe((alignment) => {
  //       console.log('WIDGET COMP - SUBSCRIBE TO WIDGET ALIGNMENT ', alignment);

  //       if (alignment) {
  //         this.alignmentSelected = alignment
  //       }
  //     });
  // }


  // subscribeToCheckedPrechatform() {
  //   this.widgetService.includePrechatformBs
  //     .subscribe((prechatform_checked: boolean) => {
  //       console.log('WIDGET COMP - SUBSCRIBE TO INCLUDE PRECHAT FORM ', prechatform_checked);
  //       if (prechatform_checked) {
  //         this.preChatForm = prechatform_checked;
  //         this.preChatFormValue = `${prechatform_checked}`;
  //       }
  //     });
  // }

  /**
   * TO AVOID THE CALLOUT TIMER EMPTY WHEN THE USER, AFTER HAVING SELECTED THE CALLOUT TIMER,
   * CHANGE PAGE AND THEN RETURN IN THE WIDGET PAGE (SEE  publishCalloutTitle) */
  // subscribeToSelectedCalloutTimer() {
  //   this.widgetService.calloutTimerBs
  //     .subscribe((timer_selected: number) => {
  //       console.log('WIDGET COMP - SUBSCRIBE TO CALLOUT TIMER ', timer_selected);
  //       if (timer_selected) {
  //         this.calloutTimerSecondSelected = timer_selected
  //       }
  //     });
  // }

  /**
   * TO AVOID THE CALLOUT TITLE EMPTY WHEN THE USER, AFTER HAVING TYPED THE CALLOUT TITLE, 
   * CHANGE PAGE AND THEN RETURN IN THE WIDGET PAGE (SEE  publishCalloutTimerSelected) */
  // subscribeToTypedCalloutTitle() {
  //   this.widgetService.calloutTitleBs
  //     .subscribe((title_typed: string) => {
  //       console.log('WIDGET COMP - SUBSCRIBE TO CALLOUT TITLE ', title_typed);

  //       if (title_typed) {
  //         this.calloutTitleText = title_typed;
  //         this.escaped_calloutTitle = this.calloutTitleText.replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
  //         console.log('+++ +++ ON SUBSCRIBE CALLOUT TITLE TEXT  ', this.calloutTitleText);
  //         console.log('+++ +++ ON SUBSCRIBE ESCAPED CALLOUT TITLE ', this.escaped_calloutTitle);
  //         this.calloutTitle = `\n      calloutTitle: "${this.escaped_calloutTitle}",` // is used in the texarea 'script'
  //       } else {
  //         console.log('+++ +++ ON SUBSCRIBE CALLOUT TITLE TEXT (else) ', this.calloutTitleText);
  //         this.escaped_calloutTitle = '';
  //         this.calloutTitle = '';
  //       }

  //     });
  // }

  // subscribeToTypedCalloutMsg() {
  //   this.widgetService.calloutMsgBs
  //     .subscribe((msg_typed: string) => {
  //       console.log('WIDGET COMP - SUBSCRIBE TO CALLOUT MSG ', msg_typed);

  //       if (msg_typed) {
  //         this.calloutMsgText = msg_typed;

  //         this.escaped_calloutMsg = this.calloutMsgText.replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
  //         console.log('+++ +++ ON KEY-UP CALLOUT MSG ', this.escaped_calloutMsg);
  //         this.calloutMsg = `\n      calloutMsg: "${this.escaped_calloutMsg}",` // is used in the texarea 'script'
  //       } else {

  //         this.escaped_calloutMsg = '';
  //         this.calloutMsg = '';
  //       }

  //     });
  // }

  // subscribeToSelectedPrimaryColor() {
  //   this.widgetService.primaryColorBs
  //     .subscribe((primary_color: string) => {
  //       console.log('WIDGET COMP - SUBSCRIBE TO PRIMARY COLOR ', primary_color);
  //       if (primary_color) {
  //         this.primaryColor = primary_color

  //         // this.themeColor IS THE PROPERTY USED IN THE TEXTAREA 'script'
  //         this.themeColor = `\n      themeColor: "${this.primaryColor}",`
  //       }
  //     });
  // }

  // subscribeToSelectedSecondaryColor() {
  //   this.widgetService.secondaryColorBs
  //     .subscribe((secondary_color: string) => {
  //       console.log('WIDGET COMP - SECONDARY COLOR ', secondary_color);
  //       if (secondary_color) {
  //         this.secondaryColor = secondary_color

  //         // this.themeForegroundColor IS THE PROPERTY USED IN THE TEXTAREA 'script'
  //         this.themeForegroundColor = `\n      themeForegroundColor: "${this.secondaryColor}",`
  //       }
  //     });
  // }

  // onKeyCalloutTitle() {
  //   if (this.calloutTitleText) {
  //     this.escaped_calloutTitle = this.calloutTitleText.replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
  //     console.log('+++ +++ ON KEY-UP CALLOUT TITLE TEXT  ', this.calloutTitleText);
  //     console.log('+++ +++ ON KEY-UP ESCAPED CALLOUT TITLE ', this.escaped_calloutTitle);

  //     /**
  //      * THE calloutTitleText IS PASSED TO THE WIDGET SERVICE THAT PUBLISH the property calloutTitleBs
  //      * THIS SAME COMP SUBSCRIBES TO THE WIDGET SERVICE (see subscribeToTypedCalloutTitle) TO AVOID THAT,
  //      * WHEN THE USER GO TO THE WIDEGT DESIGN PAGE (or in another page) AND THEN RETURN IN THE
  //      * WIDGET PAGE, THE VALUE OF THE CALLOUT TITLE BE EMPTY EVEN IF HE HAD PREVIOUSLY DIGITED IT */
  //     this.widgetService.publishCalloutTitleTyped(this.calloutTitleText)

  //     this.calloutTitle = `\n      calloutTitle: "${this.escaped_calloutTitle}",` // is used in the texarea 'script'
  //   } else {
  //     console.log('+++ +++ ON KEY-UP CALLOUT TITLE TEXT (else) ', this.calloutTitleText);
  //     this.widgetService.publishCalloutTitleTyped(this.calloutTitleText)
  //     this.escaped_calloutTitle = '';
  //     this.calloutTitle = '';
  //   }
  // }

  // onKeyCalloutMsg() {
  //   if (this.calloutMsgText) {
  //     this.escaped_calloutMsg = this.calloutMsgText.replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
  //     console.log('+++ +++ ON KEY-UP CALLOUT MSG ', this.escaped_calloutMsg);
  //     this.calloutMsg = `\n      calloutMsg: "${this.escaped_calloutMsg}",` // is used in the texarea 'script'

  //     // COMMENT AS FOR CALLOUT TITLE
  //     this.widgetService.publishCalloutMsgTyped(this.calloutMsgText);
  //   } else {
  //     this.escaped_calloutMsg = '';
  //     this.calloutMsg = '';

  //     // COMMENT AS FOR CALLOUT TITLE
  //     this.widgetService.publishCalloutMsgTyped(this.calloutMsgText);
  //   }
  // }

  // setSelectedCalloutTimer() {
  //   console.log('»»» SET SELECTED CALLOUT TIMER - TIMER SELECTED', this.calloutTimerSecondSelected)

  //   // COMMENT AS FOR CALLOUT TITLE
  //   this.widgetService.publishCalloutTimerSelected(this.calloutTimerSecondSelected)

  //   if (this.calloutTimerSecondSelected === -1) {

  //     this.escaped_calloutTitle = ''; // callout title escaped
  //     this.calloutTitleText = ''; // clear the value in the input if the user disabled the callout
  //     console.log('»»» SET SELECTED CALLOUT TIMER - CALLOUT TITLE ESCAPED', this.escaped_calloutTitle)
  //     this.escaped_calloutMsg = ''; // callout msg escaped
  //     this.calloutMsgText = '';  // clear the value in the input if the user disabled the callout
  //     console.log('»»» SET SELECTED CALLOUT TIMER - CALLOUT MSG ESCAPED ', this.escaped_calloutMsg)
  //     this.calloutTitle = '';
  //     this.calloutMsg = ''
  //   }
  // }

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

    this.has_copied = true;
    setTimeout(() => {
      this.has_copied = false;
    }, 2000);
  }

  togglePrechatformCheckBox(event) {
    if (event.target.checked) {
      this.preChatForm = true;
      // this.preChatFormValue = 'true';

      this.preChatFormValue = `\n      preChatForm: ${this.preChatForm},`
      // *** ADD PROPERTY
      this.widgetObj['preChatForm'] = this.preChatForm;
      this.widgetService.updateWidgetProject(this.widgetObj)

      // COMMENT AS FOR CALLOUT TITLE
      // this.widgetService.publishPrechatformSelected(this.preChatForm)

      console.log('»» WIDGET - INCLUDE PRE CHAT FORM ', event.target.checked)
    } else {
      this.preChatForm = false;
      // *** REMOVE PROPERTY
      delete this.widgetObj['preChatForm'];
      this.widgetService.updateWidgetProject(this.widgetObj)
      this.preChatFormValue = '';

      // this.preChatForm = false;
      // this.preChatFormValue = 'false';

      // COMMENT AS FOR CALLOUT TITLE
      // this.widgetService.publishPrechatformSelected(this.preChatForm)
      console.log('»» WIDGET - INCLUDE PRE CHAT FORM ', event.target.checked)
    }
  }



  testWidgetPage() {
    this.elementRef.nativeElement.blur();
    // http://testwidget.tiledesk.com/testsite/?projectid=5ad069b123c415001469574f&prechatform=false
    // + '&projectname=' + this.projectName
    // tslint:disable-next-line:max-line-length

    console.log('TEST WIDGET CALL OUT TIMER VALUE ', this.calloutTimerSecondSelectedValue);

    if (this.calloutTimerSecondSelectedValue) {
      this.paramCalloutTimer = '&callout_timer=' + this.calloutTimerSecondSelectedValue;
    } else {
      this.paramCalloutTimer = '&callout_timer=' + -1;
    }

    let calloutTitle = this.escaped_calloutTitle
    let paramCallout_title = '&callout_title='


    console.log('CALL OUT TITLE PARAMETER ', paramCallout_title, 'CALL OUT TITLE VALUE  ', calloutTitle);
    if (!this.escaped_calloutTitle && !this.escaped_calloutMsg) {
      paramCallout_title = '';
      calloutTitle = '';
      console.log('CALL OUT TITLE PARAMETER ', paramCallout_title, 'CALL OUT TITLE VALUE  ', calloutTitle);
    }

    if (!this.escaped_calloutTitle && this.escaped_calloutMsg) {
      paramCallout_title = '&callout_title='

      if (this.browserLang) {
        if (this.browserLang === 'it') {
          calloutTitle = 'Bisogno di aiuto?';
        } else {
          calloutTitle = 'Need Help?';
        }
      }
      console.log('CALL OUT TITLE PARAMETER ', paramCallout_title, 'CALL OUT TITLE VALUE  ', calloutTitle);
    }




    let calloutMsg = this.escaped_calloutMsg;
    let paramCallout_msg = '&callout_msg='

    console.log('CALL OUT MSG PARAMETER ', paramCallout_msg, 'CALL OUT MSG VALUE  ', calloutMsg);
    if (!this.escaped_calloutTitle && !this.escaped_calloutMsg) {
      paramCallout_msg = '';
      calloutMsg = ''
      console.log('CALL OUT MSG PARAMETER ', paramCallout_msg, 'CALL OUT MSG VALUE  ', calloutMsg);
    }

    if (this.escaped_calloutTitle && !this.escaped_calloutMsg) {
      console.log('TEST WIDGET CALL OUT TITLE ', this.escaped_calloutTitle, 'CALL OUT MSG ', this.escaped_calloutMsg);

      paramCallout_msg = '&callout_msg='

      if (this.browserLang) {
        if (this.browserLang === 'it') {
          calloutMsg = 'Clicca qui e inizia a chattare con noi!';
        } else {
          calloutMsg = 'Click here and start chatting with us!';
        }
      }
    }



    let paramThemeColor = '&themecolor=' + this.primaryColor
    if (!this.primaryColor) {
      paramThemeColor = ''
    }

    let paramThemeforegroundcolor = '&themeforegroundcolor=' + this.secondaryColor
    if (!this.secondaryColor) {
      paramThemeforegroundcolor = ''
    }

    let paramPreChatForm = '&prechatform=' + this.preChatForm
    if (!this.preChatForm) {
      paramPreChatForm = '&prechatform=false'
    }

    let paramAlign = '&align=' + this.alignmentValue;
    if (!this.alignmentValue) {
      paramAlign = '&align=right'
    }


    // '&themecolor=' + this.primaryColor
    // '&themeforegroundcolor=' + this.secondaryColor
    // http://testwidget.tiledesk.com/testsite?projectid='

    // const url = 'http://testwidget.tiledesk.com/testsitenw3?projectname=' + this.projectName + '&projectid=' + this.projectId
    // const url = this.TESTSITE_BASE_URL + '?projectname=' + this.projectName + '&projectid=' + this.projectId
    const url = this.TESTSITE_BASE_URL + '?tiledesk_projectid=' + this.projectId + '&project_name=' + this.projectName + '&isOpen=true'
    // + paramPreChatForm
    // + this.paramCalloutTimer
    // + paramThemeColor
    // + paramThemeforegroundcolor
    // + paramCallout_title + calloutTitle
    // + paramCallout_msg + calloutMsg
    // + paramAlign
    // + this.paramWellcomeTitle
    // + this.paramWellcomeMsg
    // + this.paramLogoChat
    console.log('»» WIDGET - TEST WIDGET URL ', url);
    window.open(url, '_blank');
  }

  openWebSDK() {
    // const url = 'https://docs.tiledesk.com/widget/web-sdk'
    const url = 'https://developer.tiledesk.com/widget/web-sdk';
    window.open(url, '_blank');
  }


  goToWidgetDesign() {
    // this.router.navigate(['project/' + this.project._id + '/widget/design']);
    this.router.navigate(['project/' + this.project._id + '/widget/appearance']);

  }

  goToWidgetDesignGreetings() {
    this.router.navigate(['project/' + this.project._id + '/widget/greetings']);
  }
  goToWidgetCallout() {
    this.router.navigate(['project/' + this.project._id + '/widget/callout']);
  }

  goToWidgetMultilanguage() {
    this.router.navigate(['project/' + this.project._id + '/widget/translations']);
  }
  

  goToWidgetSection() {
    this.router.navigate(['project/' + this.project._id + '/widget/design'], { fragment: 'alignment' });
  }


}

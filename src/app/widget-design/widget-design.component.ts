import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Location } from '@angular/common';
import { slideInOutAnimation } from './slide-in-out.animation';
import { ColorPickerService, Cmyk } from 'ngx-color-picker';
import { WidgetService } from '../services/widget.service';
import { ActivatedRoute } from '@angular/router';
import { ProjectService } from '../services/project.service';
import { AuthService } from '../core/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs/Rx';
import { Subscription } from 'rxjs/Subscription';
import { Subject } from 'rxjs/Subject';
@Component({
  selector: 'appdashboard-widget-design',
  templateUrl: './widget-design.component.html',
  styleUrls: ['./widget-design.component.scss']
})


export class WidgetDesignComponent implements OnInit, AfterViewInit {
  // '#2889e9'
  public primaryColor: string;
  public primaryColorRgb: any
  public primaryColorRgba: string;
  public primaryColorGradiend: string;
  public primaryColorBorder: string;

  public secondaryColor: string;

  public logoUrl: string;


  public hasOwnLogo = false;
  public welcomeTitle: string;
  public defaultItWelcomeTitle = 'Ciao, benvenuto su tiledesk';
  public defaultEnWelcomeTitle = 'Hi, welcome to tiledesk';


  public customWelcomeMsg: string;
  public id_project: string;
  public widgetObj: any;

  hasSelectedLeftAlignment = false
  hasSelectedRightAlignment = true
  private fragment: string;

  private subscription: Subscription;
  ticks: any;
  start: number;
  stop: number;

  HAS_CHANGED_WELCOME_TITLE = false;
  HAS_CHANGED_WELCOME_MSG = false;

  HIDE_WELCOME_TITLE_SAVE_BTN = true;

  browserLang: string;
  LOGO_IS_ON: boolean;

  constructor(
    public location: Location,
    private cpService: ColorPickerService,
    private widgetService: WidgetService,
    private route: ActivatedRoute,
    private projectService: ProjectService,
    private auth: AuthService,
    private translate: TranslateService
  ) { }

  ngOnInit() {

    this.getCurrentProject();
    this.getBrowserLangAndSwitchWelcomeTitleAndMsg();

    this.route.fragment.subscribe(fragment => {
      this.fragment = fragment;
      console.log('+ WIDGET DESIGN - FRAGMENT ', this.fragment)
    });



    // PRIMARY COLOR AND PROPERTIES CALCULATED FROM IT
    this.primaryColor = 'rgb(40, 137, 233)';
    this.primaryColorRgba = 'rgba(40, 137, 233, 0.50)';
    this.primaryColorGradiend = `linear-gradient(${this.primaryColor}, ${this.primaryColorRgba})`;
    this.primaryColorBorder = `2.4px solid ${this.primaryColorRgba}`;

    this.secondaryColor = 'rgb(255, 255, 255)';

    // this.logoUrl = '../assets/img/tiledesk_logo_white_small.png'
    this.subscribeToSelectedPrimaryColor();

    this.subscribeToSelectedSecondaryColor();

    this.subscribeToWidgetAlignment();

  }

  getBrowserLangAndSwitchWelcomeTitleAndMsg() {
    this.browserLang = this.translate.getBrowserLang();
    console.log('WIDGET DESIGN - BROWSER LANG ', this.browserLang)
  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      if (project) {
        this.id_project = project._id
        console.log('WIDGET DESIGN - SUBSCRIBE TO CURRENT - PRJCT-ID ', this.id_project)

        if (this.id_project) {
          this.getProjectById();
        }
      }
    });
  }

  getProjectById() {
    this.projectService.getProjectById(this.id_project).subscribe((project: any) => {
      // console.log('WIDGET DESIGN - GET PROJECT BY ID - PROJECT OBJECT: ', project);

      console.log('»» WIDGET DESIGN - PRJCT-WIDGET (onInit): ', project.widget);

      if (project.widget) {

        if (project.widget[0].logoChat && project.widget[0].logoChat !== 'nologo') {
          this.logoUrl = project.widget[0].logoChat;

          // case logoChat = 'userCompanyLogoUrl' > display the userCompanyLogoUrl
          this.hasOwnLogo = true;
          this.LOGO_IS_ON = true;

          // case logoChat = 'nologo' > no logo is displayed
        } else if (project.widget[0].logoChat && project.widget[0].logoChat === 'nologo') {
          this.LOGO_IS_ON = false;
          this.logoUrl = 'No Logo';
        } else {

          // case logoChat = '' > display the tiledesk logo and in the input field display the text 'tiledesklogo'
          this.LOGO_IS_ON = true
          this.hasOwnLogo = false;
          console.log('»» WIDGET DESIGN - PRJCT-WIDGET - LOGO CHAT : ', project.widget[0].logoChat);
          this.logoUrl = 'tiledesklogo'
        }

        if (project.widget[0].themeColor) {
          this.primaryColor = project.widget[0].themeColor;
          this.primaryColorRgb = this.hexToRgb(this.primaryColor)
          console.log('»» WIDGET DESIGN - WIDGET - THEME COLOR: ', this.primaryColor);
          this.generateRgbaGradientAndBorder(this.primaryColorRgb);
        }

        if (project.widget[0].themeForegroundColor) {
          this.secondaryColor = project.widget[0].themeForegroundColor;
          console.log('»» WIDGET DESIGN - WIDGET - THEME FOREGROUND COLOR: ', this.secondaryColor);
        }

        if (project.widget[0].wellcomeTitle) {
          this.welcomeTitle = project.widget[0].wellcomeTitle;

          console.log('»» WIDGET DESIGN - WIDGET - WELCOME TITLE: ', this.welcomeTitle);
        } else {
          console.log('»» WIDGET DESIGN - WIDGET - WELCOME TITLE IS UNDEFINED > SET DEFAULT')
          this.setDefaultWelcomeTitle();
        }

        if (project.widget[0].wellcomeMsg) {
          this.customWelcomeMsg = project.widget[0].wellcomeMsg;
          console.log('»» WIDGET DESIGN - WIDGET - WELCOME MSG: ', this.customWelcomeMsg);
        } else {
          console.log('»» WIDGET DESIGN - WIDGET - WELCOME MSG IS UNDEFINED > SET DEFAULT');
          this.setDefaultWelcomeMsg();
        }

      }
    }, (error) => {
      console.log('WIDGET DESIGN - GET PROJECT BY ID - ERROR ', error);

    }, () => {
      console.log('WIDGET DESIGN - GET PROJECT BY ID - COMPLETE ');
    });
  }



  ngAfterViewInit(): void {
    try {
      // name of the class of the html div = . + fragment
      const test = <HTMLElement>document.querySelector('.' + this.fragment)
      console.log('+ WIDGET DESIGN - QUERY SELECTOR TEST  ', test)
      test.scrollIntoView();
      // document.querySelector('#' + this.fragment).scrollIntoView();
      // console.log( document.querySelector('#' + this.fragment).scrollIntoView())
    } catch (e) {
      console.log('+ WIDGET DESIGN - QUERY SELECTOR ERROR  ', e)
    }
  }


  // ===========================================================================
  // ============== *** PRIMARY COLOR (alias for themeColor) ***  ==============
  // ===========================================================================
  /**
   * onChangePrimaryColor: USED FOR THE COLOR PREVIEW (IT IS NECESSARY FOR THE PRIMARY COLOR GIVEN THAT
   * FROM IT ARE GENERATED OTHER PROPERTIES - WITHOUT RUNS generateRgbaGradientAndBorder IN
   * THIS THE UPDATED COLORS OF THE WIDGET'S PREVIEW ARE VISIBLE ONLY AFTER PRESSED TO 'OK' IN onSelectPrimaryColor)
   * @param $event
   */
  onChangePrimaryColor($event) {
    this.primaryColor = $event

    // console.log('+ WIDGET DESIGN - ON CHANGE PRIMARY COLOR ', $event);
    // this.widgetService.publishPrimaryColorSelected(this.primaryColor);
    this.primaryColorRgb = this.hexToRgb(this.primaryColor)
    console.log('++++++ WIDGET DESIGN - ON CHANGE PRIMARY COLOR RGB ', this.primaryColorRgb);
    this.generateRgbaGradientAndBorder(this.primaryColorRgb);

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

  onClosePrimaryColorDialog(event) {
    console.log('++++++ WIDGET DESIGN - ON CLOSE PRIMARY COLOR DIALOG ', event);
    this.primaryColor = event

    // ASSIGN TO WIDEGET OBJ
    this.widgetObj =
      [
        {
          'logoChat': this.logoUrl,
          'themeColor': this.primaryColor,
          'themeForegroundColor': this.secondaryColor,
          'wellcomeTitle': this.welcomeTitle,
          'wellcomeMsg': this.customWelcomeMsg
        }
      ]

    // UPDATE WIDGET PROJECT
    this.widgetService.updateWidgetProject(this.widgetObj)
  }

  /**
   * onSelectPrimaryColor WHEN USER PRESS 'OK' UPDATE THE OBJECT WIDGET
   * @param $event
   */
  // onSelectPrimaryColor($event) {
  //   this.primaryColor = $event
  //   console.log('+ WIDGET DESIGN - ON SELECT PRIMARY COLOR ', this.primaryColor);
  //   // ASSIGN TO WIDEGET OBJ
  //   this.widgetObj =
  //     [
  //       {
  //         'logoChat': this.customLogoUrl,
  //         'themeColor': this.primaryColor,
  //         'themeForegroundColor': this.secondaryColor
  //       }
  //     ]

  //   // UPDATE WIDGET PROJECT
  //   this.widgetService.updateWidgetProject(this.widgetObj)
  //   this.generateRgbaGradientAndBorder(this.primaryColor);
  //   this.widgetService.publishPrimaryColorSelected(this.primaryColor);
  // }

  generateRgbaGradientAndBorder(primaryColor: string) {
    console.log('+ WIDGET DESIGN - ON SELECT PRIMARY COLOR (RGB) ', primaryColor);
    const new_col = primaryColor.replace(/rgb/i, 'rgba');
    this.primaryColorRgba = new_col.replace(/\)/i, ',0.50)');
    console.log('+ WIDGET DESIGN - ON SELECT PRIMARY COLOR (RGBA) ', this.primaryColorRgba);

    this.primaryColorGradiend = `linear-gradient(${this.primaryColor}, ${this.primaryColorRgba})`;
    this.primaryColorBorder = `2.4px solid ${this.primaryColorRgba}`;
  }


  // =======================================================================================
  // ============== *** SECONDARY COLOR (alias for themeForegroundColor) ***  ==============
  // =======================================================================================

  // onChangeSecondaryColor($event) {
  //   this.secondaryColor = $event
  //   console.log('+ WIDGET DESIGN - ON CHANGE SECONDARY COLOR ', $event);
  //   this.widgetService.publishSecondaryColorSelected(this.secondaryColor);
  // }

  onCloseSecondaryColorDialog(event) {
    console.log('++++++ WIDGET DESIGN - ON SELECT SECONDARY COLOR ', event);
    this.secondaryColor = event

    // ASSIGN TO WIDEGET OBJ
    this.widgetObj = [
      {
        'logoChat': this.logoUrl,
        'themeColor': this.primaryColor,
        'themeForegroundColor': this.secondaryColor,
        'wellcomeTitle': this.welcomeTitle,
        'wellcomeMsg': this.customWelcomeMsg
      }
    ]

    // UPDATE WIDGET PROJECT
    this.widgetService.updateWidgetProject(this.widgetObj)

  }

  // onSelectSecondaryColor($event) {
  //   console.log('++++++ WIDGET DESIGN - ON SELECT SECONDARY COLOR ', $event);
  //   this.secondaryColor = $event
  //   // ASSIGN TO WIDEGET OBJ
  //   this.widgetObj = [
  //     {
  //       'logoChat': this.customLogoUrl,
  //       'themeColor': this.primaryColor,
  //       'themeForegroundColor': this.secondaryColor,
  //       'wellcomeTitle': this.welcomeTitle,
  //       'wellcomeMsg': this.customWelcomeMsg
  //     }
  //   ]
  //   // UPDATE WIDGET PROJECT
  //   this.widgetService.updateWidgetProject(this.widgetObj)

  //   this.widgetService.publishSecondaryColorSelected(this.secondaryColor);
  // }

  // ===========================================================================
  // ============== *** CUSTOM LOGO URL (alias for logoChat) ***  ==============
  // ===========================================================================
  /**
   * WHEN USER PRESS 'CHANGE LOGO' UPDATE THE OBJECT WIDGET
   */
  changeLogo() {
    console.log('ON BLUR CHANGE LOGO - CUSTOM LOGO URL ', this.logoUrl);
    if (this.logoUrl && this.LOGO_IS_ON === true) {

      // ASSIGN TO WIDEGET OBJ
      this.widgetObj = [
        {
          'logoChat': this.logoUrl,
          'themeColor': this.primaryColor,
          'themeForegroundColor': this.secondaryColor,
          'wellcomeTitle': this.welcomeTitle,
          'wellcomeMsg': this.customWelcomeMsg
        }
      ]
      console.log('HAS PRESSED CHANGE LOGO - WIDGET OBJ ', this.widgetObj);

      // UPDATE WIDGET PROJECT
      this.widgetService.updateWidgetProject(this.widgetObj)

      this.hasOwnLogo = true;
      console.log('ON BLUR CHANGE LOGO - HAS OWN LOGO ', this.hasOwnLogo);

    } else if (this.logoUrl && this.LOGO_IS_ON === false) {
      this.logoUrl = 'No Logo'
      // ASSIGN TO WIDEGET OBJ
      this.widgetObj = [
        {
          'logoChat': 'nologo',
          'themeColor': this.primaryColor,
          'themeForegroundColor': this.secondaryColor,
          'wellcomeTitle': this.welcomeTitle,
          'wellcomeMsg': this.customWelcomeMsg
        }
      ]
      console.log('HAS PRESSED CHANGE LOGO - WIDGET OBJ ', this.widgetObj);

      // UPDATE WIDGET PROJECT
      this.widgetService.updateWidgetProject(this.widgetObj)

    } else {
      this.logoUrl = 'tiledesklogo'
      this.hasOwnLogo = false;
      console.log('ON BLUR CHANGE LOGO - HAS OWN LOGO ', this.hasOwnLogo);
      // ASSIGN TO WIDEGET OBJ
      this.widgetObj = [
        {
          'logoChat': '',
          'themeColor': this.primaryColor,
          'themeForegroundColor': this.secondaryColor,
          'wellcomeTitle': this.welcomeTitle,
          'wellcomeMsg': this.customWelcomeMsg
        }
      ]
      this.widgetService.updateWidgetProject(this.widgetObj)
    }
  }

  logoUrlChange(event) {
    console.log('WIDGET DESIGN - CUSTOM LOGO URL CHANGE ', event)
  }

  onLogoOnOff($event) {
    console.log('WIDGET DESIGN - LOGO ON/OFF ', $event.target.checked)
    this.LOGO_IS_ON = false
    if ($event.target.checked === false) {
      this.logoUrl = 'No Logo'
      this.widgetObj = [
        {
          'logoChat': 'nologo',
          'themeColor': this.primaryColor,
          'themeForegroundColor': this.secondaryColor,
          'wellcomeTitle': this.welcomeTitle,
          'wellcomeMsg': this.customWelcomeMsg
        }
      ]
      this.widgetService.updateWidgetProject(this.widgetObj)
    } else if ($event.target.checked === true) {

      this.logoUrl = 'tiledesklogo'
      this.LOGO_IS_ON = true;
      console.log('»»» WIDGET DESIGN LOGO_IS_ON ', this.LOGO_IS_ON)
      this.hasOwnLogo = false

      this.widgetObj = [
        {
          'logoChat': '',
          'themeColor': this.primaryColor,
          'themeForegroundColor': this.secondaryColor,
          'wellcomeTitle': this.welcomeTitle,
          'wellcomeMsg': this.customWelcomeMsg
        }
      ]
      this.widgetService.updateWidgetProject(this.widgetObj)

    }
  }

  // ====================================================================================
  // ============== *** CUSTOM WIDGET TITLE (alias for wellcomeTitle) ***  ==============
  // ====================================================================================
  // startTimer() {
  //   let ticks = 0;
  //   const timer = Observable.timer(1000, 1000);
  //   this.subscription = timer.subscribe((t) => {

  //     ticks = t
  //     console.log('**** **** ', ticks)
  //     if (ticks === 5) {
  //       console.log('**** **** ', ticks, '= 5 ')
  //       this.subscription.unsubscribe();
  //     }

  //   });
  // }

  welcomeTitleChange(event) {
    // this.HIDE_WELCOME_TITLE_SAVE_BTN = false;
    // this.startTimer()

    // hide the save btn if the text in the input field is equal to the default WelcomeTitle (eng or it) 
    // is equal to the WelcomeTitle returned in the Project object || (event === this.customWelcomeTitle)
    // if ((event === this.defaultItWelcomeTitle) || (event === this.defaultEnWelcomeTitle) ) {
    //   this.HIDE_WELCOME_TITLE_SAVE_BTN = true;
    //   console.log('WIDGET DESIGN - WELCOME TITLE HIDE SAVE BTN (modelChange) ', this.HIDE_WELCOME_TITLE_SAVE_BTN);
    // } else {
    //   this.HIDE_WELCOME_TITLE_SAVE_BTN = false;
    //   console.log('WIDGET DESIGN - WELCOME TITLE HIDE SAVE BTN (modelChange) ', this.HIDE_WELCOME_TITLE_SAVE_BTN);
    // }

    console.log('WIDGET DESIGN - WELCOME TITLE (modelChange) CHANGE ', event);
    // console.log('WIDGET DESIGN - WELCOME TITLE LENGHT (modelChange) ', event.length);
    if (event.length === 0) {
      console.log('WIDGET DESIGN - WELCOME TITLE LENGHT is (modelChange) ', event.length);

      this.setDefaultWelcomeTitle();
    }
    this.HAS_CHANGED_WELCOME_TITLE = true
  }

  setDefaultWelcomeTitle() {
    if (this.browserLang) {
      if (this.browserLang === 'it') {
        this.welcomeTitle = 'Ciao, benvenuto su tiledesk';
      } else {
        this.welcomeTitle = 'Hi, welcome to Tiledesk';
      }
    }
  }

  saveWelcomeTitle() {
    // ASSIGN TO WIDEGET OBJ
    this.widgetObj = [
      {
        'logoChat': this.logoUrl,
        'themeColor': this.primaryColor,
        'themeForegroundColor': this.secondaryColor,
        'wellcomeTitle': this.welcomeTitle,
        'wellcomeMsg': this.customWelcomeMsg
      }
    ]
    // UPDATE WIDGET PROJECT
    this.widgetService.updateWidgetProject(this.widgetObj)
  }

  // ================================================================================
  // ============== *** CUSTOM WIDGET MSG (alias for wellcomeMsg) ***  ==============
  // ================================================================================
  customWelcomeMsgChange(event) {
    console.log('WIDGET DESIGN - WELCOME MSG CHANGE ', event);



    if (event.length === 0) {
      console.log('WIDGET DESIGN - WELCOME MSG LENGHT is (modelChange) ', event.length);

      this.setDefaultWelcomeMsg();
    }
    this.HAS_CHANGED_WELCOME_MSG = true;
  }

  setDefaultWelcomeMsg() {
    if (this.browserLang) {
      if (this.browserLang === 'it') {
        this.customWelcomeMsg = 'Come possiamo aiutare?'

      } else {
        this.customWelcomeMsg = 'How can we help?'
      }
    }
  }

  saveCustomWelcomeMsg() {
    this.HAS_CHANGED_WELCOME_MSG = false;
    this.widgetObj = [
      {
        'logoChat': this.logoUrl,
        'themeColor': this.primaryColor,
        'themeForegroundColor': this.secondaryColor,
        'wellcomeTitle': this.welcomeTitle,
        'wellcomeMsg': this.customWelcomeMsg
      }
    ]
    // UPDATE WIDGET PROJECT
    this.widgetService.updateWidgetProject(this.widgetObj)
  }




  // WIDGET ALIGNMENT
  aligmentLeftSelected(left_selected: boolean) {
    console.log('+ WIDGET DESIGN - LEFT ALIGNMENT SELECTED ', left_selected);
    this.hasSelectedLeftAlignment = true;
    this.hasSelectedRightAlignment = false;

    this.widgetService.publishWidgetAligmentSelected('left');
  }

  aligmentRightSelected(right_selected: boolean) {
    console.log('+ WIDGET DESIGN - RIGHT ALIGNMENT SELECTED ', right_selected);
    this.hasSelectedLeftAlignment = false;
    this.hasSelectedRightAlignment = true;
    this.widgetService.publishWidgetAligmentSelected('right');
  }

  subscribeToWidgetAlignment() {
    this.widgetService.widgetAlignmentBs
      .subscribe((alignment) => {
        console.log('WIDGET COMP - SUBSCRIBE TO WIDGET ALIGNMENT ', alignment);
        if (alignment === 'right') {
          this.hasSelectedLeftAlignment = false;
          this.hasSelectedRightAlignment = true;

        } else if (alignment === 'left') {
          this.hasSelectedLeftAlignment = true;
          this.hasSelectedRightAlignment = false;
        }

      });
  }

  /**
   * IF THE USER SELECT A COLOR IN THE WIDGET DESIGN (THIS COMP) AND THEN GO BACK IN THE WIDGET PAGE AND THEN RETURN IN THE
   * THE WIDGET DESIGN PAGE (THIS COMP), THE WIDGET DESIGN PAGE IS RE-INITIALIZATED SO THE PRIMARY AND THE SECONDARY COLORS
   * ARE NOT THOSE PREVIOUS SELECTED BUT ARE THE DEFAULT COLORS SETTED IN THE ONINIT LIFEHOOK.
   * TO AVOID THIS ALSO THE WIDGET DESIGN PAGE (THIS COMP) IS SUBSCRIBED TO THE PRIMARY AND THE SECONDARY COLOR SELECTED IN ITSELF */
  subscribeToSelectedPrimaryColor() {
    this.widgetService.primaryColorBs.subscribe((primary_color: string) => {
      if (primary_color) {
        this.primaryColor = primary_color
      }
    })
  }
  subscribeToSelectedSecondaryColor() {
    this.widgetService.secondaryColorBs.subscribe((secondary_color: string) => {
      if (secondary_color) {
        this.secondaryColor = secondary_color
      }
    })
  }








  goBack() {
    this.location.back();
  }


}

import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Location } from '@angular/common';
import { slideInOutAnimation } from './slide-in-out.animation';
import { ColorPickerService, Cmyk } from 'ngx-color-picker';
import { WidgetService } from '../services/widget.service';
import { ActivatedRoute } from '@angular/router';
import { ProjectService } from '../services/project.service';
import { AuthService } from '../core/auth.service';

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
  public secondaryColor: string;
  public primaryColorRgba: string;
  public primaryColorGradiend: string;
  public primaryColorBorder: string;

  public customLogoUrl: string;
  public hasOwnLogo = false;
  public customWelcomeTitle: string;
  public customWelcomeMsg: string;
  public id_project: string;
  public widgetObj: any;

  hasSelectedLeftAlignment = false
  hasSelectedRightAlignment = true
  private fragment: string;

  // private subscription: Subscription;
  ticks: any;
  start: number;
  stop: number;

  HAS_CHANGED_WELCOME_TITLE = false;
  HAS_CHANGED_WELCOME_MSG = false;

  constructor(
    public location: Location,
    private cpService: ColorPickerService,
    private widgetService: WidgetService,
    private route: ActivatedRoute,
    private projectService: ProjectService,
    private auth: AuthService
  ) { }

  ngOnInit() {

    this.getCurrentProject();

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


    this.subscribeToSelectedPrimaryColor();

    this.subscribeToSelectedSecondaryColor();

    this.subscribeToWidgetAlignment();

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

      console.log('WIDGET DESIGN - PRJCT-WIDGET (onInit): ', project.widget);

      if (project.widget) {

        if (project.widget[0].logoChat) {
          this.customLogoUrl = project.widget[0].logoChat;
          console.log('»» WIDGET DESIGN - PRJCT-WIDGET - LOGO CHAT : ', this.customLogoUrl);
          this.hasOwnLogo = true;
        }

        if (project.widget[0].themeColor) {
          this.primaryColor = project.widget[0].themeColor;
          console.log('»» WIDGET DESIGN - PRJCT-WIDGET - THEME COLOR : ', this.primaryColor);
          this.generateRgbaGradientAndBorder(this.primaryColor);
        }

        if (project.widget[0].themeForegroundColor) {
          this.secondaryColor = project.widget[0].themeForegroundColor;
          console.log('»» WIDGET DESIGN - PRJCT-WIDGET - THEME FOREGROUND COLOR : ', this.secondaryColor);
        }

        if (project.widget[0].wellcomeTitle) {
          this.customWelcomeTitle = project.widget[0].wellcomeTitle;
          console.log('»» WIDGET DESIGN - PRJCT-WIDGET - CUSTOM WELCOME TITLE : ', this.customWelcomeTitle);
        }

        if (project.widget[0].wellcomeMsg) {
          this.customWelcomeMsg = project.widget[0].wellcomeMsg;
          console.log('»» WIDGET DESIGN - PRJCT-WIDGET - CUSTOM WELCOME MSG : ', this.customWelcomeMsg);
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

    this.generateRgbaGradientAndBorder(this.primaryColor);

    // console.log('+ WIDGET DESIGN - ON CHANGE PRIMARY COLOR ', $event);
    this.widgetService.publishPrimaryColorSelected(this.primaryColor);
  }

  /**
   * onSelectPrimaryColor WHEN USER PRESS 'OK' UPDATE THE OBJECT WIDGET
   * @param $event
   */
  onSelectPrimaryColor($event) {
    this.primaryColor = $event
    console.log('+ WIDGET DESIGN - ON SELECT PRIMARY COLOR ', this.primaryColor);

    // ASSIGN TO WIDEGET OBJ
    this.widgetObj = [{ 'logoChat': this.customLogoUrl, 'themeColor': this.primaryColor, 'themeForegroundColor': this.secondaryColor }]

    // UPDATE WIDGET PROJECT
    this.widgetService.updateWidgetProject(this.widgetObj)

    this.generateRgbaGradientAndBorder(this.primaryColor);

    this.widgetService.publishPrimaryColorSelected(this.primaryColor);
  }

  generateRgbaGradientAndBorder(primaryColor: string) {
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

  onSelectSecondaryColor($event) {
    console.log('++++++ WIDGET DESIGN - ON SELECT SECONDARY COLOR ', $event);
    this.secondaryColor = $event

    // ASSIGN TO WIDEGET OBJ
    this.widgetObj = [
      {
        'logoChat': this.customLogoUrl,
        'themeColor': this.primaryColor,
        'themeForegroundColor': this.secondaryColor,
        'wellcomeTitle': this.customWelcomeTitle,
        'wellcomeMsg': this.customWelcomeMsg
      }
    ]

    // UPDATE WIDGET PROJECT
    this.widgetService.updateWidgetProject(this.widgetObj)

    this.widgetService.publishSecondaryColorSelected(this.secondaryColor);
  }

  // ===========================================================================
  // ============== *** CUSTOM LOGO URL (alias for logoChat) ***  ==============
  // ===========================================================================
  /**
   * WHEN USER PRESS 'CHANGE LOGO' UPDATE THE OBJECT WIDGET
   */
  changeLogo() {
    console.log('HAS PRESSED CHANGE LOGO - CUSTOM LOGO URL ', this.customLogoUrl);
    if (this.customLogoUrl) {

      // ASSIGN TO WIDEGET OBJ
      this.widgetObj = [
        {
          'logoChat': this.customLogoUrl,
          'themeColor': this.primaryColor,
          'themeForegroundColor': this.secondaryColor,
          'wellcomeTitle': this.customWelcomeTitle,
          'wellcomeMsg': this.customWelcomeMsg
        }
      ]
      console.log('HAS PRESSED CHANGE LOGO - WIDGET OBJ ', this.widgetObj);

      // UPDATE WIDGET PROJECT
      this.widgetService.updateWidgetProject(this.widgetObj)

      this.hasOwnLogo = true;
      console.log('HAS PRESSED CHANGE LOGO - HAS OWN LOGO ', this.hasOwnLogo);
    } else {
      this.hasOwnLogo = false;
    }
  }

  customLogoUrlChange(event) {
    console.log('WIDGET DESIGN - CUSTOM LOGO URL CHANGE ', event)
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

  startTimer() {
    this.start = 0;
    this.stop = 2000;
    this.ticks = Observable.timer(this.start, this.stop);

    this.ticks.subscribe(val => {
      console.log('**** **** ', val)
    })
  }


  customWelcomeTitleChange(event) {
    console.log('WIDGET DESIGN - WELCOME TITLE CHANGE ', event);

    this.HAS_CHANGED_WELCOME_TITLE = true
  }

  saveCustomWelcomeTitle() {
    
    // ASSIGN TO WIDEGET OBJ
    this.widgetObj = [
      {
        'logoChat': this.customLogoUrl,
        'themeColor': this.primaryColor,
        'themeForegroundColor': this.secondaryColor,
        'wellcomeTitle': this.customWelcomeTitle,
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

    this.HAS_CHANGED_WELCOME_MSG = true;
  }

  saveCustomWelcomeMsg() {
    this.HAS_CHANGED_WELCOME_MSG = false;
    this.widgetObj = [
      {
        'logoChat': this.customLogoUrl,
        'themeColor': this.primaryColor,
        'themeForegroundColor': this.secondaryColor,
        'wellcomeTitle': this.customWelcomeTitle,
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

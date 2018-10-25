import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { AuthService } from '../core/auth.service';
import { Project } from '../models/project-model';
import { Http, Headers, RequestOptions } from '@angular/http';
import { Router } from '@angular/router';
import { WidgetService } from '../services/widget.service';
import { NotifyService } from '../core/notify.service';

@Component({
  selector: 'app-widget',
  templateUrl: './widget.component.html',
  styleUrls: ['./widget.component.scss']
})
export class WidgetComponent implements OnInit {
  @ViewChild('testwidgetbtn') private elementRef: ElementRef;

  project: Project;

  projectId: string;
  preChatForm = false;
  projectName: string;
  calloutTimer: string;
  hasSelectedCalloutTimer = false;
  preChatFormValue = 'false';
  http: Http;
  calloutTimerSecondSelected = -1;
  alignmentSelected = 'right'
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


  alignmentOptions = [
    { alignTo: 'bottom right', value: 'right' },
    { alignTo: 'bottom left', value: 'left' }
  ]
  constructor(
    http: Http,
    private auth: AuthService,
    private router: Router,
    private widgetService: WidgetService,
    private notify: NotifyService
  ) { this.http = http }

  ngOnInit() {
    this.auth.checkRoleForCurrentProject();

    this.getCurrentProject();

    this.subscribeToSelectedPrimaryColor();
    this.subscribeToSelectedSecondaryColor();
    this.subscribeToSelectedCalloutTimer();
    this.subscribeToTypedCalloutTitle();
    this.subscribeToTypedCalloutMsg();
    this.subscribeToCheckedPrechatform();
  }

  getCurrentProject() {
    this.auth.project_bs
      .subscribe((project) => {
        this.project = project
        console.log('00 -> WIDGET COMP project from AUTH service subscription  ', project)

        if (project) {
          this.projectId = project._id;
          this.projectName = project.name;
        }
      });
  }

  subscribeToCheckedPrechatform() {
    this.widgetService.includePrechatformBs
      .subscribe((prechatform_checked: boolean) => {
        console.log('WIDGET COMP - SUBSCRIBE TO INCLUDE PRECHAT FORM ', prechatform_checked);
        if (prechatform_checked) {
          this.preChatForm = prechatform_checked;
          this.preChatFormValue = `${prechatform_checked}`;
        }
      });
  }

  /**
   * TO AVOID THE CALLOUT TIMER EMPTY WHEN THE USER, AFTER HAVING SELECTED THE CALLOUT TIMER,
   * CHANGE PAGE AND THEN RETURN IN THE WIDGET PAGE (SEE  publishCalloutTitle) */
  subscribeToSelectedCalloutTimer() {
    this.widgetService.calloutTimerBs
      .subscribe((timer_selected: number) => {
        console.log('WIDGET COMP - SUBSCRIBE TO CALLOUT TIMER ', timer_selected);
        if (timer_selected) {
          this.calloutTimerSecondSelected = timer_selected
        }
      });
  }

  /**
   * TO AVOID THE CALLOUT TITLE EMPTY WHEN THE USER, AFTER HAVING TYPED THE CALLOUT TITLE, 
   * CHANGE PAGE AND THEN RETURN IN THE WIDGET PAGE (SEE  publishCalloutTimerSelected) */
  subscribeToTypedCalloutTitle() {
    this.widgetService.calloutTitleBs
      .subscribe((title_typed: string) => {
        console.log('WIDGET COMP - SUBSCRIBE TO CALLOUT TITLE ', title_typed);

        if (title_typed) {
          this.calloutTitleText = title_typed;
          this.escaped_calloutTitle = this.calloutTitleText.replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
          console.log('+++ +++ ON SUBSCRIBE CALLOUT TITLE TEXT  ', this.calloutTitleText);
          console.log('+++ +++ ON SUBSCRIBE ESCAPED CALLOUT TITLE ', this.escaped_calloutTitle);
          this.calloutTitle = `\n      calloutTitle: "${this.escaped_calloutTitle}",` // is used in the texarea 'script'
        } else {
          console.log('+++ +++ ON SUBSCRIBE CALLOUT TITLE TEXT (else) ', this.calloutTitleText);
          this.escaped_calloutTitle = '';
          this.calloutTitle = '';
        }

      });
  }

  subscribeToTypedCalloutMsg() {
    this.widgetService.calloutMsgBs
      .subscribe((msg_typed: string) => {
        console.log('WIDGET COMP - SUBSCRIBE TO CALLOUT MSG ', msg_typed);

        if (msg_typed) {
          this.calloutMsgText = msg_typed;

          this.escaped_calloutMsg = this.calloutMsgText.replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
          console.log('+++ +++ ON KEY-UP CALLOUT MSG ', this.escaped_calloutMsg);
          this.calloutMsg = `\n      calloutMsg: "${this.escaped_calloutMsg}",` // is used in the texarea 'script'
        } else {

          this.escaped_calloutMsg = '';
          this.calloutMsg = '';
        }

      });
  }

  subscribeToSelectedPrimaryColor() {
    this.widgetService.primaryColorBs
      .subscribe((primary_color: string) => {
        console.log('WIDGET COMP - SUBSCRIBE TO PRIMARY COLOR ', primary_color);
        if (primary_color) {
          this.notify.showNotificationChangeProject('The style of your TileDesk Widget has been updated!', 2, 'done');
          
          const alert = <HTMLElement>document.querySelector('.tiledeskalert');
          console.log('WIDGET COMP - ALERT ', alert);
          if (alert !== null) {
            setTimeout(() => {
            alert.setAttribute('style', 'display:none !important;');
          }, 200);
          }


          this.primaryColor = primary_color

          // this.themeColor IS THE PROPERTY USED IN THE TEXTAREA 'script'
          this.themeColor = `\n      themeColor: "${this.primaryColor}",`
        }
      });
  }

  subscribeToSelectedSecondaryColor() {
    this.widgetService.secondaryColorBs
      .subscribe((secondary_color: string) => {
        console.log('WIDGET COMP - SECONDARY COLOR ', secondary_color);
        if (secondary_color) {
          this.secondaryColor = secondary_color

          // this.themeForegroundColor IS THE PROPERTY USED IN THE TEXTAREA 'script'
          this.themeForegroundColor = `\n      themeForegroundColor: "${this.secondaryColor}",`
        }
      });
  }

  onKeyCalloutTitle() {
    if (this.calloutTitleText) {
      this.escaped_calloutTitle = this.calloutTitleText.replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
      console.log('+++ +++ ON KEY-UP CALLOUT TITLE TEXT  ', this.calloutTitleText);
      console.log('+++ +++ ON KEY-UP ESCAPED CALLOUT TITLE ', this.escaped_calloutTitle);

      /**
       * THE calloutTitleText IS PASSED TO THE WIDGET SERVICE THAT PUBLISH the property calloutTitleBs
       * THIS SAME COMP SUBSCRIBES TO THE WIDGET SERVICE (see subscribeToTypedCalloutTitle) TO AVOID THAT,
       * WHEN THE USER GO TO THE WIDEGT DESIGN PAGE (or in another page) AND THEN RETURN IN THE
       * WIDGET PAGE, THE VALUE OF THE CALLOUT TITLE BE EMPTY EVEN IF HE HAD PREVIOUSLY DIGITED IT */
      this.widgetService.publishCalloutTitleTyped(this.calloutTitleText)

      this.calloutTitle = `\n      calloutTitle: "${this.escaped_calloutTitle}",` // is used in the texarea 'script'
    } else {
      console.log('+++ +++ ON KEY-UP CALLOUT TITLE TEXT (else) ', this.calloutTitleText);
      this.widgetService.publishCalloutTitleTyped(this.calloutTitleText)
      this.escaped_calloutTitle = '';
      this.calloutTitle = '';
    }
  }

  onKeyCalloutMsg() {
    if (this.calloutMsgText) {
      this.escaped_calloutMsg = this.calloutMsgText.replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
      console.log('+++ +++ ON KEY-UP CALLOUT MSG ', this.escaped_calloutMsg);
      this.calloutMsg = `\n      calloutMsg: "${this.escaped_calloutMsg}",` // is used in the texarea 'script'

      // COMMENT AS FOR CALLOUT TITLE
      this.widgetService.publishCalloutMsgTyped(this.calloutMsgText);
    } else {
      this.escaped_calloutMsg = '';
      this.calloutMsg = '';

      // COMMENT AS FOR CALLOUT TITLE
      this.widgetService.publishCalloutMsgTyped(this.calloutMsgText);
    }
  }

  setSelectedCalloutTimer() {
    console.log('»»» SET SELECTED CALLOUT TIMER - TIMER SELECTED', this.calloutTimerSecondSelected)

    // COMMENT AS FOR CALLOUT TITLE
    this.widgetService.publishCalloutTimerSelected(this.calloutTimerSecondSelected)

    if (this.calloutTimerSecondSelected === -1) {

      this.escaped_calloutTitle = ''; // callout title escaped
      this.calloutTitleText = ''; // clear the value in the input if the user disabled the callout
      console.log('»»» SET SELECTED CALLOUT TIMER - CALLOUT TITLE ESCAPED', this.escaped_calloutTitle)
      this.escaped_calloutMsg = ''; // callout msg escaped
      this.calloutMsgText = '';  // clear the value in the input if the user disabled the callout
      console.log('»»» SET SELECTED CALLOUT TIMER - CALLOUT MSG ESCAPED ', this.escaped_calloutMsg)
      this.calloutTitle = '';
      this.calloutMsg = ''
    }
  }

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
  }

  togglePrechatformCheckBox(event) {
    if (event.target.checked) {
      this.preChatForm = true;
      this.preChatFormValue = 'true';

      // COMMENT AS FOR CALLOUT TITLE
      this.widgetService.publishPrechatformSelected(this.preChatForm)

      console.log('INCLUDE PRE CHAT FORM ', this.preChatForm)
    } else {
      this.preChatForm = false;
      this.preChatFormValue = 'false';

      // COMMENT AS FOR CALLOUT TITLE
      this.widgetService.publishPrechatformSelected(this.preChatForm)
      console.log('INCLUDE PRE CHAT FORM ', this.preChatForm)
    }
  }


  testWidgetPage() {
    this.elementRef.nativeElement.blur();
    // http://testwidget.tiledesk.com/testsite/?projectid=5ad069b123c415001469574f&prechatform=false
    // + '&projectname=' + this.projectName
    // tslint:disable-next-line:max-line-length

    let calloutTitle = this.escaped_calloutTitle
    let paramCallout_title = '&callout_title='

    console.log('CALL OUT TITLE PARAMETER ', paramCallout_title, 'CALL OUT TITLE VALUE  ', calloutTitle);
    if (!this.escaped_calloutTitle) {
      paramCallout_title = '';
      calloutTitle = '';
      console.log('CALL OUT TITLE PARAMETER ', paramCallout_title, 'CALL OUT TITLE VALUE  ', calloutTitle);
    }

    let calloutMsg = this.escaped_calloutMsg;
    let paramCallout_msg = '&callout_msg='

    console.log('CALL OUT MSG PARAMETER ', paramCallout_msg, 'CALL OUT MSG VALUE  ', calloutMsg);
    if (!this.escaped_calloutMsg) {
      paramCallout_msg = '';
      calloutMsg = ''
      console.log('CALL OUT MSG PARAMETER ', paramCallout_msg, 'CALL OUT MSG VALUE  ', calloutMsg);
    }

    let paramThemeColor = '&themecolor=' + this.primaryColor
    if (!this.primaryColor) {
      paramThemeColor = ''
    }

    let paramThemeforegroundcolor = '&themeforegroundcolor=' + this.secondaryColor
    if (!this.secondaryColor) {
      paramThemeforegroundcolor = ''
    }

    // '&themecolor=' + this.primaryColor
    // '&themeforegroundcolor=' + this.secondaryColor
    const url = 'http://testwidget.tiledesk.com/testsite?projectid='
      + this.projectId
      + '&prechatform=' + this.preChatForm
      + '&callout_timer=' + this.calloutTimerSecondSelected
      + paramThemeColor
      + paramThemeforegroundcolor
      + paramCallout_title + calloutTitle
      + paramCallout_msg + calloutMsg
      + '&align=' + this.alignmentSelected;
    window.open(url, '_blank');
  }

  goToWidgetDesign() {
    this.router.navigate(['project/' + this.project._id + '/widget/design']);

  }

}

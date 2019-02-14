import { Injectable, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { NotifyService } from '../core/notify.service';
import { ProjectService } from '../services/project.service';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class WidgetService implements OnInit {

  // public primaryColorBs: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  // public secondaryColorBs: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  // public calloutTimerBs: BehaviorSubject<number> = new BehaviorSubject<number>(null);
  // public calloutTitleBs: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  // public calloutMsgBs: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  // public includePrechatformBs: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  // public widgetAlignmentBs: BehaviorSubject<string> = new BehaviorSubject<string>(null);

  public id_project: string;
  public widgetSettingsObjct;
  updateWidgetSuccessNoticationMsg: string;

  constructor(
    private notify: NotifyService,
    private projectService: ProjectService,
    private translate: TranslateService
  ) { console.log('»» WIDGET SERVICE HELLO WIDGET SERVICE !') }

  ngOnInit() {  }

  // saveCustomUrl(logo_url: string) {
  //   console.log('WIDGET SERVICE - CUSTOM LOGO URL ', logo_url);
  //   this.widgetSettingsObjct = {logo_url};
  //   this.updateWidgetProject();
  // }

  updateWidgetProject(widgetSettingsObj: any) {
    this.projectService.updateWidgetProject(widgetSettingsObj)
      .subscribe((data) => {
        // console.log('»» WIDGET SERVICE - UPDATE PROJECT WIDGET - RESPONSE data', data);
        console.log('»» WIDGET SERVICE - UPDATE PROJECT WIDGET - RESPONSE data.widget', data.widget);

        this.translateAndShowUpdateWidgetNotification();

      }, (error) => {
        console.log('»» WIDGET SERVICE - UPDATE PROJECT WIDGET - ERROR ', error);
      }, () => {
        console.log('»» WIDGET SERVICE - UPDATE PROJECT WIDGET * COMPLETE *');
      });
  }

  // translateAndShowUpdateWidgetNotification() {
  //   this.translateUpdateWidgetProjectSuccessNoticationMsg();
  // }

  translateAndShowUpdateWidgetNotification() {
    this.translate.get('UpdateWidgetProjectSuccessNoticationMsg')
      .subscribe((text: string) => {

        this.updateWidgetSuccessNoticationMsg = text;
        // console.log('»» WIDGET SERVICE - Update Widget Project Success NoticationMsg', text)
      }, (error) => {

        console.log('»» WIDGET SERVICE -  Update Widget Project Success NoticationMsg - ERROR ', error);
      }, () => {

        this.notify.showWidgetStyleUpdateNotification(this.updateWidgetSuccessNoticationMsg, 2, 'done');
        // console.log('»» WIDGET SERVICE -  Update Widget Project Success NoticationMsg * COMPLETE *');
      });
  }

  /**
   * WHEN IN WIDGET-DESIGN IS CHANGED THE PRIMARY COLOR,
   * THE NEW COLOR VALUE IS PASSED IN THIS SERVICE THAT PUBLISH IT THROUGH primaryColorBs.
   * THE WIDGET-COMP IS SUBSCRIBED TO primaryColorBs THAT USE IT TO SET THE PARAMETER "ThemeColor" AND "Themeforegroundcolor"
   * IN THE 'WIDGET TEXTAREA' AND IN THE URL USED FOR TESTING THE CODE */
  // publishPrimaryColorSelected(primary_color: string) {
  //   console.log('WIDGET SERVICE - ON CHANGE IN WIDGET DESIGN > PRIMARY COLOR  ', primary_color);
  //   this.primaryColorBs.next(primary_color);

  //   setTimeout(() => {
  //     // this.notify.showWidgetStyleUpdateNotification('The style of your TileDesk Widget has been updated!', 2, 'done');
  //   }, 1000);
  // }

  // publishWidgetAligmentSelected(alignment: string) {
  //   console.log('WIDGET SERVICE - ON SELECT WIDGET ALIGNMENT ', alignment);
  //   this.widgetAlignmentBs.next(alignment);

  //   setTimeout(() => {
  //     this.notify.showWidgetStyleUpdateNotification('The style of your TileDesk Widget has been updated!', 2, 'done');
  //   }, 1000);
  // }

  // publishSecondaryColorSelected(secondary_color: string) {
  //   console.log('WIDGET SERVICE - ON CHANGE IN WIDGET DESIGN > SECONDARY COLOR ', secondary_color);
  //   setTimeout(() => {
  //     this.secondaryColorBs.next(secondary_color);
  //     this.notify.showWidgetStyleUpdateNotification('The style of your TileDesk Widget has been updated!', 2, 'done');
  //   }, 1000);
  // }

  // publishCalloutTimerSelected(timer_selected) {
  //   console.log('WIDGET SERVICE - ON SELECT IN WIDGET COMP > CALLOUT TIMER ', timer_selected);
  //   this.calloutTimerBs.next(timer_selected);
  // }

  // publishCalloutTitleTyped(callout_title) {
  //   console.log('WIDGET SERVICE - ON KEYUP IN WIDGET COMP > CALLOUT TITLE', callout_title);
  //   this.calloutTitleBs.next(callout_title)
  // }

  // publishCalloutMsgTyped(callout_msg) {
  //   console.log('WIDGET SERVICE - ON KEYUP IN WIDGET COMP > CALLOUT MSG', callout_msg);
  //   this.calloutMsgBs.next(callout_msg)
  // }

  // publishPrechatformSelected(prechatform_checked) {
  //   console.log('WIDGET SERVICE - ON SELECTED IN WIDGET COMP > INCLUDE PRECHAT FORM ', prechatform_checked);
  //   this.includePrechatformBs.next(prechatform_checked)
  // }


}

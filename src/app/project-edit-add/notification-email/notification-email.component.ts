import { AfterViewInit, Component, OnInit, SecurityContext } from '@angular/core';
import { Location } from '@angular/common';
import { ProjectService } from '../../services/project.service';
import { DomSanitizer } from '@angular/platform-browser'
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'app/core/auth.service';
import PerfectScrollbar from 'perfect-scrollbar';
import { LoggerService } from '../../services/logger/logger.service';
import { NotifyService } from '../../core/notify.service';

declare const $: any;
@Component({
  selector: 'appdashboard-notification-email',
  templateUrl: './notification-email.component.html',
  styleUrls: ['./notification-email.component.scss']
})
export class NotificationEmailComponent implements OnInit, AfterViewInit {

  emailTemplate: any;
  iframe: any;

  textToSearch: string;

  EMAIL_TEMPLATE_NAME = ["assignedRequest", "assignedEmailMessage", "pooledRequest", "pooledEmailMessage", "newMessage", "ticket", "sendTranscript", "emailDirect", "newMessageFollower"]
  iframePlaceholderText: string;
  active_template: string = "assignedRequest"
  iFrame_placeholder: string
  showSpinner: boolean;
  projectId: string;
  anErrorHasOccurredMsg: string;
  emailTemplateUpdatedSuccessfullyMsg: string;
  isChromeVerGreaterThan100: boolean;
  constructor(
    public location: Location,
    public projectService: ProjectService,
    private sanitizer: DomSanitizer,
    private translate: TranslateService,
    private auth: AuthService,
    private logger: LoggerService,
    private notify: NotifyService
  ) { }

  ngOnInit() {
    // this.setPerfectScrollbar();
    // this.showSpinner = true
    // this.getAssignedRequestTemplate();
    this.subscribeToCurrentProjectAndGetProjectById()

    this.logger.log('[NOTIFICATION-EMAIL] - GET EMAIL TEMPALTE - ACTIVE TEMPLATE ', this.active_template);
    this.auth.checkRoleForCurrentProjectPermissionOnlyToOwner()
    this.getTranslations();

    // if (window.matchMedia(`(min-width: 960px)`).matches) {
    //   const bottom_navbar = <HTMLElement>document.querySelector('.email-tmplt-bottom-nav');
    //   let ps = new PerfectScrollbar(bottom_navbar, {suppressScrollY: true});
    //   ps.update();
    // }
    this.getBrowserVersion()
  }

  getBrowserVersion() {
    this.auth.isChromeVerGreaterThan100.subscribe((isChromeVerGreaterThan100: boolean) => {
      this.isChromeVerGreaterThan100 = isChromeVerGreaterThan100;
      //  console.log("[BOT-CREATE] isChromeVerGreaterThan100 ",this.isChromeVerGreaterThan100);
    })
  }

  getTranslations() {
    this.translate.get('AnErrorHasOccurred')
      .subscribe((text: string) => {
        this.anErrorHasOccurredMsg = text;
      });

    this.translate.get('EmailTemplateUpdatedSuccessfully')
      .subscribe((text: string) => {
        this.emailTemplateUpdatedSuccessfullyMsg = text;
      });
  }



  // setPerfectScrollbar() {
  //   const bottom_navbar = <HTMLElement>document.querySelector('.email-tmplt-bottom-nav');
  //   console.log('[NOTIFICATION-EMAIL] bottom_navbar', bottom_navbar);
  //   let ps = new PerfectScrollbar(bottom_navbar, {suppressScrollY: true});
  //   ps.update();
  // }


  subscribeToCurrentProjectAndGetProjectById() {
    this.auth.project_bs.subscribe((project) => {
      if (project) {
        this.projectId = project._id
        this.logger.log('[NOTIFICATION-EMAIL] - projectId ', this.projectId)
        this.getProjectById(this.projectId)
      }
    });
  }

  getProjectById(project_id: string) {
    this.projectService.getProjectById(project_id).subscribe((project: any) => {
      this.logger.log('[NOTIFICATION-EMAIL] - GET PROJECT BY ID - project ', project);
      // console.log('[NOTIFICATION-EMAIL] - GET PROJECT BY ID - project.settings.email.templates ', project.settings.email.templates);
      if (project && project.settings && project.settings.email && project.settings.email.templates) {
        this.logger.log('[NOTIFICATION-EMAIL] - GET PROJECT BY ID - project.settings.email.templates ', project.settings.email.templates);


        // project.settings.email.templates.forEach(templatename => {
        //   console.log('[NOTIFICATION-EMAIL] - GET PROJECT BY ID - project.settings.email.templates SAVED TEMPLATE', templatename);
        // });

        if (project.settings.email.templates.hasOwnProperty(this.active_template)) {
          this.logger.log('[NOTIFICATION-EMAIL] - GET PROJECT BY ID - project.settings.email.templates hasOwnProperty ', this.active_template);
          this.emailTemplate = project.settings.email.templates[this.active_template];
          if (<HTMLIFrameElement>document.getElementById("iframe-email-template-preview")) {
            (<HTMLIFrameElement>document.getElementById("iframe-email-template-preview")).srcdoc = this.emailTemplate
          }
        } else {
          this.logger.log('[NOTIFICATION-EMAIL] - GET PROJECT BY ID - project.settings.email.templates NOT hasOwnProperty ', this.active_template, 'RUN GET DEFAULT TEMPLATE');
          this.getAssignedRequestTemplate();
        }
      } else {
        this.logger.log('[NOTIFICATION-EMAIL] - GET PROJECT BY ID - NOT EXIST project.settings.email.templates ');
        this.getAssignedRequestTemplate();
      }

    }, error => {
      this.logger.error('[NOTIFICATION-EMAIL] - GET PROJECT BY ID - ERROR ', error);

    }, () => {
      this.logger.log('[NOTIFICATION-EMAIL] - getProjectByID * complete ');
    });
  }

  getAssignedRequestTemplate() {
    this.projectService.getEmailTemplate(this.active_template).subscribe((res: any) => {
      this.logger.log('[NOTIFICATION-EMAIL] - GET EMAIL TEMPALTE res ', res)
      if (res && res.template) {
        this.emailTemplate = res.template;
        if (<HTMLIFrameElement>document.getElementById("iframe-email-template-preview")) {
          (<HTMLIFrameElement>document.getElementById("iframe-email-template-preview")).srcdoc = this.emailTemplate
        }
      }
    }, (error) => {
      this.logger.error('[NOTIFICATION-EMAIL] - GET EMAIL TEMPALTE error ', error);
    }, () => {
      this.logger.log('[NOTIFICATION-EMAIL] - GET EMAIL TEMPALTE  * COMPLETE *');

    });
  }



  ngAfterViewInit() {
    this.disableIframeLinks();
    this.getTranslationsAndSetIframePlaceholder();
  }

  getTranslationsAndSetIframePlaceholder() {
    this.translate.get('ProjectEditPage.SeeThePreviewOfTheEmail')
      .subscribe((text: string) => {
        this.logger.log('[NOTIFICATION-EMAIL] - GET TRANSLATION - text ', text);
        this.iframePlaceholderText = text;
      });
  }

  disableIframeLinks() {
    $("iframe").on('load', function () {
      $("iframe").contents().find("a").each(function (index) {
        $(this).on("click", function (event) {
          event.preventDefault();
          event.stopPropagation();
        });
      });
    });
  }


  goBack() {
    this.location.back();
  }

  selectedTemplate(tmplt) {
    this.logger.log('[NOTIFICATION-EMAIL] - GET EMAIL TEMPALTE - SELECTED TEMPALTE ', tmplt)
    this.active_template = tmplt
    this.logger.log('[NOTIFICATION-EMAIL] - GET EMAIL TEMPALTE - SELECTED TEMPALTE - ACTIVE TEMPLATE ', this.active_template)
    this.getProjectById(this.projectId);
    // (<HTMLIFrameElement>document.getElementById("iframe-email-template-preview")).srcdoc = this.iFrame_placeholder;
  }


  // NOT USED
  seePreview() {
    if (<HTMLIFrameElement>document.getElementById("iframe-email-template-preview")) {
      (<HTMLIFrameElement>document.getElementById("iframe-email-template-preview")).srcdoc = this.emailTemplate;
    }
    const see_preview_btn = <HTMLElement>document.querySelector('.see_preview_btn');
    see_preview_btn.blur();

  }

  onChangeEmailTempalte(event) {
    this.logger.log('[NOTIFICATION-EMAIL] - SAVE EMAIL TEMPLATE onChangeEmailTempalte ', this.emailTemplate);
    (<HTMLIFrameElement>document.getElementById("iframe-email-template-preview")).srcdoc = this.emailTemplate
  }

  saveEmailNotificationTemplate() {
    const save_email_template_btn = <HTMLElement>document.querySelector('.save_email_template');
    save_email_template_btn.blur();

    this.logger.log('[NOTIFICATION-EMAIL] - SAVE EMAIL TEMPLATE emailTemplate ', this.emailTemplate)
    this.projectService.updateEmailTempalte(this.active_template, this.emailTemplate)

      .subscribe((res: any) => {

        this.logger.log('[NOTIFICATION-EMAIL] - SAVE EMAIL TEMPLATE res ', res)
      }, (error) => {
        this.logger.error('[NOTIFICATION-EMAIL] - SAVE EMAIL TEMPLATE error ', error);
        this.notify.showWidgetStyleUpdateNotification(this.anErrorHasOccurredMsg, 4, 'report_problem');
      }, () => {
        this.logger.log('[NOTIFICATION-EMAIL] - SAVE EMAIL TEMPLATE * COMPLETE *');
        this.notify.showWidgetStyleUpdateNotification(this.emailTemplateUpdatedSuccessfullyMsg, 2, 'done');
      });
  }



}

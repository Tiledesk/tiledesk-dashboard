import { AfterViewInit, Component, OnInit, SecurityContext } from '@angular/core';
import { Location } from '@angular/common';
import { ProjectService } from '../../services/project.service';
import { DomSanitizer } from '@angular/platform-browser'
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'app/core/auth.service';
import PerfectScrollbar from 'perfect-scrollbar';

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

  EMAIL_TEMPLATE_NAME = ["assignedRequest", "assignedEmailMessage", "pooledRequest", "pooledEmailMessage", "newMessage", "ticket", "sendTranscript"]
  iframePlaceholderText: string;
  active_template: string = "assignedRequest"
  iFrame_placeholder: string
  showSpinner: boolean;
  projectId: string;

  constructor(
    public location: Location,
    public projectService: ProjectService,
    private sanitizer: DomSanitizer,
    private translate: TranslateService,
    private auth: AuthService,
  ) { }

  ngOnInit() {
    // this.setPerfectScrollbar();
    // this.showSpinner = true
    // this.getAssignedRequestTemplate();
    this.subscribeToCurrentProjectAndGetProjectById()

    console.log('[NOTIFICATION-EMAIL] - GET EMAIL TEMPALTE - ACTIVE TEMPLATE ', this.active_template);
    this.auth.checkRoleForCurrentProjectPermissionOnlyToOwner

    // if (window.matchMedia(`(min-width: 960px)`).matches) {
    //   const bottom_navbar = <HTMLElement>document.querySelector('.email-tmplt-bottom-nav');
    //   let ps = new PerfectScrollbar(bottom_navbar, {suppressScrollY: true});
    //   ps.update();
    // }
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
        console.log('[NOTIFICATION-EMAIL] - projectId ', this.projectId)
        this.getProjectById(this.projectId)
      }
    });
  }

  getProjectById(project_id: string) {
    this.projectService.getProjectById(project_id).subscribe((project: any) => {
      console.log('[NOTIFICATION-EMAIL] - GET PROJECT BY ID - project ', project);

      if (project && project.settings && project.settings.email && project.settings.email.templates && project.settings.email.templates) {
        console.log('[NOTIFICATION-EMAIL] - GET PROJECT BY ID - project.settings.email.templates ', project.settings.email.templates);


        // project.settings.email.templates.forEach(templatename => {
        //   console.log('[NOTIFICATION-EMAIL] - GET PROJECT BY ID - project.settings.email.templates SAVED TEMPLATE', templatename);
        // });

        if (project.settings.email.templates.hasOwnProperty(this.active_template)) {
          console.log('[NOTIFICATION-EMAIL] - GET PROJECT BY ID - project.settings.email.templates hasOwnProperty ', this.active_template);
          this.emailTemplate = project.settings.email.templates[this.active_template];
          (<HTMLIFrameElement>document.getElementById("iframe-email-template-preview")).srcdoc = this.emailTemplate
        } else {
          console.log('[NOTIFICATION-EMAIL] - GET PROJECT BY ID - project.settings.email.templates NOT hasOwnProperty ', this.active_template, 'RUN GET DEFAULT TEMPLATE');
          this.getAssignedRequestTemplate();
        }

      }

    }, error => {
      console.error('[NOTIFICATION-EMAIL] - GET PROJECT BY ID - ERROR ', error);

    }, () => {
      console.log('[NOTIFICATION-EMAIL] - getProjectByID * complete ');
    });
  }

  getAssignedRequestTemplate() {
    this.projectService.getEmailTemplate(this.active_template).subscribe((res: any) => {
      console.log('[NOTIFICATION-EMAIL] - GET EMAIL TEMPALTE res ', res)
      if (res && res.template) {
        this.emailTemplate = res.template;
        (<HTMLIFrameElement>document.getElementById("iframe-email-template-preview")).srcdoc = this.emailTemplate
      }
    }, (error) => {
      console.log('[NOTIFICATION-EMAIL] - GET EMAIL TEMPALTE error ', error);
    }, () => {
      console.log('[NOTIFICATION-EMAIL] - GET EMAIL TEMPALTE  * COMPLETE *');

    });
  }



  ngAfterViewInit() {
    this.disableIframeLinks();
    this.getTranslationsAndSetIframePlaceholder();
  }

  getTranslationsAndSetIframePlaceholder() {
    this.translate.get('ProjectEditPage.SeeThePreviewOfTheEmail')
      .subscribe((text: string) => {
        console.log('[NOTIFICATION-EMAIL] - GET TRANSLATION - text ', text);
        this.iframePlaceholderText = text;

        // setTimeout(() => {
        // this.showSpinner = false;
        // this.iFrame_placeholder = '<p id="iframe-placeholder" style="text-align:center; line-height: 484px;">' + this.iframePlaceholderText + '</p>';
        // (<HTMLIFrameElement>document.getElementById("iframe-email-template-preview")).srcdoc = this.iFrame_placeholder;
        // }, 2000);

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
    console.log('[NOTIFICATION-EMAIL] - GET EMAIL TEMPALTE - SELECTED TEMPALTE ', tmplt)
    this.active_template = tmplt
    console.log('[NOTIFICATION-EMAIL] - GET EMAIL TEMPALTE - SELECTED TEMPALTE - ACTIVE TEMPLATE ', this.active_template)
    this.getProjectById(this.projectId);
    // (<HTMLIFrameElement>document.getElementById("iframe-email-template-preview")).srcdoc = this.iFrame_placeholder;
  }





  seePreview() {
    (<HTMLIFrameElement>document.getElementById("iframe-email-template-preview")).srcdoc = this.emailTemplate;
    const see_preview_btn = <HTMLElement>document.querySelector('.see_preview_btn');
    see_preview_btn.blur();

  }

  ftxt() {
    console.log('[NOTIFICATION-EMAIL] FIND TEXT ON TEXAREA textToSearch', this.textToSearch)
    if (this.emailTemplate.includes(this.textToSearch)) {
      console.log('[NOTIFICATION-EMAIL] FIND TEXT ON TEXAREA TEXT FOUND')
      const regex = new RegExp(this.textToSearch, 'gi');
      // let text = this.emailTemplate.innerHTML;
      let text = this.emailTemplate;
      console.log('[NOTIFICATION-EMAIL] FIND text ', text)
      text = text.replace(/(<mark class="highlight">|<\/mark>)/gim, '');
      const newText = text.replace(regex, '<mark class="highlight">$&</mark>');
      // this.emailTemplate.innerHTML = newText;
      this.emailTemplate = newText;
    } else {
      console.log('[NOTIFICATION-EMAIL] FIND TEXT ON TEXAREA TEXT NOT FOUND')
    }
  }




  onChangeEmailTempalte(event) {
    console.log('[NOTIFICATION-EMAIL] - SAVE EMAIL TEMPLATE onChangeEmailTempalte ', this.emailTemplate);
    (<HTMLIFrameElement>document.getElementById("iframe-email-template-preview")).srcdoc = this.emailTemplate
  }

  saveEmailNotificationTemplate() {
    const save_email_template_btn = <HTMLElement>document.querySelector('.save_email_template');
    save_email_template_btn.blur();

    console.log('[NOTIFICATION-EMAIL] - SAVE EMAIL TEMPLATE emailTemplate ', this.emailTemplate)
    this.projectService.updateEmailTempalte(this.active_template, this.emailTemplate)

      .subscribe((res: any) => {

        console.log('[NOTIFICATION-EMAIL] - SAVE EMAIL TEMPLATE res ', res)
      }, (error) => {
        console.log('[NOTIFICATION-EMAIL] - SAVE EMAIL TEMPLATE error ', error);
      }, () => {
        console.log('[NOTIFICATION-EMAIL] - SAVE EMAIL TEMPLATE * COMPLETE *');

      });
  }



}

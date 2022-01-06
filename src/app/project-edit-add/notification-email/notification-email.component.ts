import { AfterViewInit, Component, OnInit, SecurityContext } from '@angular/core';
import { Location } from '@angular/common';
import { ProjectService } from '../../services/project.service';
import { DomSanitizer } from '@angular/platform-browser'
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'app/core/auth.service';

declare const $: any;
@Component({
  selector: 'appdashboard-notification-email',
  templateUrl: './notification-email.component.html',
  styleUrls: ['./notification-email.component.scss']
})
export class NotificationEmailComponent implements OnInit, AfterViewInit {

  emailTemplate: any;
  iframe: any;
  iframeContent: any;
  textToSearch: string;
  EMAIL_TEMPLATE_NAME = ["assignedRequest.html", "assignedEmailMessage.html", "pooledRequest.html"]
  iframePlaceholderText: string;
  active_template: string = "assignedRequest.html"
  iFrame_placeholder: string 
  constructor(
    public location: Location,
    public projectService: ProjectService,
    private sanitizer: DomSanitizer,
    private translate: TranslateService,
    private auth: AuthService,
  ) { }

  ngOnInit() {
    this.getAssignedRequestTemplate();
    console.log('[NOTIFICATION-EMAIL] - GET EMAIL TEMPALTE - ACTIVE TEMPLATE ', this.active_template);
    this.auth.checkRoleForCurrentProjectPermissionOnlyToOwner
  }

 

  ngAfterViewInit(){
    this.disableIframeLinks();
    this.getTranslations();
  }

  getTranslations() {
    this.translate.get('ProjectEditPage.SeeThePreviewOfTheEmail')
      .subscribe((text: string) => {
        console.log('[NOTIFICATION-EMAIL] - GET TRANSLATION - text ', text);
        this.iframePlaceholderText = text;
        this.iFrame_placeholder = '<p id="iframe-placeholder" style="text-align:center; line-height: 484px;">'+ this.iframePlaceholderText + '</p>';
        (<HTMLIFrameElement>document.getElementById("iframe-email-template-preview")).srcdoc = this.iFrame_placeholder;
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
    console.log('[NOTIFICATION-EMAIL] - GET EMAIL TEMPALTE - ACTIVE TEMPLATE ', this.active_template)
    this.getAssignedRequestTemplate();
    (<HTMLIFrameElement>document.getElementById("iframe-email-template-preview")).srcdoc = this.iFrame_placeholder;
  }

  getAssignedRequestTemplate() {
    this.projectService.getEmailTemplate(this.active_template).subscribe((res: any) => {
      console.log('[NOTIFICATION-EMAIL] - GET EMAIL TEMPALTE res ', res)
      if (res) {
        this.emailTemplate = res.template
        this.iframeContent = res.template
      }
    }, (error) => {
      console.log('[NOTIFICATION-EMAIL] - GET EMAIL TEMPALTE error ', error);
    }, () => {
      console.log('[NOTIFICATION-EMAIL] - GET EMAIL TEMPALTE  * COMPLETE *');

    });
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


  refresh() {
    // var inputValue =  (<HTMLInputElement>document.getElementById('text-input')).value;
    var inputValue = this.emailTemplate
    console.log('REFRESH inputValue', inputValue)
    var parsedHtml = $.parseHTML(inputValue, document, true);
    console.log('REFRESH parsedHtml', parsedHtml)
    $('#output-display').html($(parsedHtml));
  }

  onChangeEmailTempalte(event) {
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

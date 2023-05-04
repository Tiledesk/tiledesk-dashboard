import { Component, Input, OnChanges, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'app/core/auth.service';
import { NotifyService } from 'app/core/notify.service';
import { AppConfigService } from 'app/services/app-config.service';
import { ContactsService } from 'app/services/contacts.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
@Component({
  selector: 'appdashboard-contact-info',
  templateUrl: './contact-info.component.html',
  styleUrls: ['./contact-info.component.scss']
})
export class ContactInfoComponent implements OnInit, OnChanges, OnDestroy {
  @Input() contact_details: any;
  public CHAT_PANEL_MODE: boolean;
  public project_name: string;
  private unsubscribe$: Subject<any> = new Subject<any>();
  public id_project: string;
  public contactNewEmail: string;
  public EMAIL_IS_VALID: boolean = true
  public contactCompany: string;
  public contactPhone: string;
  contactTags: Array<any>
  contactTempTags: Array<any> = []
  tag: any;
  tagContainerElementHeight: any;
  isVisibleLBS: boolean;
  public_Key: string;
  requester_id: string;
  constructor(
    public router: Router,
    public auth: AuthService,
    public contactsService: ContactsService,
    public notify: NotifyService,
    private appConfigService: AppConfigService,
  ) { }


  // -------------------------------------------------------------
  // @ Lifehook
  // -------------------------------------------------------------
  ngOnInit(): void {
    this.getIfRouteUrlIsRequestForPanel();
    this.getCurrentProject();
    this.getOSCODE();
  }

  ngOnChanges() {
    console.log('[CONTACT-INFO] contact_details', this.contact_details)
    if (this.contact_details) {

      if (this.contact_details._id) {
        this.requester_id = this.contact_details._id
        console.log('requester_id ', this.requester_id)
      }


      if (this.contact_details.email) {
        this.contactNewEmail = this.contact_details.email
        console.log('contactNewEmail ', this.contactNewEmail)
      }

      if (this.contact_details.company) {
        this.contactCompany = this.contact_details.company
        console.log('contactCompany ', this.contactCompany)
      }

      if (this.contact_details.phone) {
        this.contactPhone = this.contact_details.phone
        console.log('contactPhone ', this.contactPhone)
      }

      if (this.contact_details.tags) {
        this.contactTags = this.contact_details.tags
        console.log('contactTags ', this.contactTags)
        // this.getTagContainerElementHeight()
      }
    }
  }

  getOSCODE() {
    this.public_Key = this.appConfigService.getConfig().t2y12PruGU9wUtEGzBJfolMIgK;
    console.log('[CONTACTS-DTLS]  getAppConfig public_Key', this.public_Key)

    let keys = this.public_Key.split("-");
    console.log('[CONTACTS-DTLS] - public_Key keys', keys)

    keys.forEach(key => {
   
      if (key.includes("LBS")) {
        let lbs = key.split(":");
        if (lbs[1] === "F") {
          this.isVisibleLBS = false;
        } else {
          this.isVisibleLBS = true;
        }
      }
    });
    if (!this.public_Key.includes("LBS")) {
      this.isVisibleLBS = false;
    }
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }


  getIfRouteUrlIsRequestForPanel() {
    this.CHAT_PANEL_MODE = false
    if (this.router.url.indexOf('/request-for-panel') !== -1) {
      this.CHAT_PANEL_MODE = true;
      console.log('[CONTACT-INFO] - CHAT_PANEL_MODE »»» ', this.CHAT_PANEL_MODE);


    } else {
      this.CHAT_PANEL_MODE = false;
      console.log('[CONTACT-INFO] - CHAT_PANEL_MODE »»» ', this.CHAT_PANEL_MODE);
    }
  }

  // -------------------------------------------------------------
  // @ Subscribe to current project
  // -------------------------------------------------------------
  getCurrentProject() {
    this.auth.project_bs
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((project) => {
        if (project) {
          console.log('[CONTACT-INFO] GET CURRENT PROJECT project._id (NEW)', project._id)
          console.log('[CONTACT-INFO] GET CURRENT PROJECT this.project_id (OLD)', this.id_project)
          this.id_project = project._id;
          this.project_name = project.name;
        }
      });
  }

 // -----------------------------------------------------
  // @ Lead Email
  // -----------------------------------------------------
  emailChange(event) {
    this.EMAIL_IS_VALID = this.validateEmail(event)
    console.log('[CONTACT-INFO] ON EMAIL CHANGE EMAIL_IS_VALID ', this.EMAIL_IS_VALID)
  }

  validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  editContactEmail() {
    console.log('[CONTACT-INFO] editContactEmail contactNewEmail', this.contactNewEmail)
    if (this.EMAIL_IS_VALID && this.contactNewEmail !== undefined) {
      this.updateContactemail(this.contact_details._id, this.contactNewEmail);
    }
  }

  removeEmailAnUpdateContact() {
    this.contactNewEmail = ''
    console.log('[CONTACT-INFO] removeEmailAnUpdateContact contactNewEmail', this.contactNewEmail)
    this.updateContactemail(this.contact_details._id, this.contactNewEmail);
  }



  updateContactemail(contatid: string, contatemail: string) {
    this.contactsService.updateLeadEmail(contatid, contatemail)
      .subscribe((contact) => {
        console.log('[CONTACT-INFO] - UPDATED CONTACT ', contact);
      }, (error) => {
        console.error('[CONTACT-INFO] - UPDATE CONTACT - ERROR ', error);
        // =========== NOTIFY ERROR ===========
        // this.notify.showNotification('An error occurred while updating contact', 4, 'report_problem');
      }, () => {
        console.log('[CONTACT-INFO] - UPDATE CONTACT * COMPLETE *');
        // =========== NOTIFY SUCCESS===========
        this.notify.showWidgetStyleUpdateNotification('Contact successfully updated', 2, 'done')
      });
  }

  // -----------------------------------------------------
  // @ Lead Company
  // -----------------------------------------------------
  editContactCompany() {
    if (this.contactCompany !== undefined) {
      this.updateContactCompany(this.contact_details._id, this.contactCompany)
    }
  }

  removeCompanyAnUpdateContact() {
    this.contactCompany = '';
    this.updateContactCompany(this.contact_details._id, this.contactCompany)
  }

  updateContactCompany(contactid, contactcompany) {
    this.contactsService.updateLeadCompany(
      contactid,
      contactcompany
    ).subscribe((contact) => {
      console.log('[CONTACT-EDIT] - UPDATED CONTACT updateCompany', contact);

    }, (error) => {

      console.error('[CONTACT-EDIT] - UPDATE CONTACT updateCompany - ERROR ', error);
      // =========== NOTIFY ERROR ===========
      // this.notify.showNotification('An error occurred while updating contact', 4, 'report_problem');
      // this.notify.showWidgetStyleUpdateNotification(this.editContactErrorNoticationMsg, 4, 'report_problem')

    }, () => {
      console.error('[CONTACT-EDIT] - UPDATE CONTACT updateCompany - COMPLETED ');
      this.notify.showWidgetStyleUpdateNotification('Contact successfully updated', 2, 'done')
    })

  }

  // -----------------------------------------------------
  // @ Lead Phone
  // -----------------------------------------------------

  editContactPhone() {
    if (this.contactPhone !== undefined) {
      this.updateContactPhone(this.contact_details._id, this.contactPhone)
    }
  }

  removePhoneAnUpdateContact() {
    this.contactPhone = ""
    this.updateContactPhone(this.contact_details._id, this.contactPhone)
  }

  updateContactPhone(contactid, contactphone) {
    this.contactsService.updateLeadPhone(
      contactid,
      contactphone
    ).subscribe((contact) => {
      console.log('[CONTACT-EDIT] - UPDATED CONTACT updateContactPhone', contact);

    }, (error) => {

      console.error('[CONTACT-EDIT] - UPDATE CONTACT updateContactPhone - ERROR ', error);
      // =========== NOTIFY ERROR ===========
      // this.notify.showNotification('An error occurred while updating contact', 4, 'report_problem');
      // this.notify.showWidgetStyleUpdateNotification(this.editContactErrorNoticationMsg, 4, 'report_problem')

    }, () => {
      console.error('[CONTACT-EDIT] - UPDATE CONTACT updateContactPhone - COMPLETED ');
      this.notify.showWidgetStyleUpdateNotification('Contact successfully updated', 2, 'done')
    })

  }

 
  // -----------------------------------------------------
  // @ Lead Tags
  // -----------------------------------------------------
    // When the user select a tag from the combo-box 
    addTag(tag) {
      console.log('[CONTACTS-DTLS] - ADD TAG > tag: ', tag);
      this.contactTags.push(tag.tag)
      var index = this.contactTempTags.indexOf(tag);
      if (index !== -1) {
        this.contactTempTags.splice(index, 1);
      }
      this.contactTempTags = this.contactTempTags.slice(0)
      console.log('[CONTACTS-DTLS] - ADD TAG > contactTags: ', this.contactTags);
      console.log('[CONTACTS-DTLS] - ADD TAG > contactTempTags: ', this.contactTempTags);
  
      setTimeout(() => {
        this.tag = null;
      })
      this.updateContactTag(this.requester_id, this.contactTags)
    }

    createNewTag = (newTag: string) => {
      let self = this;
      // self.logger.log("Create New TAG Clicked : " + newTag)
      console.log("Create New TAG Clicked : " + newTag)
      let newTagTrimmed = newTag.trim()
      self.contactTags.push(newTagTrimmed)
      // self.logger.log("Create New TAG Clicked - leads tag: ", self.contactTags)
      console.log("Create New TAG Clicked - leads tag: ", self.contactTags)
      self.updateContactTag(self.requester_id, self.contactTags)
    }

    removeTag(tag: string) {
     
      console.log('[CONTACTS-DTLS] removeTag tag', tag)
      var index = this.contactTags.indexOf(tag);
      if (index !== -1) {
        this.contactTags.splice(index, 1);
        this.contactTempTags.push({ tag: tag })
        this.contactTempTags = this.contactTempTags.slice(0)
        console.log('[CONTACTS-DTLS] removeTag contactTempTags', this.contactTempTags)
        console.log('[CONTACTS-DTLS] removeTag contactTags', this.contactTags)
  
        this.updateContactTag(this.requester_id, this.contactTags)
      }
  
    }

    updateContactTag(requester_id: string, tags: any) {
      this.contactsService.updateLeadTag(requester_id, tags)
        .subscribe((lead: any) => {
          console.log('[CONTACTS-DTLS] - ADD CONTACT TAGS  lead ', lead);
          if (lead) {
            this.contactTags = lead.tags
            // this.getTagContainerElementHeight()
          }
  
        })
    }

  _addInput() {
    let ulElm = <HTMLElement>document.querySelector('.contact-info-list');
    let li = document.createElement("li");
    let children = ulElm.children.length + 1
    console.log('ulElm', ulElm)
    console.log('children', children)
    li.setAttribute("id", "element" + children)
    let div = document.createElement('div');
    div.className = "contact-row"
    li.appendChild(div);
    let span = document.createElement('span');
    div.appendChild(span);

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" height="22px" viewBox="0 0 24 24" fill="none" style="min-width: 22px; min-height: 22px;"><path  d="M0 0h24v24H0V0z" fill="none"></path><path d="M9.17 6l2 2H20v10H4V6h5.17M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"></path></svg>`
    const parseSvgString = svgString =>
      new DOMParser().parseFromString(svgString, 'image/svg+xml')
        .querySelector('svg')
    span.appendChild(parseSvgString(svg));
    // li.appendChild(document.createTextNode("Element "+children));
    let div2 = document.createElement('div');
    li.appendChild(div2);
    ulElm.appendChild(li)
  }

//   addInput() {

//     let customPropertyTemplateAsString =
//       `<div class="contact-row">
//    <span>
//      <svg xmlns="http://www.w3.org/2000/svg" height="22px" viewBox="0 0 24 24" style="min-width: 22px; min-height: 22px;" fill="none"
//        matTooltipClass="custom-mat-tooltip" matTooltip="{{ 'Company' | translate }}" #tooltip="matTooltip"
//        matTooltipPosition='right' matTooltipHideDelay="100">
//        <path d="M0 0h24v24H0V0z" fill="none" />
//        <path
//          d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z" />
//      </svg>
//    </span>

//    <div class="form-group" style="margin-top: 2px;"
//      [ngStyle]="{'width':CHAT_PANEL_MODE === true ? 'unset' : '100%' }">
//      <input type="text" name="company" data-id="company" class="form-control input-md" [(ngModel)]="contactCompany"
//        placeholder="Company..." maxlength="255" (keydown.enter)='editContactCompany()' autocomplete="off"
//        style="padding-bottom: 2px;" [ngStyle]="{'width':CHAT_PANEL_MODE === true ? '200px' : '100%' }">
//    </div>
//    <div class="action-btns">
//      <button type="button" data-id="company" (click)="removeCompanyAnUpdateContact()">
//        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
//          style="min-width: 20px; min-height: 20px;">
//          <path
//            d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z">
//          </path>
//          <path d="M0 0h24v24H0z" fill="none"></path>
//        </svg>
//      </button>
//    </div>
//  </div>`

//     let ulElm = <HTMLElement>document.querySelector('.contact-info-list');
//     let li = document.createElement("li");
//     let children = ulElm.children.length + 1
//     console.log('ulElm', ulElm)
//     console.log('children', children)
//     li.setAttribute("id", "element" + children)

//     li.innerHTML = customPropertyTemplateAsString;
//     document.appendChild(li);
//   }



}

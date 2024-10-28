import { Component, Input, OnChanges, OnDestroy, OnInit, HostListener, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'app/core/auth.service';
import { NotifyService } from 'app/core/notify.service';
import { AppConfigService } from 'app/services/app-config.service';
import { ContactsService } from 'app/services/contacts.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { ContactCustomPropertiesComponent } from 'app/components/modals/contact-custom-properties/contact-custom-properties.component';
import { FormControl, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { browserRefresh } from 'app/app.component';
import { LoggerService } from '../../../services/logger/logger.service';
import { TagsService } from 'app/services/tags.service';
import { UsersService } from 'app/services/users.service';
@Component({
  selector: 'appdashboard-contact-info',
  templateUrl: './contact-info.component.html',
  styleUrls: ['./contact-info.component.scss']
})
export class ContactInfoComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {
  @Input() contact_details: any;
  @Output() onClickTagConversation = new EventEmitter();
  @Output() contactEmailChanged = new EventEmitter();
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
  tagsList: Array<any>;

  tag: any;
  tagContainerElementHeight: any;
  isVisibleLBS: boolean;
  public_Key: string;
  requester_id: string;
  contactsCustomProperties: Array<any> = []
  contactProperty: any;
  contactPropertiesToSelect: Array<any> = [];
  contactCustomProperties: Array<any> = [];
  contactCustomPropertiesAssigned: Array<any> = [];
  contactAttributesCCP: any;
  // lead Address
  showAllAddress: boolean = false
  public contactAddress: any;
  public contactStreet: string;
  public contactCity: string;
  public contactProvince: string;
  public contactZipCode: string;
  public contactCountry: string;
  public contactNote: string;
  public lead_id: string;
  public whatsAppPhoneNumber: string;
  editContactSuccessNoticationMsg: string;
  editContactErrorNoticationMsg: string;
  leadPropertiesObjct: any = {}
  showNote: boolean = false
  public browserRefresh: boolean;

  public form: FormGroup;
  CURRENT_USER_ROLE: string;
  hasEditedEmail: boolean = false;
  onFocusEmail: string 

  constructor(
    public router: Router,
    public auth: AuthService,
    public contactsService: ContactsService,
    public notify: NotifyService,
    private appConfigService: AppConfigService,
    public dialog: MatDialog,
    private translate: TranslateService,
    public logger: LoggerService,
    private tagsService: TagsService,
    public usersService: UsersService
  ) { }


  // -------------------------------------------------------------
  // @ Lifehook
  // -------------------------------------------------------------
  ngOnInit(): void {
    this.translateEditContactSuccessMsg();
    this.translateEditContactErrorMsg();
    this.getIfRouteUrlIsRequestForPanel();
    this.getCurrentProject();
    this.getOSCODE();
    this.detectBrowserRefresh();
    this.getTag();
    this.getProjectUserRole();
    // this.getAllContactProperties()
  }

  // -------------------------------------------------------------
  // @ Subscribe to project user role
  // -------------------------------------------------------------
  getProjectUserRole() {
    this.usersService.project_user_role_bs
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((userRole) => {
        this.logger.log('[WS-REQUESTS-MSGS] - GET CURRENT PTOJECT-USER ROLE - userRole ', userRole)
        // used to display / hide 'WIDGET' and 'ANALITCS' in home.component.html
        this.CURRENT_USER_ROLE = userRole;
      })
  }

  detectBrowserRefresh() {
    this.browserRefresh = browserRefresh;
    this.logger.log("[CONTACT-INFO]- ngOnInit DETECT browserRefresh ", this.browserRefresh);
    setTimeout(() => {
      this.getTagContainerElementHeight()
    }, 1500);
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.getTagContainerElementHeight()
    }, 1000);
  }

  ngOnChanges() {
    this.logger.log('[CONTACT-INFO] contact_details', this.contact_details)
    if (this.contact_details) {

      if (this.contact_details._id) {
        this.requester_id = this.contact_details._id
        this.logger.log('[CONTACT-INFO] requester_id ', this.requester_id)
      }

      if (this.contact_details.lead_id) {
        this.lead_id = this.contact_details.lead_id
        this.logger.log('[CONTACT-INFO] lead_id ', this.lead_id)
        if (this.lead_id.startsWith('wab-')) {
          this.whatsAppPhoneNumber = this.lead_id.slice(4);
          this.logger.log('[CONTACT-INFO] whatsAppPhoneNumber ', this.whatsAppPhoneNumber)
        }
      }



      if (this.contact_details.email) {
        this.contactNewEmail = this.contact_details.email
        this.logger.log('[CONTACT-INFO] contactNewEmail ', this.contactNewEmail);
        this.contactEmailChanged.emit(this.contactNewEmail)
      }

      if (this.contact_details.company) {
        this.contactCompany = this.contact_details.company
        this.logger.log('[CONTACT-INFO] contactCompany ', this.contactCompany)
      }

      if (this.contact_details.phone) {
        this.contactPhone = this.contact_details.phone
        this.logger.log('[CONTACT-INFO] contactPhone ', this.contactPhone)
      } else {
        this.logger.log('[CONTACT-INFO] else contactPhone ', this.contactPhone)
        if (this.whatsAppPhoneNumber) {
          this.contactPhone = this.whatsAppPhoneNumber;
        }
      }

      if (this.contact_details.streetAddress) {
        this.contactStreet = this.contact_details.streetAddress
        this.logger.log('contactStreet ', this.contactStreet)
      }

      if (this.contact_details.city) {
        this.contactCity = this.contact_details.city
        this.logger.log('contactCity ', this.contactCity)
      }

      if (this.contact_details.region) {
        this.contactProvince = this.contact_details.region
        this.logger.log('contactProvince ', this.contactProvince)
      }

      if (this.contact_details.zipcode) {
        this.contactZipCode = this.contact_details.zipcode
        this.logger.log('contactZipCode ', this.contactZipCode)
      }

      if (this.contact_details.country) {
        this.contactCountry = this.contact_details.country.toUpperCase()
        this.logger.log('contactCountry ', this.contactCountry)
      }

      if (this.contact_details.note) {
        this.contactNote = this.contact_details.note
        this.logger.log('contactNote ', this.contactNote)
      }

      this.genetateContactAddress(this.contactStreet, this.contactCity, this.contactProvince, this.contactZipCode, this.contactCountry)


      if (this.contact_details.tags) {
        this.contactTags = this.contact_details.tags
        this.logger.log('contactTags ', this.contactTags)
        if (this.contactTags.length > 0) {
          this.tagContainerElementHeight = 22 + "px"
          this.logger.log('tagContainerElementHeight on init', this.tagContainerElementHeight)
        }
        this.getTagContainerElementHeight()
      }


      if (this.contact_details.properties) {
        this.logger.log('[CONTACT-INFO] - CONTACT DETAILS > contact_details.properties : ', this.contact_details['properties']);
        this.leadPropertiesObjct = this.contact_details.properties
        this.logger.log('[CONTACT-INFO] - CONTACT DETAILS > leadPropertiesObjct : ', this.leadPropertiesObjct);
        this.getAllContactProperties(this.leadPropertiesObjct)
      }
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {

    this.getTagContainerElementHeight()

  }

  getOSCODE() {
    this.public_Key = this.appConfigService.getConfig().t2y12PruGU9wUtEGzBJfolMIgK;
    // this.logger.log('[CONTACT-INFO]  getAppConfig public_Key', this.public_Key)
    let keys = this.public_Key.split("-");
    // this.logger.log('[CONTACT-INFO] - public_Key keys', keys)
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
      this.logger.log('[CONTACT-INFO] - CHAT_PANEL_MODE »»» ', this.CHAT_PANEL_MODE);

    } else {
      this.CHAT_PANEL_MODE = false;
      this.logger.log('[CONTACT-INFO] - CHAT_PANEL_MODE »»» ', this.CHAT_PANEL_MODE);
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
          // this.logger.log('[CONTACT-INFO] GET CURRENT PROJECT project._id (NEW)', project._id)
          // this.logger.log('[CONTACT-INFO] GET CURRENT PROJECT this.project_id (OLD)', this.id_project)
          this.id_project = project._id;
          this.project_name = project.name;
        }
      });
  }

  // -----------------------------------------------------
  // @ Lead Email
  // -----------------------------------------------------
  emailChange(event?: any) {
    this.logger.log('[CONTACT-INFO] ON EMAIL CHANGE event ', event)
   
    if (event && event.length > 0) {
      this.logger.log('[CONTACT-INFO] ON EMAIL CHANGE event length', event.length)
      this.hasEditedEmail = true
    } else if (!event) {
      this.hasEditedEmail = false
    }
    
    this.EMAIL_IS_VALID = this.validateEmail(event)
    this.logger.log('[CONTACT-INFO] ON EMAIL CHANGE EMAIL_IS_VALID ', this.EMAIL_IS_VALID)
  }
  

  validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  contactEmailOnFocus() {
    let emailInputElement = <HTMLInputElement>document.querySelector('#lead-email');
    let emailinputValue = emailInputElement.value;
  
    this.logger.log('[CONTACT-INFO] contactEmailOnFocus emailinputValue', emailinputValue)
    if(emailinputValue === this.contactNewEmail) {
      this.hasEditedEmail = false
    }
  }

  editContactEmailOnBlur() {
   this.logger.log('[CONTACT-INFO] > editContactEmailOnBlur contactNewEmail', this.contactNewEmail)

   this.logger.log('[CONTACT-INFO] > editContactEmailOnBlur hasEditedEmail', this.hasEditedEmail)

    if ((this.EMAIL_IS_VALID && this.contactNewEmail !== undefined && this.hasEditedEmail)) {
      this.logger.log('[CONTACT-INFO] editContactEmailOnBlur HERE UPDATES CONTACT EMAIL')
      this.updateContactemail(this.contact_details._id, this.contactNewEmail);
      this.contactEmailChanged.emit(this.contactNewEmail)
    }
  }

  removeEmailAnUpdateContact() {
    this.contactNewEmail = undefined
    this.logger.log('[CONTACT-INFO] removeEmailAnUpdateContact contactNewEmail', this.contactNewEmail)
    this.updateContactemail(this.contact_details._id, this.contactNewEmail);
    this.contactEmailChanged.emit(this.contactNewEmail)
  }


  updateContactemail(contatid: string, contatemail: string) {
    this.contactsService.updateLeadEmail(contatid, contatemail)
      .subscribe((contact) => {
        this.logger.log('[CONTACT-INFO] - UPDATED CONTACT ', contact);
      }, (error) => {
        this.logger.error('[CONTACT-INFO] - UPDATE CONTACT - ERROR ', error);

        this.notify.showNotification(this.editContactErrorNoticationMsg, 4, 'report_problem');
      }, () => {
        this.logger.log('[CONTACT-INFO] - UPDATE CONTACT * COMPLETE *');

        // this.notify.showWidgetStyleUpdateNotification(this.editContactSuccessNoticationMsg, 2, 'done')
      });
  }

  // -----------------------------------------------------
  // @ Lead Phone
  // -----------------------------------------------------
  editContactPhoneOnBlur() {
    if (this.contactPhone !== undefined && this.contactPhone.length > 0) {
      this.logger.log('[CONTACT-INFO] editContactEmailOnBlur HERE UPDATES CONTACT PHONE')
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
      this.logger.log('[CONTACT-INFO] - UPDATED CONTACT updateContactPhone', contact);

    }, (error) => {

      this.logger.error('[CONTACT-INFO] - UPDATE CONTACT updateContactPhone - ERROR ', error);
      // =========== NOTIFY ERROR ===========
      // this.notify.showNotification('An error occurred while updating contact', 4, 'report_problem');
      // this.notify.showWidgetStyleUpdateNotification(this.editContactErrorNoticationMsg, 4, 'report_problem')

    }, () => {
      this.logger.log('[CONTACT-INFO] - UPDATE CONTACT updateContactPhone - COMPLETED ');
      // this.notify.showWidgetStyleUpdateNotification(this.editContactSuccessNoticationMsg, 2, 'done')
    })

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
      this.logger.log('[CONTACT-INFO] - UPDATED CONTACT updateCompany', contact);

    }, (error) => {

      this.logger.error('[CONTACT-INFO] - UPDATE CONTACT updateCompany - ERROR ', error);
      // =========== NOTIFY ERROR ===========
      // this.notify.showNotification('An error occurred while updating contact', 4, 'report_problem');
      // this.notify.showWidgetStyleUpdateNotification(this.editContactErrorNoticationMsg, 4, 'report_problem')

    }, () => {
      this.logger.log('[CONTACT-INFO] - UPDATE CONTACT updateCompany - COMPLETED ');
      // this.notify.showWidgetStyleUpdateNotification(this.editContactSuccessNoticationMsg, 2, 'done')
    })

  }

  // -----------------------------------------------------
  // @ Lead Note
  // -----------------------------------------------------

  editContactNote() {
    this.toggleContactNote()
    this.logger.log('editContactNote ', this.contactNote)
    if (this.contactNote !== undefined) {
      this.updateContactNote(this.contact_details._id, this.contactNote)
    }
  }

  removeNoteAnUpdateContact() {
    this.contactNote = ""
    this.updateContactNote(this.contact_details._id, this.contactNote)
  }

  updateContactNote(contactid, contactnote) {
    this.logger.log('updateContactNote contactid', contactid)
    this.contactsService.updateLeadNote(
      contactid,
      contactnote
    ).subscribe((contact) => {
      this.logger.log('[CONTACT-INFO] - UPDATED CONTACT updateContactNote', contact);

    }, (error) => {

      this.logger.error('[CONTACT-INFO] - UPDATE CONTACT updateContactNote - ERROR ', error);
      // =========== NOTIFY ERROR ===========
      // this.notify.showNotification('An error occurred while updating contact', 4, 'report_problem');
      // this.notify.showWidgetStyleUpdateNotification(this.editContactErrorNoticationMsg, 4, 'report_problem')

    }, () => {
      this.logger.log('[CONTACT-INFO] - UPDATE CONTACT updateContactNote - COMPLETED ');
      // this.notify.showWidgetStyleUpdateNotification(this.editContactSuccessNoticationMsg, 2, 'done')
    })

  }

 

  // -----------------------------------------------------
  // @ Lead Tags
  // -----------------------------------------------------
  getTag() {
    
    this.tagsService.getTags().subscribe((tags: any) => {
      if (tags) {
        // contactTempTags are the available tags that the administrator has set on the tag management page
       
        this.contactTempTags = tags
        this.contactTempTags =  this.contactTempTags.slice(0)
        this.logger.log('[CONTACT-INFO] - GET TAGS - tag of contactTempTags  this.contactTempTags ', this.contactTempTags);
        
        this.logger.log('[CONTACT-INFO] - GET TAGS - contactTempTags length', this.contactTempTags.length);
        this.logger.log('[CONTACTS-DTLS] - ADD TAG > contactTags: ', this.contactTags);

        // -----------------------------------------------------------------------------------
        // Splice tags from the contactTempTags the tags already present in the contactTags
        // ------------------------------------------------------------------------------------
        this.removeTagFromTaglistIfAlreadyAssigned(this.contactTempTags, this.contactTags);
      }
    }, (error) => {
      this.logger.error('[CONTACT-INFO]  - GET TAGS - ERROR  ', error);
    
    }, () => {
      this.logger.log('[CONTACT-INFO]  - GET TAGS * COMPLETE *');
     
    });
  }

  removeTagFromTaglistIfAlreadyAssigned(contactTempTags: any, contactTags: any) {
    // remove from the contactTempTags (tags that the administrator has set on the tag management page and that are displayed in the combo box 'Add tag' of this template)
    if (contactTempTags && contactTags) {
      for (var i = contactTempTags.length - 1; i >= 0; i--) {
        for (var j = 0; j < contactTags.length; j++) {
          if (contactTempTags[i] && (contactTempTags[i].tag === contactTags[j])) {
            this.logger.log('[CONTACT-INFO] - REMOVE TAGS FROM TAG LIST WHEN IS SELECTED -  contactTempTags - contactTempTags[i] ', contactTempTags[i]);
            contactTempTags.splice(i, 1);
          }
        }
      }
    } else {
      this.logger.log('[CONTACT-INFO] - REMOVE TAGS FROM TAG LIST WHEN IS SELECTED -  tagsList undefined ', this.tagsList);
    }
    this.logger.log('[CONTACT-INFO] - GET TAGS -  tagsList - AFTER SPLICE ', this.contactTempTags);
    this.contactTempTags = this.contactTempTags.slice(0);

  }


  // When the user select a tag from the combo-box 
  addTag(tag) {
    this.logger.log('[CONTACT-INFO] - ADD TAG > tag: ', tag);
    this.contactTags.push(tag.tag)
    var index = this.contactTempTags.indexOf(tag);
    if (index !== -1) {
      this.contactTempTags.splice(index, 1);
    }
    this.contactTempTags = this.contactTempTags.slice(0)
    this.logger.log('[CONTACTS-DTLS] - ADD TAG > contactTags: ', this.contactTags);
    this.logger.log('[CONTACTS-DTLS] - ADD TAG > contactTempTags: ', this.contactTempTags);

    setTimeout(() => {
      this.tag = null;
    })
    this.updateContactTag(this.requester_id, this.contactTags)
  }

  createNewTag = (newTag: string) => {
    let self = this;
    
    // self.logger.log("Create New TAG Clicked : " + newTag)
    let newTagTrimmed = newTag.trim()
    self.contactTags.push(newTagTrimmed)
    // self.this.logger.log("Create New TAG Clicked - leads tag: ", self.contactTags)
    // this.logger.log("Create New TAG Clicked - leads tag: ", self.contactTags)
    self.updateContactTag(self.requester_id, self.contactTags)
     const tag_selected_color = '#43B1F2'
    self.addTagsToThePresetList(newTag, tag_selected_color)
  }

  addTagsToThePresetList(newTag, tag_selected_color) {

    this.tagsService.createTag(newTag, tag_selected_color)
    .subscribe((tag: any) => {
      this.logger.log('[WS-REQUESTS-MSGS] - CREATE TAG - RES ', tag);

      // const tagObject = { tag: tag.tag, color: tag.color }
      

      

    }, (error) => {
      this.logger.error('[WS-REQUESTS-MSGS] - CREATE TAG - ERROR  ', error);
      // this.notify.showWidgetStyleUpdateNotification(this.create_label_error, 4, 'report_problem');
    }, () => {
      this.logger.log('[WS-REQUESTS-MSGS] - CREATE TAG * COMPLETE *');
      // this.notify.showWidgetStyleUpdateNotification(this.create_label_success, 2, 'done');

      // this.tag_name = '';
      // this.tag_selected_color = '#43B1F2';

      this.getTag();
    });

  }
 

  removeTag(tag: string) {
    this.logger.log('[CONTACT-INFO] removeTag tag', tag)
    var index = this.contactTags.indexOf(tag);
    if (index !== -1) {
      this.contactTags.splice(index, 1);
      this.contactTempTags.push({ tag: tag })
      this.contactTempTags = this.contactTempTags.slice(0)
      this.logger.log('[CONTACT-INFO] removeTag contactTempTags', this.contactTempTags)
      this.logger.log('[CONTACT-INFO] removeTag contactTags', this.contactTags)

      this.updateContactTag(this.requester_id, this.contactTags)
    }
  }

  updateContactTag(requester_id: string, tags: any) {
    this.contactsService.updateLeadTag(requester_id, tags)
      .subscribe((lead: any) => {
        this.logger.log('[CONTACT-INFO] - ADD CONTACT TAGS  lead ', lead);
        if (lead) {
          this.contactTags = lead.tags
          this.getTagContainerElementHeight()
        }

      }, (error) => {

        this.logger.error('[CONTACT-INFO] - UPDATE CONTACT DD CONTACT TAGS - ERROR ', error);
        // =========== NOTIFY ERROR ===========
        // this.notify.showNotification('An error occurred while updating contact', 4, 'report_problem');
        // this.notify.showWidgetStyleUpdateNotification(this.editContactErrorNoticationMsg, 4, 'report_problem')

      }, () => {
        this.logger.log('[CONTACT-INFO] - UPDATE CONTACT ADD CONTACT TAGS - COMPLETED ');
        // this.notify.showWidgetStyleUpdateNotification(this.editContactSuccessNoticationMsg, 2, 'done')
      })
  }

  getTagContainerElementHeight() {
    const tagContainerElement = <HTMLElement>document.querySelector('.lead-tags--container');
    // this.logger.log('tagContainerElement ', tagContainerElement)
    if (tagContainerElement) {
      this.tagContainerElementHeight = tagContainerElement.offsetHeight + 60 + 'px'
      this.logger.log('[CONTACT-INFO] tagContainerElement.offsetHeight tagContainerElementHeight ', this.tagContainerElementHeight)
      this.logger.log('[CONTACT-INFO] tagContainerElement.clientHeight ', tagContainerElement.clientHeight)

      // this.tagContainerElementHeight = (this.requestInfoListElementHeight + tagContainerElement.offsetHeight) + 'px';
      // this.this.logger.log('this.tagContainerElementHeight ', this.tagContainerElementHeight)
    }
  }

  goToTags() {
    this.router.navigate(['project/' + this.id_project + '/labels']);
  }

  // -----------------------------------------------------
  // @ Lead Address
  // -----------------------------------------------------
  toggleAddress() {
    
    this.showAllAddress = !this.showAllAddress;
    this.logger.log('here yes' , this.showAllAddress)
    const addressArrowIconElem = <HTMLElement>document.querySelector('#address-arrow-down');
    this.logger.log('toggleAddress ', addressArrowIconElem)
    if (this.showAllAddress === true) {
      if (addressArrowIconElem) {
        addressArrowIconElem.classList.add("up");
      }
    }
    if (this.showAllAddress === false) {
      if (addressArrowIconElem) {
        addressArrowIconElem.classList.remove("up")
      }
      // = addressArrowIconElem.className.replace(/\bup\b/g, "");
    }
  }

  // -----------------------------------------------------
  // @ Lead Note
  // -----------------------------------------------------
  toggleContactNote() {
    this.showNote = !this.showNote;
  }

  removeContactStreet() {
    this.contactStreet = ""
    this.updateContactAddress()
    this.logger.log('[CONTACT-INFO] - REMOVE CONTACT STREET ', this.contactStreet);

  }
  removeContactCity() {
    this.contactCity = ""
    this.updateContactAddress()
    this.logger.log('[CONTACT-INFO] - REMOVE CONTACT CITY ', this.contactCity);
  }
  removeContactProvince() {
    this.contactProvince = ""
    this.updateContactAddress()
    this.logger.log('[CONTACT-INFO] - REMOVE CONTACT PROVINCE ', this.contactProvince);
  }

  removeContactPostalCode() {
    this.contactZipCode = ""
    this.updateContactAddress()
    this.logger.log('[CONTACT-INFO] - REMOVE CONTACT POSTAL CODE ', this.contactZipCode);
  }

  removeContactCountry() {
    this.contactCountry = ""
    this.updateContactAddress()
    this.logger.log('[CONTACT-INFO] - REMOVE CONTACT COUNTRY ', this.contactCountry);
  }


  genetateContactAddress(contactStreet, contactCity, contactProvince, contactZipCode, contactCountry) {
    let contactAddressTemp = [contactStreet, contactCity, contactProvince, contactZipCode, contactCountry]
    contactAddressTemp = contactAddressTemp.filter((element) => {
      return element !== undefined && element !== '';
    });
    // this.logger.log('contactAddressTemp ', contactAddressTemp)
    if (contactAddressTemp.length > 0) {
      contactAddressTemp.join(", ")
      const contactAddressTempString = contactAddressTemp.toString()
      const contactAddressTempSpaced = contactAddressTempString.replace(/,/g, ', ');
      this.contactAddress = contactAddressTempSpaced
      this.logger.log('[CONTACT-INFO] - contactAddress ', this.contactAddress);
    } else {
      this.contactAddress = undefined
    }
  }

  editContactAddress() {
    if (this.contactStreet && this.contactStreet.length > 0) {
      this.contactStreet = this.contactStreet.trim();
      this.updateContactAddress();
    }
    if (this.contactCity && this.contactCity.length > 0) {
      this.contactCity = this.contactCity.trim();
      this.updateContactAddress();
    }

    if (this.contactProvince && this.contactProvince.length > 0) {
      this.contactProvince = this.contactProvince.trim();
      this.updateContactAddress();
    }

    if (this.contactZipCode && this.contactZipCode.length > 0) {
      this.contactZipCode = this.contactZipCode.trim();
      this.updateContactAddress();
    }

    if (this.contactCountry && this.contactCountry.length > 0) {
      this.contactCountry = this.contactCountry.trim().toUpperCase();
      this.updateContactAddress();
    }
  }


  updateContactAddress() {
    // if (this.contactStreet) {
    //   this.contactStreet = this.contactStreet.trim()
    // }
    // if (this.contactCity) {
    //   this.contactCity = this.contactCity.trim()
    // }
    // if (this.contactProvince) {
    //   this.contactProvince = this.contactProvince.trim()
    // }
    // if (this.contactZipCode) {
    //   this.contactZipCode = this.contactZipCode.trim()
    // }
    // if (this.contactCountry) {
    //   this.contactCountry = this.contactCountry.trim().toUpperCase()
    // }

    this.genetateContactAddress(this.contactStreet, this.contactCity, this.contactProvince, this.contactZipCode, this.contactCountry)


    this.contactsService.updateLeadAddress(
      this.requester_id,
      this.contactStreet,
      this.contactCity,
      this.contactProvince,
      this.contactZipCode,
      this.contactCountry
    ).subscribe((contactAddress) => {
      this.logger.log('[CONTACT-INFO] - UPDATED CONTACT ADDRESS ', contactAddress);

    }, (error) => {

      this.logger.error('[CONTACT-INFO] - UPDATE CONTACT ADDRESS - ERROR ', error);

      // this.notify.showWidgetStyleUpdateNotification(this.editContactErrorNoticationMsg, 4, 'report_problem')

    }, () => {
      this.logger.log('[CONTACT-INFO]- UPDATE CONTACT ADDRESS * COMPLETE *');

      // this.notify.showWidgetStyleUpdateNotification(this.editContactSuccessNoticationMsg, 2, 'done');

    });
  }


  // -----------------------------------------------------
  // @ Cutom properties
  // -----------------------------------------------------

  addContactCustomProperty() {
    this.logger.log('[CONTACT-INFO] - ADD CONTACT PROPERTY ');

    const dialogRef = this.dialog.open(ContactCustomPropertiesComponent, {
      // data: {
      //   featureAvailableFrom: PLAN_NAME.A,
      //   projectId: projectid,
      //   userRole: this.CURRENT_USER_ROLE
      // },
    })

    dialogRef.afterClosed().subscribe(result => {
      this.logger.log(`Dialog result:`, result);

      const propertyLabel = result.label
      const propertyName = result.internal_name

      this.createContactProperty(propertyLabel, propertyName)


    });
  }



  createContactProperty(propertyLabel: string, propertyName: string) {

    this.contactsService.createNewLeadProperty(propertyLabel, propertyName)
      .subscribe((res: any) => {
        this.logger.log('[CONTACT-INFO] - CREATE CONTACT PROPERTY ', res);


      }, (error) => {

        this.logger.error('[CONTACT-INFO] - CREATE CONTACT PROPERTY - ERROR ', error);
        // =========== NOTIFY ERROR ===========
        // this.notify.showNotification('An error occurred while updating contact', 4, 'report_problem');
        // this.notify.showWidgetStyleUpdateNotification(this.editContactErrorNoticationMsg, 4, 'report_problem')

      }, () => {
        this.logger.log('[CONTACT-INFO] - CREATE CONTACT PROPERTY - COMPLETED ');
        // this.notify.showWidgetStyleUpdateNotification(this.editContactSuccessNoticationMsg, 2, 'done')

        this.contactCustomProperties.push({ label: propertyLabel, name: propertyName })
        // this.getAllContactProperties()
      })
  }


  getAllContactProperties(leadPropertiesObjct) {
    this.logger.log('[CONTACT-INFO] - GET CONTACT PROPERTIES LIST - leadPropertiesObjct ', leadPropertiesObjct);

    for (let [key, value] of Object.entries(leadPropertiesObjct)) {
      this.logger.log(`[CONTACT-INFO] - GET CONTACT PROPERTIES LIST - leadPropertiesObjct : key`, key);
      this.logger.log(`[CONTACT-INFO] - GET CONTACT PROPERTIES LIST - leadPropertiesObjct : - value `, value);

      if (value !== null) {
        // var index = this.contactCustomProperties.findIndex((e) => { 
        //   e.name === key
        //   this.logger.log(`[CONTACT-INFO] - GET CONTACT PROPERTIES LIST - index  `, index , ` of the key `,  key, 'e.name',  e.name );
        // })



        // let hasKey = this.contactCustomProperties.hasOwnProperty(key);
        const index = this.contactCustomProperties.findIndex((e) => e.name == key)
        // this.logger.log(`[CONTACT-INFO] - CONTACT PROPERTIES LIST - contactCustomProperties >>> hasKey `, key, '-> ', hasKey);
        this.logger.log(`[CONTACT-INFO] - CONTACT PROPERTIES LIST - contactCustomProperties >>> index `, index, '-> of key ', key);
        this.logger.log(`[CONTACT-INFO] - GET CONTACT PROPERTIES LIST - HERE PUSH in contactCustomProperties ARRAY `, this.contactCustomProperties);
        // if (!hasKey) {

        if (index === -1) {
          this.contactCustomProperties.push({ 'label': '', 'name': key, 'value': value })
        }
        // });

        // } else {
        //   this.logger.log(`[CONTACT-INFO] - GET CONTACT PROPERTIES LIST - name `, key , ` already exist` );
        // }
      }
    }
    this.logger.log(`[CONTACT-INFO] ->> GET CONTACT PROPERTIES LIST ->> this.contactCustomProperties `, this.contactCustomProperties);

    this.contactsService.getAllLeadProperty()
      .subscribe((leadProperties: any) => {
        this.logger.log('[CONTACT-INFO] - GET CONTACT PROPERTIES LIST  (getAllLeadProperty)', leadProperties);
        leadProperties.forEach(property => {
          this.logger.log('[CONTACT-INFO] - GET CONTACT PROPERTIES LIST (getAllLeadProperty) property', property)

          const propertyName = property.name;

          this.contactCustomProperties.forEach(contactCustomProperty => {

            this.logger.log('[CONTACT-INFO] - GET CONTACT PROPERTIES LIST contactCustomProperty', contactCustomProperty)

            if (propertyName === contactCustomProperty.name) {
              contactCustomProperty.label = property.label

              setTimeout(() => {
                const inputEl = <HTMLInputElement>document.querySelector(`.lead--properties-${contactCustomProperty.name} div div input`);
                this.logger.log('inputEl ', inputEl)
                inputEl.value = contactCustomProperty.value
              }, 1500);
            }
          });

          // var index = this.contactCustomProperties.indexOf(property.name);

          // this.logger.log('[CONTACT-INFO] - GET CONTACT PROPERTIES LIST contactCustomProperties.indexOf', property.name, 'index ', index)
          // this.contactsCustomProperties.push({ label: property.label, name: property.name })
          var index = this.contactCustomProperties.findIndex((e) => e.name === property.name)
          this.logger.log('[CONTACT-INFO] ->> GET CONTACT PROPERTIES LIST index of contactCustomProperties name (for push in contactPropertiesToSelect)', property.name, 'index ', index)
          if (index === -1) {
            this.contactPropertiesToSelect.push({ label: property.label, name: property.name })
          }
        });
        this.logger.log(`[CONTACT-INFO] ->> GET CONTACT PROPERTIES LIST - contactCustomProperties (after) `, this.contactCustomProperties);


        this.contactPropertiesToSelect = this.contactPropertiesToSelect.slice(0)
        this.logger.log('CONTACT-INFO] ->> GET CONTACT PROPERTIES LIST contactPropertiesToSelect Array ', this.contactPropertiesToSelect)

        this.logger.log('[CONTACT-INFO] - GET CONTACT PROPERTIES LIST contactCustomProperties', this.contactCustomProperties)
        // this.contactsCustomProperties = this.contactsCustomProperties.slice(0)
        // this.logger.log('contactsCustomProperties Array ', this.contactsCustomProperties)

        // this.form = new FormGroup({
        //   fields: new FormControl(JSON.stringify(this.contactProperties))
        // })
        // this.logger.log('contactProperties form ', this.form)

      }, (error) => {

        this.logger.error('[CONTACT-INFO] - CREATE CONTACT PROPERTIES LIST- ERROR ', error);
        // =========== NOTIFY ERROR ===========
        // this.notify.showNotification('An error occurred while updating contact', 4, 'report_problem');
        // this.notify.showWidgetStyleUpdateNotification(this.editContactErrorNoticationMsg, 4, 'report_problem')

      }, () => {
        this.logger.log('[CONTACT-INFO] - CREATE CONTACT PROPERTIES LIST - COMPLETED ');

      })

  }

  onSelectCustomProperty(event) {
    this.logger.log('[CONTACT-INFO] - ON SELECT CONTACT PROPERTY event ', event);
    // this.logger.log('[CONTACT-INFO] - ON SELECT CONTACT PROPERTY contactProperty ', this.contactProperty);
    setTimeout(() => {
      this.contactProperty = null;
    })
    this.contactCustomProperties.push(event)
    this.logger.log('[CONTACT-INFO] - ON SELECT CONTACT PROPERTY > contactCustomProperties ', this.contactCustomProperties);
    this.logger.log('[CONTACT-INFO] - ON SELECT CONTACT PROPERTY > contactPropertiesToSelect ', this.contactPropertiesToSelect);
    // this.saveCustomProperty(this.requester_id,  this.contactCustomPropertiesAssigned)


    this.contactPropertiesToSelect.forEach((contactPropertyToSelect, index) => {
      this.logger.log('contactPropertyToSelect name', contactPropertyToSelect.name)
      this.logger.log('event name', event.name)
      if (contactPropertyToSelect.name === event.name) {
        this.logger.log('[CONTACT-INFO] - ON SELECT CONTACT PROPERTY REMOVE CUSTOM PROPERTY FROM contactPropertiesToSelect index ', index);
        this.contactPropertiesToSelect.splice(index, 1);
      }
    });
    this.contactPropertiesToSelect = this.contactPropertiesToSelect.slice(0)
  }

  removeCustomProperty(propertyLabel, propertyName) {
    this.logger.log('[CONTACT-INFO] - REMOVE CUSTOM PROPERTY propertyLabel ', propertyLabel);
    this.logger.log('[CONTACT-INFO] - REMOVE CUSTOM PROPERTY propertyName ', propertyName);
    //   delete  this.contactAttributes['ccp_' + propertyName]
    //   this.logger.log('[CONTACT-INFO] - REMOVE CUSTOM PROPERTY FROM ATTRIBUTES contactAttributes ', this.contactAttributes);

    this.contactCustomProperties.forEach((contactProperty, index) => {
      if (contactProperty.name === propertyName) {
        this.logger.log('[CONTACT-INFO] - REMOVE CUSTOM PROPERTY  index ', index);
        this.contactCustomProperties.splice(index, 1);
      }

    });

    this.contactPropertiesToSelect.push({ label: propertyLabel, name: propertyName })

    for (let [key, value] of Object.entries(this.leadPropertiesObjct)) {
      this.logger.log(`[CONTACT-INFO] - REMOVE CUSTOM PROPERTY leadPropertiesObjct key`, key);
      this.logger.log(`[CONTACT-INFO] - REMOVE CUSTOM PROPERTY leadPropertiesObjct value `, value);
      if (key === propertyName) {
        this.leadPropertiesObjct[key] = null
        this.updateLeadCustomProperties(this.requester_id, this.leadPropertiesObjct)
      }
    }
    // this.leadPropertiesObjct
    this.contactPropertiesToSelect = this.contactPropertiesToSelect.slice(0)
    this.logger.log('[CONTACT-INFO] - REMOVE CUSTOM PROPERTY FROM ATTRIBUTES contactCustomProperties ', this.contactCustomProperties);
    // this.saveCustomProperty(this.requester_id, this.contactCustomProperties)


    // this.updatedAttributes(this.contactAttributes)
  }

  // updatedAttributes(contactAttributes) {
  //   this.contactsService.updatedContactAttributes(this.requester_id, contactAttributes)
  //     .subscribe((res: any) => {
  //       this.logger.log('[CONTACT-INFO] - UPDATED CONTACT ATTRIBUTES ', res);
  //     }, (error) => {
  //       this.logger.error('[CONTACT-INFO] - UPDATED CONTACT ATTRIBUTES - ERROR ', error);
  //       // =========== NOTIFY ERROR ===========
  //       // this.notify.showNotification('An error occurred while updating contact', 4, 'report_problem');
  //       // this.notify.showWidgetStyleUpdateNotification(this.editContactErrorNoticationMsg, 4, 'report_problem')
  //     }, () => {
  //       this.logger.log('[CONTACT-INFO] - UPDATED CONTACT ATTRIBUTES - COMPLETED ');
  //     })
  // }

  addCustomPropertyValue(propertyName) {
    this.logger.log('[CONTACT-INFO] - ADD VALUE AT THE CUSTOM PROPERTY input id', propertyName);
    // const inputEl = <HTMLInputElement>document.getElementById('propertyName')
    const inputEl = <HTMLInputElement>document.querySelector('#propertyName');
    this.logger.log('[CONTACT-INFO] - ADD VALUE AT THE CUSTOM PROPERTY inputEl', inputEl);
    const value = inputEl.value
    this.logger.log('[CONTACT-INFO] - ADD VALUE AT THE CUSTOM PROPERTY input value', value);
  }

  onKey(propertyName, propertylabel, event) {
    this.logger.log('[CONTACT-INFO] - onKey propertyName', propertyName);
    this.logger.log('[CONTACT-INFO] - onKey propertylabel', propertylabel);
    // this.logger.log('[CONTACT-INFO] - onKey event', event);
    const inputValue = event.target.value;
    this.logger.log('[CONTACT-INFO] - onKey inputValue', inputValue);
    this.logger.log('[CONTACT-INFO] - onKey contactCustomPropertiesAssigned', this.contactCustomPropertiesAssigned);



    // ----- new 
    this.leadPropertiesObjct[propertyName] = inputValue
    this.logger.log('[CONTACT-INFO] - onKey leadPropertiesObjct', this.leadPropertiesObjct);
    this.updateLeadCustomProperties(this.requester_id, this.leadPropertiesObjct)
    // ----- ./new 

    // if (this.contactCustomPropertiesAssigned.length > 0) {
    //   this.logger.log('[CONTACT-INFO] - onKey usecase contactCustomPropertiesAssigned.length ', this.contactCustomPropertiesAssigned.length)
    //   this.contactCustomPropertiesAssigned.forEach(property => {
    //     this.logger.log('[CONTACT-INFO] - onKey property', property.name);
    //     // if (property.name !== propertyName) {
    //       this.logger.log('[CONTACT-INFO] - USE CASE PROPERTY ADDED IF NOT YET ADDED property.name', property.name, 'propertyName selected:  ', propertyName);
    //       // this.contactCustomPropertiesAssigned.push({ [propertyName]: inputValue, label: propertylabel })
    //       this.contactCustomPropertiesAssigned.push({ label: propertylabel, name: propertyName, value: inputValue })
    //       this.saveCustomProperty(this.requester_id, this.contactCustomPropertiesAssigned)
    //     // }
    //   });
    // } else {
    //   // this.contactCustomPropertiesAssigned.push({ [propertyName]: inputValue, label: propertylabel })
    //   this.logger.log('[CONTACT-INFO] - onKey usecase contactCustomPropertiesAssigned.length ', this.contactCustomPropertiesAssigned.length)
    //   this.contactCustomPropertiesAssigned.push({ label: propertylabel, name: propertyName, value: inputValue })
    //   this.saveCustomProperty(this.requester_id, this.contactCustomPropertiesAssigned)
    // }
    this.logger.log('[CONTACT-INFO] - onKey contactCustomProperties', this.contactCustomProperties);
    // this.contactCustomProperties.push({ label: propertylabel, name: propertyName, value: inputValue })
    // this.saveCustomProperty(this.requester_id, this.contactCustomProperties)
  }


  updateLeadCustomProperties(requester_id, customPropertiesObjct) {
    this.contactsService.updateLeadCustomProperties(requester_id, customPropertiesObjct)

      .subscribe((res: any) => {
        this.logger.log('[CONTACT-INFO] - ADD CUSTOM PROPERTY TO LEAD (New)', res);

      }, (error) => {

        this.logger.error('[CONTACT-INFO] - ADD CUSTOM PROPERTY TO LEAD (New) - ERROR ', error);
        // =========== NOTIFY ERROR ===========
        // this.notify.showNotification('An error occurred while updating contact', 4, 'report_problem');
        // this.notify.showWidgetStyleUpdateNotification(this.editContactErrorNoticationMsg, 4, 'report_problem')

      }, () => {
        this.logger.log('[CONTACT-INFO] - ADD CUSTOM PROPERTY TO LEAD (New) - COMPLETED ');
        // this.notify.showWidgetStyleUpdateNotification(this.editContactSuccessNoticationMsg, 2, 'done')

      })
  }


  // saveCustomProperty(requester_id, propertyName, inputValue) {
  saveCustomProperty(requester_id, contactCustomPropertiesAssigned) {
    this.contactsService.addCustoPropertyToLead(requester_id, contactCustomPropertiesAssigned)

      .subscribe((res: any) => {
        this.logger.log('[CONTACT-INFO] - ADD CUSTOM PROPERTY TO LEAD ', res);

      }, (error) => {

        this.logger.error('[CONTACT-INFO] - ADD CUSTOM PROPERTY TO LEAD - ERROR ', error);

        this.notify.showWidgetStyleUpdateNotification(this.editContactErrorNoticationMsg, 4, 'report_problem')

      }, () => {
        this.logger.log('[CONTACT-INFO] - ADD CUSTOM PROPERTY TO LEAD - COMPLETED ');

      })
  }


  // ----------------------------------------------
  // Translation
  // ----------------------------------------------
  translateEditContactSuccessMsg() {
    this.translate.get('EditContactSuccessNoticationMsg')
      .subscribe((text: string) => {

        this.editContactSuccessNoticationMsg = text;
        // this.this.logger.log('[CONTACT-EDIT] + + + EditContactSuccessNoticationMsg', text)
      });
  }
  // TRANSLATION
  translateEditContactErrorMsg() {
    this.translate.get('EditContactErrorNoticationMsg')
      .subscribe((text: string) => {

        this.editContactErrorNoticationMsg = text;
        // this.logger.log('[CONTACT-EDIT] + + + EditContactErrorNoticationMsg', text)
      });
  }

  // _addInput() {
  //   let ulElm = <HTMLElement>document.querySelector('.contact-info-list');
  //   let li = document.createElement("li");
  //   let children = ulElm.children.length + 1
  //   logger.log('ulElm', ulElm)
  //   logger.log('children', children)
  //   li.setAttribute("id", "element" + children)
  //   let div = document.createElement('div');
  //   div.className = "contact-row"
  //   li.appendChild(div);
  //   let span = document.createElement('span');
  //   div.appendChild(span);

  //   let svg = `<svg xmlns="http://www.w3.org/2000/svg" height="22px" viewBox="0 0 24 24" fill="none" style="min-width: 22px; min-height: 22px;"><path  d="M0 0h24v24H0V0z" fill="none"></path><path d="M9.17 6l2 2H20v10H4V6h5.17M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"></path></svg>`
  //   const parseSvgString = svgString =>
  //     new DOMParser().parseFromString(svgString, 'image/svg+xml')
  //       .querySelector('svg')
  //   span.appendChild(parseSvgString(svg));
  //   // li.appendChild(document.createTextNode("Element "+children));
  //   let div2 = document.createElement('div');
  //   li.appendChild(div2);
  //   ulElm.appendChild(li)
  // }

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
  //     logger.log('ulElm', ulElm)
  //     logger.log('children', children)
  //     li.setAttribute("id", "element" + children)

  //     li.innerHTML = customPropertyTemplateAsString;
  //     document.appendChild(li);
  //   }

  goToTicketTab() {
    this.logger.log('[CONTACT-INFO] -  GO TO TICKET TAB ');
    this.onClickTagConversation.emit()
  }

}

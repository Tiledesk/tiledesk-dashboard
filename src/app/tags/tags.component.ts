import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NotifyService } from '../core/notify.service';
import { TagsService } from '../services/tags.service';
import { LocalDbService } from '../services/users-local-db.service';
import { UsersService } from '../services/users.service';
import { AppConfigService } from '../services/app-config.service';
import { AuthService } from '../core/auth.service';
import { LoggerService } from '../services/logger/logger.service';
import { URL_tag_doc } from 'app/utils/util';
import { BrandService } from 'app/services/brand.service';
import { Subject } from 'rxjs';
import { RoleService } from 'app/services/role.service';
import { RolesService } from 'app/services/roles.service';
import { takeUntil } from 'rxjs/operators';
import { PERMISSIONS } from 'app/utils/permissions.constants';
import { FaqKbService } from 'app/services/faq-kb.service';

interface TagUser {
  firstname: string;
  lastname?: string;
  email?: string;
  isBot?: boolean;
}

@Component({
  selector: 'appdashboard-tags',
  templateUrl: './tags.component.html',
  styleUrls: ['./tags.component.scss']
})



export class TagsComponent implements OnInit, AfterViewInit, OnDestroy {
  public tag_docs_url = URL_tag_doc
  tagsList: Array<any>;
  tagname: string;
  tag_name: string; // is that passed to the delete modal
  tagid: string;
  create_label_success: string;
  create_label_error: string;
  update_label_success: string;
  update_label_error: string;

  showSpinner = true;
  tag_selected_color = '#43B1F2';
  tag_new_selected_color: string;
  displayModalDeleteTag = 'none';
  displayModalEditTag = 'none';

  isOpenEditTagColorDropdown = false;
  storageBucket: string;
  baseUrl: string;
  UPLOAD_ENGINE_IS_FIREBASE: boolean;
  hasError = false;
  public hideHelpLink: boolean;
 
  tagColor = [
    { name: 'red', hex: '#FF5C55' },
    { name: 'orange', hex: '#F89D34' },
    { name: 'yellow', hex: '#F3C835' },
    { name: 'green', hex: '#66C549' },
    { name: 'blue', hex: '#43B1F2' },
    { name: 'violet', hex: '#CB80DD' },
  ];
  IS_OPEN_SETTINGS_SIDEBAR: boolean;
  isChromeVerGreaterThan100: boolean;

  private unsubscribe$: Subject<any> = new Subject<any>();
  isAuthorized = false;
  permissionChecked = false;

  PERMISSION_TO_CREATE: boolean;
  PERMISSION_TO_DELETE: boolean;
  PERMISSION_TO_UPDATE: boolean;

  constructor(
    public translate: TranslateService,
    private notify: NotifyService,
    private tagsService: TagsService,
    private usersLocalDbService: LocalDbService,
    public appConfigService: AppConfigService,
    private usersService: UsersService,
    private auth: AuthService,
    private logger: LoggerService,
    public brandService: BrandService,
    private roleService: RoleService,
    public rolesService: RolesService,
    private faqKbService: FaqKbService,
  ) { 
    const brand = brandService.getBrand(); 
    this.hideHelpLink= brand['DOCS'];
  }

  ngOnInit() {
    this.getTag();
    this.translateNotificationMsgs();
    this.getImageStorage();
    this.listenSidebarIsOpened();
    this.getBrowserVersion();
    this.checkPermissions();
    this.listenToProjectUser()
  }

   ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  async checkPermissions() {
    const result = await this.roleService.checkRoleForCurrentProject('tags')
    console.log('[TAGS] result ', result)
    this.isAuthorized = result === true;
    this.permissionChecked = true;
    console.log('[TAGS] isAuthorized ', this.isAuthorized)
    console.log('[TAGS] permissionChecked ', this.permissionChecked)
  }

  listenToProjectUser() {
    this.rolesService.listenToProjectUserPermissions(this.unsubscribe$);
    this.rolesService.getUpdateRequestPermission()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(status => {
        console.log('[TAGS] - Role:', status.role);
        console.log('[TAGS] - Permissions:', status.matchedPermissions);
        if (status.role !== 'owner' && status.role !== 'admin' && status.role !== 'agent') {
          if (status.matchedPermissions.includes(PERMISSIONS.TAG_CREATE)) {
          
            this.PERMISSION_TO_CREATE = true
            console.log('[TAGS] - PERMISSION_TO_CREATE ', this.PERMISSION_TO_CREATE);
          } else {
            this.PERMISSION_TO_CREATE = false
            console.log('[TAGS] - PERMISSION_TO_CREATE ', this.PERMISSION_TO_CREATE);
          }
        } else {
          this.PERMISSION_TO_CREATE = true
          console.log('[TAGS] - Project user has a default role ', status.role, 'PERMISSION_TO_CREATE ', this.PERMISSION_TO_CREATE);
        }


        if (status.role !== 'owner' && status.role !== 'admin' && status.role !== 'agent') {
          if (status.matchedPermissions.includes(PERMISSIONS.TAG_DELETE)) {
          
            this.PERMISSION_TO_DELETE = true
            console.log('[TAGS] - PERMISSION_TO_DELETE ', this.PERMISSION_TO_DELETE);
          } else {
            this.PERMISSION_TO_DELETE = false
            console.log('[TAGS] - PERMISSION_TO_DELETE ', this.PERMISSION_TO_DELETE);
          }
        } else {
          this.PERMISSION_TO_DELETE = true
          console.log('[TAGS] - Project user has a default role ', status.role, 'PERMISSION_TO_DELETE ', this.PERMISSION_TO_DELETE);
        }

        if (status.role !== 'owner' && status.role !== 'admin' && status.role !== 'agent') {
          if (status.matchedPermissions.includes(PERMISSIONS.TAG_UPDATE)) {
          
            this.PERMISSION_TO_UPDATE = true
            console.log('[TAGS] - PERMISSION_TO_UPDATE ', this.PERMISSION_TO_UPDATE);
          } else {
            this.PERMISSION_TO_UPDATE = false
            console.log('[TAGS] - PERMISSION_TO_UPDATE ', this.PERMISSION_TO_UPDATE);
          }
        } else {
          this.PERMISSION_TO_UPDATE = true
          console.log('[TAGS] - Project user has a default role ', status.role, 'PERMISSION_TO_UPDATE ', this.PERMISSION_TO_UPDATE);
        }

        // if (status.matchedPermissions.includes('lead_update')) {
        //   // Enable lead update action
        // }

        // You can also check status.role === 'owner' if needed
      });
  }

  getBrowserVersion() {
    this.auth.isChromeVerGreaterThan100.subscribe((isChromeVerGreaterThan100: boolean) => { 
     this.isChromeVerGreaterThan100 = isChromeVerGreaterThan100;
    //  console.log("[WS-REQUESTS-LIST] isChromeVerGreaterThan100 ",this.isChromeVerGreaterThan100);
    })
   } 

  listenSidebarIsOpened() {
    this.auth.settingSidebarIsOpned.subscribe((isopened) => {
      this.logger.log('[TAGS] SETTINGS-SIDEBAR isopened (FROM SUBSCRIPTION) ', isopened)
      this.IS_OPEN_SETTINGS_SIDEBAR = isopened
    });
  }
  ngAfterViewInit() { }

  getImageStorage() {
    if (this.appConfigService.getConfig().uploadEngine === 'firebase') {
      this.UPLOAD_ENGINE_IS_FIREBASE = true;
      const firebase_conf = this.appConfigService.getConfig().firebase;
      this.storageBucket = firebase_conf['storageBucket'];
      this.logger.log('[TAGS] IMAGE STORAGE ', this.storageBucket, 'usecase native')
    } else {
      this.UPLOAD_ENGINE_IS_FIREBASE = false;

      this.baseUrl = this.appConfigService.getConfig().SERVER_BASE_URL;
      this.logger.log('[TAGS] IMAGE STORAGE ', this.baseUrl, 'usecase native')
    }
  }

  translateNotificationMsgs() {
    this.translate.get('Tags.NotificationMsgs')
      .subscribe((translation: any) => {
        // this.logger.log('[TAGS]  translateNotificationMsgs text', translation)
        this.create_label_success = translation.CreateLabelSuccess;
        this.create_label_error = translation.CreateLabelError;
        this.update_label_success = translation.UpdateLabelSuccess;
        this.update_label_error = translation.UpdateLabelError

      }, err => {
        this.logger.error('[TAGS] TRANSLATE GET NOTIFICATION MSGS - ERROR ',err);
      }, () => {
        this.logger.log('[TAGS] TRANSLATE GET NOTIFICATION MSGS * COMPLETE *');
      });
  }


  old_getTag() {
    this.tagsService.getTags().subscribe((tags: any) => {
      this.logger.log('TAGS] - GET TAGS - RES ', tags);

      if (tags) {
        this.tagsList = tags;

        this.tagsList.forEach(tag => {

          // -----------------------------------------------------
          // Get the user by id ('createdBy' matches the user id)
          // -----------------------------------------------------
          const user = this.usersLocalDbService.getMemberFromStorage(tag.createdBy);
          this.logger.log('[TAGS] - GET TAGS - getMemberFromStorage - createdBy ', user);
          if (user !== null) {
            tag.createdBy_user = user;
          } else {
            // -----------------------------------------------------
            // From remote if not exist in the local storage
            // -----------------------------------------------------
            this.getMemberFromRemote(tag, tag.createdBy);
          }
        });
      }
    }, (error) => {
      this.logger.error('[TAGS] - GET TAGS - ERROR ', error);
      this.showSpinner = false
    }, () => {
      this.logger.log('[TAGS] - GET TAGS * COMPLETE *');
      this.showSpinner = false
    });
  }

  // getTag() {
  //  this.tagsService.getTags().subscribe(
  //   (tags: any) => {
  //    console.log('[TAGS] - GET TAGS - RES ', tags);

  //     if (tags) {
  //       this.tagsList = tags;

  //       this.tagsList.forEach(tag => {
  //         // -----------------------------------------------------
  //         // Get the user by id ('createdBy' matches the user id)
  //         // -----------------------------------------------------
  //         let user: TagUser | string | null = this.usersLocalDbService.getMemberFromStorage(tag.createdBy);
  //         console.log('[TAGS] - GET TAGS - getMemberFromStorage - createdBy ', user);

  //         if (!user) {
            
  //           const storedValue = localStorage.getItem(tag.createdBy);
  //           if (storedValue) {
  //             console.log('[TAGS] - GET TAGS - NO USER CHECK FOR BOT IN STOAGE storedValue', storedValue);
  //             // Se lo storage contiene solo una stringa, assumiamo sia un chatbot
  //             let storedValueParsed = JSON.parse(storedValue) 
  //              console.log('[TAGS] - GET TAGS - NO USER CHECK FOR BOT IN STOAGE storedValueParsed', storedValueParsed);
  //              if (storedValueParsed.type = "tilebot") {
  //                 user = { firstname: storedValueParsed.name, isBot: true };
  //              }
             
  //           }
  //         }

  //         if (user) {
  //           tag.createdBy_user = user;
  //         } else {
  //           console.log('[TAGS] - GET TAGS - NO USER IN STORAGE ', user);
  //           // -----------------------------------------------------
  //           // From remote if not exist in the local storage
  //           // -----------------------------------------------------
  //           this.getMemberFromRemote(tag, tag.createdBy);
  //         }
  //       });
  //     }
  //   },
  //   (error) => {
  //     this.logger.error('[TAGS] - GET TAGS - ERROR ', error);
  //     this.showSpinner = false;
  //   },
  //   () => {
  //     this.logger.log('[TAGS] - GET TAGS * COMPLETE *');
  //     this.showSpinner = false;
  //   }
  // );
  // }

  _getTag() {
    this.tagsService.getTags().subscribe(
      (tags: any) => {
        this.logger.log('[TAGS] - GET TAGS - RES ', tags);

        if (tags) {
          this.tagsList = tags;

          this.tagsList.forEach(tag => {
            // -----------------------------------------------------
            // Provo a prendere l'utente dallo storage locale
            // -----------------------------------------------------
            let user: any = this.usersLocalDbService.getMemberFromStorage(tag.createdBy);

            if (user) {
              tag.createdBy_user = user;
            } else {
              // -----------------------------------------------------
              // Controllo se è un bot nello storage locale
              // -----------------------------------------------------
              const storedValue = localStorage.getItem(tag.createdBy);
              if (storedValue) {
                let storedBotParsed = JSON.parse(storedValue) 
                if (storedBotParsed.type = 'tilebot') {
                  tag.createdBy_user = { firstname: storedBotParsed.name, isBot: true };
                }
              } else {
                // -----------------------------------------------------
                // Se non trovato, chiamo le API remote
                // -----------------------------------------------------
                // Decido se è bot o umano in base a qualche logica: es. id pattern
                if (tag.createdBy.startsWith('bot_')) {
                  // è un bot
                  this.getBotById(tag.createdBy, tag);
                } else {
                  // è un utente umano
                  this.getMemberFromRemote(tag, tag.createdBy);
                }
              }
            }
          });
        }
      },
      (error) => {
        this.logger.error('[TAGS] - GET TAGS - ERROR ', error);
        this.showSpinner = false;
      },
      () => {
        this.logger.log('[TAGS] - GET TAGS * COMPLETE *');
        this.showSpinner = false;
      }
    );
  }
  getTag() {
    this.tagsService.getTags().subscribe((tags: any) => {
      this.logger.log('[TAGS] - GET TAGS - RES ', tags);

      if (tags) {
        this.tagsList = tags;

        this.tagsList.forEach(tag => {
          // 1️⃣ Provo a prendere l’utente dallo storage locale
          let user: any = this.usersLocalDbService.getMemberFromStorage(tag.createdBy);

          if (user) {
            tag.createdBy_user = user;

          } else {
            // 2️⃣ Utente non trovato nello storage locale → chiamata remota
            this.getMemberFromRemote(tag, tag.createdBy);

            // 3️⃣ Controllo se esiste uno stored bot
            const storedValue = localStorage.getItem(tag.createdBy);
            if (storedValue) {
              try {
                const storedBotParsed = JSON.parse(storedValue);
                if (storedBotParsed.type === 'tilebot') {
                  tag.createdBy_user = { firstname: storedBotParsed.name, isBot: true };
                }
              } catch (e) {
                this.logger.error('[TAGS] - errore parsing storedValue', e);
              }
            } else {
              // 4️⃣ Nessun bot nello storage → chiamata remota per il bot
              this.getBotById(tag.createdBy, tag);
            }
          }
        });
      }
    },
    (error) => {
      this.logger.error('[TAGS] - GET TAGS - ERROR ', error);
      this.showSpinner = false;
    },
    () => {
      this.logger.log('[TAGS] - GET TAGS * COMPLETE *');
      this.showSpinner = false;
    }
  );
  }



getBotById(botid: string, tag: any) {
    this.logger.log('getFaqById');

    this.faqKbService.getBotById(botid).subscribe((chatbot) => {
      this.logger.log('[TAGS] - GET BOT BY ID RES - chatbot', chatbot);
      if (chatbot) {
 
        tag.createdBy_user = { firstname: chatbot.name, isBot: true };
      }
    }, (error) => {
      this.logger.error('[TAGS] - GET BOT BY ID RES - ERROR ', error);

    }, () => {
      this.logger.log('[TAGS] - GET BOT BY ID RES - COMPLETE ');

    });
  }




  getMemberFromRemote(tag: any, userid: string) {
    this.usersService.getProjectUserById(userid)
      .subscribe((projectuser) => {
        this.logger.log('[TAGS] - getMemberFromRemote ID ', projectuser);

        tag.createdBy_user = projectuser[0].id_user;

      }, (error) => {
        this.logger.error('[TAGS] - getMemberFromRemote - ERROR ', error);
      }, () => {
        this.logger.log('[TAGS] - getMemberFromRemote * COMPLETE *');
      });
  }


  tagSelectedColor(hex: any) {
    // console.log('[TAGS] - TAG SELECTED COLOR ', hex);
    this.tag_selected_color = hex;
  }


  createTag() {

    if (this.PERMISSION_TO_CREATE) {
      // console.log('[TAGS] - CREATE TAG - TAG-NAME: ', this.tagname, ' TAG-COLOR: ', this.tag_selected_color)
      const createTagBtn = <HTMLElement>document.querySelector('.create-tag-btn');

      createTagBtn.blur();

      if (this.tagname && this.tagname.length > 0) {
        this.hasError = false;

        this.tagsService.createTag(this.tagname, this.tag_selected_color)
          .subscribe((tag: any) => {
            this.logger.log('[TAGS] - CREATE TAG - RES ', tag);

          }, (error) => {
            this.logger.error('[TAGS] - CREATE TAG - ERROR  ', error);
            this.notify.showWidgetStyleUpdateNotification(this.create_label_error, 4, 'report_problem');
          }, () => {
            this.logger.log('[TAGS] - CREATE TAG * COMPLETE *');
            this.notify.showWidgetStyleUpdateNotification(this.create_label_success, 2, 'done');

            this.tagname = '';
            this.tag_selected_color = '#43B1F2';

            this.getTag();
          });

      } else {

        this.hasError = true;
      }

    } else {
      this.notify.presentDialogNoPermissionToPermomfAction()
    }

  }

  onChangeTagname($event) {
    this.logger.log('[TAGS] - ON-CHANGE-TAG-NAME ', $event);

    if ($event.length > 0) {
      this.hasError = false;
    }
  }

  presentModalDeleteTag(tag_id: string, tag_name: string) {
    if (this.PERMISSION_TO_DELETE) {
      this.displayModalDeleteTag = 'block';
      this.tagid = tag_id;
      this.tag_name = tag_name;
      this.logger.log('[TAGS] - presentModalDeleteTag - tagid  ', this.tagid, ' tagname ', this.tagname);
    } else {
      this.notify.presentDialogNoPermissionToPermomfAction()
    }
  }

  closeModalDeleteTag() {
    this.displayModalDeleteTag = 'none';
  }

  onTagDeleted(tagid) {
    this.logger.log('[TAGS] - onTagDeleted - tagid  ', tagid);
    this.logger.log('[TAGS] - onTagDeleted -  this.tagsList  ',  this.tagsList);
  
    for (var i = 0; i < this.tagsList.length; i++) {
      if (this.tagsList[i]._id === tagid) {
        this.tagsList.splice(i, 1);
        i--;
      }
    }
    // this.getTag();
  }

  // !! NOT USED
  openEditColorDropdown() {
    this.isOpenEditTagColorDropdown = !this.isOpenEditTagColorDropdown
    this.logger.log('[TAGS] - openEditColorDropdown - isOpenEditTagColorDropdown  ', this.isOpenEditTagColorDropdown);
  }

  tagNewColorSelected(hex: string, tagid, tagname) {
    this.logger.log('[TAGS] - editTag - tagid  ', tagid, ' tag name: ', tagname);
    this.tag_new_selected_color = hex;
    this.logger.log('[TAGS] - tagNewColorSelected - tag_new_selected_color  ', this.tag_new_selected_color);
  }

  editTag(tagname: string, hex: string, tagid: string, index: number) {
    this.logger.log('[TAGS] - editTag - new color ', hex, ' tagid: ', tagid, ' tag name: ', tagname, ' index ', index);

    this.tagsService.updateTag(tagname, hex, tagid)
      .subscribe((tag: any) => {
        this.logger.log('[TAGS] - EDIT TAG - RES ', tag);

      }, (error) => {
        this.logger.error('[TAGS] - EDIT TAG - ERROR  ', error);
        this.notify.showWidgetStyleUpdateNotification(this.update_label_error, 4, 'report_problem');
      }, () => {
        this.logger.log('[TAGS] - EDIT TAG * COMPLETE *');
        this.notify.showWidgetStyleUpdateNotification(this.update_label_success, 2, 'done');

        this.getTag();
      });
  }

  goTagsDocs(){
    const url = this.tag_docs_url;
    window.open(url, '_blank');
  }



}

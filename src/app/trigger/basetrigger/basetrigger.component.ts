import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable, zip } from 'rxjs';
import { DepartmentService } from 'app/services/department.service'
import { UsersService } from '../../services/users.service';
import { FaqKbService } from '../../services/faq-kb.service';
import { LoggerService } from '../../services/logger/logger.service';
@Component({
  selector: 'appdashboard-basetrigger',
  template: '',
})
export class BasetriggerComponent implements OnInit {

  condition: any;
  options: any;
  operator: any
  action: any;

  messageCondition: string;
  messageAction: string;
  messageServerError: string;

  showSpinner = true;

  departments = []
  projectUsersList: any;
  bots: any;
  projectUserAndBotsArray = [];

  botsWithoutIdentityBot: any;
  projectUserAndBotsWithoutIdentityBotArray = []
  botsWithoutIdentityBotArray = []
  default_dept_id: string;
  constructor(
    public translate: TranslateService,
    public departmentService: DepartmentService,
    public usersService: UsersService,
    public faqKbService: FaqKbService,
    public logger: LoggerService
  ) {
  }

  ngOnInit() {
    this.logger.log('[TRIGGER][BASE-TRIGGER] - CALLING  BASE-TRIGGER ONINIT ');
    this.translateNotifyMsg()
    this.getDepartments();
    this.translateBasicINFO();
    // this.getTranslateAndDepartmentCallsEnd()
    this.getProjectUsersAndBots();
    this.getProjectUsersAndBotsWithoutIdentityBot();
  }
  // -----------------------------------------------------------------------------------------------------
  // @ Get all project's Agents excluding the identity bot(project-users & bots but not the identity bot ) 
  // -----------------------------------------------------------------------------------------------------
  getProjectUsersAndBotsWithoutIdentityBot() {
    // https://stackoverflow.com/questions/44004144/how-to-wait-for-two-observables-in-rxjs

    // this.projectUserAndBotsArray 
    const projectUsers = this.usersService.getProjectUsersByProjectId();
    const botsWithoutIdentityBot = this.faqKbService.getFaqKbByProjectId();

  
      zip(projectUsers, botsWithoutIdentityBot, (_projectUsers: any, _botsWithoutIdentity: any) => ({ _projectUsers, _botsWithoutIdentity }))
      .subscribe(pair => {
        this.logger.log('[TRIGGER][BASE-TRIGGER] - GET P-USERS-&-BOTS - PROJECT USERS : ', pair._projectUsers);
        this.logger.log('[TRIGGER][BASE-TRIGGER] - GET P-USERS-&-BOTS - BOTS WITHOUT IDENTITY BOT: ', pair._botsWithoutIdentity);

        if (pair && pair._projectUsers) {
          this.projectUsersList = pair._projectUsers;

          this.projectUsersList.forEach(p_user => {
            this.projectUserAndBotsWithoutIdentityBotArray.push({ id: p_user.id_user._id, label_key: p_user.id_user.firstname + ' ' + p_user.id_user.lastname });

          });

        }

        if (pair && pair._botsWithoutIdentity) {

          this.botsWithoutIdentityBot = pair._botsWithoutIdentity
            .filter(bot => {
              if (bot['trashed'] === false) {
                return true
              } else {
                return false
              }
            })
          this.logger.log('[TRIGGER][BASE-TRIGGER] - GET P-USERS-&-BOTS-WITHOUT-IDENTITY-BOT - botsWithoutIdentityBot : ', this.botsWithoutIdentityBot);

          this.botsWithoutIdentityBot.forEach(bot => {
            this.projectUserAndBotsWithoutIdentityBotArray.push({ id: bot._id, label_key: bot.name + ' (bot)' })
          });

          this.botsWithoutIdentityBot.forEach(bot => {
            this.botsWithoutIdentityBotArray.push({ id: bot._id, label_key: bot.name + ' (bot)' })
          });
        }

        this.logger.log('[TRIGGER][BASE-TRIGGER] - GET P-USERS-&-BOTS - PROJECT-USER & BOTS ARRAY WITHOUT IDENTITY BOT : ', this.projectUserAndBotsWithoutIdentityBotArray);

        // this.botsWithoutIdentityBotArray = this.projectUserAndBotsWithoutIdentityBotArray.filter((item) => {
        //   // this.logger.log('[TRIGGER][BASE-TRIGGER] - FILTER ARRAY P-USERS-&-BOTS  WITHOUT IDENTITY BOT - item: ', item);
        //   return item.label_key.includes('bot');
        // });
        // this.logger.log('[TRIGGER][BASE-TRIGGER] -  P-USERS-&-BOTS  WITHOUT IDENTITY BOT - ARRAY: ',  this.botsWithoutIdentityBotArray);


      }, error => {
        this.logger.error('[TRIGGER][BASE-TRIGGER] - GET P-USERS-&-BOTS WITHOUT IDENTITY BOT - ERROR: ', error);
      }, () => {
        this.logger.log('[TRIGGER][BASE-TRIGGER] - GET P-USERS-&-BOTS WITHOUT IDENTITY BOT - COMPLETE');
      });
  }

  // ----------------------------------------------------
  // @ Get all project's Agents (project-users & bots) 
  // ----------------------------------------------------
  getProjectUsersAndBots() {
    // https://stackoverflow.com/questions/44004144/how-to-wait-for-two-observables-in-rxjs

    const projectUsers = this.usersService.getProjectUsersByProjectId();
    const bots = this.faqKbService.getAllBotByProjectId();


    zip(projectUsers, bots, (_projectUsers: any, _bots: any) => ({ _projectUsers, _bots }))
      .subscribe(pair => {
        this.logger.log('[TRIGGER][BASE-TRIGGER] - GET P-USERS-&-BOTS - PROJECT USERS : ', pair._projectUsers);
        this.logger.log('[TRIGGER][BASE-TRIGGER] - GET P-USERS-&-BOTS - BOTS: ', pair._bots);

        if (pair && pair._projectUsers) {
          this.projectUsersList = pair._projectUsers;

          this.projectUsersList.forEach(p_user => {
            this.projectUserAndBotsArray.push({ id: p_user.id_user._id, label_key: p_user.id_user.firstname + ' ' + p_user.id_user.lastname });

          });

        }

        if (pair && pair._bots) {

          this.bots = pair._bots
            .filter(bot => {
              if (bot['trashed'] === false) {
                return true
              } else {
                return false
              }
            })

          this.bots.forEach(bot => {
            this.projectUserAndBotsArray.push({ id: bot._id, label_key: bot.name + ' (bot)' })
          });
        }

        this.logger.log('[TRIGGER][BASE-TRIGGER] - GET P-USERS-&-BOTS - PROJECT-USER & BOTS ARRAY : ', this.projectUserAndBotsArray);

      }, error => {
        this.logger.error('[TRIGGER][BASE-TRIGGER] - GET P-USERS-&-BOTS - ERROR: ', error);
      }, () => {
        this.logger.log('[TRIGGER][BASE-TRIGGER] - GET P-USERS-&-BOTS - COMPLETE');
      });
  }


  translateNotifyMsg() {
    this.translate.get('Trigger.Add_Edit.ConditionNotifyError').subscribe((text: string) => {
      this.messageCondition = text;
    });
    this.translate.get('Trigger.Add_Edit.ActionNotifyError').subscribe((text: string) => {
      this.messageAction = text;
    });
    this.translate.get('Trigger.ServerError').subscribe((text: string) => {
      this.messageServerError = text;
    });

  }

  // get all available departments by project_id and customize json for dropdown element
  getDepartments() {
    this.departmentService.getDeptsByProjectId().subscribe((_departments: any) => {
      this.logger.log('[TRIGGER][BASE-TRIGGER] - GET DEPTS RESPONSE  ', _departments);

      _departments.forEach(dept => {

        const index = this.departments.findIndex((d) => d.id === dept['id']);
        // this.logger.log('BASE-TRIGGER - GET getDefaultDept DEPTS RESPONSE departments includes dept._id  ', index);
        if (index === -1) {
          this.departments.push({ id: dept._id, label_key: dept.name, default: dept.default })
        }
        if (dept.default === true) {
          this.logger.log('[TRIGGER][BASE-TRIGGER] - GET getDefaultDept DEPTS RESPONSE default dept  ', dept);
          this.default_dept_id = dept.id
        }
      });

      this.logger.log('[TRIGGER][BASE-TRIGGER] - GET DEPTS - ARRAY : ', this.departments);

    }, error => {
      this.logger.error('[TRIGGER][BASE-TRIGGER] - GET DEPTS - ERROR: ', error);
    }, () => {
      // this.showSpinner = false;
      this.logger.log('[TRIGGER][BASE-TRIGGER] - GET DEPTS * COMPLETE *')

    });
  }

  translateBasicINFO() {
    this.translate.get('Trigger.ArrayCondition_Option_Action').subscribe((translateArray: any) => {
      this.logger.log('[TRIGGER][BASE-TRIGGER] - Translate translateArray ', translateArray)
      const translateConditions = translateArray.ConditionArray;
      const translateOptions = translateArray.OptionArray;
      const translateAction = translateArray.ActionArray;

      this.condition = [

        // ******* MESSAGE - When a chat message is sent - START *******
        {
          groupId: translateConditions.message.groupId.MessageInformation,
          id: 'text',
          key: 'message.text',
          label_key: translateConditions.message.label_key.VisitorSearchTerm,
          triggerType: 'message.create.from.requester',
          type: 'string'
        },
        {
          groupId: translateConditions.message.groupId.MessageInformation,
          id: 'senderFullname',
          key: 'message.senderFullname',
          label_key: translateConditions.message.label_key.VisitorName,
          triggerType: 'message.create.from.requester',
          type: 'string'
        },
        // {
        //   groupId: translateConditions.message.groupId.MessageInformation,
        //   id: 'attributes.userEmail',
        //   key: 'message.userEmail',
        //   label_key: translateConditions.message.label_key.VisitorMail,
        //   triggerType: 'message.create.from.requester',
        //   type: 'string'
        // },
        // // {
        // //   groupId: translateConditions.message.groupId.VisitorInformation,
        // //   id: 'attributes.departmentId',
        // //   key: 'message.attributes.departmentId',
        // //   label_key: translateConditions.message.label_key.VisitorDepartment,
        // //   triggerType: 'message.received',
        // //   type: 'boolean',
        // //   operator: this.departments,
        // //   placeholder: translateConditions.message.placeholder.SelectDepartment
        // // },
        // {
        //   groupId: translateConditions.message.groupId.MessageInformation,
        //   id: 'attributes.departmentId',
        //   key: 'message.attributes.departmentId',
        //   label_key: translateConditions.message.label_key.Department,
        //   triggerType: 'message.create.from.requester',
        //   type: 'boolean',
        //   operator: this.departments,
        //   placeholder: translateConditions.message.placeholder.SelectDepartment
        // },
        // // {
        // //   groupId: translateConditions.message.groupId.VisitorInformation,
        // //   id: 'attributes.client',
        // //   key: 'message.attributes.client',
        // //   label_key: translateConditions.message.label_key.VisitorReferrer,
        // //   triggerType: 'message.received',
        // //   type: 'string'
        // // },
        // {
        //   groupId: translateConditions.message.groupId.MessageInformation,
        //   id: 'attributes.sourcePage',
        //   key: 'message.attributes.sourcePageUrl',
        //   label_key: translateConditions.message.label_key.VisitorURL,
        //   triggerType: 'message.create.from.requester',
        //   type: 'string'
        // },
        // // {
        // //   groupId: translateConditions.message.groupId.PageInformation,
        // //   id: 'attributes.sourcePage',
        // //   key: 'message.attribute.sourcePageTitle',
        // //   label_key: translateConditions.message.label_key.VisitorPageTitle,
        // //   triggerType: 'message.received',
        // //   type: 'string'
        // // },
        // {
        //   groupId: translateConditions.message.groupId.MessageInformation,
        //   id: 'attributes.client',
        //   key: 'message.attributes.clientBrowser',
        //   label_key: translateConditions.message.label_key.VisitorBrowser,
        //   triggerType: 'message.create.from.requester',
        //   type: 'string'
        // },
        // {
        //   groupId: translateConditions.message.groupId.MessageInformation,
        //   id: 'attributes.client',
        //   key: 'message.attributes.clientPlatform',
        //   label_key: translateConditions.message.label_key.VisitorPlatform,
        //   triggerType: 'message.create.from.requester',
        //   type: 'string'
        // },

        // {
        //   groupId: translateConditions.message.groupId.MessageInformation,
        //   id: 'status',
        //   key: 'message.status',
        //   label_key: translateConditions.message.label_key.VisitorServed,
        //   triggerType: 'message.create.from.requester',
        //   type: 'boolean',
        //   operator: [
        //     { id: 200, label_key: 'True' },
        //     { id: 100, label_key: 'False' }
        //   ],
        //   placeholder: translateConditions.message.placeholder.SelectStatus
        // },

        // ******* MESSAGE - When a chat message is sent - START *******


        // ******* REQUEST - When a chat message is sent from visitor- START *******
        {
          groupId: translateConditions.message.groupId.RequestInformation,
          id: 'request.sourcePage',
          key: 'message.request.sourcePageUrl',
          label_key: translateConditions.message.label_key.VisitorURL,
          triggerType: 'message.create.from.requester',
          type: 'string'
        },
        {
          /**
           * NON FUNZIONA
           * Se l'utente è Guest, anche con il pre chat form abilitato, il campo lead.fullname non esiste.
           * Il nome dell'utente si trova sotto attributes.
           * Non dovrebbero esserci problemi se l'utente non è guest. (Da verificare)
           */
          groupId: translateConditions.message.groupId.RequestInformation,
          // chiamare contact fullname (label)
          id: 'request.lead.fullname',
          key: 'message.request.lead.fullname',
          label_key: translateConditions.message.label_key.VisitorName,
          triggerType: 'message.create.from.requester',
          type: 'string'
        },
        {
          /**
           * NON FUNZIONA
           * Se l'utente è Guest, anche con il pre chat form abilitato, il campo lead.email non esiste.
           * L'email dell'utente si trova sotto attributes.
           * Non dovrebbero esserci problemi se l'utente non è guest. (Da verificare)
           */
          groupId: translateConditions.message.groupId.RequestInformation,
          // chiamare contact email (label)
          id: 'request.lead.email',
          key: 'message.request.lead.email',
          label_key: translateConditions.message.label_key.VisitorMail,
          triggerType: 'message.create.from.requester',
          type: 'string'
        },
        {
          groupId: translateConditions.message.groupId.RequestInformation,
          id: 'request.first_text',
          key: 'message.request.first_text',
          label_key: translateConditions.message.label_key.VisitorFirstText,
          triggerType: 'message.create.from.requester',
          type: 'string'
        },
        {
          groupId: translateConditions.message.groupId.RequestInformation,
          id: 'request.userAgent',
          key: 'message.request.userAgentBrowser',
          label_key: translateConditions.message.label_key.VisitorBrowser,
          triggerType: 'message.create.from.requester',
          type: 'string'
        },
        {
          groupId: translateConditions.message.groupId.RequestInformation,
          id: 'request.userAgent',
          key: 'message.request.userAgentPlatform',
          label_key: translateConditions.message.label_key.VisitorPlatform,
          triggerType: 'message.create.from.requester',
          type: 'string'
        },
        {
          groupId: translateConditions.message.groupId.RequestInformation,
          id: 'request.agents.length',
          key: 'message.request.agents.length',
          label_key: translateConditions.message.label_key.VisitoruserAgent,
          triggerType: 'message.create.from.requester',
          type: 'int'
        },
        {
          groupId: translateConditions.message.groupId.RequestInformation,
          /**
           * NON FUNZIONA
           * Il campo request.availableAgentsCount esiste nella richiesta, ma il trigger non funziona.
           */
          // id: 'availableAgents.length',
          // key: 'request.availableAgents.length',
          id: 'request.snapshot.availableAgentsCount',
          key: 'message.request.snapshot.availableAgentsCount',
          label_key: translateConditions.message.label_key.VisitoruserAgentAvailable,
          triggerType: 'message.create.from.requester',
          type: 'int'
        },
        {
          groupId: translateConditions.message.groupId.RequestInformation,
          id: 'request.participatingBots.length',
          key: 'message.request.participatingBots.length',
          label_key: translateConditions.message.label_key.NumberOfParticipatingBot,
          triggerType: 'message.create.from.requester',
          type: 'int'
        },
        {
          groupId: translateConditions.message.groupId.RequestInformation,
          id: 'request.channel.name',
          key: 'message.request.channel.name',
          label_key: translateConditions.message.label_key.ChannelName,
          triggerType: 'message.create.from.requester',
          type: 'string'
        },
        {
          groupId: translateConditions.message.groupId.RequestInformation,
          id: 'request.language',
          key: 'message.request.language',
          label_key: translateConditions.message.label_key.VisitorCountryRegion,
          triggerType: 'message.create.from.requester',
          type: 'boolean',
          placeholder: translateConditions.message.placeholder.SelectLanguage
        },
        {
          /**
           * NON FUNZIONA
           * In request.department.name c'è il nome del dipartimento.
           * Mentre il valore che si imposta al trigger è l'id del dipartimento.
           * Cambiare path in request.department._id? (Non funziona uguale)
           */
          groupId: translateConditions.message.groupId.RequestInformation,
          id: 'request.department._id',
          key: 'message.request.department.name',
          label_key: translateConditions.message.label_key.Department,
          triggerType: 'message.create.from.requester',
          type: 'boolean',
          operator: this.departments,
          placeholder: translateConditions.message.placeholder.SelectDepartment
        },
        {
          /**
           * NON FUNZIONA
           * In request.department.hasBot = false. Il valore della condizione del trigger è false, 
           * ma non funziona ugualmente.
           */
          groupId: translateConditions.message.groupId.RequestInformation,
          id: 'request.department.hasBot',
          key: 'message.request.departmentHasBot',
          label_key: translateConditions.message.label_key.DepartmentHasBot,
          triggerType: 'message.create.from.requester',
          type: 'boolean',
          placeholder: translateConditions.message.placeholder.SelectStatus
        },
        {
          /**
           * NON FUNZIONA
           * Il campo isOpen in request non sembra esserci.
           */
          groupId: translateConditions.message.groupId.RequestInformation,
          id: 'request.isOpen',
          key: 'message.request.isOpen',    // ***** NON FUNZIONA
          label_key: translateConditions.message.label_key.OfficesAreOpen,
          triggerType: 'message.create.from.requester',
          type: 'boolean',
          placeholder: translateConditions.message.placeholder.SelectStatus
        },
        {
          groupId: translateConditions.message.groupId.RequestInformation,
          id: 'request.status',
          key: 'message.request.statusVisitorServed',
          label_key: translateConditions.message.label_key.VisitorServed,
          triggerType: 'message.create.from.requester',
          type: 'boolean',
          placeholder: translateConditions.message.placeholder.SelectStatus
        },
        {
          groupId: translateConditions.message.groupId.RequestInformation,
          id: 'request.status',
          key: 'message.request.statusRequestStatus',
          label_key: translateConditions.message.label_key.RequestStatus,
          triggerType: 'message.create.from.requester',
          type: 'int'
        },
        // ******* REQUEST - When a chat message is sent from visitor - END *******

         // ******* REQUEST - When a chat message is sent from anyone - Start *******

         {
          groupId: translateConditions.message.groupId.MessageInformation,
          id: 'text',
          key: 'message.text',
          label_key: translateConditions.message.label_key.VisitorSearchTerm,
          triggerType: 'message.received',
          type: 'string'
        },
        {
          groupId: translateConditions.message.groupId.MessageInformation,
          id: 'senderFullname',
          key: 'message.senderFullname',
          label_key: translateConditions.message.label_key.VisitorName,
          triggerType: 'message.received',
          type: 'string'
        },
         {
          groupId: translateConditions.message.groupId.RequestInformation,
          id: 'request.sourcePage',
          key: 'message.request.sourcePageUrl',
          label_key: translateConditions.message.label_key.VisitorURL,
          triggerType: 'message.received',
          type: 'string'
        },
        {
          /**
           * NON FUNZIONA
           * Se l'utente è Guest, anche con il pre chat form abilitato, il campo lead.fullname non esiste.
           * Il nome dell'utente si trova sotto attributes.
           * Non dovrebbero esserci problemi se l'utente non è guest. (Da verificare)
           */
          groupId: translateConditions.message.groupId.RequestInformation,
          // chiamare contact fullname (label)
          id: 'request.lead.fullname',
          key: 'message.request.lead.fullname',
          label_key: translateConditions.message.label_key.VisitorName,
          triggerType: 'message.received',
          type: 'string'
        },
        {
          /**
           * NON FUNZIONA
           * Se l'utente è Guest, anche con il pre chat form abilitato, il campo lead.email non esiste.
           * L'email dell'utente si trova sotto attributes.
           * Non dovrebbero esserci problemi se l'utente non è guest. (Da verificare)
           */
          groupId: translateConditions.message.groupId.RequestInformation,
          // chiamare contact email (label)
          id: 'request.lead.email',
          key: 'message.request.lead.email',
          label_key: translateConditions.message.label_key.VisitorMail,
          triggerType: 'message.received',
          type: 'string'
        },
        {
          groupId: translateConditions.message.groupId.RequestInformation,
          id: 'request.first_text',
          key: 'message.request.first_text',
          label_key: translateConditions.message.label_key.VisitorFirstText,
          triggerType: 'message.received',
          type: 'string'
        },
        {
          groupId: translateConditions.message.groupId.RequestInformation,
          id: 'request.userAgent',
          key: 'message.request.userAgentBrowser',
          label_key: translateConditions.message.label_key.VisitorBrowser,
          triggerType: 'message.received',
          type: 'string'
        },
        {
          groupId: translateConditions.message.groupId.RequestInformation,
          id: 'request.userAgent',
          key: 'message.request.userAgentPlatform',
          label_key: translateConditions.message.label_key.VisitorPlatform,
          triggerType: 'message.received',
          type: 'string'
        },
        {
          groupId: translateConditions.message.groupId.RequestInformation,
          id: 'request.agents.length',
          key: 'message.request.agents.length',
          label_key: translateConditions.message.label_key.VisitoruserAgent,
          triggerType: 'message.received',
          type: 'int'
        },
        {
          groupId: translateConditions.message.groupId.RequestInformation,
          /**
           * NON FUNZIONA
           * Il campo request.availableAgentsCount esiste nella richiesta, ma il trigger non funziona.
           */
          // id: 'availableAgents.length',
          // key: 'request.availableAgents.length',
          id: 'request.snapshot.availableAgentsCount',
          key: 'message.request.snapshot.availableAgentsCount',
          label_key: translateConditions.message.label_key.VisitoruserAgentAvailable,
          triggerType: 'message.received',
          type: 'int'
        },
        {
          groupId: translateConditions.message.groupId.RequestInformation,
          id: 'request.participatingBots.length',
          key: 'message.request.participatingBots.length',
          label_key: translateConditions.message.label_key.NumberOfParticipatingBot,
          triggerType: 'message.received',
          type: 'int'
        },
        {
          groupId: translateConditions.message.groupId.RequestInformation,
          id: 'request.channel.name',
          key: 'message.request.channel.name',
          label_key: translateConditions.message.label_key.ChannelName,
          triggerType: 'message.received',
          type: 'string'
        },
        {
          groupId: translateConditions.message.groupId.RequestInformation,
          id: 'request.language',
          key: 'message.request.language',
          label_key: translateConditions.message.label_key.VisitorCountryRegion,
          triggerType: 'message.received',
          type: 'boolean',
          placeholder: translateConditions.message.placeholder.SelectLanguage
        },
        {
          /**
           * NON FUNZIONA
           * In request.department.name c'è il nome del dipartimento.
           * Mentre il valore che si imposta al trigger è l'id del dipartimento.
           * Cambiare path in request.department._id? (Non funziona uguale)
           */
          groupId: translateConditions.message.groupId.RequestInformation,
          id: 'request.department._id',
          key: 'message.request.department.name',
          label_key: translateConditions.message.label_key.Department,
          triggerType: 'message.received',
          type: 'boolean',
          operator: this.departments,
          placeholder: translateConditions.message.placeholder.SelectDepartment
        },
        {
          /**
           * NON FUNZIONA
           * In request.department.hasBot = false. Il valore della condizione del trigger è false, 
           * ma non funziona ugualmente.
           */
          groupId: translateConditions.message.groupId.RequestInformation,
          id: 'request.department.hasBot',
          key: 'message.request.departmentHasBot',
          label_key: translateConditions.message.label_key.DepartmentHasBot,
          triggerType: 'message.received',
          type: 'boolean',
          placeholder: translateConditions.message.placeholder.SelectStatus
        },
        {
          /**
           * NON FUNZIONA
           * Il campo isOpen in request non sembra esserci.
           */
          groupId: translateConditions.message.groupId.RequestInformation,
          id: 'request.isOpen',
          key: 'message.request.isOpen',    // ***** NON FUNZIONA
          label_key: translateConditions.message.label_key.OfficesAreOpen,
          triggerType: 'message.received',
          type: 'boolean',
          placeholder: translateConditions.message.placeholder.SelectStatus
        },
        {
          groupId: translateConditions.message.groupId.RequestInformation,
          id: 'request.status',
          key: 'message.request.statusVisitorServed',
          label_key: translateConditions.message.label_key.VisitorServed,
          triggerType: 'message.received',
          type: 'boolean',
          placeholder: translateConditions.message.placeholder.SelectStatus
        },
        {
          groupId: translateConditions.message.groupId.RequestInformation,
          id: 'request.status',
          key: 'message.request.statusRequestStatus',
          label_key: translateConditions.message.label_key.RequestStatus,
          triggerType: 'message.received',
          type: 'int'
        },
         // ******* REQUEST - When a chat message is sent from anyone - END *******


        // ******* REQUEST - When a visitor request a chat - START *******
        {
          groupId: translateConditions.chat.groupId.PageInformation,
          id: 'sourcePage',
          key: 'request.sourcePageUrl',
          label_key: translateConditions.chat.label_key.VisitorURL,
          triggerType: 'request.create',
          type: 'string'
        },
        // {
        //   groupId: translateConditions.chat.groupId.PageInformation,
        //   id: 'sourcePage',
        //   key: 'request.sourcePageTitle',
        //   label_key: translateConditions.chat.label_key.VisitorPageTitle,
        //   triggerType: 'request.create',
        //   type: 'string'
        // },
        {
          groupId: translateConditions.chat.groupId.VisitorInformation,
          id: 'lead.fullname',
          key: 'request.lead.fullname',
          label_key: translateConditions.chat.label_key.VisitorName,
          triggerType: 'request.create',
          type: 'string'
        },
        {
          groupId: translateConditions.chat.groupId.VisitorInformation,
          id: 'lead.email',
          key: 'request.lead.email',
          label_key: translateConditions.chat.label_key.VisitorMail,
          triggerType: 'request.create',
          type: 'string'
        },
        {
          groupId: translateConditions.chat.groupId.VisitorInformation,
          id: 'first_text',
          key: 'request.first_text',
          label_key: translateConditions.chat.label_key.VisitorFirstText,
          triggerType: 'request.create',
          type: 'string'
        },
        // {
        //   groupId: translateConditions.chat.groupId.VisitorInformation,
        //   id: 'lead.attributes.departmentId',
        //   key: 'request.lead.attributes.departmentId',
        //   label_key: translateConditions.chat.label_key.VisitorDepartment,
        //   triggerType: 'request.create',
        //   type: 'boolean',
        //   operator: this.departments,
        //   placeholder: translateConditions.chat.placeholder.SelectDepartment
        // },
        // {
        //   groupId: translateConditions.chat.groupId.VisitorInformation,
        //   id: 'lead.attributes.client',
        //   key: 'request.lead.attributes.client',
        //   label_key: translateConditions.chat.label_key.VisitorReferrer,
        //   triggerType: 'request.create',
        //   type: 'string'
        // },
        {
          groupId: translateConditions.chat.groupId.SoftwareOfVisitor,
          id: 'userAgent',
          key: 'request.userAgentBrowser',
          label_key: translateConditions.chat.label_key.VisitorBrowser,
          triggerType: 'request.create',
          type: 'string'
        },
        {
          groupId: translateConditions.chat.groupId.SoftwareOfVisitor,
          id: 'userAgent',
          key: 'request.userAgentPlatform',
          label_key: translateConditions.chat.label_key.VisitorPlatform,
          triggerType: 'request.create',
          type: 'string'
        },
        {
          groupId: translateConditions.chat.groupId.SoftwareOfVisitor,
          id: 'agents.length',
          key: 'request.agents.length',
          label_key: translateConditions.chat.label_key.VisitoruserAgent,
          triggerType: 'request.create',
          type: 'int'
        },
        {
          groupId: translateConditions.chat.groupId.SoftwareOfVisitor,
          // id: 'availableAgents.length',
          // key: 'request.availableAgents.length',
          id: 'snapshot.availableAgentsCount',
          key: 'request.snapshot.availableAgentsCount',
          label_key: translateConditions.chat.label_key.VisitoruserAgentAvailable,
          triggerType: 'request.create',
          type: 'int'
        },
        {
          groupId: translateConditions.chat.groupId.SoftwareOfVisitor,
          id: 'participatingBots.length',
          key: 'request.participatingBots.length',
          label_key: translateConditions.chat.label_key.NumberOfParticipatingBot,
          triggerType: 'request.create',
          type: 'int'
        },
        {
          groupId: translateConditions.chat.groupId.ChannelInformation,
          id: 'channel.name',
          key: 'request.channel.name',
          label_key: translateConditions.chat.label_key.ChannelName,
          triggerType: 'request.create',
          type: 'string'
        },
        {
          groupId: translateConditions.chat.groupId.LocationVisitor,
          id: 'language',
          key: 'request.language',
          label_key: translateConditions.chat.label_key.VisitorCountryRegion,
          triggerType: 'request.create',
          type: 'boolean',
          // operator: [
          //   { id: 'zh-CN', label_key: 'Chinese' },
          //   { id: 'en-GB', label_key: 'English' },
          //   { id: 'fr-FR', label_key: 'French' },
          //   { id: 'it-IT', label_key: 'Italian' }
          // ],
          // operator: [
          //   { id: 'zh', label_key: 'Chinese' },
          //   { id: 'en', label_key: 'English' },
          //   { id: 'fr', label_key: 'French' },
          //   { id: 'it', label_key: 'Italian' },
          //   { id: 'de', label_key: 'German' },
          //   { id: 'es', label_key: 'Spanish' },
          // ],
          placeholder: translateConditions.chat.placeholder.SelectLanguage
        },
        {
          groupId: translateConditions.chat.groupId.ChatInformation,
          id: 'department.name',
          key: 'request.department.name',
          label_key: translateConditions.chat.label_key.Department,
          triggerType: 'request.create',
          type: 'boolean',
          operator: this.departments,
          placeholder: translateConditions.chat.placeholder.SelectDepartment
        },
        {
          groupId: translateConditions.chat.groupId.ChatInformation,
          id: 'department.hasBot',
          key: 'request.departmentHasBot',
          label_key: translateConditions.chat.label_key.DepartmentHasBot,
          triggerType: 'request.create',
          type: 'boolean',
          placeholder: translateConditions.chat.placeholder.SelectStatus
        },
        {
          groupId: translateConditions.chat.groupId.ChatInformation,
          id: 'isOpen',
          key: 'request.isOpen',
          label_key: translateConditions.chat.label_key.OfficesAreOpen,
          triggerType: 'request.create',
          type: 'boolean',
          placeholder: translateConditions.chat.placeholder.SelectStatus
        },
        {
          groupId: translateConditions.chat.groupId.ChatInformation,
          id: 'status',
          key: 'request.statusVisitorServed',
          label_key: translateConditions.chat.label_key.VisitorServed,
          triggerType: 'request.create',
          type: 'boolean',
          placeholder: translateConditions.chat.placeholder.SelectStatus
        },
        {
          groupId: translateConditions.chat.groupId.ChatInformation,
          id: 'status',
          key: 'request.statusRequestStatus',
          label_key: translateConditions.chat.label_key.RequestStatus,
          triggerType: 'request.create',
          type: 'int'
        },
        // ******* REQUEST - When a visitor request a chat - END *******


        // ******* USER - When user has logged in - START *******
        {
          groupId: translateConditions.user.groupId.VisitorInformation,
          id: 'firstname',
          key: 'login.firstname',
          label_key: translateConditions.user.label_key.VisitorName,
          triggerType: 'user.login',
          type: 'string'
        },
        {
          groupId: translateConditions.user.groupId.VisitorInformation,
          id: 'lastname',
          key: 'login.lastname',
          label_key: translateConditions.user.label_key.VisitorLastName,
          triggerType: 'user.login',
          type: 'string'
        },
        {
          groupId: translateConditions.user.groupId.VisitorInformation,
          id: 'email',
          key: 'login.email',
          label_key: translateConditions.user.label_key.VisitorMail,
          triggerType: 'user.login',
          type: 'string'
        },
        // ******* USER - When user has logged in - END *******


        // ******* EVENT - New event - START *******
        {
          groupId: translateConditions.event.groupId.VisitorInformation,
          id: 'name',
          key: 'event.name',
          label_key: translateConditions.event.label_key.EventName,
          triggerType: 'event.emit',
          type: 'string'
        },
        {
          groupId: translateConditions.event.groupId.VisitorInformation,
          id: 'attributes.event.code',
          key: 'event.attributes.code',
          label_key: translateConditions.event.label_key.EventCode,
          triggerType: 'event.emit',
          type: 'int'
        },
        {
          groupId: translateConditions.event.groupId.VisitorInformation,
          id: 'attributes.attributes.sourcePage',
          key: 'event.attributes.attributes.sourcePage',
          label_key: translateConditions.event.label_key.EventSourcePage,
          triggerType: 'event.emit',
          type: 'string'
        }
        // ******* EVENT - New event - END *******
      ]

      this.options = {
        stringOpt: [
          { id: 'equal', label_key: translateOptions.label_key.Equal },
          { id: 'notEqual', label_key: translateOptions.label_key.NotEqual },
          { id: 'in', label_key: translateOptions.label_key.Contains },
          { id: 'notIn', label_key: translateOptions.label_key.NotContain },
        ],
        intOpt: [
          { id: 'equal', label_key: translateOptions.label_key.Equal },
          { id: 'notEqual', label_key: translateOptions.label_key.NotEqual },
          { id: 'greaterThan', label_key: translateOptions.label_key.GreatherThan },
          { id: 'lessThan', label_key: translateOptions.label_key.LessThan },
          { id: 'greaterThanInclusive', label_key: translateOptions.label_key.GreaterEqualThan },
          { id: 'lessThanInclusive', label_key: translateOptions.label_key.LessEqualThan }
        ],
        booleanOpt: [
          { id: 'equal', label_key: translateOptions.label_key.Equal, value: true },
          { id: 'notEqual', label_key: translateOptions.label_key.NotEqual, value: false }
        ],
        keyExistOpt: [
          { id: 'hasOwnProperty', label_key: translateOptions.label_key.HasOwnProperty },
          { id: 'notHasOwnProperty', label_key: translateOptions.label_key.NotHasOwnProperty }
        ]
      }

      this.action = [
        // {
        //   key: 'message.send',
        //   label_key: translateAction.label_key.SendMessageToVisitor,
        //   type: 'input',
        //   placeholder: translateAction.placeholder.NameAgent
        // },

        {
          key: 'message.send',
          label_key: translateAction.label_key.SendMessageToVisitor,
          type: 'select',
          placeholder: translateAction.placeholder.SelectAgent
        },
        {
          key: 'email.send',
          label_key: translateAction.label_key.SendEmailToVisitor,
          type: 'select',
          placeholder: translateAction.placeholder.SelectAgent
        },
        {
          key: 'request.department.route',
          label_key: translateAction.label_key.AssignToDep,
          type: 'select',
          placeholder: translateAction.placeholder.SelectDepartment
        },
        //{ key: 'request.department.root.self', label_key: translateAction.label_key.ReAssignToSameDep, type: 'none'},
        {
          key: 'request.department.route.self', // only action first condition
          label_key: translateAction.label_key.ReAssignToSameDep,
          type: 'select',
          placeholder: translateAction.placeholder.SelectStatus
        },
        {
          key: 'request.department.bot.launch', // only action first condition
          label_key: translateAction.label_key.LaunchDeptBot,
          type: 'select',
          placeholder: ''
        },
        {
          key: 'request.status.update',
          label_key: translateAction.label_key.RequestUpdateStatus,
          type: 'select',
          placeholder: translateAction.placeholder.SelectStatus
        },
        {
          key: 'request.close', // only action first condition
          label_key: translateAction.label_key.RequestClose,
          type: 'select',
          placeholder: translateAction.placeholder.SelectStatus
        }, //none
        {
          key: 'request.reopen', // only action first condition
          label_key: translateAction.label_key.RequestReopen,
          type: 'select',
          placeholder: translateAction.placeholder.SelectStatus
        }, //none
        {
          key: 'request.participants.join',
          label_key: translateAction.label_key.RequestParticipantsJoin,
          type: 'select',
          placeholder: translateAction.placeholder.SelectAgent
        }, // dropdown con elenco utenti e bot.
        {
          key: 'request.participants.leave',
          label_key: translateAction.label_key.RequestParticipantsLeave,
          type: 'select',
          placeholder: translateAction.placeholder.SelectAgent
        },
        {
          key: 'request.bot.launch',
          label_key: translateAction.label_key.LaunchBot,
          type: 'select',
          placeholder: translateAction.placeholder.SelectBot
        },

        // dropdown con elenco utenti e bot
        //{ key: 'request.create', label_key: translateAction.label_key.RequestCreate, type: 'input', placeholder: translateAction.placeholder.NameAgent, parameters: [{key:"fullname", placeholder: "placeholder", required:true}]}
        {
          key: 'request.create',
          label_key: translateAction.label_key.RequestCreate,
          type: 'select',
          placeholder: translateAction.placeholder.SelectDepartment
          // type: 'input',
          // placeholder: translateAction.placeholder.NameAgent
        },
        {
          key: 'request.tags.add',
          label_key: translateAction.label_key.AssignLabel,
          type: 'input',
          placeholder: translateAction.placeholder.Label
        }
      ]

      // hanno lista dipartimenti
      // condizioni: 
      // key: 'message.attributes.departmentId', i.e. Department e Visitor Department quando  triggerType: 'message.received',
      // key: 'request.lead.attributes.departmentId', i.e. Visitor Department quando triggerType: 'request.create',
      // key: 'request.department.name', i.e. Department quando triggerType: 'request.create',

      // Azioni:
      // key: 'request.create', Crea richiesta
      // key: 'request.department.route', Assegna a diparimento

      this.logger.log("*** Deps: ", this.departments)

      this.operator = {
        'attributes.departmentId': this.departments,
        'lead.attributes.departmentId': this.departments,
        'message.request.department.name': this.departments,
        'department.name': this.departments,
        'request.department.name': this.departments,
        'request.department._id': this.departments,
        'status': [
          { id: 200, label_key: 'True' },
          { id: 100, label_key: 'False' }
        ],
        'request.status': [
          { id: 200, label_key: 'True' },
          { id: 100, label_key: 'False' }
        ],
        'department': [
          { id: 'id_bot', label_key: 'True' },
          { id: 'null', label_key: 'False' }
        ],
        'department.hasBot': [
          { id: true, label_key: 'True' },
          { id: false, label_key: 'False' }
        ],
        'request.department.hasBot': [
          { id: true, label_key: 'True' },
          { id: false, label_key: 'False' }
        ],
        'isOpen': [
          { id: true, label_key: 'True' },
          { id: false, label_key: 'False' }
        ],
        'request.isOpen': [
          { id: true, label_key: 'True' },
          { id: false, label_key: 'False' }
        ],
        'language': [
          { id: 'zh', label_key: 'Chinese' },
          { id: 'en', label_key: 'English' },
          { id: 'fr', label_key: 'French' },
          { id: 'it', label_key: 'Italian' },
          { id: 'de', label_key: 'German' },
          { id: 'es', label_key: 'Spanish' },
        ],
        // 'request.language': [
        //   { id: 'zh-CN', label_key: 'Chinese' },
        //   { id: 'en-GB', label_key: 'English' },
        //   { id: 'fr-FR', label_key: 'French' },
        //   { id: 'it-IT', label_key: 'Italian' },
        //   { id: 'de-DE', label_key: 'German' },
        //   { id: 'es-ES', label_key: 'Spanish' },
        // ],
        'request.language': [
          { id: 'zh', label_key: 'Chinese' },
          { id: 'en', label_key: 'English' },
          { id: 'fr', label_key: 'French' },
          { id: 'it', label_key: 'Italian' },
          { id: 'de', label_key: 'German' },
          { id: 'es', label_key: 'Spanish' },
        ],
        'message.send': this.projectUserAndBotsArray,
        'email.send': this.projectUserAndBotsArray,
        'request.department.route': this.departments,
        'request.department.route.self': [
          { id: true, label_key: 'True' },
          { id: false, label_key: 'False' }
        ],
        'request.close': [
          { id: true, label_key: 'True' },
          { id: false, label_key: 'False' }
        ],
        'request.reopen': [
          { id: true, label_key: 'True' },
          { id: false, label_key: 'False' }
        ],
        'request.participants.join': this.projectUserAndBotsWithoutIdentityBotArray,
        'request.participants.leave': this.projectUserAndBotsWithoutIdentityBotArray,
        'request.bot.launch': this.botsWithoutIdentityBotArray,
        'request.status.update': [
          { id: 100, label_key: 'Pooled' },
          { id: 200, label_key: 'Assigned' },
          { id: 1000, label_key: 'Closed' }
        ],
        'request.create': this.departments
      },
        this.logger.log('[TRIGGER][BASE-TRIGGER] No pair_cond:', this.condition)

    }, (error) => {
      this.logger.error('[TRIGGER][BASE-TRIGGER] - Translate translateArray - REQUESTS TRANSLATE FOR COND, OPT AND ACT - ERROR: ', error);
    }, () => {
      this.logger.log('[TRIGGER][BASE-TRIGGER] - Translate translateArray - REQUESTS TRANSLATE FOR COND, OPT AND ACT - COMPLETE ');
      this.showSpinner = false;
    });
  }

  //not in use?
  getTranslateAndDepartmentCallsEnd() {
    const translateArray = this.translate.get('Trigger.ArrayCondition_Option_Action')
    const _departments = this.departmentService.getDeptsByProjectId();


    zip(translateArray, _departments, (translateArray: any, _departments: any) => ({ translateArray, _departments }))
      .subscribe((pair) => {
        this.logger.log('[TRIGGER][BASE-TRIGGER] ***** pair IS USED ?', pair)


        if (pair) {
          const departments = pair._departments;
          departments.forEach(element => {
            this.departments.push({ id: element.name, label_key: element.name })
          });

          const translateConditions = pair.translateArray.ConditionArray;
          this.logger.log('[TRIGGER][BASE-TRIGGER] - TRANSLATE COND IS USED ? ', translateConditions);
          const translateOptions = pair.translateArray.OptionArray;
          const translateAction = pair.translateArray.ActionArray;
          this.condition = [
            // message.received conditions start
            { groupId: translateConditions.message.groupId.VisitorInformation, id: 'text', label_key: translateConditions.message.label_key.VisitorSearchTerm, triggerType: 'message.create.from.requester', type: 'string' },
            { groupId: translateConditions.message.groupId.VisitorInformation, id: 'senderFullname', label_key: translateConditions.message.label_key.VisitorName, triggerType: 'message.create.from.requester', type: 'string' },
            { groupId: translateConditions.message.groupId.VisitorInformation, id: 'attributes.userEmail', label_key: translateConditions.message.label_key.VisitorMail, triggerType: 'message.create.from.requester', type: 'string' },
            {
              groupId: translateConditions.message.groupId.VisitorInformation, id: 'attributes.departmentId', label_key: translateConditions.message.label_key.VisitorDepartment,
              triggerType: 'message.create.from.requester', type: 'boolean', operator: this.departments, placeholder: translateConditions.message.placeholder.SelectDepartment
            },
            { groupId: translateConditions.message.groupId.VisitorInformation, id: 'attributes.client', label_key: translateConditions.message.label_key.VisitorReferrer, triggerType: 'message.create.from.requester', type: 'string' },
            { groupId: translateConditions.message.groupId.PageInformation, id: 'attributes.sourcePage', label_key: translateConditions.message.label_key.VisitorURL, triggerType: 'message.create.from.requester', type: 'string' },
            { groupId: translateConditions.message.groupId.PageInformation, id: 'attributes.sourcePage', label_key: translateConditions.message.label_key.VisitorPageTitle, triggerType: 'message.create.from.requester', type: 'string' },
            { groupId: translateConditions.message.groupId.SoftwareOfVisitor, id: 'attributes.client', label_key: translateConditions.message.label_key.VisitorBrowser, triggerType: 'message.create.from.requester', type: 'string' },
            { groupId: translateConditions.message.groupId.SoftwareOfVisitor, id: 'attributes.client', label_key: translateConditions.message.label_key.VisitorPlatform, triggerType: 'message.create.from.requester', type: 'string' },
            {
              groupId: translateConditions.message.groupId.ChatInformation, id: 'attributes.departmentId', label_key: translateConditions.message.label_key.Department,
              triggerType: 'message.create.from.requester', type: 'boolean', operator: this.departments, placeholder: translateConditions.message.placeholder.SelectDepartment
            },
            {
              groupId: translateConditions.message.groupId.ChatInformation,
              id: 'status', label_key: translateConditions.message.label_key.VisitorServed,
              triggerType: 'message.create.from.requester', type: 'boolean', operator: [{ id: 200, label_key: 'True' },
              { id: 100, label_key: 'False' }
              ], placeholder: translateConditions.message.placeholder.SelectStatus
            },
            // request.create conditions start
            { groupId: translateConditions.chat.groupId.PageInformation, id: 'sourcePage', label_key: translateConditions.chat.label_key.VisitorURL, triggerType: 'request.create', type: 'string' },
            { groupId: translateConditions.chat.groupId.PageInformation, id: 'sourcePage', label_key: translateConditions.chat.label_key.VisitorPageTitle, triggerType: 'request.create', type: 'string' },
            { groupId: translateConditions.chat.groupId.VisitorInformation, id: 'lead.fullname', label_key: translateConditions.chat.label_key.VisitorName, triggerType: 'request.create', type: 'string' },
            { groupId: translateConditions.chat.groupId.VisitorInformation, id: 'lead.email', label_key: translateConditions.chat.label_key.VisitorMail, triggerType: 'request.create', type: 'string' },
            { groupId: translateConditions.chat.groupId.VisitorInformation, id: 'first_text', label_key: translateConditions.chat.label_key.VisitorFirstText, triggerType: 'request.create', type: 'string' },
            {
              groupId: translateConditions.chat.groupId.VisitorInformation, id: 'lead.attributes.departmentId', label_key: translateConditions.chat.label_key.VisitorDepartment,
              triggerType: 'request.create', type: 'boolean', operator: this.departments, placeholder: translateConditions.chat.placeholder.SelectDepartment
            },
            { groupId: translateConditions.chat.groupId.VisitorInformation, id: 'lead.attributes.client', label_key: translateConditions.chat.label_key.VisitorReferrer, triggerType: 'request.create', type: 'string' },
            { groupId: translateConditions.chat.groupId.SoftwareOfVisitor, id: 'userAgent', label_key: translateConditions.chat.label_key.VisitorBrowser, triggerType: 'request.create', type: 'string' },
            { groupId: translateConditions.chat.groupId.SoftwareOfVisitor, id: 'userAgent', label_key: translateConditions.chat.label_key.VisitorPlatform, triggerType: 'request.create', type: 'string' },
            { groupId: translateConditions.chat.groupId.SoftwareOfVisitor, id: 'agents.length', label_key: translateConditions.chat.label_key.VisitoruserAgent, triggerType: 'request.create', type: 'int' },
            { groupId: translateConditions.chat.groupId.SoftwareOfVisitor, id: 'availableAgents.length', label_key: translateConditions.chat.label_key.VisitoruserAgentAvailable, triggerType: 'request.create', type: 'int' },
            { groupId: translateConditions.chat.groupId.ChannelInformation, id: 'channel.name', label_key: translateConditions.chat.label_key.ChannelName, triggerType: 'request.create', type: 'string' },
            {
              groupId: translateConditions.chat.groupId.LocationVisitor, id: 'language', label_key: translateConditions.chat.label_key.VisitorCountryRegion,
              triggerType: 'request.create', type: 'boolean', operator: [{ id: 'zh-CN', label_key: 'Chinese' },
              { id: 'en-GB', label_key: 'English' },
              { id: 'fr-FR', label_key: 'Franch' },
              { id: 'it-IT', label_key: 'Italian' }
              ], placeholder: translateConditions.chat.placeholder.SelectLanguage
            },
            {
              groupId: translateConditions.chat.groupId.ChatInformation, id: 'department.name', label_key: translateConditions.chat.label_key.Department,
              triggerType: 'request.create', type: 'boolean', operator: this.departments, placeholder: translateConditions.chat.placeholder.SelectDepartment
            },
            {
              groupId: translateConditions.chat.groupId.ChatInformation, id: 'department', label_key: translateConditions.chat.label_key.DepartmentHasBot,
              triggerType: 'request.create', type: 'keyExist', operator: [{ id: 'id_bot', label_key: 'True' },
              { id: 'id_bot', label_key: 'False' }
              ], placeholder: translateConditions.chat.placeholder.SelectStatus
            },
            {
              groupId: translateConditions.chat.groupId.ChatInformation, id: 'status', label_key: translateConditions.chat.label_key.VisitorServed,
              triggerType: 'request.create', type: 'boolean', operator: [{ id: 200, label_key: 'True' },
              { id: 100, label_key: 'False' }
              ], placeholder: translateConditions.chat.placeholder.SelectStatus
            },
            { groupId: translateConditions.chat.groupId.ChatInformation, id: 'status', label_key: translateConditions.chat.label_key.RequestStatus, triggerType: 'request.create', type: 'int' },
            // user.login conditions start
            { groupId: translateConditions.user.groupId.VisitorInformation, id: 'firstname', label_key: translateConditions.user.label_key.VisitorName, triggerType: 'user.login', type: 'string' },
            { groupId: translateConditions.user.groupId.VisitorInformation, id: 'lastname', label_key: translateConditions.user.label_key.VisitorLastName, triggerType: 'user.login', type: 'string' },
            { groupId: translateConditions.user.groupId.VisitorInformation, id: 'email', label_key: translateConditions.user.label_key.VisitorMail, triggerType: 'user.login', type: 'string' },
            { groupId: translateConditions.event.groupId.VisitorInformation, id: 'name', key: 'event.name', label_key: translateConditions.event.label_key.EventName, triggerType: 'event.emit', type: 'string' },
            { groupId: translateConditions.event.groupId.VisitorInformation, id: 'attributes.event.code', key: 'event.attributes.code', label_key: translateConditions.event.label_key.EventCode, triggerType: 'event.emit', type: 'int' },
            { groupId: translateConditions.event.groupId.VisitorInformation, id: 'attributes.attributes.sourcePage', key: 'event.attributes.attributes.sourcePage', label_key: translateConditions.event.label_key.EventSourcePage, triggerType: 'event.emit', type: 'string' }

          ]

          this.options = {
            stringOpt: [
              { id: 'equal', label_key: translateOptions.label_key.Equal },
              { id: 'notEqual', label_key: translateOptions.label_key.NotEqual },
              { id: 'in', label_key: translateOptions.label_key.Contains },
              { id: 'notIn', label_key: translateOptions.label_key.NotContain },
            ],
            intOpt: [
              { id: 'equal', label_key: translateOptions.label_key.Equal },
              { id: 'notEqual', label_key: translateOptions.label_key.NotEqual },
              { id: 'greaterThan', label_key: translateOptions.label_key.GreatherThan },
              { id: 'lessThan', label_key: translateOptions.label_key.LessThan },
              { id: 'greaterThanInclusive', label_key: translateOptions.label_key.GreaterEqualThan },
              { id: 'lessThanInclusive', label_key: translateOptions.label_key.LessEqualThan }
            ],
            booleanOpt: [
              { id: 'equal', label_key: translateOptions.label_key.Equal, value: true },
              { id: 'notEqual', label_key: translateOptions.label_key.NotEqual, value: false }
            ],
            keyExistOpt: [
              { id: 'hasOwnProperty', label_key: 'Ha un bot' },
              { id: 'notHasOwnProperty', label_key: 'non ha un bot' }
            ]
          }

          this.action = [
            { key: 'message.send', label_key: translateAction.label_key.SendMessageToVisitor, type: 'input', placeholder: translateAction.placeholder.NameAgent },
            // { key: 'request.department.root', label_key: 'Assegna a dipartimento', type: 'select', placeholder: 'text here2'},
            // { key: 'request.department.root.self', label_key: 'Riassegna allo stesso dipartimento', type: 'input', placeholder: 'text here2'}
          ]

          this.logger.log("*** Deps: ", this.departments);

          this.operator = {
            'attributes.departmentId': this.departments,
            'lead.attributes.departmentId': this.departments,
            'department.name': this.departments,
            'status': [{ id: 200, label_key: 'True' },
            { id: 100, label_key: 'False' }
            ],
            'department': [{ id: 'id_bot', label_key: 'True' },
            { id: 'id__bot', label_key: 'False' }
            ],
            'language': [
              { id: 'zh-CN', label_key: 'Chinese' },
              { id: 'en-GB', label_key: 'English' },
              { id: 'fr-FR', label_key: 'French' },
              { id: 'it-IT', label_key: 'Italian' },
              { id: 'de-DE', label_key: 'German' },
              { id: 'es-ES', label_key: 'Spanish' },
            ]
          }

          this.logger.log('[TRIGGER][BASE-TRIGGER] pair_dep IS USED?', this.departments)
          this.logger.log('[TRIGGER][BASE-TRIGGER] pair_cond IS USED?', this.condition)
          this.logger.log('[TRIGGER][BASE-TRIGGER] pair_opt IS USED?', this.options)
          this.logger.log('pair_act', this.action)
        }
      }, (error) => {
        this.logger.error('[TRIGGER][BASE-TRIGGER] REQUESTS DEP or TRANSLATE - ERROR: ', error);
      }, () => {
        this.logger.log('[TRIGGER][BASE-TRIGGER] REQUESTS DEP or TRANSLATE - COMPLETE - IS USED? ');
        this.showSpinner = false;
      })

  }



}

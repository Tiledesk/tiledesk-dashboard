import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { DepartmentService } from 'app/services/mongodb-department.service'

@Component({
  selector: 'appdashboard-basetrigger',
  template: '',
})
export class BasetriggerComponent  {

  condition: any;
  options: any;
  operator: any
  action: any;

  messageCondition: string;
  messageAction: string;
  messageServerError: string;

  showSpinner = true;

  departments = []

  constructor(public translate: TranslateService,
              public departmentService: DepartmentService
              ) {
                  this.translateNotifyMsg()
                  this.getDepartments();
                  this.translateBasicINFO();
                  // this.getTranslateAndDepartmentCallsEnd()
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
      console.log('!!! NEW REQUESTS HISTORY - GET DEPTS RESPONSE by analitycs ', _departments);

      _departments.forEach(element => {
        this.departments.push({ id: element._id, label_key: element.name})
      });

    }, error => {
      console.log('!!! NEW REQUESTS HISTORY - GET DEPTS - ERROR: ', error);
    }, () => {
      // this.showSpinner = false;
      console.log('!!! NEW REQUESTS HISTORY - GET DEPTS * COMPLETE *')

    });
  }



  translateBasicINFO() {
    this.translate.get('Trigger.ArrayCondition_Option_Action').subscribe((translateArray: any) => {
      console.log('Translate TEXT ', translateArray)
      const translateConditions = translateArray.ConditionArray;
      const translateOptions = translateArray.OptionArray;
      const translateAction = translateArray.ActionArray;

      this.condition = [
        // message.received conditions start
        { groupId: translateConditions.message.groupId.VisitorInformation, id: 'text', key: 'message.text', label_key: translateConditions.message.label_key.VisitorSearchTerm, triggerType: 'message.received', type: 'string'},
        { groupId: translateConditions.message.groupId.VisitorInformation, id: 'senderFullname', key: 'message.senderFullname', label_key: translateConditions.message.label_key.VisitorName, triggerType: 'message.received', type: 'string'},
        { groupId: translateConditions.message.groupId.VisitorInformation, id: 'attributes.userEmail', key: 'message.userEmail', label_key: translateConditions.message.label_key.VisitorMail, triggerType: 'message.received', type: 'string'},
        { groupId: translateConditions.message.groupId.VisitorInformation, id: 'attributes.departmentId', key: 'message.attributes.departmentId', label_key: translateConditions.message.label_key.VisitorDepartment,
              triggerType: 'message.received', type: 'boolean', operator: this.departments, placeholder: translateConditions.message.placeholder.SelectDepartment },
        { groupId: translateConditions.message.groupId.VisitorInformation, id: 'attributes.client', key: 'message.attributes.client', label_key: translateConditions.message.label_key.VisitorReferrer, triggerType: 'message.received', type: 'string'},
        { groupId: translateConditions.message.groupId.PageInformation, id: 'attributes.sourcePage', key: 'message.attributes.sourcePageUrl', label_key: translateConditions.message.label_key.VisitorURL, triggerType: 'message.received', type: 'string'},
        { groupId: translateConditions.message.groupId.PageInformation, id: 'attributes.sourcePage', key: 'message.attribute.sourcePageTitle', label_key: translateConditions.message.label_key.VisitorPageTitle, triggerType: 'message.received', type: 'string'},
        { groupId: translateConditions.message.groupId.SoftwareOfVisitor, id: 'attributes.client', key: 'message.attributes.clientBrowser', label_key: translateConditions.message.label_key.VisitorBrowser, triggerType: 'message.received', type: 'string'},
        { groupId: translateConditions.message.groupId.SoftwareOfVisitor, id: 'attributes.client', key: 'message.attributes.clientPlatform', label_key: translateConditions.message.label_key.VisitorPlatform, triggerType: 'message.received', type: 'string'},
        { groupId: translateConditions.message.groupId.ChatInformation, id: 'attributes.departmentId', key: 'message.attributes.departmentId', label_key: translateConditions.message.label_key.Department,
              triggerType: 'message.received', type: 'boolean', operator: this.departments, placeholder: translateConditions.message.placeholder.SelectDepartment},
        { groupId: translateConditions.message.groupId.ChatInformation, id: 'status', key: 'message.status', label_key: translateConditions.message.label_key.VisitorServed,
              triggerType: 'message.received', type: 'boolean', operator: [ {id: 200, label_key: 'True'},
                                                                            {id: 100, label_key: 'False'}
                                                              ], placeholder: translateConditions.message.placeholder.SelectStatus},
        // request.create conditions start
        { groupId: translateConditions.chat.groupId.PageInformation, id: 'sourcePage', key: 'request.sourcePageUrl', label_key: translateConditions.chat.label_key.VisitorURL, triggerType: 'request.create', type: 'string'},
        { groupId: translateConditions.chat.groupId.PageInformation, id: 'sourcePage', key: 'request.sourcePageTitle', label_key: translateConditions.chat.label_key.VisitorPageTitle, triggerType: 'request.create', type: 'string'},
        { groupId: translateConditions.chat.groupId.VisitorInformation, id: 'lead.fullname', key: 'request.lead.fullname', label_key: translateConditions.chat.label_key.VisitorName, triggerType: 'request.create', type: 'string'},
        { groupId: translateConditions.chat.groupId.VisitorInformation, id: 'lead.email', key: 'request.lead.email', label_key: translateConditions.chat.label_key.VisitorMail, triggerType: 'request.create', type: 'string'},
        { groupId: translateConditions.chat.groupId.VisitorInformation, id: 'first_text', key: 'request.first_text', label_key: translateConditions.chat.label_key.VisitorFirstText, triggerType: 'request.create', type: 'string'},
        { groupId: translateConditions.chat.groupId.VisitorInformation, id: 'lead.attributes.departmentId', key: 'request.lead.attributes.departmentId', label_key: translateConditions.chat.label_key.VisitorDepartment,
              triggerType: 'request.create', type: 'boolean', operator: this.departments, placeholder: translateConditions.chat.placeholder.SelectDepartment},
        { groupId: translateConditions.chat.groupId.VisitorInformation, id: 'lead.attributes.client', key: 'request.lead.attributes.client', label_key: translateConditions.chat.label_key.VisitorReferrer, triggerType: 'request.create', type: 'string'},
        { groupId: translateConditions.chat.groupId.SoftwareOfVisitor, id: 'userAgent', key: 'request.userAgentBrowser', label_key: translateConditions.chat.label_key.VisitorBrowser, triggerType: 'request.create', type: 'string'},
        { groupId: translateConditions.chat.groupId.SoftwareOfVisitor, id: 'userAgent', key: 'request.userAgentPlatform', label_key: translateConditions.chat.label_key.VisitorPlatform, triggerType: 'request.create', type: 'string'},
        { groupId: translateConditions.chat.groupId.SoftwareOfVisitor, id: 'agents.length', key: 'request.agents.length', label_key: translateConditions.chat.label_key.VisitoruserAgent, triggerType: 'request.create', type: 'int'},
        { groupId: translateConditions.chat.groupId.SoftwareOfVisitor, id: 'availableAgents.length', key: 'request.availableAgents.length', label_key: translateConditions.chat.label_key.VisitoruserAgentAvailable, triggerType: 'request.create', type: 'int'},
        { groupId: translateConditions.chat.groupId.ChannelInformation, id: 'channel.name', key: 'request.channel.name', label_key: translateConditions.chat.label_key.ChannelName, triggerType: 'request.create', type: 'string'},
        { groupId: translateConditions.chat.groupId.LocationVisitor, id: 'language', key: 'request.language', label_key: translateConditions.chat.label_key.VisitorCountryRegion,
              triggerType: 'request.create', type: 'boolean', operator: [ { id: 'zh-CN', label_key: 'Chinese'},
                                                                          { id: 'en-GB', label_key: 'English'},
                                                                          { id: 'fr-FR', label_key: 'Franch'},
                                                                          { id: 'it-IT', label_key: 'Italian'}
                                                                      ], placeholder: translateConditions.chat.placeholder.SelectLanguage},
        { groupId: translateConditions.chat.groupId.ChatInformation, id: 'department.name', key: 'request.department.name', label_key: translateConditions.chat.label_key.Department,
              triggerType: 'request.create', type: 'boolean', operator: this.departments, placeholder: translateConditions.chat.placeholder.SelectDepartment },
        { groupId: translateConditions.chat.groupId.ChatInformation, id: 'department', key: 'request.departmentHasBot', label_key: translateConditions.chat.label_key.DepartmentHasBot,
              triggerType: 'request.create', type: 'keyExist', operator: [ {id: 'id_bot', label_key: 'True'},
                                                                          {id: 'null', label_key: 'False'}
                                                                        ], placeholder: translateConditions.chat.placeholder.SelectStatus },
        { groupId: translateConditions.chat.groupId.ChatInformation, id: 'status', key: 'request.statusVisitorServed', label_key: translateConditions.chat.label_key.VisitorServed,
              triggerType: 'request.create', type: 'boolean', placeholder: translateConditions.chat.placeholder.SelectStatus},
        { groupId: translateConditions.chat.groupId.ChatInformation, id: 'status', key: 'request.statusRequestStatus', label_key: translateConditions.chat.label_key.RequestStatus, triggerType: 'request.create', type: 'int'},
        // user.login conditions start
        { groupId: translateConditions.user.groupId.VisitorInformation, id: 'firstname', key: 'login.firstname', label_key: translateConditions.user.label_key.VisitorName, triggerType: 'user.login', type: 'string'},
        { groupId: translateConditions.user.groupId.VisitorInformation, id: 'lastname', key: 'login.lastname', label_key: translateConditions.user.label_key.VisitorLastName, triggerType: 'user.login', type: 'string'},
        { groupId: translateConditions.user.groupId.VisitorInformation, id: 'email', key: 'login.email', label_key: translateConditions.user.label_key.VisitorMail, triggerType: 'user.login', type: 'string'},
        { groupId: translateConditions.event.groupId.VisitorInformation, id: 'name', key: 'event.name', label_key: translateConditions.event.label_key.EventName, triggerType: 'event.emit', type: 'string'}
  ]

      this.options = {
        stringOpt: [
          { id: 'equal', label_key: translateOptions.label_key.Equal},
          { id: 'notEqual', label_key: translateOptions.label_key.NotEqual},
          { id: 'in', label_key: translateOptions.label_key.Contains},
          { id: 'notIn', label_key: translateOptions.label_key.NotContain},
        ],
        intOpt: [
          { id: 'equal', label_key: translateOptions.label_key.Equal},
          { id: 'notEqual', label_key: translateOptions.label_key.NotEqual},
          { id: 'greaterThan', label_key: translateOptions.label_key.GreatherThan},
          { id: 'lessThan', label_key: translateOptions.label_key.LessThan},
          { id: 'greaterThanInclusive', label_key: translateOptions.label_key.GreaterEqualThan},
          { id: 'lessThanInclusive', label_key: translateOptions.label_key.LessEqualThan}
        ],
        booleanOpt: [
          { id: 'equal', label_key: translateOptions.label_key.Equal, value: true},
          { id: 'notEqual', label_key: translateOptions.label_key.NotEqual, value: false}
        ],
        keyExistOpt: [
          {id: 'hasOwnProperty', label_key: translateOptions.label_key.HasOwnProperty},
          {id: 'notHasOwnProperty', label_key: translateOptions.label_key.NotHasOwnProperty}
        ]
      }

      this.action = [
        { key: 'message.send', label_key: translateAction.label_key.SendMessageToVisitor, type: 'input', placeholder: translateAction.placeholder.NameAgent},
        { key: 'request.department.root', label_key: translateAction.label_key.AssignToDep, type: 'select', placeholder: translateAction.placeholder.SelectDepartment},
        //{ key: 'request.department.root.self', label_key: translateAction.label_key.ReAssignToSameDep, type: 'none'},
        { key: 'request.department.root.self', label_key: translateAction.label_key.ReAssignToSameDep, type: 'select', placeholder: translateAction.placeholder.SelectStatus}, //none
        { key: 'request.status.update', label_key: translateAction.label_key.RequestUpdateStatus, type: 'select', placeholder: translateAction.placeholder.SelectStatus},
        { key: 'request.close', label_key: translateAction.label_key.RequestClose, type: 'select', placeholder: translateAction.placeholder.SelectStatus}, //none
        { key: 'request.reopen', label_key: translateAction.label_key.RequestReopen, type: 'select', placeholder: translateAction.placeholder.SelectStatus}, //none
        { key: 'request.participants.join', label_key: translateAction.label_key.RequestParticipantsJoin, type: 'select', placeholder: translateAction.placeholder.SelectStatus}, // dropdown con elenco utenti e bot.
        { key: 'request.participants.leave', label_key: translateAction.label_key.RequestParticipantsLeave, type: 'select', placeholder: translateAction.placeholder.SelectStatus}, // dropdown con elenco utenti e bot
        //{ key: 'request.create', label_key: translateAction.label_key.RequestCreate, type: 'input', placeholder: translateAction.placeholder.NameAgent, parameters: [{key:"fullname", placeholder: "placeholder", required:true}]}
        { key: 'request.create', label_key: translateAction.label_key.RequestCreate, type: 'input', placeholder: translateAction.placeholder.NameAgent} //
      ]

      this.operator = {
        'attributes.departmentId':  this.departments ,
        'lead.attributes.departmentId': this.departments,
        'department.name': this.departments,
        'status': [ {id: 200, label_key: 'True'},
                    {id: 100, label_key: 'False'}
        ],
        'department': [ {id: 'id_bot', label_key: 'True'},
                        {id: 'null', label_key: 'False'}
        ],
        'language': [ { id: 'zh-CN', label_key: 'Chinese'},
                      { id: 'en-GB', label_key: 'English'},
                      { id: 'fr-FR', label_key: 'Franch'},
                      { id: 'it-IT', label_key: 'Italian'},
                      { id: 'de-DE', label_key: 'German'},
                      { id: 'es-ES', label_key: 'Spanish'},
        ],
        'request.department.root' : this.departments,
        'request.department.root.self' : [ {id: true, label_key: 'True'},
                                           {id: false, label_key: 'False'}
                                          ],
        'request.close' : [ {id: true, label_key: 'True'},
                                           {id: false, label_key: 'False'}
                          ],
        'request.reopen' : [ {id: true, label_key: 'True'},
                                           {id: false, label_key: 'False'}
                          ],
        'request.participants.join' : [ {id: true, label_key: 'True'},
                          {id: false, label_key: 'False'}
                          ],                          
        'request.participants.leave' : [ {id: true, label_key: 'True'},
                                      {id: false, label_key: 'False'}
                                        ],                                                                      
        'request.status.update' : [{id: 100, label_key: 'Pooled'},
                                  {id: 200, label_key: 'Assigned'}]
      }
      console.log('No pair_cond:', this.condition)

    }, (error) => {
      console.log('!!!  REQUESTS TRANSLATE FOR COND, OPT AND ACT - ERROR: ', error);
    }, () => {
      console.log('!!!  REQUESTS TRANSLATE FOR COND, OPT AND ACT - COMPLETE ');
      this.showSpinner = false;
    });
  }

//not in use?
  getTranslateAndDepartmentCallsEnd() {
    const translateArray = this.translate.get('Trigger.ArrayCondition_Option_Action')
    const _departments = this.departmentService.getDeptsByProjectId();


    Observable.zip(translateArray, _departments, (translateArray: any, _departments: any) => ({ translateArray, _departments}))
    .subscribe( (pair) => {
      console.log('pair', pair)


      if (pair) {
        const departments = pair._departments;
        departments.forEach(element => {
          this.departments.push({ id: element._id, label_key: element.name})
        });

        const translateConditions = pair.translateArray.ConditionArray;
        const translateOptions = pair.translateArray.OptionArray;
        const translateAction = pair.translateArray.ActionArray;
        this.condition = [
          // message.received conditions start
          { groupId: translateConditions.message.groupId.VisitorInformation, id: 'text', label_key: translateConditions.message.label_key.VisitorSearchTerm, triggerType: 'message.received', type: 'string'},
          { groupId: translateConditions.message.groupId.VisitorInformation, id: 'senderFullname', label_key: translateConditions.message.label_key.VisitorName, triggerType: 'message.received', type: 'string'},
          { groupId: translateConditions.message.groupId.VisitorInformation, id: 'attributes.userEmail', label_key: translateConditions.message.label_key.VisitorMail, triggerType: 'message.received', type: 'string'},
          { groupId: translateConditions.message.groupId.VisitorInformation, id: 'attributes.departmentId', label_key: translateConditions.message.label_key.VisitorDepartment,
                triggerType: 'message.received', type: 'boolean', operator: this.departments, placeholder: translateConditions.message.placeholder.SelectDepartment },
          { groupId: translateConditions.message.groupId.VisitorInformation, id: 'attributes.client', label_key: translateConditions.message.label_key.VisitorReferrer, triggerType: 'message.received', type: 'string'},
          { groupId: translateConditions.message.groupId.PageInformation, id: 'attributes.sourcePage', label_key: translateConditions.message.label_key.VisitorURL, triggerType: 'message.received', type: 'string'},
          { groupId: translateConditions.message.groupId.PageInformation, id: 'attributes.sourcePage', label_key: translateConditions.message.label_key.VisitorPageTitle, triggerType: 'message.received', type: 'string'},
          { groupId: translateConditions.message.groupId.SoftwareOfVisitor, id: 'attributes.client', label_key: translateConditions.message.label_key.VisitorBrowser, triggerType: 'message.received', type: 'string'},
          { groupId: translateConditions.message.groupId.SoftwareOfVisitor, id: 'attributes.client', label_key: translateConditions.message.label_key.VisitorPlatform, triggerType: 'message.received', type: 'string'},
          { groupId: translateConditions.message.groupId.ChatInformation, id: 'attributes.departmentId', label_key: translateConditions.message.label_key.Department,
                triggerType: 'message.received', type: 'boolean', operator: this.departments, placeholder: translateConditions.message.placeholder.SelectDepartment},
          { groupId: translateConditions.message.groupId.ChatInformation, id: 'status', label_key: translateConditions.message.label_key.VisitorServed,
                triggerType: 'message.received', type: 'boolean', operator: [ {id: 200, label_key: 'True'},
                                                                              {id: 100, label_key: 'False'}
                                                                ], placeholder: translateConditions.message.placeholder.SelectStatus},
          // request.create conditions start
          { groupId: translateConditions.chat.groupId.PageInformation, id: 'sourcePage', label_key: translateConditions.chat.label_key.VisitorURL, triggerType: 'request.create', type: 'string'},
          { groupId: translateConditions.chat.groupId.PageInformation, id: 'sourcePage', label_key: translateConditions.chat.label_key.VisitorPageTitle, triggerType: 'request.create', type: 'string'},
          { groupId: translateConditions.chat.groupId.VisitorInformation, id: 'lead.fullname', label_key: translateConditions.chat.label_key.VisitorName, triggerType: 'request.create', type: 'string'},
          { groupId: translateConditions.chat.groupId.VisitorInformation, id: 'lead.email', label_key: translateConditions.chat.label_key.VisitorMail, triggerType: 'request.create', type: 'string'},
          { groupId: translateConditions.chat.groupId.VisitorInformation, id: 'first_text', label_key: translateConditions.chat.label_key.VisitorFirstText, triggerType: 'request.create', type: 'string'},
          { groupId: translateConditions.chat.groupId.VisitorInformation, id: 'lead.attributes.departmentId', label_key: translateConditions.chat.label_key.VisitorDepartment,
                triggerType: 'request.create', type: 'boolean', operator: this.departments, placeholder: translateConditions.chat.placeholder.SelectDepartment},
          { groupId: translateConditions.chat.groupId.VisitorInformation, id: 'lead.attributes.client', label_key: translateConditions.chat.label_key.VisitorReferrer, triggerType: 'request.create', type: 'string'},
          { groupId: translateConditions.chat.groupId.SoftwareOfVisitor, id: 'userAgent', label_key: translateConditions.chat.label_key.VisitorBrowser, triggerType: 'request.create', type: 'string'},
          { groupId: translateConditions.chat.groupId.SoftwareOfVisitor, id: 'userAgent', label_key: translateConditions.chat.label_key.VisitorPlatform, triggerType: 'request.create', type: 'string'},
          { groupId: translateConditions.chat.groupId.SoftwareOfVisitor, id: 'agents.length', label_key: translateConditions.chat.label_key.VisitoruserAgent, triggerType: 'request.create', type: 'int'},
          { groupId: translateConditions.chat.groupId.SoftwareOfVisitor, id: 'availableAgents.length', label_key: translateConditions.chat.label_key.VisitoruserAgentAvailable, triggerType: 'request.create', type: 'int'},
          { groupId: translateConditions.chat.groupId.ChannelInformation, id: 'channel.name', label_key: translateConditions.chat.label_key.ChannelName, triggerType: 'request.create', type: 'string'},
          { groupId: translateConditions.chat.groupId.LocationVisitor, id: 'language', label_key: translateConditions.chat.label_key.VisitorCountryRegion,
                triggerType: 'request.create', type: 'boolean', operator: [ { id: 'zh-CN', label_key: 'Chinese'},
                                                                            { id: 'en-GB', label_key: 'English'},
                                                                            { id: 'fr-FR', label_key: 'Franch'},
                                                                            { id: 'it-IT', label_key: 'Italian'}
                                                                        ], placeholder: translateConditions.chat.placeholder.SelectLanguage},
          { groupId: translateConditions.chat.groupId.ChatInformation, id: 'department.name', label_key: translateConditions.chat.label_key.Department,
                triggerType: 'request.create', type: 'boolean', operator: this.departments, placeholder: translateConditions.chat.placeholder.SelectDepartment },
          { groupId: translateConditions.chat.groupId.ChatInformation, id: 'department', label_key: translateConditions.chat.label_key.DepartmentHasBot,
                triggerType: 'request.create', type: 'keyExist', operator: [ {id: 'id_bot', label_key: 'True'},
                                                                            {id: 'id_bot', label_key: 'False'}
                                                                          ], placeholder: translateConditions.chat.placeholder.SelectStatus },
          { groupId: translateConditions.chat.groupId.ChatInformation, id: 'status', label_key: translateConditions.chat.label_key.VisitorServed,
                triggerType: 'request.create', type: 'boolean', operator: [ {id: 200, label_key: 'True'},
                                                                            {id: 100, label_key: 'False'}
                                                                ], placeholder: translateConditions.chat.placeholder.SelectStatus},
          { groupId: translateConditions.chat.groupId.ChatInformation, id: 'status', label_key: translateConditions.chat.label_key.RequestStatus, triggerType: 'request.create', type: 'int'},
          // user.login conditions start
          { groupId: translateConditions.user.groupId.VisitorInformation, id: 'firstname', label_key: translateConditions.user.label_key.VisitorName, triggerType: 'user.login', type: 'string'},
          { groupId: translateConditions.user.groupId.VisitorInformation, id: 'lastname', label_key: translateConditions.user.label_key.VisitorLastName, triggerType: 'user.login', type: 'string'},
          { groupId: translateConditions.user.groupId.VisitorInformation, id: 'email', label_key: translateConditions.user.label_key.VisitorMail, triggerType: 'user.login', type: 'string'},
          { groupId: translateConditions.event.groupId.VisitorInformation, id: 'name', key: 'event.name', label_key: translateConditions.event.label_key.EventName, triggerType: 'event.emit', type: 'string'}
        ]

        this.options = {
          stringOpt: [
            { id: 'equal', label_key: translateOptions.label_key.Equal},
            { id: 'notEqual', label_key: translateOptions.label_key.NotEqual},
            { id: 'in', label_key: translateOptions.label_key.Contains},
            { id: 'notIn', label_key: translateOptions.label_key.NotContain},
          ],
          intOpt: [
            { id: 'equal', label_key: translateOptions.label_key.Equal},
            { id: 'notEqual', label_key: translateOptions.label_key.NotEqual},
            { id: 'greaterThan', label_key: translateOptions.label_key.GreatherThan},
            { id: 'lessThan', label_key: translateOptions.label_key.LessThan},
            { id: 'greaterThanInclusive', label_key: translateOptions.label_key.GreaterEqualThan},
            { id: 'lessThanInclusive', label_key: translateOptions.label_key.LessEqualThan}
          ],
          booleanOpt: [
            { id: 'equal', label_key: translateOptions.label_key.Equal, value: true},
            { id: 'notEqual', label_key: translateOptions.label_key.NotEqual, value: false}
          ],
          keyExistOpt: [
            {id: 'hasOwnProperty', label_key: 'Ha un bot'},
            {id: 'notHasOwnProperty', label_key: 'non ha un bot'}
          ]
        }

        this.action = [
          { key: 'message.send', label_key: translateAction.label_key.SendMessageToVisitor, type: 'input', placeholder: translateAction.placeholder.NameAgent},
          // { key: 'request.department.root', label_key: 'Assegna a dipartimento', type: 'select', placeholder: 'text here2'},
          // { key: 'request.department.root.self', label_key: 'Riassegna allo stesso dipartimento', type: 'input', placeholder: 'text here2'}
        ]

        this.operator = {
          'attributes.departmentId':  this.departments ,
          'lead.attributes.departmentId': this.departments,
          'department.name': this.departments,
          'status': [ {id: 200, label_key: 'True'},
                      {id: 100, label_key: 'False'}
          ],
          'department': [ {id: 'id_bot', label_key: 'True'},
                          {id: 'id__bot', label_key: 'False'}
          ],
          'language': [ { id: 'zh-CN', label_key: 'Chinese'},
                        { id: 'en-GB', label_key: 'English'},
                        { id: 'fr-FR', label_key: 'Franch'},
                        { id: 'it-IT', label_key: 'Italian'},
                        { id: 'de-DE', label_key: 'German'},
                        { id: 'es-ES', label_key: 'Spanish'},
          ]
        }

      console.log('pair_dep', this.departments)
      console.log('pair_cond', this.condition)
      console.log('pair_opt', this.options)
      console.log('pair_act', this.action)
      }
    }, (error) => {
      console.log('!!!  REQUESTS DEP or TRANSLATE - ERROR: ', error);
    }, () => {
      console.log('!!!  REQUESTS DEP or TRANSLATE - COMPLETE ');
      this.showSpinner = false;
    })

  }



}

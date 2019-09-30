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
            { groupId: translateConditions.message.groupId.VisitorInformation, id: 'text', label_key: translateConditions.message.label_key.VisitorSearchTerm, triggerType: 'message.received', type: 'string'},
            { groupId: translateConditions.message.groupId.VisitorInformation, id: 'senderFullname', label_key: translateConditions.message.label_key.VisitorName, triggerType: 'message.received', type: 'string'},
            { groupId: translateConditions.message.groupId.VisitorInformation, id: 'attributes.userEmail', label_key: translateConditions.message.label_key.VisitorMail, triggerType: 'message.received', type: 'string'},
            { groupId: translateConditions.message.groupId.VisitorInformation, id: 'attributes.departmentId', label_key: translateConditions.message.label_key.VisitorDepartment,
                  triggerType: 'message.received', type: 'boolean', operator: this.departments },
            { groupId: translateConditions.message.groupId.VisitorInformation, id: 'attributes.client', label_key: translateConditions.message.label_key.VisitorReferrer, triggerType: 'message.received', type: 'string'},
            { groupId: translateConditions.message.groupId.PageInformation, id: 'attributes.sourcePage', label_key: translateConditions.message.label_key.VisitorURL, triggerType: 'message.received', type: 'string'},
            { groupId: translateConditions.message.groupId.PageInformation, id: 'attributes.sourcePage', label_key: translateConditions.message.label_key.VisitorPageTitle, triggerType: 'message.received', type: 'string'},
            { groupId: translateConditions.message.groupId.SoftwareOfVisitor, id: 'attributes.client', label_key: translateConditions.message.label_key.VisitorBrowser, triggerType: 'message.received', type: 'string'},
            { groupId: translateConditions.message.groupId.SoftwareOfVisitor, id: 'attributes.client', label_key: translateConditions.message.label_key.VisitorPlatform, triggerType: 'message.received', type: 'string'},
            { groupId: translateConditions.message.groupId.ChatInformation, id: 'attributes.departmentId', label_key: translateConditions.message.label_key.Department,
                  triggerType: 'message.received', type: 'boolean', operator: this.departments },
            { groupId: translateConditions.message.groupId.ChatInformation, id: 'status', label_key: translateConditions.message.label_key.VisitorServed,
                  triggerType: 'message.received', type: 'boolean', operator: [ {id: 200, label_key: 'True'},
                                                                                {id: 100, label_key: 'False'}
                                                                  ]},
            // request.create conditions start
            { groupId: translateConditions.chat.groupId.PageInformation, id: 'sourcePage', label_key: translateConditions.chat.label_key.VisitorURL, triggerType: 'request.create', type: 'string'},
            { groupId: translateConditions.chat.groupId.PageInformation, id: 'sourcePage', label_key: translateConditions.chat.label_key.VisitorPageTitle, triggerType: 'request.create', type: 'string'},
            { groupId: translateConditions.chat.groupId.VisitorInformation, id: 'lead.fullname', label_key: translateConditions.chat.label_key.VisitorName, triggerType: 'request.create', type: 'string'},
            { groupId: translateConditions.chat.groupId.VisitorInformation, id: 'lead.email', label_key: translateConditions.chat.label_key.VisitorMail, triggerType: 'request.create', type: 'string'},
            { groupId: translateConditions.chat.groupId.VisitorInformation, id: 'lead.attributes.departmentName', label_key: translateConditions.chat.label_key.VisitorDepartment,
                  triggerType: 'request.create', type: 'boolean', operator: this.departments},
            { groupId: translateConditions.chat.groupId.VisitorInformation, id: 'lead.attributes.client', label_key: translateConditions.chat.label_key.VisitorReferrer, triggerType: 'request.create', type: 'string'},
            { groupId: translateConditions.chat.groupId.SoftwareOfVisitor, id: 'userAgent', label_key: translateConditions.chat.label_key.VisitorBrowser, triggerType: 'request.create', type: 'string'},
            { groupId: translateConditions.chat.groupId.SoftwareOfVisitor, id: 'userAgent', label_key: translateConditions.chat.label_key.VisitorPlatform, triggerType: 'request.create', type: 'string'},
            { groupId: translateConditions.chat.groupId.SoftwareOfVisitor, id: 'agents.length', label_key: translateConditions.chat.label_key.VisitoruserAgent, triggerType: 'request.create', type: 'int'},
            { groupId: translateConditions.chat.groupId.ChannelInformation, id: 'channel.name', label_key: translateConditions.chat.label_key.ChannelName, triggerType: 'request.create', type: 'string'},
            { groupId: translateConditions.chat.groupId.LocationVisitor, id: 'language', label_key: translateConditions.chat.label_key.VisitorCountryRegion,
                  triggerType: 'request.create', type: 'boolean', operator: [ { id: 'zh-CN', label_key: 'Chinese'},
                                                                              { id: 'en-GB', label_key: 'English'},
                                                                              { id: 'fr-FR', label_key: 'Franch'},
                                                                              { id: 'it-IT', label_key: 'Italian'}
                                                                          ]},
            { groupId: translateConditions.chat.groupId.ChatInformation, id: 'department.name', label_key: translateConditions.chat.label_key.Department,
                  triggerType: 'request.create', type: 'boolean', operator: this.departments},
            { groupId: translateConditions.chat.groupId.ChatInformation, id: 'status', label_key: translateConditions.chat.label_key.VisitorServed,
                  triggerType: 'request.create', type: 'boolean', operator: [ {id: 200, label_key: 'True'},
                                                                              {id: 100, label_key: 'False'}
                                                                  ]},

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
        ]
      }

      this.action = [
        { key: 'message.send', label_key: translateAction.label_key.SendMessageToVisitor, type: 'input', placeholder: translateAction.placeholder.NameAgent},
        // { key: 'message.received', label_key: 'Ricevi messaggio', type: 'select', placeholder: 'text here2'},
        // { key: 'wait', label_key: 'Attesa', type: 'input', placeholder: 'text here2'}
      ]
      console.log('No pair_cond:', this.condition)

    }, (error) => {
      console.log('!!!  REQUESTS TRANSLATE FOR COND OPT AND ACT - ERROR: ', error);
    }, () => {
      console.log('!!!  REQUESTS TRANSLATE FOR COND OPT AND ACT - COMPLETE ');
      this.showSpinner = false;
    });
  }


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
                  triggerType: 'message.received', type: 'boolean', operator: this.departments },
            { groupId: translateConditions.message.groupId.VisitorInformation, id: 'attributes.client', label_key: translateConditions.message.label_key.VisitorReferrer, triggerType: 'message.received', type: 'string'},
            { groupId: translateConditions.message.groupId.PageInformation, id: 'attributes.sourcePage', label_key: translateConditions.message.label_key.VisitorURL, triggerType: 'message.received', type: 'string'},
            { groupId: translateConditions.message.groupId.PageInformation, id: 'attributes.sourcePage', label_key: translateConditions.message.label_key.VisitorPageTitle, triggerType: 'message.received', type: 'string'},
            { groupId: translateConditions.message.groupId.SoftwareOfVisitor, id: 'attributes.client', label_key: translateConditions.message.label_key.VisitorBrowser, triggerType: 'message.received', type: 'string'},
            { groupId: translateConditions.message.groupId.SoftwareOfVisitor, id: 'attributes.client', label_key: translateConditions.message.label_key.VisitorPlatform, triggerType: 'message.received', type: 'string'},
            { groupId: translateConditions.message.groupId.ChatInformation, id: 'attributes.departmentName', label_key: translateConditions.message.label_key.Department,
                  triggerType: 'message.received', type: 'boolean', operator: this.departments },
            { groupId: translateConditions.message.groupId.ChatInformation, id: 'status', label_key: translateConditions.message.label_key.VisitorServed,
                  triggerType: 'message.received', type: 'boolean', operator: [ {id: 200, label_key: 'True'},
                                                                                {id: 100, label_key: 'False'}
                                                                  ]},
            // request.create conditions start
            { groupId: translateConditions.chat.groupId.PageInformation, id: 'sourcePage', label_key: translateConditions.chat.label_key.VisitorURL, triggerType: 'request.create', type: 'string'},
            { groupId: translateConditions.chat.groupId.PageInformation, id: 'sourcePage', label_key: translateConditions.chat.label_key.VisitorPageTitle, triggerType: 'request.create', type: 'string'},
            { groupId: translateConditions.chat.groupId.VisitorInformation, id: 'lead.fullname', label_key: translateConditions.chat.label_key.VisitorName, triggerType: 'request.create', type: 'string'},
            { groupId: translateConditions.chat.groupId.VisitorInformation, id: 'lead.email', label_key: translateConditions.chat.label_key.VisitorMail, triggerType: 'request.create', type: 'string'},
            { groupId: translateConditions.chat.groupId.VisitorInformation, id: 'lead.attributes.departmentName', label_key: translateConditions.chat.label_key.VisitorDepartment,
                  triggerType: 'request.create', type: 'boolean', operator: this.departments},
            { groupId: translateConditions.chat.groupId.VisitorInformation, id: 'lead.attributes.client', label_key: translateConditions.chat.label_key.VisitorReferrer, triggerType: 'request.create', type: 'string'},
            { groupId: translateConditions.chat.groupId.SoftwareOfVisitor, id: 'userAgent', label_key: translateConditions.chat.label_key.VisitorBrowser, triggerType: 'request.create', type: 'string'},
            { groupId: translateConditions.chat.groupId.SoftwareOfVisitor, id: 'userAgent', label_key: translateConditions.chat.label_key.VisitorPlatform, triggerType: 'request.create', type: 'string'},
            { groupId: translateConditions.chat.groupId.SoftwareOfVisitor, id: 'agents.length', label_key: translateConditions.chat.label_key.VisitoruserAgent, triggerType: 'request.create', type: 'int'},
            { groupId: translateConditions.chat.groupId.ChannelInformation, id: 'channel.name', label_key: translateConditions.chat.label_key.ChannelName, triggerType: 'request.create', type: 'string'},
            { groupId: translateConditions.chat.groupId.LocationVisitor, id: 'language', label_key: translateConditions.chat.label_key.VisitorCountryRegion,
                  triggerType: 'request.create', type: 'boolean', operator: [ { id: 'zh-CN', label_key: 'Chinese'},
                                                                              { id: 'en-GB', label_key: 'English'},
                                                                              { id: 'fr-FR', label_key: 'Franch'},
                                                                              { id: 'it-IT', label_key: 'Italian'}
                                                                          ]},
            { groupId: translateConditions.chat.groupId.ChatInformation, id: 'department.name', label_key: translateConditions.chat.label_key.Department,
                  triggerType: 'request.create', type: 'boolean', operator: this.departments},
            { groupId: translateConditions.chat.groupId.ChatInformation, id: 'status', label_key: translateConditions.chat.label_key.VisitorServed,
                  triggerType: 'request.create', type: 'boolean', operator: [ {id: 200, label_key: 'True'},
                                                                              {id: 100, label_key: 'False'}
                                                                  ]},

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
        ]
      }

      this.action = [
        { key: 'message.send', label_key: translateAction.label_key.SendMessageToVisitor, type: 'input', placeholder: translateAction.placeholder.NameAgent},
        // { key: 'message.received', label_key: 'Ricevi messaggio', type: 'select', placeholder: 'text here2'},
        // { key: 'wait', label_key: 'Attesa', type: 'input', placeholder: 'text here2'}
      ]
      }

      console.log('pair_dep', this.departments)
      console.log('pair_cond', this.condition)
      console.log('pair_opt', this.options)
      console.log('pair_act', this.action)

    }, (error) => {
      console.log('!!!  REQUESTS DEP or TRANSLATE - ERROR: ', error);
    }, () => {
      console.log('!!!  REQUESTS DEP or TRANSLATE - COMPLETE ');
      this.showSpinner = false;
    })

  }



}

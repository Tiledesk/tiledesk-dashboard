// tslint:disable:max-line-length
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { Contact } from '../models/contact-model';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { AuthService } from '../core/auth.service';
import { AppConfigService } from '../services/app-config.service';
import { WebSocketJs } from "./websocket/websocket-js";
import { LoggerService } from '../services/logger/logger.service';
import { map } from 'rxjs/operators';

@Injectable()
export class ContactsService {

  projectId: string;
  user: any;
  TOKEN: any;
  currentUserID: string;
  SERVER_BASE_PATH: string;

  constructor(
    private httpClient: HttpClient,
    public auth: AuthService,
    public appConfigService: AppConfigService,
    public webSocketJs: WebSocketJs,
    private logger: LoggerService

  ) {
    this.getCurrentProject();

    this.user = auth.user_bs.value
    this.checkUser()

    this.auth.user_bs.subscribe((user) => {

      this.user = user;
      this.checkUser()
    });

    this.getAppConfig();
  }

  getAppConfig() {
    this.SERVER_BASE_PATH = this.appConfigService.getConfig().SERVER_BASE_URL;
    this.logger.log('[CONTACTS-SERV] getAppConfig SERVER_BASE_PATH', this.SERVER_BASE_PATH);
  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      // this.logger.log('[CONTACTS-SERV]: SUBSCRIBE TO THE PROJECT PUBLISHED BY AUTH SERVICE ', project)
      if (project) {
        this.projectId = project._id
      }
    })
  }

  checkUser() {
    if (this.user) {
      this.TOKEN = this.user.token
      this.currentUserID = this.user._id
      this.logger.log('[CONTACTS-SERV] - USER UID  ', this.currentUserID);
    } else {
      this.logger.log('No user is signed in');
    }
  }

  // ---------------------------------
  // @ GET LEADS - ACTIVE OR TRASHED
  // ---------------------------------
  public getLeadsActiveOrTrashed(querystring, pagenumber, hasclickedtrash): Observable<Contact[]> {
    let _querystring = '&' + querystring

    this.logger.log('[CONTACTS-SERV] - GET CONTACTS (ACTIVE OR TRASHED) hasclickedtrash', hasclickedtrash);
    this.logger.log('[CONTACTS-SERV] - GET CONTACTS (ACTIVE OR TRASHED) querystring', querystring);
    this.logger.log('[CONTACTS-SERV] - GET CONTACTS (ACTIVE OR TRASHED) pagenumber', pagenumber);

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };

    if (querystring === undefined || !querystring) {
      _querystring = ''
    }

    let trashed_contacts = ''
    if (hasclickedtrash === true) {
      trashed_contacts = '&status=1000'
    }

    const url = this.SERVER_BASE_PATH + this.projectId + '/leads?page=' + pagenumber + _querystring + trashed_contacts;
    this.logger.log('[CONTACTS-SERV] - GET CONTACTS (ACTIVE OR TRASHED) URL', url);

    return this.httpClient
      .get<Contact[]>(url, httpOptions)
  }

  // -------------------------------
  // @ GET LEADS - TRASHED
  // -------------------------------
  getLeadsTrashed(): Observable<Contact[]> {

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };

    const url = this.SERVER_BASE_PATH + this.projectId + '/leads?page=0&status=1000';
    this.logger.log('[CONTACTS-SERV] - GET TRASHED CONTACTS URL', url);

    return this.httpClient
      .get<Contact[]>(url, httpOptions)
  }

  // -------------------------------
  // @ GET LEADS - ACTIVE
  // -------------------------------
  getLeadsActive(): Observable<Contact[]> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };

    const url = this.SERVER_BASE_PATH + this.projectId + '/leads';
    this.logger.log('[CONTACTS-SERV] - GET ACIVE CONTACTS URL', url);

    return this.httpClient
      .get<Contact[]>(url, httpOptions)
  }

  // -------------------------------
  // @ GET LEADS WHIT LIMIT
  // -------------------------------
  getAllLeadsActiveWithLimit(limit): Observable<Contact[]> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };

    const url = this.SERVER_BASE_PATH + this.projectId + '/leads?limit=' + limit + '&with_fullname=true';
    this.logger.log('[CONTACTS-SERV] - GET ACIVE CONTACTS WITH LIMIT URL', url);

    return this.httpClient
      .get<Contact[]>(url, httpOptions)
  }

  // ---------------------------------------------
  // @ Create new project user to get new lead ID
  // ---------------------------------------------
  public createNewProjectUserToGetNewLeadID() {
    const httpOptions = {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };

    const url = this.SERVER_BASE_PATH + this.projectId + '/project_users/'
    const body = {};
    this.logger.log('[CONTACTS-SERV] - CREATE NEW PROJECT USER TO GET NEW LEAD ID url ', url);

    return this.httpClient
      .post(url, body, httpOptions)
  }

  // ---------------------------------------------
  // @ Create new lead 
  // ---------------------------------------------
  public createNewLead(leadid: string, fullname: string, leademail: string): Observable<Contact[]> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };
    const url = this.SERVER_BASE_PATH + this.projectId + '/leads/';
    const body = { 'lead_id': leadid, 'fullname': fullname, 'email': leademail };
    this.logger.log('[CONTACTS-SERV] - CREATE NEW LEAD ', body);

    return this.httpClient
      .post<Contact[]>(url, JSON.stringify(body), httpOptions)
  }

  // ---------------------------------------------
  // @ Export lead to CSV
  // ---------------------------------------------
  public exportLeadToCsv(querystring, pagenumber, hasclickedtrash) {
    let _querystring = '&' + querystring
    if (querystring === undefined || !querystring) {
      _querystring = ''
    }

    let trashed_contacts = ''
    if (hasclickedtrash === true) {
      trashed_contacts = '&status=1000'
    }

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN,
      }),
      responseType: 'text' as 'json'
    };

    // + trashed_contacts // IL SERVIZIO NON PRENDE I STATUS 1000
    const url = this.SERVER_BASE_PATH + this.projectId + '/leads/csv?page=' + pagenumber + _querystring;
    this.logger.log('[CONTACTS-SERV] - EXPORT LEAD AS CSV URL', url);

    return this.httpClient
      .get(url, httpOptions)
  }

  // -------------------------------------------------------------------
  // @ Get lead by id
  // -------------------------------------------------------------------
  public getLeadById(id: string): Observable<Contact[]> {

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN,
      })
    };

    const url = this.SERVER_BASE_PATH + this.projectId + '/leads/' + id;
    this.logger.log('[CONTACTS-SERV] - GET LEAD BY ID URL', url);

    return this.httpClient
      .get<Contact[]>(url, httpOptions)
  }

  // ---------------------------------------------
  // @ Update lead Fullname
  // ---------------------------------------------
  public updateLeadFullname(leadid: string, fullName: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN,
      })
    };
    const url = this.SERVER_BASE_PATH + this.projectId + '/leads/' + leadid;
    this.logger.log('[CONTACTS-SERV] UPDATE LEAD - URL ', url);

    const body = { 'fullname': fullName };
    this.logger.log('[CONTACTS-SERV] UPDATE LEAD REQUEST - BODY ', body);
    return this.httpClient
      .put(url, JSON.stringify(body), httpOptions)
  }

  // ---------------------------------------------
  // @ Update lead Email
  // ---------------------------------------------
  public updateLeadEmail(leadid: string, lead_email: string) {
    if (lead_email === undefined) {
      lead_email = ""
    }
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN,
      })
    };
    const url = this.SERVER_BASE_PATH + this.projectId + '/leads/' + leadid;
    this.logger.log('[CONTACTS-SERV] UPDATE LEAD - URL ', url);
    const body = {
      'email': lead_email
    };
    this.logger.log('[CONTACTS-SERV] UPDATE LEAD REQUEST - BODY ', body);
    return this.httpClient
      .put(url, JSON.stringify(body), httpOptions)
  }


  // ---------------------------------------------
  // @ Update lead Company
  // ---------------------------------------------
  public updateLeadCompany(leadid: string, leadcompany: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN,
      })
    };
    const url = this.SERVER_BASE_PATH + this.projectId + '/leads/' + leadid;
    this.logger.log('[CONTACTS-SERV] UPDATE LEAD - URL ', url);
    const body = {
      'company': leadcompany
    };
    this.logger.log('[CONTACTS-SERV] UPDATE LEAD REQUEST - BODY ', body);
    return this.httpClient
      .put(url, JSON.stringify(body), httpOptions)
  }

  // ---------------------------------------------
  // @ Update lead Phone
  // ---------------------------------------------
  public updateLeadPhone(leadid: string, leadphone: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN,
      })
    };
    const url = this.SERVER_BASE_PATH + this.projectId + '/leads/' + leadid;
    this.logger.log('[CONTACTS-SERV] UPDATE LEAD - URL ', url);
    const body = {
      'phone': leadphone
    };
    this.logger.log('[CONTACTS-SERV] UPDATE LEAD REQUEST - BODY ', body);
    return this.httpClient
      .put(url, JSON.stringify(body), httpOptions)
  }

   // ---------------------------------------------
  // @ Update lead Note
  // ---------------------------------------------
  public updateLeadNote(leadid: string, leadNote: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN,
      })
    };
    const url = this.SERVER_BASE_PATH + this.projectId + '/leads/' + leadid;
    this.logger.log('[CONTACTS-SERV] UPDATE LEAD - URL ', url);
    const body = {
      'note': leadNote
    };
    this.logger.log('[CONTACTS-SERV] UPDATE LEAD REQUEST - BODY ', body);
    return this.httpClient
      .put(url, JSON.stringify(body), httpOptions)
  }


  // ---------------------------------------------
  // @ Update lead
  // ---------------------------------------------
  public updateLead(
    id: string,
    fullName: string,
    lead_email: string,
    lead_company: string,
    lead_street_address: string,
    lead_city: string,
    lead_state: string,
    lead_postalcode: string,
    lead_country: string,
    lead_phone_number: string,
    lead_note: string
  ) {

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN,
      })
    };

    const url = this.SERVER_BASE_PATH + this.projectId + '/leads/' + id;
    this.logger.log('[CONTACTS-SERV] UPDATE LEAD - URL ', url);

    const body = {
      'fullname': fullName,
      'email': lead_email,
      'company': lead_company,
      'streetAddress': lead_street_address,
      'city': lead_city,
      'region': lead_state,
      'zipcode': lead_postalcode,
      'country': lead_country,
      'phone': lead_phone_number,
      'note': lead_note
    };

    this.logger.log('[CONTACTS-SERV] UPDATE LEAD REQUEST - BODY ', body);

    return this.httpClient
      .put(url, JSON.stringify(body), httpOptions)
  }

  // ---------------------------------------------
  // @ Add contact tag
  // ---------------------------------------------
  public updateLeadTag(
    id: string,
    tags: string,
  ) {

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN,
      })
    };

    const url = this.SERVER_BASE_PATH + this.projectId + '/leads/' + id;
    this.logger.log('[CONTACTS-SERV] ADD LEAD TAG - URL ', url);

    const body = {
      'tags': tags
    };

    this.logger.log('[CONTACTS-SERV] UPDATE LEAD REQUEST - BODY ', body);

    return this.httpClient
      .put(url, JSON.stringify(body), httpOptions)
  }

  // -------------------------------------------------
  // @ Lead property - CREATE NEW PROPERTY
  // -------------------------------------------------
  public createNewLeadProperty(propertyLabel: string, propertyName: string): Observable<Contact[]> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };
    const url = this.SERVER_BASE_PATH + this.projectId + '/properties';
    const body = { "label": propertyLabel, "name": propertyName, "type": "text" };
    this.logger.log('[CONTACTS-SERV] - CREATE NEW LEAD PROPERTY body', body);

    return this.httpClient
      .post<Contact[]>(url, JSON.stringify(body), httpOptions)
  }

  // -------------------------------------------------
  // @ Lead property - GET ALL
  // -------------------------------------------------
  public getAllLeadProperty(): Observable<Contact[]> {

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN,
      })
    };

    const url = this.SERVER_BASE_PATH + this.projectId + '/properties';
    this.logger.log('[CONTACTS-SERV] - GET ALL LEAD PROPERTIES URL', url);

    return this.httpClient
      .get<Contact[]>(url, httpOptions)
  }

  // addCustoPropertyToLead(contactid,propertyName, propertyValue  ){
  addCustoPropertyToLead(contactid, contactCustomPropertiesAssigned) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };

    let url = this.SERVER_BASE_PATH + this.projectId + '/leads/' + contactid + "/attributes"
    this.logger.log('[CONTACTS-SERV] - ADD CUSTOM PROPERTY TO LEAD - URL', url);
    // var key = 'ccp_'+propertyName;
    // const body = { [key]: propertyValue };
    const body = { ccp: contactCustomPropertiesAssigned }
    this.logger.log('[DEPTS-SERV] - ADD CUSTOM PROPERTY - BODY', body);

    return this.httpClient
      .patch(url, JSON.stringify(body), httpOptions)
  }

  // curl -v -X PATCH -H 'Content-Type:application/json' -u andrea.leo@frontiere21.it:258456td -d '{"a1":"a2", "b1":"b2"}' http://localhost:3000/6307a210f6c98c2d6c9c74ef/leads/630e19bf8ddb5f633abfedbf/properties

  updateLeadCustomProperties(contactid, contactCustomPropertiesObjct) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };

    let url = this.SERVER_BASE_PATH + this.projectId + '/leads/' + contactid + "/properties"
    this.logger.log('[CONTACTS-SERV] - ADD CUSTOM PROPERTY TO LEAD - URL', url);
    // var key = 'ccp_'+propertyName;
    // const body = { [key]: propertyValue };
    const body = contactCustomPropertiesObjct
    this.logger.log('[DEPTS-SERV] - ADD CUSTOM PROPERTY - BODY', body);

    return this.httpClient
      .patch(url, JSON.stringify(body), httpOptions)
  }

  public updateLeadAddress(
    contactid: string,
    lead_street_address: string,
    lead_city: string,
    lead_state: string,
    lead_postalcode: string,
    lead_country: string,
  ) {
    
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN,
      })
    };

    const url = this.SERVER_BASE_PATH + this.projectId + '/leads/' + contactid;
    this.logger.log('[CONTACTS-SERV] UPDATE LEAD - URL ', url);

    const body = {
      'streetAddress': lead_street_address,
      'city': lead_city,
      'region': lead_state,
      'zipcode': lead_postalcode,
      'country': lead_country

    };

    this.logger.log('[CONTACTS-SERV] UPDATE LEAD REQUEST - BODY ', body);

    return this.httpClient
      .put(url, JSON.stringify(body), httpOptions)
  }

  // updatedContactAttributes(contactid, attributes) {
  //   const httpOptions = {
  //     headers: new HttpHeaders({
  //       'Content-Type': 'application/json',
  //       'Authorization': this.TOKEN
  //     })
  //   };

  //   let url = this.SERVER_BASE_PATH + this.projectId + '/leads/' + contactid + "/attributes"
  //   this.logger.log('[CONTACTS-SERV] - UPDATED CONTACT ATTRIBUTES - URL', url);

  //   return this.httpClient
  //     .patch(url, JSON.stringify(attributes), httpOptions)

  // }

  // ---------------------------------------------
  // @ Delete lead (move to trash)
  // ---------------------------------------------
  public deleteLead(id: string) {

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN,
      })
    };

    const url = this.SERVER_BASE_PATH + this.projectId + '/leads/' + id;
    this.logger.log('[CONTACTS-SERV] DELETE LEAD - URL ', url);

    return this.httpClient
      .delete(url, httpOptions)
  }

  // ---------------------------------------------
  // @ Delete lead from db
  // ---------------------------------------------
  public deleteLeadForever(id: string) {

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN,
      })
    };

    const url = this.SERVER_BASE_PATH + this.projectId + '/leads/' + id + '/physical';
    this.logger.log('[CONTACTS-SERV] DELETE LEAD FOREVER - URL ', url);

    return this.httpClient
      .delete(url, httpOptions)
  }

  // ---------------------------------------------
  // @ Restore lead
  // ---------------------------------------------
  public restoreLead(id: string) {

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN,
      })
    };

    const url = this.SERVER_BASE_PATH + this.projectId + '/leads/' + id;
    this.logger.log('[CONTACTS-SERV] - RESTORE LEAD - URL ', url);

    const body = { 'status': 100 };
    this.logger.log('[CONTACTS-SERV] - RESTORE LEAD - BODY ', body);

    return this.httpClient
      .put(url, JSON.stringify(body), httpOptions)
  }

  // ---------------------------------------------
  // @ Get requests by requester id
  // ---------------------------------------------
  public getRequestsByRequesterId(requesterid: string, pagenumber: number) {

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN,
      })
    };

    const url = this.SERVER_BASE_PATH + this.projectId + '/requests?lead=' + requesterid + '&page=' + pagenumber + '&status=all' + '&no_populate=true';
    this.logger.log('[CONTACTS-SERV] - GET REQUESTS BY REQUESTER ID - URL ', url);
    return this.httpClient
      .get(url, httpOptions)
      .pipe(
        map(
          (response) => {
            const data = response
            // Does something on data.data
            this.logger.log('[CONTACTS-SERV] - GET REQUESTS BY REQUESTER ID * DATA * ', data);

            if (data['requests']) {
              data['requests'].forEach(request => {

                // ----------------------------------
                // @ Department
                // ----------------------------------
                if (request.snapshot && request.snapshot.department) {
                  this.logger.log("[CONTACTS-SERV] - GET REQUESTS BY REQUESTER ID - snapshot department", request.snapshot.department);
                  request.department = request['snapshot']["department"]

                } else if (request.department) {
                  request.department = request.department
                }

              })
            }
            return data;
          })
      )
  }

}

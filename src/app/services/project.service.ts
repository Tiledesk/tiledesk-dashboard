// tslint:disable:max-line-length
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject} from 'rxjs';
import { Project } from '../models/project-model';
import { AuthService } from '../core/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppConfigService } from '../services/app-config.service';
import { LoggerService } from '../services/logger/logger.service';
@Injectable()
export class ProjectService {

  SERVER_BASE_PATH: string;
  PROJECTS_URL: string;
  TOKEN: string;
  user: any;
  currentUserID: string;
  projectID: string;

  public myAvailabilityCount: BehaviorSubject<number> = new BehaviorSubject<number>(null);
  public hasCreatedNewProject$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(
 
    public auth: AuthService,
    public _httpclient: HttpClient,
    public appConfigService: AppConfigService,
    private logger: LoggerService
  ) {
    this.user = auth.user_bs.value
    this.checkIfUserExistAndGetToken()

    this.auth.user_bs.subscribe((user) => {
      this.user = user;
      this.checkIfUserExistAndGetToken()
    });
    this.getAppConfigAndBuildUrl();
    this.getCurrentProject();

  }

  getAppConfigAndBuildUrl() {
    this.SERVER_BASE_PATH = this.appConfigService.getConfig().SERVER_BASE_URL;
    this.logger.log('[PROJECT-SERV] - SERVER_BASE_PATH ', this.SERVER_BASE_PATH);
    this.PROJECTS_URL = this.SERVER_BASE_PATH + 'projects/';
    this.logger.log('[PROJECT-SERV] - PROJECTS URL ', this.PROJECTS_URL);
  }

  countOfMyAvailability(numOfMyAvailability: number) {
    this.logger.log('[PROJECT-SERV] - BS PUBLISH countOfMyAvailability ', numOfMyAvailability);
    this.myAvailabilityCount.next(numOfMyAvailability);
  }

  newProjectCreated(newProjectCreated: boolean) {
    this.logger.log('[PROJECT-SERV] - BS PUBLISH newProjectCreated ', newProjectCreated);
    this.hasCreatedNewProject$.next(newProjectCreated);
  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      if (project) {
        this.projectID = project._id;
        // this.logger.log('[PROJECT-SERV] project ID from AUTH service subscription ', this.projectID)
      }
    });
  }

  checkIfUserExistAndGetToken() {
    if (this.user) {

      this.currentUserID = this.user._id
      this.TOKEN = this.user.token
      // this.logger.log('[PROJECT-SERV] user is signed in');
    } else {
      this.logger.log('[PROJECT-SERV] - No user is signed in');
    }
  }

  // ------------------------------------------------------
  // READ (GET ALL PROJECTS)
  // ------------------------------------------------------
  public getProjects(): Observable<Project[]> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };
    const url = this.PROJECTS_URL;
    this.logger.log('[PROJECT-SERV] - GET PROJECTS URL', url);

    return this._httpclient
      .get<Project[]>(url, httpOptions)
  }

  /**
   * DELETE PROJECT
   * @param projectid 
   * @returns 
   */
  public deleteProject(projectid: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };

    let url = this.PROJECTS_URL + projectid;
    this.logger.log('[PROJECT-SERV] - DELETE URL ', url);

    return this._httpclient
      .delete(url, httpOptions)
  }


  /**
   * GET PROJECT BY PROJECT ID
   * @param id 
   * @returns 
   */
  public getProjectById(id: string): Observable<Project[]> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };

    let url = this.PROJECTS_URL + id;
    this.logger.log('[PROJECT-SERV] - GET PROJECT BY ID - URL', url);

    return this._httpclient
      .get<Project[]>(url, httpOptions)
  }

  /**
   * CREATE (POST) A NEW PROJECT
   * @param name
   * @param id_user
   */
  public createProject(name: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };

    const url = this.PROJECTS_URL;
    this.logger.log('[PROJECT-SERV] CREATE PROJECT POST REQUEST - URL ', url);

    const body = { 'name': name };
    this.logger.log('[PROJECT-SERV] CREATE PROJECT POST REQUEST - BODY ', body);

    return this._httpclient
      .post(url, JSON.stringify(body), httpOptions)
  }

  // ----------------------------------------------------------
  // @ Stripe service 
  // ----------------------------------------------------------

  /**
   * Get stripe subscription payments
   * @param subscriptionId 
   * @returns 
   */
  public getSubscriptionPayments(subscriptionId: string): Observable<[any]> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };
    const url = this.SERVER_BASE_PATH + 'modules/payments/stripe/' + subscriptionId;
    this.logger.log('[PROJECT-SERV] - GET SUBSCRIPTION PAYMENTS - URL', url);

    return this._httpclient
      .get<[any]>(url, httpOptions)
  }

  /**
   * Get stripe customer
   * @returns 
   */
  public getStripeCustomer() {
    const httpOptions = {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };

    const url = this.SERVER_BASE_PATH + 'modules/payments/stripe/customer/' + this.projectID  // const url = 'https://cabd-151-35-162-143.ngrok.io/modules/payments/stripe/customer/' + this.projectID
    this.logger.log('[PROJECT-SERV] GET STRIPE CUSTOMER - URL ', url);

    return this._httpclient
      .get(url, httpOptions)
  }

  /**
   * Get customer payment methods
   * @param customerid 
   * @returns 
   */
  getCustomerPaymentMethodsList(customerid) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };

    const url = this.SERVER_BASE_PATH + 'modules/payments/stripe/payment_methods/' + customerid    // const url = 'https://cabd-151-35-162-143.ngrok.io/modules/payments/stripe/payment_methods/' + customerid
    this.logger.log('[PROJECT-SERV]  GET PAYMENT METHODS LIST', url);

    return this._httpclient
      .get(url, httpOptions)
  }

  /**
   * Update stripe customer
   * @param customerid 
   * @param creditcardnum 
   * @param expirationDateMonth 
   * @param expirationDateYear 
   * @param creditcardcvc 
   * @returns 
   */
  public updateStripeCustomer(customerid, creditcardnum, expirationDateMonth, expirationDateYear, creditcardcvc) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };

    const url = this.SERVER_BASE_PATH + 'modules/payments/stripe/customers/' + customerid  // const url = 'https://cabd-151-35-162-143.ngrok.io/modules/payments/stripe/customers/' + customerid
    this.logger.log('[PROJECT-SERV] UPDATE STRIPE CUSTOMER - URL ', url);

    const expirationDateMonthNum = +expirationDateMonth;
    const expirationDateYearNum = +expirationDateYear;
    const body = {
      'credit_card_num': creditcardnum,
      'expiration_date_month': expirationDateMonthNum,
      'expiration_date_year': expirationDateYearNum,
      'credit_card_cvc': creditcardcvc
    };
    this.logger.log('[PROJECT-SERV] UPDATE STRIPE CUSTOMER POST  BODY ', body);

    return this._httpclient
      .post(url, JSON.stringify(body), httpOptions)
  }

  /**
   * Cancel subscription
   * @returns 
   */
  public cancelSubscription() {
    const httpOptions = {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };

    const url = this.SERVER_BASE_PATH + 'modules/payments/stripe/cancelsubscription';
    this.logger.log('[PROJECT-SERV] - CANCEL SUBSCRIPTION - PUT URL ', url);

    const body = { 'projectid': this.projectID, 'userid': this.user._id };
    this.logger.log('[PROJECT-SERV] - CANCEL SUBSCRIPTION - PUT REQUEST BODY ', body);

    return this._httpclient
      .put(url, JSON.stringify(body), httpOptions)
  }

  // ----------------------------------------------------------
  // @ ./ Stripe service 
  // ----------------------------------------------------------



  // -----------------------------------------------------------------
  // Used to update the project name - todo from put to patch
  // -----------------------------------------------------------------
  public updateProjectName(id: string, name: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };

    let url = this.PROJECTS_URL + id;
    this.logger.log('[PROJECT-SERV] - UPDATE PROJECT NAME - PUT URL ', url);

    const body = { 'name': `${name}` };
    this.logger.log('[PROJECT-SERV] - UPDATE PROJECT NAME - PUT BODY ', body);

    return this._httpclient
      .put(url, JSON.stringify(body), httpOptions)
  }

  public updateHasEmittedTrialEnded(id: string, triaended: boolean) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };

    let url = this.PROJECTS_URL + id;
    this.logger.log('[PROJECT-SERV] - UPDATE PROJECT WHITH THE KEY TRIAL ENDED - PUT URL ', url);

    const body = { 'trialEnded': triaended };
    this.logger.log('[PROJECT-SERV] - UPDATE PROJECT WHITH THE KEY TRIAL ENDED - PUT BODY ', body);

    return this._httpclient
      .put(url, JSON.stringify(body), httpOptions)
  }


  public addAllowedIPranges(id: string, ipFilterEnabled: boolean, ipFilterArray: any) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };

    let url = this.PROJECTS_URL + id;
    this.logger.log('[PROJECT-SERV] - ADD ALLOWED IP RANGES - PUT URL ', url);


    const body = { 'ipFilterEnabled': ipFilterEnabled, 'ipFilter': ipFilterArray };
    this.logger.log('[PROJECT-SERV] - ADD ALLOWED IP RANGES - PUT BODY ', body);

    return this._httpclient
      .put(url, JSON.stringify(body), httpOptions)

  }

  // --------------------------------
  // UPDATE PROJECT ADVANCED SETTINGS
  // --------------------------------
  public updateAdvancedSettings(chatlimit: number, reassignmenttimeout: number, automaticidlechats: number, chat_limit_on: boolean, reassignment_on: boolean, unavailable_status_on: boolean) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };

    let url = this.PROJECTS_URL + this.projectID;;
    this.logger.log('[PROJECT-SERV] - UPDATE ADVANCED SETTINGS - PUT URL ', url);

    const body = {
      'settings.max_agent_assigned_chat': chatlimit,
      'settings.reassignment_delay': reassignmenttimeout,
      'settings.automatic_idle_chats': automaticidlechats,
      'settings.chat_limit_on': chat_limit_on,
      'settings.reassignment_on': reassignment_on,
      'settings.automatic_unavailable_status_on': unavailable_status_on,
    }

    this.logger.log('[PROJECT-SERV] - UPDATE ADVANCED SETTINGS - PUT BODY ', body);

    return this._httpclient
      .put(url, JSON.stringify(body), httpOptions)
  }

  // -------------------------------------------------------------------------------------
  // UPDATE PROJECT SETTINGS > AUTO SEND TRANSCRIPT TO REQUESTER  - todo from put to patch
  // -------------------------------------------------------------------------------------
  public updateAutoSendTranscriptToRequester(autosend: boolean) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };

    let url = this.PROJECTS_URL + this.projectID;
    this.logger.log('[PROJECT-SERV] UPDATE AUTO SEND TRASCRIPT TO REQUESTER - PUT URL ', url);

    const body = { 'settings.email.autoSendTranscriptToRequester': autosend }
    this.logger.log('[PROJECT-SERV] UPDATE AUTO SEND TRASCRIPT TO REQUESTER - PUT BODY ', body);

    return this._httpclient
      .put(url, JSON.stringify(body), httpOptions)
  }

  /**
   * Get email template
   * @param temaplateName 
   * @returns 
   */
  public getEmailTemplate(temaplateName) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };

    const url = this.SERVER_BASE_PATH + this.projectID + '/emails/templates/' + temaplateName;
    this.logger.log('[PROJECT-SERV] - GET EMAIL TEMPLATE - URL', url);

    return this._httpclient
      .get(url, httpOptions)
  }

  // ------------------------------
  // Update Emai template
  // ------------------------------
  public updateEmailTempalte(temaplateName: string, template: any) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };

    let url = this.PROJECTS_URL + this.projectID + '/'
    this.logger.log('[PROJECT-SERV] UPDATE EMAIL TEMPLATE - PUT URL ', url);
    this.logger.log('[PROJECT-SERV] UPDATE EMAIL TEMPLATE - temaplateName ', temaplateName);
    // console.log('[PROJECT-SERV] UPDATE EMAIL TEMPLATE - template ', template);

    // const body = { "settings.email.templates": template }
    // Object.keys(body).forEach(k => {
    //   console.log('body key: ', k)
    //   k + temaplateName
    // });

    let body = {}
    body["settings.email.templates." + temaplateName] = template;
    // body["settings.email.templates." + temaplateName + '.html'] = template;
    // -------------------------------------------------------
    // Andrea L
    // -------------------------------------------------------
    // let body = { settings: { email: { templates: { }} } }
    // body.settings.email.templates[temaplateName] = template

    return this._httpclient
      .put(url, JSON.stringify(body), httpOptions)
  }

  // ------------------------------
  // Update SMTP settings
  // ------------------------------
  public updateSMPTSettings(smtp_host_name, smtp_port, sender_email_address, smtp_usermame, smtp_pswd, smtp_connetion_security) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };

    let url = this.PROJECTS_URL + this.projectID + '/'

    const body = {
      'settings.email.from': sender_email_address,
      'settings.email.config.host': smtp_host_name,
      'settings.email.config.port': smtp_port,
      'settings.email.config.secure': smtp_connetion_security,
      'settings.email.config.user': smtp_usermame,
      'settings.email.config.pass': smtp_pswd,
    }

    return this._httpclient
      .put(url, JSON.stringify(body), httpOptions)
  }


  // ------------------------------
  // Reset to default SMTP settings
  // ------------------------------
  public resetToDefaultSMPTSettings() {
    const httpOptions = {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };

    let url = this.PROJECTS_URL + this.projectID + '/'
    // console.log('[PROJECT-SERV] SAVE SMTP SETTINGS - PUT URL ', url);

    let body = {}
    body["settings.email.from"] = undefined;
    body["settings.email.config"] = undefined;

    this.logger.log('[PROJECT-SERV] RESET TO DEFAULT SMTP - body ', body);

    return this._httpclient
      .put(url, JSON.stringify(body), httpOptions)
  }

  public sendTestEmail(recipientemail, smtp_host_name, smtp_port_number, smtp_connetion_security, smtp_usermame, smtp_pswd) {
    let url = this.SERVER_BASE_PATH + this.projectID + '/emails/test/send'
    const httpOptions = {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };

    const body = { "to": recipientemail, "config": { "host": smtp_host_name, 'port': smtp_port_number, 'secure': smtp_connetion_security, 'user': smtp_usermame, 'pass': smtp_pswd } }
    this.logger.log('[PROJECT-SERV] SEND TEST EMAIL POST - body ', body);

    return this._httpclient
      .post(url, JSON.stringify(body), httpOptions)

  }


  // -----------------------------------------------------------------
  // UPDATE WIDGET PROJECT  - todo from put to patch
  // -----------------------------------------------------------------
  public updateWidgetProject(widget_settings: any) {
    let url = this.PROJECTS_URL + this.projectID;

    this.logger.log('[PROJECT-SERV] - UPDATE WIDGET PROJECT - PUT URL ', url);

    const httpOptions = {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };

    const body = { 'widget': widget_settings };

    this.logger.log('[PROJECT-SERV] UPDATE WIDGET PROJECT - PUT BODY ', body);

    return this._httpclient
      .put(url, JSON.stringify(body), httpOptions)
  }


  // -----------------------------------------------------------------
  // UPDATE OPERATING HOURS - todo from put to patch
  // -----------------------------------------------------------------
  public updateProjectOperatingHours(_activeOperatingHours: boolean, _operatingHours: any): Observable<Project[]> {
    const url = this.PROJECTS_URL + this.projectID;
    this.logger.log('[PROJECT-SERV] -  UPDATE PROJECT OPERATING HOURS - PUT URL ', url);

    const httpOptions = {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };

    const body = { 'activeOperatingHours': _activeOperatingHours, 'operatingHours': _operatingHours };

    this.logger.log('[PROJECT-SERV] - UPDATE PROJECT OPERATING HOURS PUT BODY ', body);

    return this._httpclient
      .put<Project[]>(url, JSON.stringify(body), httpOptions)
  }
  /// UPDATE TIMETABLE AND GET AVAILABLE PROJECT USER



  // -----------------------------------------------------------------
  // GENERATE SHARED SECRET
  // -----------------------------------------------------------------
  /* https://api.tiledesk.com/v1/PROJECTID/keys/generate */
  public generateSharedSecret() {
    const httpOptions = {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };

    const url = this.SERVER_BASE_PATH + this.projectID + '/keys/generate';

    /** ********* FOR TEST  ********* **/
    // headers.append('Authorization', 'JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyIkX18iOnsic3RyaWN0TW9kZSI6dHJ1ZSwic2VsZWN0ZWQiOnsiZW1haWwiOjEsImZpcnN0bmFtZSI6MSwibGFzdG5hbWUiOjEsInBhc3N3b3JkIjoxLCJlbWFpbHZlcmlmaWVkIjoxLCJpZCI6MX0sImdldHRlcnMiOnt9LCJfaWQiOiI1YWM3NTIxNzg3ZjZiNTAwMTRlMGI1OTIiLCJ3YXNQb3B1bGF0ZWQiOmZhbHNlLCJhY3RpdmVQYXRocyI6eyJwYXRocyI6eyJwYXNzd29yZCI6ImluaXQiLCJlbWFpbCI6ImluaXQiLCJlbWFpbHZlcmlmaWVkIjoiaW5pdCIsImxhc3RuYW1lIjoiaW5pdCIsImZpcnN0bmFtZSI6ImluaXQiLCJfaWQiOiJpbml0In0sInN0YXRlcyI6eyJpZ25vcmUiOnt9LCJkZWZhdWx0Ijp7fSwiaW5pdCI6eyJlbWFpbHZlcmlmaWVkIjp0cnVlLCJsYXN0bmFtZSI6dHJ1ZSwiZmlyc3RuYW1lIjp0cnVlLCJwYXNzd29yZCI6dHJ1ZSwiZW1haWwiOnRydWUsIl9pZCI6dHJ1ZX0sIm1vZGlmeSI6e30sInJlcXVpcmUiOnt9fSwic3RhdGVOYW1lcyI6WyJyZXF1aXJlIiwibW9kaWZ5IiwiaW5pdCIsImRlZmF1bHQiLCJpZ25vcmUiXX0sInBhdGhzVG9TY29wZXMiOnt9LCJlbWl0dGVyIjp7ImRvbWFpbiI6bnVsbCwiX2V2ZW50cyI6e30sIl9ldmVudHNDb3VudCI6MCwiX21heExpc3RlbmVycyI6MH0sIiRvcHRpb25zIjp0cnVlfSwiaXNOZXciOmZhbHNlLCJfZG9jIjp7ImVtYWlsdmVyaWZpZWQiOnRydWUsImxhc3RuYW1lIjoiTGFuemlsb3R0byIsImZpcnN0bmFtZSI6Ik5pY29sYSIsInBhc3N3b3JkIjoiJDJhJDEwJDEzZlROSnA3OUx5RVYvdzh6NXRrbmVrc3pYRUtuaWFxZm83TnR2aTZpSHdaQ2ZLRUZKd1kuIiwiZW1haWwiOiJuaWNvbGEubGFuemlsb3R0b0Bmcm9udGllcmUyMS5pdCIsIl9pZCI6IjVhYzc1MjE3ODdmNmI1MDAxNGUwYjU5MiJ9LCIkaW5pdCI6dHJ1ZSwiaWF0IjoxNTQwODE5MTUzfQ.af5nAtSYVmmWzmdgGummY6fQnt2dFTR0lCnrfP0vr6I');
    // const url = 'https://api.tiledesk.com/v1/5b55e806c93dde00143163dd/keys/generate'

    this.logger.log('[PROJECT-SERV] - GENERATE SHARED SECRET - POST URL ', url);
    const body = {};

    return this._httpclient
      .post(url, JSON.stringify(body), httpOptions)
  }


  // -----------------------------------------------------------------------------------------
  // @ Ban visitor 
  // -----------------------------------------------------------------------------------------
  public banVisitor(leadid: string, ipaddress: string) {

    const httpOptions = {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };

    const url = this.PROJECTS_URL + this.projectID + '/ban';

    const body = { "id": leadid, "ip": ipaddress }

    return this._httpclient
      .post(url, JSON.stringify(body), httpOptions)
  }


  // -----------------------------------------------------------------------------------------
  // @ Unban visitor  http://localhost:3000/projects/6307a210f6c98c2d6c9c74ef/ban/6307a22cf6c98c2d6c9c7525
  // -----------------------------------------------------------------------------------------
  public unbanVisitor(contactid: string) {
    let url = this.PROJECTS_URL + this.projectID + '/ban/' + contactid;
    // console.log('[PROJECT-SERV] - DELETE URL ', url);

    const httpOptions = {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };

    return this._httpclient
      .delete(url, httpOptions)
  }


  // ----------------------------------------------------------------------------
  // !!! not used -  UPDATE GETTING STARTED (IS THE MODAL WINDOW GETTING STARTED)
  // ----------------------------------------------------------------------------
  public updateGettingStartedProject(getting_started: any) {

    let url = this.PROJECTS_URL + this.projectID

    this.logger.log('[PROJECT-SERV] UPDATE GETTING-STARTED - URL ', url);

    const httpOptions = {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };

    const body = { 'gettingStarted': getting_started };

    this.logger.log('[PROJECT-SERV] UPDATE GETTING-STARTED - BODY ', body);

    return this._httpclient
      .put(url, JSON.stringify(body), httpOptions)
  }

  // --------------------------------------------------------------------------------------
  // ENABLE/DISABLE ASSIGNED NOTIFICATION - IS IN THE TAB NOTIFICATION OF PROJECT SETTINGS
  // --------------------------------------------------------------------------------------
  enableDisableAssignedNotification(status) {
    let promise = new Promise((resolve, reject) => {

      this.logger.log("[PROJECT-SERV]  ENABLE/DISABLE ASSIGNED NOTIFICATION status", status)
      let headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })

      this._httpclient.put(this.SERVER_BASE_PATH + "projects/" + this.projectID, { "settings.email.notification.conversation.assigned": status }, { headers: headers })
        .toPromise().then((res) => {
          resolve(res)
        }).catch((err) => {
          reject(err)
        })
    })
    return promise;
  }
  // --------------------------------------------------------------------------------------
  // ENABLE/DISABLE UNASSIGNED NOTIFICATION - IS IN THE TAB NOTIFICATION OF PROJECT SETTINGS
  // --------------------------------------------------------------------------------------
  enableDisableUnassignedNotification(status) {
    let promise = new Promise((resolve, reject) => {
      this.logger.log("[PROJECT-SERV]  ENABLE/DISABLE UNASSIGNED NOTIFICATION status", status)
      let headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })

      this._httpclient.put(this.SERVER_BASE_PATH + "projects/" + this.projectID, { "settings.email.notification.conversation.pooled": status }, { headers: headers })
        .toPromise().then((res) => {
          resolve(res)
        }).catch((err) => {
          reject(err)
        })
    })
    return promise;
  }

  // -------------------------------------
  // UPDATE SUBSCRIPTION !! Used for test
  // -------------------------------------
  public updatesubscription() {
    const httpOptions = {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };

    const url = this.SERVER_BASE_PATH + 'modules/payments/stripe/updatesubscription';
    this.logger.log('[PROJECT-SERV] UPDATE SUBSCRIPTION PUT URL ', url);

    const body = { 'projectid': this.projectID, 'userid': this.user._id };
    this.logger.log('[PROJECT-SERV] UPDATE SUBSCRIPTION PUT  BODY ', body);

    return this._httpclient
      .put(url, JSON.stringify(body), httpOptions)
  }

  // ----------------------------------------------------------------
  // Not used service
  // ----------------------------------------------------------------

  // -----------------------------------
  //  GET SUBSCRIPTION by ID !! Not used
  // -----------------------------------
  public getSubscriptionById(subscriptionId: string): Observable<[any]> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };

    const url = this.SERVER_BASE_PATH + 'modules/payments/stripe/stripesubs/' + subscriptionId;
    this.logger.log('[PROJECT-SERV] - GET SUBSCRIPTION BY ID - ID', subscriptionId);
    this.logger.log('[PROJECT-SERV] - GET SUBSCRIPTION BY ID - URL', url);


    return this._httpclient
      .get<[any]>(url, httpOptions)
  }

  // ----------------------------------------------------------------------
  // !!! NOT USED -  DOWNGRADE PLAN - todo from put to patch & TODO SERVICE
  // ----------------------------------------------------------------------
  public downgradePlanToFree(projectid: string) {
    const url = this.PROJECTS_URL + projectid + '/downgradeplan';
    this.logger.log('[PROJECT-SERV] DOWNGRADE PLAN TO FREE  - URL ', url);

    const httpOptions = {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };

    const body = { 'profile.type': 'free', 'profile.name': 'free' };
    this.logger.log('[PROJECT-SERV] - DOWNGRADE PLAN TO FREE - body ', body);

    return this._httpclient
      .put(url, JSON.stringify(body), httpOptions)
  }

  // --------------------------------
  //  GET CUSTOMER by ID !! Not used   
  // --------------------------------
  public getCustomerById(customerId: string): Observable<[any]> {
    const url = this.SERVER_BASE_PATH + 'modules/payments/stripe/customers/' + customerId;
    // const url =  'https://cabd-151-35-162-143.ngrok.io/modules/payments/stripe/customers/' + customerId;
    this.logger.log('[PROJECT-SERV] - GET CUSTOMER BY ID - ID', customerId);
    this.logger.log('[PROJECT-SERV] - GET CUSTOMER BY ID - URL', url);
   
    const httpOptions = {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };
    return this._httpclient
      .get<[any]>(url, httpOptions)
  } 

}

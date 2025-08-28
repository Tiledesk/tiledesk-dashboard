import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AutomationUploadCsvComponent } from 'app/automation-upload-csv/automation-upload-csv.component';
import { AuthService } from 'app/core/auth.service';
import { AutomationsService } from 'app/services/automations.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { RoleService } from 'app/services/role.service';
import { Location } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
const Swal = require('sweetalert2')

@Component({
  selector: 'appdashboard-automation-create',
  templateUrl: './automation-create.component.html',
  styleUrls: ['./automation-create.component.scss']
})
export class AutomationCreateComponent implements OnInit {

  private unsubscribe$: Subject<any> = new Subject<any>();
  public IS_OPEN_SETTINGS_SIDEBAR: boolean;
  public isChromeVerGreaterThan100: boolean
  templates_list = [];
  projectId: string;
  phone_number_id: string;
  selected_template: any;
  selected_template_name: any;
  selected_template_lang: any;
  templateName: string;
  csvOutput: any;

  // -------------
  header_component: any;
  body_component: any;
  footer_component: any;
  buttons_component: any;
  url_button_component: any;
  url_button_component_temp: any;
  header_component_temp: any;
  body_component_temp: any;
  body_params = [];
  header_params = [];
  buttons_params = [];
  previsioning_url: string;
  src: any;
  sanitizedUrl: any;
  fileUploadAccept: string
  // -------------

  csvFile: File;
  parsedCsvData: any;
  displayedColumns: string[] = [];
  automation_id: string;

  fakeTmplt = [{ "name": "promo_mensile", "parameter_format": "POSITIONAL", "components": [{ "type": "HEADER", "format": "IMAGE", "example": { "header_handle": ["https://scontent.whatsapp.net/v/t61.29466-34/343725253_729228922313210_6754026546673493433_n.jpg?ccb=1-7&_nc_sid=8b1bef&_nc_ohc=uJnqYx8IR-AQ7kNvwHJEtFo&_nc_oc=Adk0wVT4Fg9gn4YCFxTKFPcWfw4VOCmdbcjTtMLwxdQGJnGyOyAMtG1zCMiqJ9NBFWM&_nc_zt=3&_nc_ht=scontent.whatsapp.net&edm=AH51TzQEAAAA&_nc_gid=JBHqlsUw1l4jymRX24x1TA&oh=01_Q5Aa2AGWof5sqqX3V_ZQ8hd2B5eMNTHObB04o-LSLdMc6rghRg&oe=68BADCB3"] } }, { "type": "BODY", "text": "Ciao *{{1}}*,\nIn offerta per i nostri clienti, solo per il mese di {{2}}\n\n*{{3}}*\na soli € _{{4}}_ invece di € ~{{5}}~", "example": { "body_text": [["Marco", "Maggio", "JALAPENOS CHEDDAR 5PZX1KG(CGM)", "24,99", "29,99"]] } }, { "type": "FOOTER", "text": "Scopri le altre offerte su www.eurofoodservice.it" }, { "type": "BUTTONS", "buttons": [{ "type": "URL", "text": "Acquista ora!", "url": "https://www.eurofoodservice.it/it/ultimi-arrivi/10628-jalapenos-cheddar-5pzx1kgcgm.html{{1}}", "example": ["https://www.eurofoodservice.it/it/ultimi-arrivi/10628-jalapenos-cheddar-5pzx1kgcgm.html?user=fake0b33d91d"] }] }], "language": "it", "status": "APPROVED", "category": "MARKETING", "id": "729228918979877" }, { "name": "codice_sconto_2", "parameter_format": "POSITIONAL", "components": [{ "type": "HEADER", "format": "TEXT", "text": "Codice promozionale" }, { "type": "BODY", "text": "Ciao {{1}}, solo per te un codice sconto del *{{2}}%* su tutto il nostro catalogo.\n\nUsa il codice {{3}} in fase di acquisto.\n\n*Codice utilizzabile per un solo acquisto", "example": { "body_text": [["Marco", "30%", "SUMMER2023"]] } }, { "type": "FOOTER", "text": "Non ti interessa? Tocca Interrompi promozioni" }, { "type": "BUTTONS", "buttons": [{ "type": "QUICK_REPLY", "text": "Grazie!" }, { "type": "QUICK_REPLY", "text": "Vai ai preferiti" }, { "type": "QUICK_REPLY", "text": "Interrompi promozioni" }] }], "language": "it", "status": "APPROVED", "category": "MARKETING", "id": "266717792558792" }, { "name": "fine_supporto", "parameter_format": "POSITIONAL", "components": [{ "type": "BODY", "text": "Ciao da Assi.Cura,\nCome nostro cliente hai diritto ad uno sconto del 10% sulla tua prossima polizza.\nA cosa sei interessato?" }, { "type": "BUTTONS", "buttons": [{ "type": "QUICK_REPLY", "text": "Polizza Auto" }, { "type": "QUICK_REPLY", "text": "Polizza Vita" }, { "type": "QUICK_REPLY", "text": "Polizza Moto" }, { "type": "QUICK_REPLY", "text": "Polizza Famiglia" }, { "type": "QUICK_REPLY", "text": "Polizza Casa" }] }], "language": "it", "status": "APPROVED", "category": "MARKETING", "sub_category": "CUSTOM", "id": "509677821785781" }, { "name": "tiledesk_scheduler", "parameter_format": "POSITIONAL", "components": [{ "type": "HEADER", "format": "IMAGE", "example": { "header_handle": ["https://scontent.whatsapp.net/v/t61.29466-34/394168429_23901956129448434_7220288921085766441_n.png?ccb=1-7&_nc_sid=8b1bef&_nc_ohc=JhAJccIAtasQ7kNvwFPd1fn&_nc_oc=AdkObNiva_peHoapo7PL6v-NExbMgqym25OIMj3NVQPxIfASPejnb8j2Seu8ZxC8elA&_nc_zt=3&_nc_ht=scontent.whatsapp.net&edm=AH51TzQEAAAA&_nc_gid=JBHqlsUw1l4jymRX24x1TA&oh=01_Q5Aa2AEuBiNV1U__PELmQsuD34cQr-7jv4TcHF7PQMXrkY4Qsg&oe=68BAC07F"] } }, { "type": "BODY", "text": "*Operazione Scheduler*\n\nSe hai ricevuto questo messaggio vuol dire che da oggi è possibile utilizzare Whatsapp con Tiledesk per inviare campagne utilizzando lo schema Scheduler-Worker!\nPuoi darci un riscontro rispondendo a questo messaggio." }, { "type": "FOOTER", "text": "_Il team di Tiledesk_" }, { "type": "BUTTONS", "buttons": [{ "type": "QUICK_REPLY", "text": "Ho ricevuto il messaggio" }] }], "language": "it", "status": "APPROVED", "category": "MARKETING", "id": "23901956106115103" }, { "name": "store_fisico", "parameter_format": "POSITIONAL", "components": [{ "type": "HEADER", "format": "LOCATION" }, { "type": "BODY", "text": "Le offerte imperdibile proseguono nel nostro store fisico.\nVieni a trovarci a in \n📍_via Bruxelles, 30 - Z.I. Soleto, Lecce, Italia_" }], "language": "it", "status": "APPROVED", "category": "MARKETING", "id": "810382583422764" }, { "name": "giacenza_ordine", "parameter_format": "POSITIONAL", "components": [{ "type": "BODY", "text": "Ciao {{1}},\nabbiamo provato a consegnarti un pacco, ma non ci siamo riusciti.\nIl pacco relativo all'ordine *{{2}}* è adesso in giacenza presso il nostro magazzino.\nSe vuoi riprogrammare la consegna clicca sul bottone qui sotto.", "example": { "body_text": [["John", "123456789"]] } }, { "type": "FOOTER", "text": "Il team di Tiledesk" }, { "type": "BUTTONS", "buttons": [{ "type": "QUICK_REPLY", "text": "Riprogramma ora" }] }], "language": "it", "status": "APPROVED", "category": "UTILITY", "id": "909025190948975" }, { "name": "codice_sconto", "parameter_format": "POSITIONAL", "components": [{ "type": "HEADER", "format": "TEXT", "text": "Codice promozionale" }, { "type": "BODY", "text": "Ciao {{1}}, solo per te un codice sconto del *{{2}}%* su tutto il nostro catalogo.\n\nUsa il codice {{3}} in fase di acquisto.\n\n*Codice utilizzabile per un solo acquisto", "example": { "body_text": [["John", "30", "WINTER30"]] } }, { "type": "FOOTER", "text": "Non ti interessa? Tocca Interrompi promozioni" }, { "type": "BUTTONS", "buttons": [{ "type": "QUICK_REPLY", "text": "Non mi interessa" }] }], "language": "it", "status": "APPROVED", "category": "MARKETING", "id": "241243738551710" }, { "name": "issue_resolution", "parameter_format": "POSITIONAL", "components": [{ "type": "HEADER", "format": "TEXT", "text": "Hi {{1}}", "example": { "header_text": ["Marco"] } }, { "type": "BODY", "text": "were we able to solve your problem about {{1}}?", "example": { "body_text": [["the use of templates"]] } }, { "type": "FOOTER", "text": "The Tiledesk Team" }, { "type": "BUTTONS", "buttons": [{ "type": "QUICK_REPLY", "text": "Yes, thank you!" }, { "type": "QUICK_REPLY", "text": "No" }] }], "language": "en_US", "status": "REJECTED", "category": "UTILITY", "id": "188981247423476" }, { "name": "promo_mensile_2", "parameter_format": "POSITIONAL", "components": [{ "type": "HEADER", "format": "IMAGE", "example": { "header_handle": ["https://scontent.whatsapp.net/v/t61.29466-34/347084442_622522489760178_4258564200183192902_n.jpg?ccb=1-7&_nc_sid=8b1bef&_nc_ohc=cSqfcr2WBDgQ7kNvwGASVqI&_nc_oc=AdkElw6eOHJw6r3-mXIDSq0VNUfhUPPmJEA1IKvly3C-dGF2p8Z0CY6U3SOduEHN5NI&_nc_zt=3&_nc_ht=scontent.whatsapp.net&edm=AH51TzQEAAAA&_nc_gid=JBHqlsUw1l4jymRX24x1TA&oh=01_Q5Aa2AGC6vqLsHdCmgcV8SRTaCWHzwS2OvFv6jPktRJHnArJTQ&oe=68BACEA8"] } }, { "type": "BODY", "text": "Ciao *{{1}}*,\nIn offerta per i nostri clienti, solo per il mese di {{2}}\n\n*{{3}}*\na soli € _{{4}}_ invece di € ~{{5}}~", "example": { "body_text": [["Marco", "Maggio", "JALAPENOS CHEDDAR 5PZX1KG(CGM)", "24,99", "29,99"]] } }, { "type": "FOOTER", "text": "Scopri le altre offerte su www.eurofoodservice.it" }, { "type": "BUTTONS", "buttons": [{ "type": "URL", "text": "Acquista ora!", "url": "https://www.eurofoodservice.it/{{1}}", "example": ["https://www.eurofoodservice.it/it/ultimi-arrivi/10628-jalapenos-cheddar-5pzx1kgcgm.html?user=marco123456"] }, { "type": "PHONE_NUMBER", "text": "Ordina per telefono", "phone_number": "+390836521511" }] }], "language": "it", "status": "APPROVED", "category": "MARKETING", "id": "622522486426845" }, { "name": "test_marketing", "parameter_format": "POSITIONAL", "components": [{ "type": "HEADER", "format": "IMAGE", "example": { "header_handle": ["https://scontent.whatsapp.net/v/t61.29466-34/347247516_769112138286827_1046197383828542239_n.jpg?ccb=1-7&_nc_sid=8b1bef&_nc_ohc=JLdTY7wWWakQ7kNvwGr0HrO&_nc_oc=AdnHJplQTgDzAyqsfb0jK3I1vqKPU6oowaSLmRJ06HEFpg8-8lQRh81Ds0RJkWn6Wm8&_nc_zt=3&_nc_ht=scontent.whatsapp.net&edm=AH51TzQEAAAA&_nc_gid=JBHqlsUw1l4jymRX24x1TA&oh=01_Q5Aa2AFq2q0aymJrt-NCEbvTJqLuNPvfbLciczJrEYbW4I7uag&oe=68BACC50"] } }, { "type": "BODY", "text": "In offerta solo per questa settimana {{1}} al prezzo di {{2}}!\nValida solo per i clienti Eurofood.", "example": { "body_text": [["Croissant Superfarcito al Cioccolato 3x1", "3€"]] } }, { "type": "FOOTER", "text": "www.eurofoodservice.it" }, { "type": "BUTTONS", "buttons": [{ "type": "URL", "text": "Acquista subito", "url": "https://www.eurofoodservice.it/it/ultimi-arrivi/11151-croissant-superfarcito-cioccolato-56pzx100grbu.html" }] }], "language": "it", "status": "APPROVED", "category": "MARKETING", "id": "769112134953494" }, { "name": "fattura_acquisto", "parameter_format": "POSITIONAL", "components": [{ "type": "HEADER", "format": "DOCUMENT", "example": { "header_handle": ["https://scontent.whatsapp.net/v/t61.29466-34/346935368_567293045520623_7846722721882459788_n.pdf?ccb=1-7&_nc_sid=8b1bef&_nc_ohc=DJQNRD0c5WMQ7kNvwG6AeO2&_nc_oc=Adke1lTi_2a3YehCIIkVMRRyWVzFE1HvjCYSe4DwgYKRsSeS-dMKBk7CrVcHJhemrA0&_nc_zt=3&_nc_ht=scontent.whatsapp.net&edm=AH51TzQEAAAA&_nc_gid=JBHqlsUw1l4jymRX24x1TA&oh=01_Q5Aa2AGL_1Gbn7cL8az8SWgmP9oMo39PoAhcrfHK01gWQ4-Xlg&oe=68BAC7A3"] } }, { "type": "BODY", "text": "Ciao *{{1}}*,\nè disponibile la fattura di vendita numero *{{2}}*\nriferita all'ordine numero *{{3}}* del _{{4}}_\n\nA presto!", "example": { "body_text": [["Marco", "23F0064772", "EVYCKBZZG", "17/05/2023"]] } }, { "type": "FOOTER", "text": "Il team di Eurofood" }, { "type": "BUTTONS", "buttons": [{ "type": "PHONE_NUMBER", "text": "Problemi con la fattura?", "phone_number": "+393484506627" }] }], "language": "it", "status": "APPROVED", "category": "UTILITY", "id": "566707308912530" }, { "name": "hello_world", "parameter_format": "POSITIONAL", "components": [{ "type": "HEADER", "format": "TEXT", "text": "Hello World" }, { "type": "BODY", "text": "Welcome and congratulations!! This message demonstrates your ability to send a WhatsApp message notification from the Cloud API, hosted by Meta. Thank you for taking the time to test with us." }, { "type": "FOOTER", "text": "WhatsApp Business Platform sample message" }], "language": "en_US", "status": "APPROVED", "category": "UTILITY", "id": "1283803345820684" }]
  
  constructor(
    private auth: AuthService,
    private logger: LoggerService,
    private automationsService: AutomationsService,
    private router: Router,
    private roleService: RoleService,
    public dialog: MatDialog,
    public location: Location,
    public sanitizer: DomSanitizer,
    private translate: TranslateService,
  ) { }

  ngOnInit(): void {
    this.roleService.checkRoleForCurrentProject('automations')
    this.getBrowserVersion();
    this.listenSidebarIsOpened();
    this.getWATemplates();
    this.getCurrentProject();
    // this.templates_list = this.fakeTmplt
    // this.logger.log("[AUTOMATION-CREATE] GET WA TEMPLATES templates fake ", this.templates_list);
  }

   ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  getCurrentProject() {
      this.auth.project_bs
        .pipe(
          takeUntil(this.unsubscribe$)
        )
        .subscribe((project) => {
          if (project) {
            this.projectId = project._id;
            this.logger.log('[AUTOMATION-CREATE] - projectId ', this.projectId)
          }
        });
    }

  downloadFile(data, filename) {
    const blob = new Blob(['\ufeff' + data], { type: 'text/csv;charset=utf-8;' });
    const dwldLink = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const isSafariBrowser = navigator.userAgent.indexOf('Safari') !== -1 && navigator.userAgent.indexOf('Chrome') === -1;
    this.logger.log('[AUTOMATION-CREATE] isSafariBrowser ', isSafariBrowser)
    if (isSafariBrowser) {  // if Safari open in new window to save file with random filename.
      dwldLink.setAttribute('target', '_blank');

      /**
       * *** FOR SAFARI TO UNCOMMENT AND TEST ***
       */
      // https://stackoverflow.com/questions/29799696/saving-csv-file-using-blob-in-safari/46641236
      // const link = document.createElement('a');
      // link.id = 'csvDwnLink';

      // document.body.appendChild(link);
      // window.URL = window.URL;
      // const csv = '\ufeff' + data,
      //   csvData = 'data:attachment/csv;charset=utf-8,' + encodeURIComponent(csv),
      //   filename = 'filename.csv';
      // $('#csvDwnLink').attr({ 'download': filename, 'href': csvData });
      // $('#csvDwnLink')[0].click();
      // document.body.removeChild(link);
    }
    dwldLink.setAttribute('href', url);
    dwldLink.setAttribute('download', filename);
    dwldLink.style.visibility = 'hidden';
    document.body.appendChild(dwldLink);
    dwldLink.click();
    document.body.removeChild(dwldLink);
  }

  getWATemplates() {
    this.automationsService.getWATemplates().subscribe((templates: any) => {
      this.logger.log("[AUTOMATION-CREATE] GET WA TEMPLATES templates ", templates);
      // this.logger.log("[AUTOMATION-CREATE] GET WA TEMPLATES templates fake ", this.fakeTmplt);
      this.templates_list = templates

      // .map(t => {
      //   if (t.category === 'MARKETING') {
      //     t['icon'] = "campaign"
      //   }
      //   else {
      //     t['icon'] = "notifications_active"
      //   }
      //   // t['description'] = t.components.find(c => c.type === 'BODY').text;
      //   return t;
      // })


    }, (error) => {

      this.logger.error("[AUTOMATION-CREATE] - GET WA TEMPLATES - ERROR: ", error)

    }, () => {

      this.logger.log('[AUTOMATION-CREATE] - GET WA TEMPLATES * COMPLETE *');

    });
  }

  onSelectTemplate() {
    this.selected_template = this.templates_list.find(t => t.name === this.templateName);
    this.logger.log('[AUTOMATION-CREATE] onSelectTemplate selected_template', this.selected_template)
    this.selected_template_name = this.selected_template.name
    this.selected_template_lang = this.selected_template.language

    this.logger.log('[AUTOMATION-CREATE] onSelectTemplate selected_template_name', this.selected_template_name)
    const phoneNumbers = ['3931234567'];
    this.csvOutput = this.generateCSVFromWhatsAppTemplate(this.selected_template, phoneNumbers);

    this.logger.log('[AUTOMATION-CREATE] csvOutput', this.csvOutput)
    // if (csvOutput) {
    //  this.downloadFile(csvOutput, 'example.csv');
    // }
    this.createTemplatePreview()
  }

  // formatWaText(text?: string): SafeHtml {
  //   if (!text) { return ''; }
  //   // 1) escape HTML
  //   let s = text.replace(/&/g, '&amp;')
  //               .replace(/</g, '&lt;')
  //               .replace(/>/g, '&gt;');
  //   // 2) convert line breaks
  //   s = s.replace(/\n/g, '<br/>');
  //   // 3) WhatsApp-style -> HTML
  //   s = s.replace(/\*(.+?)\*/g, '<strong>$1</strong>')   // *bold*
  //        .replace(/_(.+?)_/g, '<em>$1</em>')             // _italic_
  //        .replace(/~(.+?)~/g, '<s>$1</s>');              // ~strike~
  //   return this.sanitizer.bypassSecurityTrustHtml(s);
  // }

  createTemplatePreview() {
    this.header_params = [];
    this.body_params = [];
    this.buttons_params = [];
    this.previsioning_url = null;

    let temp_template = JSON.parse(JSON.stringify(this.selected_template));
    this.header_component = temp_template.components.find(c => c.type === 'HEADER');
    this.logger.log('[AUTOMATION-CREATE] header_component', this.header_component)
    this.body_component = temp_template.components.find(c => c.type === 'BODY');
    this.logger.log('[AUTOMATION-CREATE] body_component', this.body_component)
    this.footer_component = temp_template.components.find(c => c.type === 'FOOTER');
    this.logger.log('[AUTOMATION-CREATE] footer_component', this.footer_component)
    this.buttons_component = temp_template.components.find(c => c.type === 'BUTTONS');
    this.logger.log('[AUTOMATION-CREATE] footer_component', this.buttons_component)
    if (this.buttons_component) {
      this.url_button_component = this.buttons_component.buttons.find(c => c.type === 'URL')
    }

    if (this.header_component) {
      this.header_component_temp = JSON.parse(JSON.stringify(this.header_component));
      if (this.header_component.format === 'TEXT') {
        // if (this.header_component.example &&
        //   this.header_component.example.header_text) {
        //   this.header_component.example.header_text.forEach((p, i) => {
        //     this.header_params.push({ index: i + 1, type: this.header_component.format, text: null })
        //   })
        // }
        const headerValues = this.header_component.example?.header_text || [];
        headerValues.forEach((val, i) => {
          const re = new RegExp('\\{\\{' + (i + 1) + '\\}\\}', 'g');
          this.header_component.text = (this.header_component.text || '').replace(re, val);
          this.header_params.push({ index: i + 1, type: 'TEXT', text: val });
        });
      }
      else if (this.header_component.format === 'IMAGE') {
        const links = this.header_component.example?.header_handle || [];
        links.forEach((link, i) => {
          this.header_params.push({ index: i + 1, type: 'IMAGE', image: { link } });
        });
      }
      else if (this.header_component.format === 'DOCUMENT') {
        // if (this.header_component.example &&
        //   this.header_component.example.header_handle) {
        //   this.fileUploadAccept = ".pdf"
        //   this.src = this.header_component.example.header_handle[0];
        //   this.sanitizeUrl(this.header_component.example.header_handle[0]);
        //   this.header_component.example.header_handle.forEach((p, i) => {
        //     this.header_params.push({ index: i + 1, type: this.header_component.format, document: { link: null } })
        //   })
        // }
        const handles = this.header_component.example?.header_handle || [];
        if (handles.length) {
          this.fileUploadAccept = '.pdf';
          this.src = handles[0];                  // URL del PDF per eventuale anteprima
          this.sanitizeUrl(handles[0]);           // prepara sanitizedUrl se usi l’iframe

          // Prefilla i parametri del documento (utile se devi mostrare/modificare i param)
          handles.forEach((link, i) => {
            this.header_params.push({
              index: i + 1,
              type: 'DOCUMENT',
              document: { link }
            });
          });
        }
      }
      else if (this.header_component.format === 'LOCATION') {
        this.header_params.push({ index: 1, type: this.header_component.format, location: { latitude: null, longitude: null, name: null, address: null } })
      }
      else {
        this.logger.log("[WHATSAPP RECEIVER] Check unrecognized Header: ", this.header_component)
      }
    }

    if (this.body_component) {
      // this.body_component_temp = JSON.parse(JSON.stringify(this.body_component));
      // if (this.body_component.example) {
      //   this.body_component.example.body_text[0].forEach((p, i) => {
      //     this.body_params.push({ index: i + 1, type: "text", text: null })
      //   })
      // }
      const bodyValues = this.body_component.example?.body_text?.[0] || [];
      bodyValues.forEach((val, i) => {
        const colLabel = `[body_${i}]`;   // etichetta colonna CSV
        const re = new RegExp('\\{\\{' + (i + 1) + '\\}\\}', 'g');
        this.body_component.text = (this.body_component.text || '').replace(re, `${val} [body_${i}]`);
        this.body_params.push({ index: i + 1, type: 'text', text: val });
      });
    }

    // if (this.url_button_component) {
    //   this.url_button_component_temp = JSON.parse(JSON.stringify(this.url_button_component));
    //   if (this.url_button_component.example) {
    //     this.url_button_component.example.forEach((p, i) => {
    //       this.buttons_params.push({ index: i + 1, type: "text", text: null })
    //       this.previsioning_url = this.url_button_component.url;
    //     })
    //   }
    // }
    if (this.url_button_component?.example?.[0]) {
      const originalUrl = this.url_button_component.url || '';
      const exampleUrl = this.url_button_component.example[0];

      if (originalUrl.includes('{{1}}')) {
        const [prefix, suffix] = originalUrl.split('{{1}}');
        let paramText = '';
        if (exampleUrl.startsWith(prefix) && exampleUrl.endsWith(suffix)) {
          paramText = exampleUrl.slice(prefix.length, exampleUrl.length - suffix.length);
        }
        this.buttons_params = [{ index: 1, type: 'text', text: paramText }];
        this.url_button_component.url = originalUrl.replace('{{1}}', paramText);

        const bi = this.buttons_component.buttons.findIndex(b => b.type === 'URL');
        if (bi > -1) this.buttons_component.buttons[bi] = this.url_button_component;
        this.previsioning_url = this.url_button_component.url;
      }
    }

  }

  sanitizeUrl(url) {
    this.sanitizedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  onHeaderImageError(event) {
    event.target.src = this.header_component.example.header_handle[0];
  }

  openUploadCSVDialog() {
    const dialogRef = this.dialog.open(AutomationUploadCsvComponent, {
      backdropClass: 'cdk-overlay-transparent-backdrop',
      hasBackdrop: true,
      width: '600px',
      data: {
        csvOutput: this.csvOutput,
        selected_template_name: this.selected_template_name
      },
    });
    this.logger.log('[AUTOMATION-CREATE] AutomationUploadCsv ')
    dialogRef.afterClosed().subscribe(result => {
      this.logger.log('[AUTOMATION-CREATE] AutomationUploadCsv (afterClosed) result : ', result);
      if (result) {
        this.csvFile = result.file
        this.parsedCsvData = result.parsedData
        const firstRow = this.parsedCsvData[0];
        if (firstRow) {
          this.displayedColumns = Object.keys(firstRow);
        }
        this.logger.log('[AUTOMATION-CREATE] AutomationUploadCsv (afterClosed) csvFile : ', this.csvFile);
        this.logger.log('[AUTOMATION-CREATE] AutomationUploadCsv (afterClosed) parsedCsvData : ', this.parsedCsvData);
      }
    });
  }



  getBrowserVersion() {
    this.auth.isChromeVerGreaterThan100.subscribe((isChromeVerGreaterThan100: boolean) => {
      this.isChromeVerGreaterThan100 = isChromeVerGreaterThan100;
    })
  }

  listenSidebarIsOpened() {
    this.auth.settingSidebarIsOpned.subscribe((isopened) => {
      this.logger.log('[AUTOMATION-CREATE] SETTINGS-SIDEBAR isopened (FROM SUBSCRIPTION) ', isopened)
      this.IS_OPEN_SETTINGS_SIDEBAR = isopened
    });
  }


  // interface WhatsAppTemplate {
  //   name: string;
  //   parameter_format: string;
  //   components: any[];
  //   language: string;
  //   status: string;
  //   category: string;
  //   id: string;
  // }

  generateCSVFromWhatsAppTemplate(template: any, phoneNumbers: string[]): string {
    const headerFields: string[] = [];
    const rows: string[][] = [];

    const headerComponent = template.components.find(c => c.type === 'HEADER');
    const bodyComponent = template.components.find(c => c.type === 'BODY');
    const footerComponent = template.components.find(c => c.type === 'FOOTER');
    const buttonsComponent = template.components.find(c => c.type === 'BUTTONS');

    const bodyExamples: string[][] = bodyComponent?.example?.body_text ?? [[]];
    const headerExample = headerComponent?.example;
    const buttonsExamples = buttonsComponent?.buttons?.[0]?.example ?? [];

    headerFields.push(`phone_number`);
    // Determine header columns
    if (headerComponent) {
      headerFields.push('header_0');
    }

    if (bodyExamples.length > 0) {
      for (let i = 0; i < bodyExamples[0].length; i++) {
        headerFields.push(`body_${i}`);
      }
    }

    if (buttonsExamples.length > 0) {
      headerFields.push('buttons_0');
    }

    // Build data rows
    for (let i = 0; i < phoneNumbers.length; i++) {
      const row: string[] = [];
      row.push(phoneNumbers[i]);

      // Header
      if (headerComponent?.format === 'IMAGE' && headerExample?.header_handle?.[0]) {
        row.push(headerExample.header_handle[0]);
      } else if (headerComponent?.format === 'TEXT' && headerExample?.header_text?.[0]) {
        row.push(headerExample.header_text[0]);
      } else if (headerComponent) {
        row.push(''); // empty if format exists but no example
      }

      // Body
      const bodyParams = bodyExamples[i] ?? [];
      for (let j = 0; j < (bodyExamples[0]?.length ?? 0); j++) {
        row.push(bodyParams[j] ?? '');
      }

      // Buttons
      if (buttonsExamples[i]) {
        row.push(buttonsExamples[i]);
      } else if (buttonsExamples[0]) {
        row.push(buttonsExamples[0]); // fallback to first
      }

      rows.push(row);
    }

    // Convert to CSV string
    const csv = [headerFields.join(';'), ...rows.map(row => row.join(';'))].join('\n');
    return csv;
  }


  goBack() {
    this.location.back();
  }



  presentDialogBeforeToSendToServer() {

    Swal.fire({
      title: this.translate.instant('AreYouSure'),
      text: this.translate.instant('ByPressingTheSendButtonYouWillSendTheMessageTo', { contacts_num: this.parsedCsvData.length, template_name: this.selected_template_name }),//`By pressing the Send button you will send a message to ${this.parsedCsvData.length} contact using the template ${this.selected_template_name}`, // "By pressing the Send button you will send the message to {{contacts_num}} using the template {{template_name}}" ,
      icon: "warning",
      showCloseButton: false,
      showCancelButton: true,
      showConfirmButton: true,
      showDenyButton: false,
      confirmButtonText: this.translate.instant('Send'),
      cancelButtonText: this.translate.instant('Cancel'),
      focusConfirm: false,
      reverseButtons: true,
      // buttons: ["Cancel", "Delete"],
      // dangerMode: true,
    })
      .then((result) => {
        if (result.isConfirmed) {

          if (!this.csvFile) return;
          this.logger.log('[AUTOMATION-CREATE] SEND TO SERVER csvFile ', this.csvFile);
          this.logger.log('[AUTOMATION-CREATE] SEND TO SERVER id_project ', this.projectId);
          this.logger.log('[AUTOMATION-CREATE] SEND TO SERVER selected_template_lang ', this.selected_template_lang);
          this.logger.log('[AUTOMATION-CREATE] SEND TO SERVER selected_template_name ', this.selected_template_name);
          const formData = new FormData();
          formData.append('delimiter', ';');
          formData.append('id_project', this.projectId);
          formData.append('template_name', this.selected_template_name);
          formData.append('template_language', this.selected_template_lang);
          formData.append('uploadFile', this.csvFile, this.csvFile.name);
          this.automationsService.uploadCsv(formData).subscribe(res => {
            this.logger.log('[AUTOMATION-CREATE] SEND TO SERVER res', res);
            if (res) {
              this.automation_id = res['automation_id']
              this.logger.log('[AUTOMATION-CREATE] SEND TO SERVER automation_id', this.automation_id);
            }

          }, (error) => {
            this.logger.error('[AUTOMATION-CREATE] SEND TO SERVER- ERROR ', error);
            this.logger.error('[AUTOMATION-CREATE] SEND TO SERVER- ERROR ERROR ERROR', error.error.error);
            let error_msg = ""
            if(error.error.error === 'WhatsApp not configured or missing business_account_id.') {
              error_msg = this.translate.instant('WhatsAppNotConfiguredOrMissingBusinessAccountID') //'WhatsApp not configured or missing business_account_id.'
            } else {
              error_msg = this.translate.instant('HoursPage.ErrorOccurred')
            }
            Swal.fire({
              title: this.translate.instant('Oops') + '!',
              text: error_msg,
              icon: "error",
              showCloseButton: false,
              showCancelButton: false,
              confirmButtonText: this.translate.instant('Ok'),
              // confirmButtonColor: "var(--primary-btn-background)",
            });

          }, () => {
            this.logger.log('[AUTOMATION-CREATE] SEND TO SERVER * COMPLETE *');

            this.parsedCsvData = undefined

            Swal.fire({
              title: this.translate.instant('Done') + "!",
              text: this.translate.instant('TheBroadcastHasStarted'), // "The broadcast has started. You can check its status on the dedicated page.",
              icon: "success",
              showCloseButton: false,
              showCancelButton: false,
              // confirmButtonColor: "var(--primary-btn-background)",
              confirmButtonText: this.translate.instant('Ok'),
              
            }).then((okpressed) => {
              this.logger.log('[AUTOMATION-CREATE] okpressed')
              // this.router.navigate(['project/' + this.projectId + '/automations/'], { queryParams: { id: this.automation_id } });
            });
          });

        } else {
          this.logger.log('[AUTOMATION-CREATE] (else)')
        }
      });
  }

  // sendToServer() {
  //   if (!this.csvFile) return;
  //   this.logger.log('[AUTOMATION-CREATE] SEND TO SERVER csvFile ', this.csvFile);
  //   const formData = new FormData();
  //   formData.append('delimiter', ';');
  //   formData.append('id_project', '64425d26aaa97d0013819905');
  //   formData.append('template_name', this.templateName);
  //   formData.append('template_language', 'it');
  //   formData.append('uploadFile', this.csvFile, this.csvFile.name);
  //   this.automationsService.uploadCsv(formData).subscribe(data => {
  //     this.logger.log('[AUTOMATION-CREATE] SEND TO SERVER ', data);
  //     if (data) {
  //       // this.parse_done = true;
  //     }

  //   }, (error) => {
  //     this.logger.error('[AUTOMATION-CREATE] SEND TO SERVER- ERROR ', error);


  //   }, () => {
  //     this.logger.log('[AUTOMATION-CREATE] SEND TO SERVER * COMPLETE *');

  //   });
  // }


}

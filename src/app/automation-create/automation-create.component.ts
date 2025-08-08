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
@Component({
  selector: 'appdashboard-automation-create',
  templateUrl: './automation-create.component.html',
  styleUrls: ['./automation-create.component.scss']
})
export class AutomationCreateComponent implements OnInit {

  public IS_OPEN_SETTINGS_SIDEBAR: boolean;
  public isChromeVerGreaterThan100: boolean
  templates_list = [];

  phone_number_id: string;
  selected_template: any;
  selected_template_name: any;
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

  template = {
    "name": "promo_mensile",
    "parameter_format": "POSITIONAL",
    "components": [
      {
        "type": "HEADER",
        "format": "IMAGE",
        "example": {
          "header_handle": [
            "https://scontent.whatsapp.net/v/t61.29466-34/343725253_729228922313210_6754026546673493433_n.jpg?ccb=1-7&_nc_sid=8b1bef&_nc_ohc=uJnqYx8IR-AQ7kNvwHJEtFo&_nc_oc=Adk0wVT4Fg9gn4YCFxTKFPcWfw4VOCmdbcjTtMLwxdQGJnGyOyAMtG1zCMiqJ9NBFWM&_nc_zt=3&_nc_ht=scontent.whatsapp.net&edm=AH51TzQEAAAA&_nc_gid=JBHqlsUw1l4jymRX24x1TA&oh=01_Q5Aa2AGWof5sqqX3V_ZQ8hd2B5eMNTHObB04o-LSLdMc6rghRg&oe=68BADCB3"
          ]
        }
      },
      {
        "type": "BODY",
        "text": "Ciao *{{1}}*,\nIn offerta per i nostri clienti, solo per il mese di {{2}}\n\n*{{3}}*\na soli € _{{4}}_ invece di € ~{{5}}~",
        "example": {
          "body_text": [
            [
              "Marco",
              "Maggio",
              "JALAPENOS CHEDDAR 5PZX1KG(CGM)",
              "24,99",
              "29,99"
            ]
          ]
        }
      },
      {
        "type": "FOOTER",
        "text": "Scopri le altre offerte su www.eurofoodservice.it"
      },
      {
        "type": "BUTTONS",
        "buttons": [
          {
            "type": "URL",
            "text": "Acquista ora!",
            "url": "https://www.eurofoodservice.it/it/ultimi-arrivi/10628-jalapenos-cheddar-5pzx1kgcgm.html{{1}}",
            "example": [
              "https://www.eurofoodservice.it/it/ultimi-arrivi/10628-jalapenos-cheddar-5pzx1kgcgm.html?user=fake0b33d91d"
            ]
          }
        ]
      }
    ],
    "language": "it",
    "status": "APPROVED",
    "category": "MARKETING",
    "id": "729228918979877"
  }




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
  ) { }

  ngOnInit(): void {
    this.roleService.checkRoleForCurrentProject('automations')
    this.getBrowserVersion();
    this.listenSidebarIsOpened();
    // this.getWATemplates()
    this.templates_list = this.fakeTmplt
    console.log("[AUTOMATION-CREATE] GET WA TEMPLATES templates fake ", this.templates_list);


  }

  downloadFile(data, filename) {
    const blob = new Blob(['\ufeff' + data], { type: 'text/csv;charset=utf-8;' });
    const dwldLink = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const isSafariBrowser = navigator.userAgent.indexOf('Safari') !== -1 && navigator.userAgent.indexOf('Chrome') === -1;
    this.logger.log('[FAQ-COMP] isSafariBrowser ', isSafariBrowser)
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
      // console.log("[AUTOMATION-CREATE] GET WA TEMPLATES templates ", templates);
      console.log("[AUTOMATION-CREATE] GET WA TEMPLATES templates fake ", this.fakeTmplt);
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

      console.error("[AUTOMATION-CREATE] - GET WA TEMPLATES - ERROR: ", error)

    }, () => {

      console.log('[AUTOMATION-CREATE] - GET WA TEMPLATES * COMPLETE *');

    });
  }

  onSelectTemplate() {
    this.selected_template = this.templates_list.find(t => t.name === this.templateName);
    console.log('[AUTOMATION-CREATE] onSelectTemplate selected_template', this.selected_template)
    this.selected_template_name = this.selected_template.name
    console.log('[AUTOMATION-CREATE] onSelectTemplate selected_template_name', this.selected_template_name)
    const phoneNumbers = ['3484506627'];
    this.csvOutput = this.generateCSVFromWhatsAppTemplate(this.selected_template, phoneNumbers);

    console.log('[AUTOMATION-CREATE] csvOutput', this.csvOutput)
    // if (csvOutput) {
    //  this.downloadFile(csvOutput, 'example.csv');
    // }
    this.createTemplatePreview()
  }

  createTemplatePreview() {

    let temp_template = JSON.parse(JSON.stringify(this.selected_template));
    this.header_component = temp_template.components.find(c => c.type === 'HEADER');
    console.log('[AUTOMATION-CREATE] header_component', this.header_component)
    this.body_component = temp_template.components.find(c => c.type === 'BODY');
    console.log('[AUTOMATION-CREATE] body_component', this.body_component)
    this.footer_component = temp_template.components.find(c => c.type === 'FOOTER');
    console.log('[AUTOMATION-CREATE] footer_component', this.footer_component)
    this.buttons_component = temp_template.components.find(c => c.type === 'BUTTONS');
    console.log('[AUTOMATION-CREATE] footer_component', this.buttons_component)
    if (this.buttons_component) {
      this.url_button_component = this.buttons_component.buttons.find(c => c.type === 'URL')
    }

    if (this.header_component) {
      this.header_component_temp = JSON.parse(JSON.stringify(this.header_component));
      if (this.header_component.format === 'TEXT') {
        if (this.header_component.example &&
          this.header_component.example.header_text) {
          this.header_component.example.header_text.forEach((p, i) => {
            this.header_params.push({ index: i + 1, type: this.header_component.format, text: null })
          })
        }
      }
      else if (this.header_component.format === 'IMAGE') {
        if (this.header_component.example &&
          this.header_component.example.header_handle) {
          this.header_component.example.header_handle.forEach((p, i) => {
            this.header_params.push({ index: i + 1, type: this.header_component.format, image: { link: null } })
          })

        }
      }
      else if (this.header_component.format === 'DOCUMENT') {
        if (this.header_component.example &&
          this.header_component.example.header_handle) {
          this.fileUploadAccept = ".pdf"
          this.src = this.header_component.example.header_handle[0];
          this.sanitizeUrl(this.header_component.example.header_handle[0]);
          this.header_component.example.header_handle.forEach((p, i) => {
            this.header_params.push({ index: i + 1, type: this.header_component.format, document: { link: null } })
          })
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
      this.body_component_temp = JSON.parse(JSON.stringify(this.body_component));
      if (this.body_component.example) {
        this.body_component.example.body_text[0].forEach((p, i) => {
          this.body_params.push({ index: i + 1, type: "text", text: null })
        })
      }
    }

    if (this.url_button_component) {
      this.url_button_component_temp = JSON.parse(JSON.stringify(this.url_button_component));
      if (this.url_button_component.example) {
        this.url_button_component.example.forEach((p, i) => {
          this.buttons_params.push({ index: i + 1, type: "text", text: null })
          this.previsioning_url = this.url_button_component.url;
        })
      }
    }

    this.body_params.forEach((param, i) => {
      let index = i + 1;
      let regex = '{{' + index + '}}';
      if (param.text) {
        this.body_component.text = this.body_component.text.replace(regex, param.text);
      }
    })

    this.header_params.forEach((param, i) => {
      let index = i + 1;
      let regex = '{{' + index + '}}';
      if (param.text) {
        this.header_component.text = this.header_component.text.replace(regex, param.text);
      }
    })

    this.buttons_params.forEach((param, i) => {
      //this.logger.log("buttons_params - param: ", param);
      let index = i + 1;
      let regex = '{{' + index + '}}';
      if (param.text) {
        this.url_button_component.url = this.url_button_component.url.replace(regex, param.text);
      }
      let button_index = this.buttons_component.buttons.findIndex(b => b.type === 'URL');
      this.buttons_component.buttons[button_index] = this.url_button_component;
      this.previsioning_url = this.url_button_component.url;
    })

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
    console.log('[AUTOMATION-CREATE] AutomationUploadCsv ')
    dialogRef.afterClosed().subscribe(result => {
      console.log('[AUTOMATION-CREATE] AutomationUploadCsv (afterClosed) result : ', result);
      if (result) {
        this.csvFile = result.file
        this.parsedCsvData = result.parsedData
        const firstRow = this.parsedCsvData[0];
        if (firstRow) {
          this.displayedColumns = Object.keys(firstRow);
        }
        console.log('[AUTOMATION-CREATE] AutomationUploadCsv (afterClosed) csvFile : ', this.csvFile);
        console.log('[AUTOMATION-CREATE] AutomationUploadCsv (afterClosed) parsedCsvData : ', this.parsedCsvData);
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

  sendToServer() {
    if (!this.csvFile) return;

    const formData = new FormData();
    formData.set('delimiter', ';');
    formData.append('uploadFile', this.csvFile, this.csvFile.name);
    this.automationsService.uploadFaqCsv(formData).subscribe(data => {
      console.log('[AUTOMATION-CREATE] UPLOAD CSV DATA ', data);
      if (data) {
        // this.parse_done = true;
      }

    }, (error) => {
      this.logger.error('[AUTOMATION-CREATE] UPLOAD CSV - ERROR ', error);


    }, () => {
     console.log('[[AUTOMATION-CREATE] UPLOAD CSV * COMPLETE *');

    });
  }


}

import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AutomationsService } from 'app/services/automations.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'appdashboard-contacts-wa-broadcast-modal',
  templateUrl: './contacts-wa-broadcast-modal.component.html',
  styleUrls: ['./contacts-wa-broadcast-modal.component.scss']
})
export class ContactsWaBroadcastModalComponent implements OnInit {

  templates_list = [];
  selected_template: any;
  selected_template_name: any;
  selected_template_lang: any;
  templateName: string;
  phoneNumber: string = ''; // Numero di telefono del contatto
  bodyParamsValues: string[] = []; // Array per i valori dei parametri del body
  headerParamsValues: string[] = []; // Array per i valori dei parametri dell'header
  buttonParamsValues: string[] = []; // Array per i valori dei parametri dei button
  private previewUpdateTimeout: any;

  // Template Preview components
  header_component: any;
  body_component: any;
  footer_component: any;
  buttons_component: any;
  url_button_component: any;
  header_component_temp: any;
  body_component_temp: any;
  body_params = [];
  header_params = [];
  buttons_params = [];
  previsioning_url: string;
  src: any;
  sanitizedUrl: any;
  fileUploadAccept: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ContactsWaBroadcastModalComponent>,
    private automationsService: AutomationsService,
    private logger: LoggerService,
    public sanitizer: DomSanitizer,
  ) {
    console.log('[MODAL-WA-BROADCAST] data ', data)
    // Inizializza il numero di telefono dal contact
    if (this.data?.contact?.phone) {
      this.phoneNumber = this.data.contact.phone;
    }
   }

  ngOnInit(): void {
    this.getWATemplates();
  }

  getWATemplates() {
    this.automationsService.getWATemplates().subscribe((templates: any) => {
      this.logger.log("[CONTACTS-WA-BROADCAST-MODAL] GET WA TEMPLATES templates ", templates);
      this.templates_list = templates;
    }, (error) => {
      this.logger.error("[CONTACTS-WA-BROADCAST-MODAL] - GET WA TEMPLATES - ERROR: ", error)
      this.logger.log(error.error?.message)
    }, () => {
      this.logger.log('[CONTACTS-WA-BROADCAST-MODAL] - GET WA TEMPLATES * COMPLETE *');
    });
  }

  onSelectTemplate() {
    this.selected_template = this.templates_list.find(t => t.name === this.templateName);
   console.log('[CONTACTS-WA-BROADCAST-MODAL] onSelectTemplate selected_template', this.selected_template)
    if (this.selected_template) {
      this.selected_template_name = this.selected_template.name
      this.selected_template_lang = this.selected_template.language
      this.logger.log('[CONTACTS-WA-BROADCAST-MODAL] onSelectTemplate selected_template_name', this.selected_template_name)
      
      // Resetta body_component_temp quando si seleziona un nuovo template
      this.body_component_temp = null;
      
      // Inizializza i valori dei parametri con gli esempi del template
      this.initializeBodyParams();
      this.initializeHeaderParams();
      this.initializeButtonParams();
      this.createTemplatePreview()
    }
  }

  initializeBodyParams() {
    this.bodyParamsValues = [];
    const bodyComponent = this.selected_template.components.find(c => c.type === 'BODY');
    if (bodyComponent) {
      const bodyValues = bodyComponent.example?.body_text?.[0] || [];
      // Inizializza con i valori di esempio, o con il nome del contatto per il primo parametro se disponibile
      bodyValues.forEach((val, i) => {
        if (i === 0 && this.data?.contact?.fullname) {
          this.bodyParamsValues.push(this.data.contact.fullname);
        } else {
          this.bodyParamsValues.push(val || '');
        }
      });
    }
  }

  initializeHeaderParams() {
    this.headerParamsValues = [];
    const headerComponent = this.selected_template.components.find(c => c.type === 'HEADER');
    if (headerComponent) {
      if (headerComponent.format === 'TEXT') {
        const headerValues = headerComponent.example?.header_text || [];
        headerValues.forEach((val) => {
          this.headerParamsValues.push(val || '');
        });
      } else if (headerComponent.format === 'IMAGE' || headerComponent.format === 'DOCUMENT') {
        const links = headerComponent.example?.header_handle || [];
        links.forEach((link) => {
          this.headerParamsValues.push(link || '');
        });
      }
    }
  }

  initializeButtonParams() {
    this.buttonParamsValues = [];
    const buttonsComponent = this.selected_template.components.find(c => c.type === 'BUTTONS');
    if (buttonsComponent) {
      const urlButton = buttonsComponent.buttons.find(b => b.type === 'URL');
      if (urlButton && urlButton.url && urlButton.url.includes('{{1}}')) {
        const exampleUrl = urlButton.example?.[0] || '';
        const originalUrl = urlButton.url || '';
        const [prefix, suffix] = originalUrl.split('{{1}}');
        let paramText = '';
        if (exampleUrl.startsWith(prefix) && exampleUrl.endsWith(suffix)) {
          // Estrae il valore che sostituisce {{1}}
          const extractedValue = exampleUrl.slice(prefix.length, exampleUrl.length - suffix.length);
          
          // Se il valore estratto contiene un query parameter (inizia con ? o &), estrae solo quello
          // Altrimenti usa il valore completo
          if (extractedValue.includes('?')) {
            // Estrae solo la parte del query parameter
            const queryIndex = extractedValue.indexOf('?');
            paramText = extractedValue.substring(queryIndex);
          } else if (extractedValue.includes('&')) {
            // Se inizia con &, estrae da & in poi
            const andIndex = extractedValue.indexOf('&');
            paramText = extractedValue.substring(andIndex);
          } else {
            // Altrimenti usa il valore completo
            paramText = extractedValue;
          }
        }
        this.buttonParamsValues.push(paramText);
      }
      // Se l'URL non contiene {{1}}, non aggiungere nessun input (buttonParamsValues rimane vuoto)
    }
  }

  createTemplatePreview() {
    this.header_params = [];
    this.body_params = [];
    this.buttons_params = [];
    this.previsioning_url = null;

    let temp_template = JSON.parse(JSON.stringify(this.selected_template));
    this.header_component = temp_template.components.find(c => c.type === 'HEADER');
    this.logger.log('[CONTACTS-WA-BROADCAST-MODAL] header_component', this.header_component)
    this.body_component = temp_template.components.find(c => c.type === 'BODY');
    this.logger.log('[CONTACTS-WA-BROADCAST-MODAL] body_component', this.body_component)
    this.footer_component = temp_template.components.find(c => c.type === 'FOOTER');
    this.logger.log('[CONTACTS-WA-BROADCAST-MODAL] footer_component', this.footer_component)
    this.buttons_component = temp_template.components.find(c => c.type === 'BUTTONS');
    this.logger.log('[CONTACTS-WA-BROADCAST-MODAL] buttons_component', this.buttons_component)
    if (this.buttons_component) {
      this.url_button_component = this.buttons_component.buttons.find(c => c.type === 'URL')
    }

    if (this.header_component) {
      this.header_component_temp = JSON.parse(JSON.stringify(this.header_component));
      if (this.header_component.format === 'TEXT') {
        // Usa i valori dagli input invece degli esempi
        this.headerParamsValues.forEach((val, i) => {
          const re = new RegExp('\\{\\{' + (i + 1) + '\\}\\}', 'g');
          this.header_component.text = (this.header_component.text || '').replace(re, val || `{{${i + 1}}}`);
          this.header_params.push({ index: i + 1, type: 'TEXT', text: val || '' });
        });
      }
      else if (this.header_component.format === 'IMAGE') {
        // Usa i valori dagli input invece degli esempi
        this.headerParamsValues.forEach((link, i) => {
          this.header_params.push({ index: i + 1, type: 'IMAGE', image: { link: link || '' } });
        });
      }
      else if (this.header_component.format === 'DOCUMENT') {
        // Usa i valori dagli input invece degli esempi
        if (this.headerParamsValues.length) {
          this.fileUploadAccept = '.pdf';
          this.src = this.headerParamsValues[0];
          this.sanitizeUrl(this.headerParamsValues[0]);
          this.headerParamsValues.forEach((link, i) => {
            this.header_params.push({
              index: i + 1,
              type: 'DOCUMENT',
              document: { link: link || '' }
            });
          });
        }
      }
      else if (this.header_component.format === 'LOCATION') {
        this.header_params.push({ index: 1, type: this.header_component.format, location: { latitude: null, longitude: null, name: null, address: null } })
      }
      else {
        this.logger.log("[CONTACTS-WA-BROADCAST-MODAL] Check unrecognized Header: ", this.header_component)
      }
    }

    if (this.body_component) {
      // Salva il testo originale se non è già stato salvato
      if (!this.body_component_temp) {
        this.body_component_temp = JSON.parse(JSON.stringify(this.body_component));
      }
      // Ripristina il testo originale prima di fare le sostituzioni
      this.body_component.text = this.body_component_temp.text;
      this.body_params = [];
      
      // Usa i valori dai parametri modificabili dall'utente
      this.bodyParamsValues.forEach((paramValue, i) => {
        const re = new RegExp('\\{\\{' + (i + 1) + '\\}\\}', 'g');
        // Sostituisce il placeholder con il valore dell'utente
        const displayValue = paramValue || `{{${i + 1}}}`;
        this.body_component.text = (this.body_component.text || '').replace(re, displayValue);
        this.body_params.push({ index: i + 1, type: 'text', text: paramValue || '' });
      });
    }

    if (this.url_button_component && this.buttonParamsValues.length > 0) {
      const originalUrl = this.url_button_component.url || '';
      const paramText = this.buttonParamsValues[0] || '';

      if (originalUrl.includes('{{1}}')) {
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
    if (this.header_component?.example?.header_handle?.[0]) {
      event.target.src = this.header_component.example.header_handle[0];
    }
  }

  trackByIndex(index: number, item: any): any {
    return index;
  }

  onBodyParamChange() {
    // Aggiorna il preview quando l'utente modifica qualsiasi parametro del body
    // Usa un debounce per evitare chiamate troppo frequenti che interferiscono con l'input
    if (this.previewUpdateTimeout) {
      clearTimeout(this.previewUpdateTimeout);
    }
    this.previewUpdateTimeout = setTimeout(() => {
      if (this.selected_template) {
        this.createTemplatePreview();
      }
    }, 500);
  }

  onHeaderParamChange() {
    // Aggiorna il preview quando l'utente modifica qualsiasi parametro dell'header
    if (this.previewUpdateTimeout) {
      clearTimeout(this.previewUpdateTimeout);
    }
    this.previewUpdateTimeout = setTimeout(() => {
      if (this.selected_template) {
        this.createTemplatePreview();
      }
    }, 500);
  }

  onButtonParamChange() {
    // Aggiorna il preview quando l'utente modifica qualsiasi parametro del button
    if (this.previewUpdateTimeout) {
      clearTimeout(this.previewUpdateTimeout);
    }
    this.previewUpdateTimeout = setTimeout(() => {
      if (this.selected_template) {
        this.createTemplatePreview();
      }
    }, 500);
  }

}

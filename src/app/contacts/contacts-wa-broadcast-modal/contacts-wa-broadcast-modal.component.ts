import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AutomationsService } from 'app/services/automations.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';

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
  phone_number_id: string = '110894941712700'; // WhatsApp Phone Number ID
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
  projectId: string;
  wa_is_installed: boolean | null = null; // null = loading, true = installed, false = not installed

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ContactsWaBroadcastModalComponent>,
    private automationsService: AutomationsService,
    private logger: LoggerService,
    public sanitizer: DomSanitizer,
    private router: Router,
  ) {
    console.log('[MODAL-WA-BROADCAST] data ', data)
    // Inizializza il numero di telefono dal contact
    if (this.data?.contact?.phone) {
      this.phoneNumber = this.data.contact.phone;
    }
    if (this.data?.projectId) {
      this.projectId = this.data.projectId;
    }
   }

  ngOnInit(): void {
    this.getWATemplates();
    
  }


  getWATemplates() {
    this.automationsService.getWATemplates().subscribe((templates: any) => {
      console.log("[CONTACTS-WA-BROADCAST-MODAL] GET WA TEMPLATES templates ", templates);
      this.templates_list = templates;
       console.log("[CONTACTS-WA-BROADCAST-MODAL] GET WA TEMPLATES templates_list ", this.templates_list);
    }, (error) => {
      this.logger.error("[CONTACTS-WA-BROADCAST-MODAL] - GET WA TEMPLATES - ERROR: ", error)
      this.logger.log(error.error?.message)
      if (error.error.message.includes('WhatsApp not installed for the project_id')  ) {
        console.log('[CONTACTS-WA-BROADCAST-MODAL] - WA not installed');
        this.wa_is_installed = false
        // this.presentDialogWANotInstalledFoTheCurrentProject()
      }
    }, () => {
      this.logger.log('[CONTACTS-WA-BROADCAST-MODAL] - GET WA TEMPLATES * COMPLETE *');
      this.wa_is_installed = true
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
        // Mostra l'intero URL dell'esempio nell'input
        const exampleUrl = urlButton.example?.[0] || '';
        this.buttonParamsValues.push(exampleUrl);
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
      const fullUrl = this.buttonParamsValues[0] || '';

      if (originalUrl.includes('{{1}}')) {
        // Se l'URL originale contiene {{1}}, sostituiscilo con l'URL completo inserito dall'utente
        // Ma dobbiamo estrarre solo la parte che sostituisce {{1}} per il parametro
        const [prefix, suffix] = originalUrl.split('{{1}}');
        let paramText = fullUrl;
        
        // Se l'URL inserito inizia con il prefix e finisce con il suffix, estrai solo la parte variabile
        if (fullUrl.startsWith(prefix) && fullUrl.endsWith(suffix)) {
          paramText = fullUrl.slice(prefix.length, fullUrl.length - suffix.length);
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

  createReceiversList() {
    // Crea un array con un solo receiver (il contatto corrente)
    const phone_number = this.phoneNumber.startsWith('+') ? this.phoneNumber : `+${this.phoneNumber}`;
    const receiver: any = { phone_number };

    // Header params
    if (this.headerParamsValues.length > 0) {
      const header_params = [];
      this.headerParamsValues.forEach((value, index) => {
        if (!value) return;
        
        if (this.header_component?.format === 'IMAGE' || this.header_component?.format === 'DOCUMENT') {
          if (value.startsWith('http')) {
            header_params.push({
              type: "IMAGE",
              image: { link: value }
            });
          }
        } else if (this.header_component?.format === 'TEXT') {
          header_params.push({
            type: "text",
            text: value
          });
        }
      });
      if (header_params.length) receiver.header_params = header_params;
    }

    // Body params
    if (this.bodyParamsValues.length > 0) {
      const body_params = [];
      this.bodyParamsValues.forEach((value) => {
        if (!value) return;
        body_params.push({
          type: "text",
          text: value
        });
      });
      if (body_params.length) receiver.body_params = body_params;
    }

    // Buttons params
    if (this.buttonParamsValues.length > 0) {
      const buttons_params = [];
      this.buttonParamsValues.forEach((value) => {
        if (!value) return;
        // Per i button, il valore è l'URL completo che sostituisce {{1}}
        // Dobbiamo estrarre solo la parte variabile se l'URL originale contiene {{1}}
        let paramText = value;
        if (this.url_button_component?.url && this.url_button_component.url.includes('{{1}}')) {
          const [prefix, suffix] = this.url_button_component.url.split('{{1}}');
          if (value.startsWith(prefix) && value.endsWith(suffix)) {
            paramText = value.slice(prefix.length, value.length - suffix.length);
          }
        }
        buttons_params.push({
          type: "text",
          text: paramText
        });
      });
      if (buttons_params.length) receiver.buttons_params = buttons_params;
    }

    return [receiver];
  }

  sendBroadcast() {
    if (!this.selected_template) {
      this.logger.error('[CONTACTS-WA-BROADCAST-MODAL] No template selected');
      return;
    }

    if (!this.phoneNumber) {
      this.logger.error('[CONTACTS-WA-BROADCAST-MODAL] No phone number');
      return;
    }

    // Crea la receiver_list
    const receiver_list = this.createReceiversList();
    console.log('[CONTACTS-WA-BROADCAST-MODAL] receiver_list' , receiver_list )
    
    // Prepara i dati per il broadcast
    const broadcastData = {
      id_project: this.automationsService.project_id,
      receiver_list: receiver_list,
      phone_number_id: this.data?.phone_number_id || this.phone_number_id,
      template: this.selected_template_name,
      transaction_id: `automation-request-${this.projectId}-${Date.now()}`,
      // broadcast: true
    };
    console.log('[CONTACTS-WA-BROADCAST-MODAL] broadcastData' , broadcastData )

    this.logger.log('[CONTACTS-WA-BROADCAST-MODAL] Sending broadcast with data:', broadcastData);

    this.automationsService.sendBroadcast(broadcastData).subscribe(
      (response) => {
       console.log('[CONTACTS-WA-BROADCAST-MODAL] Broadcast sent successfully:', response);
        this.dialogRef.close({ success: true, response });
      },
      (error) => {
        this.logger.error('[CONTACTS-WA-BROADCAST-MODAL] Error sending broadcast:', error);
        // Potresti mostrare un messaggio di errore all'utente qui
        this.dialogRef.close({ success: false, error });
      }
    );
  }

  onOkPresssed(){
    this.sendBroadcast();
  }

  onConfigureWAPresssed() {
    this.dialogRef.close();
    this.router.navigate(['project/' + this.projectId + '/integrations'], { queryParams: { 'name': 'whatsapp' } })
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}

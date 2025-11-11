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
  contactName: string;

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
    this.logger.log('[MODAL-WA-BROADCAST] data ', data)
   }

  ngOnInit(): void {
    // Inizializza il nome del contatto dai dati passati al modal
    this.contactName = this.data?.contact?.fullname || 'Nome Contatto';
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
      this.createTemplatePreview()
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
        const handles = this.header_component.example?.header_handle || [];
        if (handles.length) {
          this.fileUploadAccept = '.pdf';
          this.src = handles[0];
          this.sanitizeUrl(handles[0]);
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
        this.logger.log("[CONTACTS-WA-BROADCAST-MODAL] Check unrecognized Header: ", this.header_component)
      }
    }

    if (this.body_component) {
      // Usa il nome del contatto dalla proprietà (modificabile dall'utente)
      const bodyValues = this.body_component.example?.body_text?.[0] || [];
      bodyValues.forEach((val, i) => {
        const colLabel = `[body_${i}]`;
        const re = new RegExp('\\{\\{' + (i + 1) + '\\}\\}', 'g');
        
        // Se è il primo placeholder ({{1}}), usa il nome del contatto modificabile
        if (i === 0) {
          this.body_component.text = (this.body_component.text || '').replace(re, this.contactName);
          this.body_params.push({ index: i + 1, type: 'text', text: this.contactName });
        } else {
          // Per gli altri placeholder, usa i valori di esempio con l'etichetta
          this.body_component.text = (this.body_component.text || '').replace(re, `${val} [body_${i}]`);
          this.body_params.push({ index: i + 1, type: 'text', text: val });
        }
      });
    }

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
    if (this.header_component?.example?.header_handle?.[0]) {
      event.target.src = this.header_component.example.header_handle[0];
    }
  }

  onContactNameChange() {
    // Aggiorna il preview quando l'utente modifica il nome del contatto
    if (this.selected_template) {
      this.createTemplatePreview();
    }
  }

}

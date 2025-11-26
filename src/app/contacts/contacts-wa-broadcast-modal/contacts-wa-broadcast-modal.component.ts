import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AutomationsService } from 'app/services/automations.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { UploadImageNativeService } from 'app/services/upload-image-native.service';
import { AppConfigService } from 'app/services/app-config.service';
import { NotifyService } from 'app/core/notify.service';
import { ContactsService } from 'app/services/contacts.service';
import { parsePhoneNumberFromString, isValidPhoneNumber, AsYouType } from 'libphonenumber-js';
import { TranslateService } from '@ngx-translate/core';

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
  phoneNumber: string = ''; // Contact phone number
  originalPhoneNumber: string = ''; // Original phone number (to check if it has been changed)
  phone_number_id: string = '110894941712700'; // WhatsApp Phone Number ID
  phoneCountryCode: string = null; // Country code for the flag (e.g. 'IT', 'US', 'GB')
  phoneCountryName: string = null; // Country name (e.g. 'Italy', 'United States')
  phoneNumberError: string = null; // Error message for phone number
  phoneNumberValid: boolean = false; // Indicates whether the number is valid
  phoneNumberFormatted: string = ''; // Number formatted as the user types
  isSavingPhone: boolean = false; // Indicates whether saving contact phone number is in progress
  broadcastStatus: 'idle' | 'sending' | 'success' | 'error' = 'idle'; // Status of broadcast sending
  broadcastErrorMessage: string = null; // Error message if broadcast fails
  isNamedTemplate: boolean = false; // Indicates if the selected template uses NAMED parameters
   
  // Country Name Map (ISO Code -> Name)
 private countryNames: { [key: string]: string } = {
    'AC': 'Ascension Island',
    'AD': 'Andorra',
    'AE': 'United Arab Emirates',
    'AF': 'Afghanistan',
    'AG': 'Antigua and Barbuda',
    'AI': 'Anguilla',
    'AL': 'Albania',
    'AM': 'Armenia',
    'AO': 'Angola',
    'AR': 'Argentina',
    'AS': 'American Samoa',
    'AT': 'Austria',
    'AU': 'Australia',
    'AW': 'Aruba',
    'AX': 'Åland Islands',
    'AZ': 'Azerbaijan',
    'BA': 'Bosnia and Herzegovina',
    'BB': 'Barbados',
    'BD': 'Bangladesh',
    'BE': 'Belgium',
    'BF': 'Burkina Faso',
    'BG': 'Bulgaria',
    'BH': 'Bahrain',
    'BI': 'Burundi',
    'BJ': 'Benin',
    'BL': 'Saint Barthélemy',
    'BM': 'Bermuda',
    'BN': 'Brunei Darussalam',
    'BO': 'Bolivia, Plurinational State of',
    'BQ': 'Bonaire, Sint Eustatius and Saba',
    'BR': 'Brazil',
    'BS': 'Bahamas',
    'BT': 'Bhutan',
    'BW': 'Botswana',
    'BY': 'Belarus',
    'BZ': 'Belize',
    'CA': 'Canada',
    'CC': 'Cocos (Keeling) Islands',
    'CD': 'Congo, Democratic Republic of the',
    'CF': 'Central African Republic',
    'CG': 'Congo',
    'CH': 'Switzerland',
    'CI': 'Côte d\'Ivoire',
    'CK': 'Cook Islands',
    'CL': 'Chile',
    'CM': 'Cameroon',
    'CN': 'China',
    'CO': 'Colombia',
    'CR': 'Costa Rica',
    'CU': 'Cuba',
    'CV': 'Cabo Verde',
    'CW': 'Curaçao',
    'CX': 'Christmas Island',
    'CY': 'Cyprus',
    'CZ': 'Czechia',
    'DE': 'Germany',
    'DJ': 'Djibouti',
    'DK': 'Denmark',
    'DM': 'Dominica',
    'DO': 'Dominican Republic',
    'DZ': 'Algeria',
    'EC': 'Ecuador',
    'EE': 'Estonia',
    'EG': 'Egypt',
    'EH': 'Western Sahara',
    'ER': 'Eritrea',
    'ES': 'Spain',
    'ET': 'Ethiopia',
    'FI': 'Finland',
    'FJ': 'Fiji',
    'FK': 'Falkland Islands (Malvinas)',
    'FM': 'Micronesia, Federated States of',
    'FO': 'Faroe Islands',
    'FR': 'France',
    'GA': 'Gabon',
    'GB': 'United Kingdom of Great Britain and Northern Ireland',
    'GD': 'Grenada',
    'GE': 'Georgia',
    'GF': 'French Guiana',
    'GG': 'Guernsey',
    'GH': 'Ghana',
    'GI': 'Gibraltar',
    'GL': 'Greenland',
    'GM': 'Gambia',
    'GN': 'Guinea',
    'GP': 'Guadeloupe',
    'GQ': 'Equatorial Guinea',
    'GR': 'Greece',
    'GT': 'Guatemala',
    'GU': 'Guam',
    'GW': 'Guinea-Bissau',
    'GY': 'Guyana',
    'HK': 'Hong Kong',
    'HN': 'Honduras',
    'HR': 'Croatia',
    'HT': 'Haiti',
    'HU': 'Hungary',
    'ID': 'Indonesia',
    'IE': 'Ireland',
    'IL': 'Israel',
    'IM': 'Isle of Man',
    'IN': 'India',
    'IO': 'British Indian Ocean Territory',
    'IQ': 'Iraq',
    'IR': 'Iran, Islamic Republic of',
    'IS': 'Iceland',
    'IT': 'Italy',
    'JE': 'Jersey',
    'JM': 'Jamaica',
    'JO': 'Jordan',
    'JP': 'Japan',
    'KE': 'Kenya',
    'KG': 'Kyrgyzstan',
    'KH': 'Cambodia',
    'KI': 'Kiribati',
    'KM': 'Comoros',
    'KN': 'Saint Kitts and Nevis',
    'KP': 'Korea, Democratic People\'s Republic of',
    'KR': 'Korea, Republic of',
    'KW': 'Kuwait',
    'KY': 'Cayman Islands',
    'KZ': 'Kazakhstan',
    'LA': 'Lao People\'s Democratic Republic',
    'LB': 'Lebanon',
    'LC': 'Saint Lucia',
    'LI': 'Liechtenstein',
    'LK': 'Sri Lanka',
    'LR': 'Liberia',
    'LS': 'Lesotho',
    'LT': 'Lithuania',
    'LU': 'Luxembourg',
    'LV': 'Latvia',
    'LY': 'Libya',
    'MA': 'Morocco',
    'MC': 'Monaco',
    'MD': 'Moldova, Republic of',
    'ME': 'Montenegro',
    'MF': 'Saint Martin (French part)',
    'MG': 'Madagascar',
    'MH': 'Marshall Islands',
    'MK': 'North Macedonia',
    'ML': 'Mali',
    'MM': 'Myanmar',
    'MN': 'Mongolia',
    'MO': 'Macao',
    'MP': 'Northern Mariana Islands',
    'MQ': 'Martinique',
    'MR': 'Mauritania',
    'MS': 'Montserrat',
    'MT': 'Malta',
    'MU': 'Mauritius',
    'MV': 'Maldives',
    'MW': 'Malawi',
    'MX': 'Mexico',
    'MY': 'Malaysia',
    'MZ': 'Mozambique',
    'NA': 'Namibia',
    'NC': 'New Caledonia',
    'NE': 'Niger',
    'NF': 'Norfolk Island',
    'NG': 'Nigeria',
    'NI': 'Nicaragua',
    'NL': 'Netherlands, Kingdom of the',
    'NO': 'Norway',
    'NP': 'Nepal',
    'NR': 'Nauru',
    'NU': 'Niue',
    'NZ': 'New Zealand',
    'OM': 'Oman',
    'PA': 'Panama',
    'PE': 'Peru',
    'PF': 'French Polynesia',
    'PG': 'Papua New Guinea',
    'PH': 'Philippines',
    'PK': 'Pakistan',
    'PL': 'Poland',
    'PM': 'Saint Pierre and Miquelon',
    'PN': 'Pitcairn',
    'PR': 'Puerto Rico',
    'PS': 'Palestine, State of',
    'PT': 'Portugal',
    'PW': 'Palau',
    'PY': 'Paraguay',
    'QA': 'Qatar',
    'RE': 'Réunion',
    'RO': 'Romania',
    'RS': 'Serbia',
    'RU': 'Russian Federation',
    'RW': 'Rwanda',
    'SA': 'Saudi Arabia',
    'SB': 'Solomon Islands',
    'SC': 'Seychelles',
    'SD': 'Sudan',
    'SE': 'Sweden',
    'SG': 'Singapore',
    'SH': 'Saint Helena, Ascension and Tristan da Cunha',
    'SI': 'Slovenia',
    'SJ': 'Svalbard and Jan Mayen',
    'SK': 'Slovakia',
    'SL': 'Sierra Leone',
    'SM': 'San Marino',
    'SN': 'Senegal',
    'SO': 'Somalia',
    'SR': 'Suriname',
    'SS': 'South Sudan',
    'ST': 'Sao Tome and Principe',
    'SV': 'El Salvador',
    'SX': 'Sint Maarten (Dutch part)',
    'SY': 'Syrian Arab Republic',
    'SZ': 'Eswatini',
    'TA': 'Tristan da Cunha',
    'TC': 'Turks and Caicos Islands',
    'TD': 'Chad',
    'TG': 'Togo',
    'TH': 'Thailand',
    'TJ': 'Tajikistan',
    'TK': 'Tokelau',
    'TL': 'Timor-Leste',
    'TM': 'Turkmenistan',
    'TN': 'Tunisia',
    'TO': 'Tonga',
    'TR': 'Türkiye',
    'TT': 'Trinidad and Tobago',
    'TV': 'Tuvalu',
    'TW': 'Taiwan, Province of China',
    'TZ': 'Tanzania, United Republic of',
    'UA': 'Ukraine',
    'UG': 'Uganda',
    'US': 'United States of America',
    'UY': 'Uruguay',
    'UZ': 'Uzbekistan',
    'VA': 'Holy See',
    'VC': 'Saint Vincent and the Grenadines',
    'VE': 'Venezuela, Bolivarian Republic of',
    'VG': 'Virgin Islands (British)',
    'VI': 'Virgin Islands (U.S.)',
    'VN': 'Viet Nam',
    'VU': 'Vanuatu',
    'WF': 'Wallis and Futuna',
    'WS': 'Samoa',
    'XK': 'Kosovo',
    'YE': 'Yemen',
    'YT': 'Mayotte',
    'ZA': 'South Africa',
    'ZM': 'Zambia',
    'ZW': 'Zimbabwe'
};
  
  bodyParamsValues: string[] = []; // Array for body parameter values
  headerParamsValues: string[] = []; // Array for header parameter values
  buttonParamsValues: string[] = []; // Array for button parameter values
  hasUrlButtonWithParam: boolean = false; // Indicates if there's a URL button with {{1}} parameter
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
    private uploadImageNativeService: UploadImageNativeService,
    private notify: NotifyService,
    private contactsService: ContactsService,
    private translate: TranslateService,
  ) {
    console.log('[MODAL-WA-BROADCAST] data ', data)
    if (this.data?.projectId) {
      this.projectId = this.data.projectId;
    }
   }

  // Metodo helper per inizializzare il numero telefonico
  private initializePhoneNumber(contact: any) {
    if (contact?.phone) {
      const existingPhone = contact.phone;
      // Remove spaces and invalid characters (keep only numbers and +)
      const cleanedPhone = existingPhone.replace(/[^\d+]/g, '');
      this.phoneNumber = cleanedPhone;
      this.originalPhoneNumber = cleanedPhone; // Save the original number for comparison
      // Process the existing number (formatting and validation)
      // Use setTimeout to avoid initialization problems
      setTimeout(() => {
        this.onPhoneNumberChange(cleanedPhone);
      }, 100);
    } else {
      // If there is no phone number, it displays a "Field required" error.
      this.phoneNumberError = this.translate.instant('FieldRequired');
      this.phoneNumberValid = false;
      this.originalPhoneNumber = '';
    }
  }

  ngOnInit(): void {
    // Imposta il projectId nel servizio se necessario
    if (this.projectId) {
      this.contactsService.projectId = this.projectId;
    }
    
    // Recupera i dati aggiornati del contatto se disponibile
    if (this.data?.contact?._id) {
      this.contactsService.getLeadById(this.data.contact._id).subscribe(
        (contact: any) => {
          console.log('[CONTACTS-WA-BROADCAST-MODAL] Contact data refreshed:', contact);
          if (contact) {
            // La response è un oggetto, non un array
            // Aggiorna i dati del contatto con quelli freschi dal server
            this.data.contact = contact;
            console.log('[CONTACTS-WA-BROADCAST-MODAL] Contact data refreshed:', contact);
            
            // Inizializza il numero telefonico con i dati aggiornati
            this.initializePhoneNumber(contact);
          } else {
            // Se non trovato, usa i dati originali
            this.initializePhoneNumber(this.data.contact);
          }
        },
        (error) => {
          this.logger.error('[CONTACTS-WA-BROADCAST-MODAL] Error fetching updated contact:', error);
          // In caso di errore, usa i dati originali
          this.initializePhoneNumber(this.data.contact);
        }
      );
    } else {
      // Se non c'è un ID contatto, usa i dati originali
      this.initializePhoneNumber(this.data?.contact);
    }
    
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
      // Check if template uses NAMED parameters
      this.isNamedTemplate = this.selected_template.parameter_format === 'NAMED';
      
      this.selected_template_name = this.selected_template.name
      this.selected_template_lang = this.selected_template.language
      this.logger.log('[CONTACTS-WA-BROADCAST-MODAL] onSelectTemplate selected_template_name', this.selected_template_name)
      
      // Reset body_component_temp when selecting a new template
      this.body_component_temp = null;
      
      // If template is NAMED, don't initialize parameters (not supported yet) but still show the template
      if (!this.isNamedTemplate) {
        // Initialize parameter values ​​with template examples only for POSITIONAL templates
        this.initializeBodyParams();
        this.initializeHeaderParams();
        this.initializeButtonParams();
      }
      
      // Always create template preview to show the template (even if NAMED and not supported)
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
    this.hasUrlButtonWithParam = false;
    const buttonsComponent = this.selected_template.components.find(c => c.type === 'BUTTONS');
    if (buttonsComponent) {
      const urlButton = buttonsComponent.buttons.find(b => b.type === 'URL');
      if (urlButton && urlButton.url && urlButton.url.includes('{{1}}')) {
        // Mostra l'intero URL dell'esempio nell'input
        const exampleUrl = urlButton.example?.[0] || '';
        this.buttonParamsValues.push(exampleUrl);
        this.hasUrlButtonWithParam = true;
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
          const paramNumber = i + 1;
          // Usa un marker temporaneo che verrà sostituito con il badge dopo il processing del markdown
          const displayValue = val 
            ? `${val}[PARAM_BADGE_${paramNumber}]`
            : `{{${paramNumber}}}`;
          this.header_component.text = (this.header_component.text || '').replace(re, displayValue);
          this.header_params.push({ index: i + 1, type: 'TEXT', text: val || '' });
        });
      }
      else if (this.header_component.format === 'IMAGE') {
        // Usa i valori dagli input invece degli esempi
        // Solo se il link non è vuoto
        this.headerParamsValues.forEach((link, i) => {
          if (link && link.trim()) {
            this.header_params.push({ index: i + 1, type: 'IMAGE', image: { link: link.trim() } });
          }
        });
      }
      else if (this.header_component.format === 'DOCUMENT') {
        // Usa i valori dagli input invece degli esempi
        // Solo se il link non è vuoto
        if (this.headerParamsValues.length && this.headerParamsValues[0] && this.headerParamsValues[0].trim()) {
          this.fileUploadAccept = '.pdf';
          this.src = this.headerParamsValues[0].trim();
          this.sanitizeUrl(this.headerParamsValues[0].trim());
          this.headerParamsValues.forEach((link, i) => {
            if (link && link.trim()) {
              this.header_params.push({
                index: i + 1,
                type: 'DOCUMENT',
                document: { link: link.trim() }
              });
            }
          });
        } else {
          // Reset se l'input è vuoto
          this.src = null;
          this.sanitizeUrl(null);
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
        // Usa un marker temporaneo che verrà sostituito con il badge dopo il processing del markdown
        const paramNumber = i + 1;
        const displayValue = paramValue 
          ? `${paramValue}[PARAM_BADGE_${paramNumber}]`
          : `{{${paramNumber}}}`;
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
        // Usa un marker temporaneo che verrà sostituito con il badge dopo il processing
        const displayUrl = paramText 
          ? `${paramText}[PARAM_BADGE_1]`
          : '{{1}}';
        this.url_button_component.url = originalUrl.replace('{{1}}', displayUrl);

        const bi = this.buttons_component.buttons.findIndex(b => b.type === 'URL');
        if (bi > -1) this.buttons_component.buttons[bi] = this.url_button_component;
        this.previsioning_url = this.url_button_component.url;
      }
    }
  }

  sanitizeUrl(url) {
    if (url) {
      this.sanitizedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    } else {
      this.sanitizedUrl = null;
    }
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

  clearHeaderParam(index: number) {
    // Cancella il contenuto del parametro header e aggiorna il preview
    if (this.headerParamsValues[index] !== undefined) {
      this.headerParamsValues[index] = '';
      this.onHeaderParamChange();
    }
  }

  triggerFileUpload(index: number, type: 'image' | 'document') {
    // Triggera il click sull'input file nascosto
    const inputId = type === 'image' ? `imageUploadInput_${index}` : `documentUploadInput_${index}`;
    const fileInput = document.getElementById(inputId) as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  onFileSelected(event: any, index: number, type: 'image' | 'document') {
    const file = event.target.files[0];
    if (!file) {
      return;
    }

    // Verifica il tipo di file
    if (type === 'image') {
      // WhatsApp Business API supporta solo JPG, JPEG e PNG
      const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      const allowedExtensions = ['.jpg', '.jpeg', '.png'];
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      
      if (!allowedImageTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
        this.notify.showWidgetStyleUpdateNotification('Please select a valid image file (JPG, JPEG or PNG only)', 4, 'report_problem');
        event.target.value = '';
        return;
      }
    } else if (type === 'document') {
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        this.notify.showWidgetStyleUpdateNotification('Please select a valid PDF file', 4, 'report_problem');
        event.target.value = '';
        return;
      }
    }

    this.logger.log(`[CONTACTS-WA-BROADCAST-MODAL] Uploading ${type} file:`, file.name);

    // Upload del file
    this.uploadImageNativeService.uploadAttachment_Native(file).then((downloadURL: string) => {
      this.logger.log(`[CONTACTS-WA-BROADCAST-MODAL] ${type} uploaded successfully:`, downloadURL);
      // Aggiorna il valore del parametro con l'URL del file caricato
      if (this.headerParamsValues[index] !== undefined) {
        this.headerParamsValues[index] = downloadURL;
        this.onHeaderParamChange();
      }
      // Reset dell'input file
      event.target.value = '';
    }).catch((error) => {
      this.logger.error(`[CONTACTS-WA-BROADCAST-MODAL] Error uploading ${type}:`, error);
      this.notify.showWidgetStyleUpdateNotification(`Error uploading ${type}. Please try again.`, 4, 'report_problem');
      // Reset dell'input file
      event.target.value = '';
    });
  }

  detectPhoneCountry() {
    // Rileva il paese dal numero telefonico usando libphonenumber-js
    if (!this.phoneNumber || this.phoneNumber.trim() === '') {
      this.phoneCountryCode = null;
      this.phoneCountryName = null;
      this.phoneNumberError = null;
      this.phoneNumberValid = false;
      return;
    }

    // Rimuovi spazi e caratteri non validi
    const phoneToParse = this.phoneNumber.replace(/[^\d+]/g, '').trim();
    
    // Per WhatsApp è richiesto il formato internazionale con "+" iniziale
    if (!phoneToParse.startsWith('+')) {
      this.phoneCountryCode = null;
      this.phoneCountryName = null;
      // Non sovrascrivere l'errore se è già impostato (es. caratteri non validi o "Field required")
      // Ma se l'errore è "Field required", sostituiscilo con l'errore corretto
      if (!this.phoneNumberError || this.phoneNumberError === this.translate.instant('FieldRequired')) {
        this.phoneNumberError = this.translate.instant('PhoneNumberMustStartWithPlus');
      }
      this.phoneNumberValid = false;
      return;
    }

      // Usa AsYouType per rilevare il dial code anche quando il numero non è completo
      // Questo permette di mostrare la bandiera già quando si inserisce il dial code
      // NON usare la mappa dei dial code comuni per evitare falsi positivi quando il numero è troppo corto
      try {
        let country = null;
        const formatter = new AsYouType();
        formatter.input(phoneToParse);
        country = formatter.getCountry();
        
        // Se AsYouType non rileva il paese, verifica se il numero inizia con un dial code valido
        // controllando i primi caratteri dopo il +. Se corrisponde a un dial code noto,
        // consideriamo che il dial code sia presente anche se il numero completo non è valido
        if (!country && phoneToParse.length >= 3) {
          const firstTwoDigits = phoneToParse.substring(1, 3);
          const firstDigit = phoneToParse.substring(1, 2);
          
          // Mappa dei dial code comuni per verificare se il numero inizia con un dial code valido
          const dialCodeToCountry: { [key: string]: string } = {
            '39': 'IT', '44': 'GB', '33': 'FR', '49': 'DE', '34': 'ES',
            '31': 'NL', '32': 'BE', '41': 'CH', '43': 'AT', '45': 'DK',
            '46': 'SE', '48': 'PL', '36': 'HU', '30': 'GR',
            '1': 'US', '7': 'RU'
          };
          
          // Prova prima con dial code a 2 cifre (più comune)
          if (firstTwoDigits && dialCodeToCountry[firstTwoDigits]) {
            // Verifica che il numero non inizi con un dial code più lungo che contiene questo
            // (es. +39 non deve essere confuso con +393 se +393 è un dial code valido)
            // Per ora assumiamo che se i primi 2 caratteri corrispondono a un dial code valido,
            // allora il dial code è presente
            country = dialCodeToCountry[firstTwoDigits];
            this.logger.log('[CONTACTS-WA-BROADCAST-MODAL] Country detected via dial code check (2 digits):', country);
          }
          // Se non trovato, prova con dial code a 1 cifra (solo +1 e +7)
          else if (firstDigit && (firstDigit === '1' || firstDigit === '7') && dialCodeToCountry[firstDigit]) {
            country = dialCodeToCountry[firstDigit];
            this.logger.log('[CONTACTS-WA-BROADCAST-MODAL] Country detected via dial code check (1 digit):', country);
          }
        }
      
      if (country) {
        this.phoneCountryCode = country;
        this.phoneCountryName = this.countryNames[country] || country;
        console.log('[CONTACTS-WA-BROADCAST-MODAL] Country detected:', country, 'Name:', this.phoneCountryName);
        
        // Se il dial code è stato rilevato, rimuovi l'errore "PhoneNumberMustStartWithPlus" se presente
        // perché ora il + è presente e il dial code è valido
        const mustStartWithPlusError = this.translate.instant('PhoneNumberMustStartWithPlus');
        if (this.phoneNumberError === mustStartWithPlusError) {
          this.phoneNumberError = null;
        }
        
        // Se il dial code è valido, valida il numero per il relativo paese
        try {
          // Usa parsePhoneNumberFromString con il paese rilevato per una validazione più accurata
          const phoneNumber = parsePhoneNumberFromString(phoneToParse, country);
          
          if (phoneNumber && phoneNumber.isValid()) {
            // Non sovrascrivere l'errore se è già impostato (es. caratteri non validi)
            // L'errore per caratteri non validi ha priorità
            if (!this.phoneNumberError || !this.phoneNumberError.includes('invalid characters')) {
              this.phoneNumberError = null;
              this.phoneNumberValid = true;
              this.logger.log('[CONTACTS-WA-BROADCAST-MODAL] Valid phone number for country:', country);
            } else {
              // Se c'è un errore per caratteri non validi, mantieni il numero come non valido
              this.phoneNumberValid = false;
            }
          } else {
            // Numero non valido per il paese rilevato
            // Verifica se il numero è troppo corto o se manca il dial code
            // Se il numero è molto corto (meno di 8 caratteri incluso il +), potrebbe mancare il dial code
            // o il numero potrebbe essere incompleto
            const invalidCharsError = this.translate.instant('PhoneNumberContainsInvalidCharacters');
            if (!this.phoneNumberError || this.phoneNumberError !== invalidCharsError) {
              // Se il numero è corto (meno di 8 caratteri incluso il +), mostra errore generico
              // altrimenti mostra errore specifico per il paese
              if (phoneToParse.length < 8) {
                // Numero troppo corto - potrebbe mancare il dial code o essere incompleto
                // Ma se il dial code è stato rilevato, il problema è che il numero è incompleto
                this.phoneNumberError = this.translate.instant('InvalidPhoneNumberFormat');
              } else {
                // Numero abbastanza lungo ma non valido - mostra errore specifico per il paese
                this.phoneNumberError = this.translate.instant('InvalidPhoneNumberForCountry', { country: country.toUpperCase() });
              }
            }
            this.phoneNumberValid = false;
            this.logger.log('[CONTACTS-WA-BROADCAST-MODAL] Invalid phone number for country:', country, 'length:', phoneToParse.length);
          }
        } catch (e) {
          // Prova anche senza specificare il paese (fallback)
          try {
            const phoneNumber = parsePhoneNumberFromString(phoneToParse);
            if (phoneNumber && phoneNumber.isValid()) {
              // Non sovrascrivere l'errore se è già impostato (es. caratteri non validi)
              if (!this.phoneNumberError || !this.phoneNumberError.includes('invalid characters')) {
                this.phoneNumberError = null;
                this.phoneNumberValid = true;
              } else {
                this.phoneNumberValid = false;
              }
            } else {
              // Non sovrascrivere l'errore se è già impostato per caratteri non validi
              if (!this.phoneNumberError || !this.phoneNumberError.includes('invalid characters')) {
                // Dial code valido ma numero non valido - mostra errore generico
                this.phoneNumberError = this.translate.instant('InvalidPhoneNumberFormat');
              }
              this.phoneNumberValid = false;
            }
          } catch (e2) {
            // Numero non valido ma dial code rilevato - mostra bandiera ma con errore generico
            const invalidCharsError = this.translate.instant('PhoneNumberContainsInvalidCharacters');
            if (!this.phoneNumberError || this.phoneNumberError !== invalidCharsError) {
              this.phoneNumberError = this.translate.instant('InvalidPhoneNumberFormat');
            }
            this.phoneNumberValid = false;
            this.logger.log('[CONTACTS-WA-BROADCAST-MODAL] Invalid format but dial code detected:', country);
          }
        }
      } else {
        // Dial code non rilevato da AsYouType, verifica se il numero inizia con un dial code valido
        // controllando i primi caratteri dopo il +
        let countryFromCheck = null;
        if (phoneToParse.length >= 3) {
          const firstTwoDigits = phoneToParse.substring(1, 3);
          const firstDigit = phoneToParse.substring(1, 2);
          
          const dialCodeToCountry: { [key: string]: string } = {
            '39': 'IT', '44': 'GB', '33': 'FR', '49': 'DE', '34': 'ES',
            '31': 'NL', '32': 'BE', '41': 'CH', '43': 'AT', '45': 'DK',
            '46': 'SE', '48': 'PL', '36': 'HU', '30': 'GR',
            '1': 'US', '7': 'RU'
          };
          
          // Prova prima con dial code a 2 cifre
          if (firstTwoDigits && dialCodeToCountry[firstTwoDigits]) {
            countryFromCheck = dialCodeToCountry[firstTwoDigits];
            this.logger.log('[CONTACTS-WA-BROADCAST-MODAL] Country detected via dial code check in else block:', countryFromCheck);
          }
          // Se non trovato, prova con dial code a 1 cifra
          else if (firstDigit && (firstDigit === '1' || firstDigit === '7') && dialCodeToCountry[firstDigit]) {
            countryFromCheck = dialCodeToCountry[firstDigit];
            this.logger.log('[CONTACTS-WA-BROADCAST-MODAL] Country detected via dial code check in else block (1 digit):', countryFromCheck);
          }
        }
        
        if (countryFromCheck) {
          // Dial code rilevato ma numero non valido - mostra errore generico
          this.phoneCountryCode = countryFromCheck;
          this.phoneCountryName = this.countryNames[countryFromCheck] || countryFromCheck;
          const invalidCharsError = this.translate.instant('PhoneNumberContainsInvalidCharacters');
          if (!this.phoneNumberError || this.phoneNumberError !== invalidCharsError) {
            this.phoneNumberError = this.translate.instant('InvalidPhoneNumberFormat');
          }
          this.phoneNumberValid = false;
        } else {
          // Dial code non rilevato
          this.phoneCountryCode = null;
          this.phoneCountryName = null;
          // Se il numero inizia con + ma non ha un dial code valido, mostra errore specifico
          // Controlla se l'errore è già impostato (es. caratteri non validi)
          const invalidCharsError = this.translate.instant('PhoneNumberContainsInvalidCharacters');
          if (!this.phoneNumberError || this.phoneNumberError === invalidCharsError) {
            // Se il numero è abbastanza lungo (>= 5 caratteri incluso il +), probabilmente manca il dial code
            if (phoneToParse.length >= 5) {
              this.phoneNumberError = this.translate.instant('PhoneNumberMissingDialCode');
            } else {
              // Se è troppo corto, mostra errore generico
              this.phoneNumberError = this.translate.instant('InvalidPhoneNumberFormat');
            }
          }
          this.phoneNumberValid = false;
        }
      }
    } catch (error) {
      // Se non riesce a rilevare il dial code, nascondi la bandiera
      this.phoneCountryCode = null;
      this.phoneCountryName = null;
      // Verifica se manca il dial code
      const invalidCharsError = this.translate.instant('PhoneNumberContainsInvalidCharacters');
      if (!this.phoneNumberError || this.phoneNumberError === invalidCharsError) {
        if (phoneToParse.length >= 5) {
          this.phoneNumberError = this.translate.instant('PhoneNumberMissingDialCode');
        } else {
          this.phoneNumberError = this.translate.instant('InvalidPhoneNumberFormat');
        }
      }
      this.phoneNumberValid = false;
      this.logger.log('[CONTACTS-WA-BROADCAST-MODAL] Could not detect dial code:', error);
    }
  }

  onPhoneNumberChange(value: string) {
    // Formatta il numero mentre l'utente digita usando AsYouType
    this.logger.log('[CONTACTS-WA-BROADCAST-MODAL] onPhoneNumberChange called with:', value);
    
    if (!value || value.trim() === '') {
      this.phoneNumber = '';
      this.phoneNumberFormatted = '';
      this.phoneCountryCode = null;
      this.phoneCountryName = null;
      this.phoneNumberError = this.translate.instant('FieldRequired');
      this.phoneNumberValid = false;
      return;
    }

    // Verifica se ci sono caratteri non validi (solo numeri, + e spazi sono permessi)
    const hasInvalidChars = /[^\d+\s]/.test(value);
    
    // Prima valida usando la libreria sul numero originale (prima della pulizia)
    // per rilevare caratteri non validi che la libreria non accetta
    let libraryValidationPassed = false;
    if (value.trim() !== '' && value.startsWith('+')) {
      try {
        // Rimuovi solo spazi per la validazione (mantieni caratteri non validi per vedere se la libreria li rileva)
        const originalCleaned = value.replace(/\s/g, '');
        // Usa isValidPhoneNumber per validare il numero originale
        libraryValidationPassed = isValidPhoneNumber(originalCleaned);
        
        // Se la libreria dice che non è valido, potrebbe essere per caratteri non validi
        if (!libraryValidationPassed && hasInvalidChars) {
          // La libreria ha rilevato caratteri non validi
          this.phoneNumberError = this.translate.instant('PhoneNumberContainsInvalidCharacters');
          this.phoneNumberValid = false;
        }
      } catch (e) {
        // Se la validazione fallisce con un'eccezione, ci sono caratteri non validi
        if (hasInvalidChars) {
          this.phoneNumberError = this.translate.instant('PhoneNumberContainsInvalidCharacters');
          this.phoneNumberValid = false;
        }
        this.logger.log('[CONTACTS-WA-BROADCAST-MODAL] Library validation error:', e);
      }
    }
    
    // Rimuovi spazi e caratteri non validi (mantieni solo numeri e +)
    let phoneToFormat = value.replace(/[^\d+]/g, '');
    
    // Se ci sono caratteri non validi, mostra errore e non considerare il numero valido
    if (hasInvalidChars) {
      // L'errore è già stato impostato sopra se la libreria ha fallito
      if (!this.phoneNumberError) {
        this.phoneNumberError = this.translate.instant('PhoneNumberContainsInvalidCharacters');
      }
      this.phoneNumberValid = false;
      // Aggiorna comunque il valore pulito per mostrare cosa verrà salvato
      if (this.phoneNumber !== phoneToFormat) {
        this.phoneNumber = phoneToFormat;
      }
      // Continua con la validazione del numero pulito per mostrare la bandiera se c'è un dial code
      // ma il numero non sarà considerato valido finché non vengono rimossi i caratteri non validi
    } else {
      // Aggiorna il valore solo se è diverso per evitare loop infiniti
      if (this.phoneNumber !== phoneToFormat) {
        this.phoneNumber = phoneToFormat;
      }
    }
    
    // Se il numero è troppo corto (meno di 3 caratteri), non mostrare errori
    // L'utente sta ancora digitando
    if (phoneToFormat.length < 3) {
      this.phoneNumberFormatted = phoneToFormat;
      this.phoneCountryCode = null;
      this.phoneNumberError = null;
      return;
    }
    
    // Per WhatsApp è richiesto il formato internazionale con "+" iniziale
    // Non formattiamo se manca il "+", ma mostra errore solo se il numero è abbastanza lungo
    if (!phoneToFormat.startsWith('+')) {
      this.phoneNumberFormatted = phoneToFormat;
      // Se c'è un valore, rimuovi l'errore "Field required" (se presente)
      // perché il campo non è più vuoto
      // Ma NON rimuovere altri errori (es. caratteri non validi) che hanno priorità
      if (this.phoneNumberError === this.translate.instant('FieldRequired')) {
        this.phoneNumberError = null;
      }
      // Se ci sono caratteri non validi, non chiamare detectPhoneCountry perché l'errore è già impostato
      if (hasInvalidChars) {
        // L'errore per caratteri non validi ha già priorità, non sovrascriverlo
        return;
      }
      // Mostra errore solo se il numero è abbastanza lungo (almeno 5 caratteri)
      if (phoneToFormat.length >= 5) {
        this.detectPhoneCountry(); // Mostra errore che manca il +
      } else {
        this.phoneCountryCode = null;
        // Non resettare l'errore se non è "Field required" (potrebbe essere un altro errore)
        if (this.phoneNumberError === this.translate.instant('FieldRequired')) {
          this.phoneNumberError = null;
        }
      }
      return;
    }

    // Rileva il paese e mostra la bandiera anche durante la digitazione
    try {
      const formatter = new AsYouType();
      formatter.input(phoneToFormat);
      const country = formatter.getCountry();
      
      if (country) {
        this.phoneCountryCode = country;
        this.phoneCountryName = this.countryNames[country] || country;
        console.log('[CONTACTS-WA-BROADCAST-MODAL] Country detected:', country, 'Name:', this.phoneCountryName);
      } else {
        this.phoneCountryCode = null;
        this.phoneCountryName = null;
      }
      
      // Ottieni il numero formattato (anche se incompleto)
      const formattedNumber = formatter.getNumber();
      
      this.logger.log('[CONTACTS-WA-BROADCAST-MODAL] AsYouType formattedNumber:', formattedNumber);
      
      // Usa il formato internazionale se il numero è completo e valido
      // Ma solo se non ci sono caratteri non validi nel valore originale
      if (formattedNumber && formattedNumber.isValid() && !hasInvalidChars) {
        this.phoneNumberFormatted = formattedNumber.formatInternational();
        // Aggiorna il numero formattato solo se è completo e valido, e solo se diverso
        if (this.phoneNumber !== this.phoneNumberFormatted) {
          this.phoneNumber = this.phoneNumberFormatted;
        }
      } else {
        // Se il numero non è completo o ci sono caratteri non validi, mantieni il valore originale
        this.phoneNumberFormatted = phoneToFormat;
      }
      
      this.logger.log('[CONTACTS-WA-BROADCAST-MODAL] Final formatted number:', this.phoneNumberFormatted, 'Original:', phoneToFormat);
    } catch (error) {
      // Se la formattazione fallisce, usa il numero originale
      this.logger.error('[CONTACTS-WA-BROADCAST-MODAL] Error formatting phone number:', error);
      this.phoneNumberFormatted = phoneToFormat;
    }

    // Valida il numero anche se è corto (per mostrare la bandiera subito dopo il dial code)
    // Ma mostra errori solo se è abbastanza lungo (almeno 5 caratteri)
    // Se ci sono caratteri non validi, non chiamare detectPhoneCountry perché l'errore è già impostato
    if (!hasInvalidChars) {
      if (phoneToFormat.length >= 2) {
        // Se il numero inizia con +, rimuovi l'errore "PhoneNumberMustStartWithPlus" se presente
        // perché ora il + è presente
        if (phoneToFormat.startsWith('+')) {
          const mustStartWithPlusError = this.translate.instant('PhoneNumberMustStartWithPlus');
          if (this.phoneNumberError === mustStartWithPlusError) {
            this.phoneNumberError = null;
          }
        }
        // Chiama detectPhoneCountry anche per numeri corti per mostrare la bandiera
        this.detectPhoneCountry();
        // Ma resetta l'errore se il numero è troppo corto (a meno che non ci siano caratteri non validi)
        if (phoneToFormat.length < 5) {
          // Non resettare l'errore se è "PhoneNumberMissingDialCode" o altri errori importanti
          const missingDialCodeError = this.translate.instant('PhoneNumberMissingDialCode');
          if (this.phoneNumberError !== missingDialCodeError) {
            this.phoneNumberError = null;
          }
          this.phoneNumberValid = false;
        }
      } else {
        // Se il numero è troppo corto, non mostrare errori
        this.phoneNumberError = null;
        this.phoneNumberValid = false;
      }
    }
    // Se hasInvalidChars è true, l'errore è già stato impostato sopra e phoneNumberValid è false
  }

  getFlagImagePath(): string {
    // Restituisce il percorso dell'immagine della bandiera
    // Se c'è un dial code valido, mostra la bandiera del paese
    if (this.phoneCountryCode) {
      return `assets/img/flags/${this.phoneCountryCode.toUpperCase()}.png`;
    }
    // In tutti gli altri casi (numero senza dial code o campo vuoto), mostra Missing_flag.png come fallback
    return `assets/img/flags/Missing_flag.png`;
  }

  // Verifica se il numero è stato modificato rispetto all'originale
  isPhoneNumberModified(): boolean {
    if (!this.originalPhoneNumber) {
      // Se non c'era un numero originale, considera modificato se c'è un numero valido
      return this.phoneNumberValid && !!this.phoneNumber;
    }
    // Confronta il numero corrente con quello originale (normalizzati)
    const currentNormalized = this.phoneNumber.replace(/\s/g, '');
    const originalNormalized = this.originalPhoneNumber.replace(/\s/g, '');
    return currentNormalized !== originalNormalized;
  }

  updateContactPhone() {
    if (!this.data?.contact?._id || !this.phoneNumber || !this.phoneNumberValid) {
      this.logger.warn('[CONTACTS-WA-BROADCAST-MODAL] Cannot update contact phone: missing contact ID, phone number, or invalid phone number.');
      return;
    }

    if (this.isSavingPhone) {
      return; // Evita doppi salvataggi
    }

    this.isSavingPhone = true;
    this.logger.log('[CONTACTS-WA-BROADCAST-MODAL] Updating contact phone:', {
      contactId: this.data.contact._id,
      phoneNumber: this.phoneNumber
    });

    // Imposta il projectId nel servizio se necessario
    if (this.projectId) {
      this.contactsService.projectId = this.projectId;
    }

    // Salva il numero senza formattazione (senza spazi)
    const phoneNumberToSave = this.phoneNumber.replace(/\s/g, '');
    this.contactsService.updateLeadPhone(this.data.contact._id, phoneNumberToSave)
      .subscribe(
        (contact) => {
          this.logger.log('[CONTACTS-WA-BROADCAST-MODAL] Contact phone updated successfully:', contact);
          // Aggiorna il numero originale dopo il salvataggio
          this.originalPhoneNumber = this.phoneNumber;
          this.isSavingPhone = false;
          // Mostra notifica di successo
          this.notify.showWidgetStyleUpdateNotification('Contact phone updated successfully', 2, 'done');
        },
        (error) => {
          this.logger.error('[CONTACTS-WA-BROADCAST-MODAL] Error updating contact phone:', error);
          this.isSavingPhone = false;
          // Mostra notifica di errore
          this.notify.showWidgetStyleUpdateNotification('An error occurred while updating contact phone', 4, 'report_problem');
        }
      );
  }

  createReceiversList() {
    // Crea un array con un solo receiver (il contatto corrente)
    // Rimuovi spazi dal numero telefonico prima di inviarlo al server
    const phoneNumberCleaned = this.phoneNumber.replace(/\s/g, '');
    const phone_number = phoneNumberCleaned.startsWith('+') ? phoneNumberCleaned : `+${phoneNumberCleaned}`;
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
    
    // Reset status
    this.broadcastStatus = 'sending';
    this.broadcastErrorMessage = null;

    this.automationsService.sendBroadcast(broadcastData).subscribe(
      (response) => {
       console.log('[CONTACTS-WA-BROADCAST-MODAL] Broadcast sent successfully:', response);
        this.broadcastStatus = 'success';
        // Non chiudere automaticamente la modale, lascia che l'utente la chiuda manualmente
      },
      (error) => {
        this.logger.error('[CONTACTS-WA-BROADCAST-MODAL] Error sending broadcast:', error);
        this.broadcastStatus = 'error';
        this.broadcastErrorMessage = error?.error?.message || error?.message || this.translate.instant('ErrorSendingWhatsAppMessage');
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

  goToWhatsAppBroadcasts() {
     this.dialogRef.close();
    this.router.navigate(['project/' + this.projectId + '/automations'])
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}

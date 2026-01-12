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
import { BrandService } from 'app/services/brand.service';
import { URL_WA_BroadcastsDocs } from 'app/utils/util';
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
  templates_list: any[] = [];
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

  public hideHelpLink: boolean;

  fakeTmplt = [ {
        "name": "tracking_consegna",
        "parameter_format": "POSITIONAL",
        "components": [
            {
                "type": "HEADER",
                "format": "TEXT",
                "text": "Il tuo articolo è stato spedito"
            },
            {
                "type": "BODY",
                "text": "Ciao {{1}}, la tua spedizione da Shop.com è partita e verrà consegnata in 24/48 ore.\nPuoi tracciare il pacco cliccando cliccando qui sotto.",
                "example": {
                    "body_text": [
                        [
                            "Giovanni"
                        ]
                    ]
                }
            },
            {
                "type": "BUTTONS",
                "buttons": [
                    {
                        "type": "URL",
                        "text": "Visit website",
                        "url": "https://mytracking.com/{{1}}",
                        "example": [
                            "https://mytracking.com/?numer=123456"
                        ]
                    }
                ]
            }
        ],
        "language": "en",
        "status": "APPROVED",
        "category": "UTILITY",
        "sub_category": "CUSTOM",
        "id": "1408747083529940"
    },
    {
        "name": "programmazione_consegna",
        "parameter_format": "POSITIONAL",
        "components": [
            {
                "type": "BODY",
                "text": "Buongiorno\nGrazie per aver fatto un ordine con noi! Ti contattiamo per programmare uno slot a te conveniente per la consegna del prodotto.\nIndicami pure le tue disponibilità direttamente qui in chat.\nA presto"
            }
        ],
        "language": "it",
        "status": "APPROVED",
        "category": "MARKETING",
        "sub_category": "CUSTOM",
        "id": "735620482551669"
    },
    {
        "name": "test_img",
        "parameter_format": "NAMED",
        "components": [
            {
                "type": "HEADER",
                "format": "IMAGE",
                "example": {
                    "header_handle": [
                        "https://scontent.whatsapp.net/v/t61.29466-34/491885243_1774615546785586_6748268181529287354_n.png?ccb=1-7&_nc_sid=8b1bef&_nc_ohc=p9gAXGHwKaYQ7kNvwGtl2ix&_nc_oc=Admj4oHltQinLzKR-weau79OEgOixe1AErBTva8GCa8_p_TK5bkmfTp7TP89Yddg57Q&_nc_zt=3&_nc_ht=scontent.whatsapp.net&edm=AH51TzQEAAAA&_nc_gid=YGYSiiPoBI4ue25tN9eSmg&_nc_tpa=Q5bMBQF67fqL_1_UTB-9Mt1AceOsMlIGA20h7Uqs8LVfn0jmhqadp23E3IgU5-DjxjRJ6i1DoIncFyia&oh=01_Q5Aa3gH-8YyY1Yf0BcknzZDorDYdLbRxdIh8jcUjdTmNdkVMVw&oe=698C8A83"
                    ]
                }
            },
            {
                "type": "BODY",
                "text": "Hello Davide\nquesto è un template con l'immagine"
            },
            {
                "type": "FOOTER",
                "text": "saluti"
            }
        ],
        "language": "en",
        "status": "APPROVED",
        "category": "MARKETING",
        "sub_category": "CUSTOM",
        "id": "1774615543452253"
    },
    {
        "name": "esprinet",
        "parameter_format": "POSITIONAL",
        "components": [
            {
                "type": "BODY",
                "text": "Ciao\nGrazie per aver chattato con l'Agente virtuale di Esprinet.\n\nAbbiamo raccolto le info su quello che stai cercando. Verrai ricontattato dal nostro team commerciale nelle prossime 24 ore lavorative.\n\nNel frattempo, se hai qualche domanda o dubbio, puoi continuare a chattare con il nostro Agente virtuale qui su WhatsApp!\n\nA presto"
            },
            {
                "type": "FOOTER",
                "text": "Team di Esprinet"
            }
        ],
        "language": "it",
        "status": "APPROVED",
        "category": "MARKETING",
        "sub_category": "CUSTOM",
        "id": "1084835630174840"
    },
    {
        "name": "preventivo_tilby_rifiutato",
        "parameter_format": "POSITIONAL",
        "components": [
            {
                "type": "BODY",
                "text": "Salve,\nCi dispiace non siamo riusciti a trovare un accordo sul preventivo che ti abbiamo proposto. Ci sarebbe d'aiuto capire le tue motivazioni a riguardo.\nChattiamo qui?"
            },
            {
                "type": "FOOTER",
                "text": "Team Tilby"
            }
        ],
        "language": "it",
        "status": "APPROVED",
        "category": "MARKETING",
        "sub_category": "CUSTOM",
        "id": "1899456320799008"
    },
    {
        "name": "preventivo_tilby",
        "parameter_format": "POSITIONAL",
        "components": [
            {
                "type": "BODY",
                "text": "Salve, \ncome da accordi la nostra proposta di preventivo ti è stata inviata via email. \nPer qualsiasi chiarimento o dubbio non esitare a farmi delle domande direttamente in questa chat."
            },
            {
                "type": "FOOTER",
                "text": "Team Tilby"
            }
        ],
        "language": "it",
        "status": "APPROVED",
        "category": "MARKETING",
        "sub_category": "CUSTOM",
        "id": "1232519955542332"
    },
    {
        "name": "promo50off",
        "parameter_format": "POSITIONAL",
        "components": [
            {
                "type": "BODY",
                "text": "Hello\nThis is the last opportunity for you to claim our 50% discount on all of our plans!\nHurry up"
            },
            {
                "type": "FOOTER",
                "text": "Tiledesk Team"
            },
            {
                "type": "BUTTONS",
                "buttons": [
                    {
                        "type": "URL",
                        "text": "Visit website",
                        "url": "https://tiledesk.com/"
                    }
                ]
            }
        ],
        "language": "en",
        "status": "APPROVED",
        "category": "MARKETING",
        "sub_category": "CUSTOM",
        "id": "1403283594379254"
    },
    {
        "name": "studio_dentistico",
        "parameter_format": "POSITIONAL",
        "components": [
            {
                "type": "BODY",
                "text": "Buongiorno ! \nLe ricordiamo l'appuntamento per il giorno {{2}} alle ore {{3}} per {{1}}. \nLa invitiamo a confermare tramite i tasti sotto riportati. La preghiamo di informarci con almeno 24 ore di anticipo nel caso avesse qualche problema, in quanto il medico ha riservato per lei uno spazio di {{4}} minuti.\n\nLe auguriamo un’ottima giornata!",
                "example": {
                    "body_text": [
                        [
                            "Valentina Marras",
                            "4/09/2024",
                            "12:00",
                            "20"
                        ]
                    ]
                }
            },
            {
                "type": "FOOTER",
                "text": "Studio Dentistico Piras Denotti Piazza Repubblica 22"
            },
            {
                "type": "BUTTONS",
                "buttons": [
                    {
                        "type": "QUICK_REPLY",
                        "text": "Confermo"
                    },
                    {
                        "type": "QUICK_REPLY",
                        "text": "Non confermo"
                    },
                    {
                        "type": "URL",
                        "text": "Apri nella mappa",
                        "url": "https://shorturl.at/Voa5j"
                    }
                ]
            }
        ],
        "language": "it",
        "status": "APPROVED",
        "category": "MARKETING",
        "sub_category": "CUSTOM",
        "id": "1054368693007292"
    },
    {
        "name": "reminder_for_dinner_at_restauran",
        "parameter_format": "POSITIONAL",
        "components": [
            {
                "type": "HEADER",
                "format": "IMAGE",
                "example": {
                    "header_handle": [
                        "https://scontent.whatsapp.net/v/t61.29466-34/436752126_8690680000961402_6264950153954945392_n.png?ccb=1-7&_nc_sid=8b1bef&_nc_ohc=k5g20XNaQYwQ7kNvwF8jZa-&_nc_oc=Admuwv9ixTx8eXDkDYQ-EvGl9vV8aTxC4zyJez2JktE0g8zxyz4kzeEF5b0Bv04MTSs&_nc_zt=3&_nc_ht=scontent.whatsapp.net&edm=AH51TzQEAAAA&_nc_gid=YGYSiiPoBI4ue25tN9eSmg&_nc_tpa=Q5bMBQHTxpgymWKJviUhOifr_U6mDcnZCvq7HfGDwH7ITCvtn36xxfKCbYfZANSbdv5OyfT6iKnRaWhW&oh=01_Q5Aa3gH8CDqDvpxiyo91BakTIuulCVR9A6RmEnutF6RTrHy9Lg&oe=698C870F"
                    ]
                }
            },
            {
                "type": "BODY",
                "text": "Gentile, {{1}}\nSiamo lieti di ricordarLe che la Sua prenotazione presso il ristorante Lötschberg di Berna è confermata per le ore 20:00, in data 13.08.2024.\n\nL'indirizzo del ristorante è:\nLötschberg\nZeughausgasse 16, \n3011 Berna\n\nNon vediamo l'ora di accoglierLa e di offrirLe una serata speciale!",
                "example": {
                    "body_text": [
                        [
                            "Marco"
                        ]
                    ]
                }
            },
            {
                "type": "FOOTER",
                "text": "Il team del ristorante Lötschberg"
            }
        ],
        "language": "it",
        "status": "APPROVED",
        "category": "MARKETING",
        "sub_category": "CUSTOM",
        "id": "8690679997628069"
    },
    {
        "name": "new_kbs",
        "parameter_format": "POSITIONAL",
        "components": [
            {
                "type": "HEADER",
                "format": "IMAGE",
                "example": {
                    "header_handle": [
                        "https://scontent.whatsapp.net/v/t61.29466-34/444788677_490015320150645_5388482583650719226_n.png?ccb=1-7&_nc_sid=8b1bef&_nc_ohc=p9PeTNCjF4gQ7kNvwHSfjFQ&_nc_oc=Adnp1TkQ4_b4DglqUihlmT2fDO-aTBooV2u86B5NjBvxGgy8We7f_cFCIGp_WXvYY18&_nc_zt=3&_nc_ht=scontent.whatsapp.net&edm=AH51TzQEAAAA&_nc_gid=YGYSiiPoBI4ue25tN9eSmg&_nc_tpa=Q5bMBQH_lxx9MpZILiKspO1CK5hou2tp3ZdbjWcg-1W3UEKcPUvPmH6CsCL6gM2XZbXp3th3AA8sodAk&oh=01_Q5Aa3gHO_oqLVAdQMZDA5dPy0c1qmQNRi6u8Z2Ftbck7g2XeSw&oe=698C9A6D"
                    ]
                }
            },
            {
                "type": "BODY",
                "text": "Hey {{1}}\nExciting news!\nYou can now add separate KBs, or Namespaces as we call them, in the Manage Your Contents section. \nHow?\nClick on the Default to get the option of adding a new KB and/or choose an existing KB.",
                "example": {
                    "body_text": [
                        [
                            "Matteo"
                        ]
                    ]
                }
            },
            {
                "type": "FOOTER",
                "text": "Your Tiledesk Team"
            },
            {
                "type": "BUTTONS",
                "buttons": [
                    {
                        "type": "URL",
                        "text": "Try it out NOW!",
                        "url": "https://panel.tiledesk.com/v3/dashboard/#/login"
                    }
                ]
            }
        ],
        "language": "en",
        "status": "APPROVED",
        "category": "MARKETING",
        "sub_category": "CUSTOM",
        "id": "490015316817312"
    },
    {
        "name": "prodotto_cucina_offerta",
        "parameter_format": "POSITIONAL",
        "components": [
            {
                "type": "HEADER",
                "format": "IMAGE",
                "example": {
                    "header_handle": [
                        "https://scontent.whatsapp.net/v/t61.29466-34/323952735_464081529644938_1319930073932790672_n.png?ccb=1-7&_nc_sid=8b1bef&_nc_ohc=VM34Yz1I78AQ7kNvwGTcuA4&_nc_oc=Adlksvys7CoILihi29Jy_Pd5SP4nwyJw7QRe5JjJ_Tjtlk6T0D9Dnzs1KHKwiMrR1dM&_nc_zt=3&_nc_ht=scontent.whatsapp.net&edm=AH51TzQEAAAA&_nc_gid=YGYSiiPoBI4ue25tN9eSmg&_nc_tpa=Q5bMBQHKCytrTg1-senmLVKCMPbsjBb2epcmQgmegF7oxiyj94K5_gFnwQiBSIYCxNqA30b2eialTW4B&oh=01_Q5Aa3gGfboSH_u__eQQw374KBNOjExnol-m0HYAM6VmK0mKYFw&oe=698C8206"
                    ]
                }
            },
            {
                "type": "BODY",
                "text": "Ciao *{{1}}*,\nIn offerta per i nostri clienti, solo per il mese di {{2}}:\n\n*{{3}}*\na soli € _{{4}}_ invece di € ~{{5}}~\n\nScopri anche tu tutta la magia di un buon biscotto!",
                "example": {
                    "body_text": [
                        [
                            "Marisa",
                            "Giugno",
                            "Matterello Merlino con Stampini",
                            "17,90",
                            "29,90"
                        ]
                    ]
                }
            },
            {
                "type": "FOOTER",
                "text": "Il tuo Team di Fiducia"
            },
            {
                "type": "BUTTONS",
                "buttons": [
                    {
                        "type": "URL",
                        "text": "Acquista ora!",
                        "url": "https://www.tupperware.it/shop/it/matterello-merlino-con-stampini.html"
                    }
                ]
            }
        ],
        "language": "it",
        "status": "APPROVED",
        "category": "MARKETING",
        "id": "464081526311605"
    },
    {
        "name": "summer_promo",
        "parameter_format": "POSITIONAL",
        "components": [
            {
                "type": "HEADER",
                "format": "IMAGE",
                "example": {
                    "header_handle": [
                        "https://scontent.whatsapp.net/v/t61.29466-34/442720920_2037177846740518_7715523337563257232_n.jpg?ccb=1-7&_nc_sid=8b1bef&_nc_ohc=YvCvGx1hsEoQ7kNvwFLZUJd&_nc_oc=AdlrpE59JTM0fvya7_RxL2MaEz6BKzP8iF8_ymChc6pYAfYAUaVivECcmYLSeNBA26Q&_nc_zt=3&_nc_ht=scontent.whatsapp.net&edm=AH51TzQEAAAA&_nc_gid=YGYSiiPoBI4ue25tN9eSmg&_nc_tpa=Q5bMBQFm_nsgUvq3HnNR0GfeFRfAmMacM_eVQ5gwXafcdQZdQnIokpJ0ep6pDkMsJRJAsktjBkmMPdnK&oh=01_Q5Aa3gF54ZjGZvOa3ULzDbEy0heuraAbtCFoE7j1pPKuad8VBw&oe=698C90DD"
                    ]
                }
            },
            {
                "type": "BODY",
                "text": "Hey {{1}}, I've got a small token of appreciation for your trust! \nThis month only, *{{2}}%* of discount on all of our products.\n\nType in the code {{3}} at the checkout.\n\n*One-time promo code",
                "example": {
                    "body_text": [
                        [
                            "John",
                            "20",
                            "SummerHigh"
                        ]
                    ]
                }
            },
            {
                "type": "FOOTER",
                "text": "Not interested? Tap Stop promotions"
            },
            {
                "type": "BUTTONS",
                "buttons": [
                    {
                        "type": "QUICK_REPLY",
                        "text": "Stop promotions"
                    }
                ]
            }
        ],
        "language": "en_GB",
        "status": "APPROVED",
        "category": "MARKETING",
        "id": "2037177843407185"
    },
    {
        "name": "summer_promo",
        "parameter_format": "POSITIONAL",
        "components": [
            {
                "type": "HEADER",
                "format": "IMAGE",
                "example": {
                    "header_handle": [
                        "https://scontent.whatsapp.net/v/t61.29466-34/444788671_834284335237699_4028462709980494335_n.jpg?ccb=1-7&_nc_sid=8b1bef&_nc_ohc=peq5WlmYYacQ7kNvwGbY2-I&_nc_oc=AdkDMUok2X5eYwHnZYA-sPDlwdSwuP3fw0p7TMWxawUOuTu5rNpQOBW_8VsnfS5HlmA&_nc_zt=3&_nc_ht=scontent.whatsapp.net&edm=AH51TzQEAAAA&_nc_gid=YGYSiiPoBI4ue25tN9eSmg&_nc_tpa=Q5bMBQGgS2jfo0IZlg-CAx0shsSw7yJ6ZBAMmqQOiH4rhssUI4lO09WnDU3ERAgtDFobQHfoI7_5RMKX&oh=01_Q5Aa3gEYeowV1KMoaMmJLDvT3QB92q1BahX558w4tL1VJEo-qw&oe=698C71FB"
                    ]
                }
            },
            {
                "type": "BODY",
                "text": "Ciao {{1}}, solo per te un codice sconto del *{{2}}%* su tutto il nostro catalogo.\n\nUsa il codice {{3}} in fase di acquisto.\n\n*Codice utilizzabile per un solo acquisto",
                "example": {
                    "body_text": [
                        [
                            "Jovana",
                            "25",
                            "ArrivaEstate"
                        ]
                    ]
                }
            },
            {
                "type": "FOOTER",
                "text": "Non ti interessa? Tocca Interrompi promozioni"
            },
            {
                "type": "BUTTONS",
                "buttons": [
                    {
                        "type": "QUICK_REPLY",
                        "text": "Interrompi promozioni"
                    }
                ]
            }
        ],
        "language": "it",
        "status": "APPROVED",
        "category": "MARKETING",
        "id": "834284331904366"
    },
    {
        "name": "fattura",
        "parameter_format": "POSITIONAL",
        "components": [
            {
                "type": "HEADER",
                "format": "DOCUMENT",
                "example": {
                    "header_handle": [
                        "https://scontent.whatsapp.net/v/t61.29466-34/324037797_773198701594329_2391946491575082657_n.pdf?ccb=1-7&_nc_sid=8b1bef&_nc_ohc=AQmuBhDJ_xkQ7kNvwHLDDQD&_nc_oc=AdlGcZXtB-FtsmGFYJ1W21wP4GjXWlIsSwqNSmuOLDcOPKK14uH_aOOVXgSRiAJ6akU&_nc_zt=3&_nc_ht=scontent.whatsapp.net&edm=AH51TzQEAAAA&_nc_gid=YGYSiiPoBI4ue25tN9eSmg&_nc_tpa=Q5bMBQGBsT18bVNvoTKjq1BnvhWbbuxYrjMZy8QBtm6pKCfAIRpyxjwa3epxYFGZe9XRPoWTWzAmU_A6&oh=01_Q5Aa3gGwb8lFRe5T2gLwvk4kqXWbbH9fL9HELPwxmVWJn0bU8A&oe=698C92BA"
                    ]
                }
            },
            {
                "type": "BODY",
                "text": "Ciao *{{1}}*,\nè disponibile la fattura di vendita numero *{{2}}*\nriferita all'ordine numero *{{3}}* del _{{4}}_\n\nA presto!",
                "example": {
                    "body_text": [
                        [
                            "Jovana",
                            "1234",
                            "ABCD",
                            "25/05/24"
                        ]
                    ]
                }
            },
            {
                "type": "FOOTER",
                "text": "Il Team di Scelgo"
            },
            {
                "type": "BUTTONS",
                "buttons": [
                    {
                        "type": "PHONE_NUMBER",
                        "text": "Problemi con la fattura?",
                        "phone_number": "+393497744444"
                    }
                ]
            }
        ],
        "language": "it",
        "status": "APPROVED",
        "category": "UTILITY",
        "id": "773198698260996"
    },
    {
        "name": "prodotto_inscadenza_in_offerta",
        "parameter_format": "POSITIONAL",
        "components": [
            {
                "type": "HEADER",
                "format": "IMAGE",
                "example": {
                    "header_handle": [
                        "https://scontent.whatsapp.net/v/t61.29466-34/328798447_1174202220665470_5358947475254180022_n.jpg?ccb=1-7&_nc_sid=8b1bef&_nc_ohc=l6xf6gBxmR8Q7kNvwGlI10P&_nc_oc=AdndDeTT2PLofp80oTftEfXGTqLGStlwowRJhTAnB77sPRVZFHlAf_dpYhYY8HYY7bY&_nc_zt=3&_nc_ht=scontent.whatsapp.net&edm=AH51TzQEAAAA&_nc_gid=YGYSiiPoBI4ue25tN9eSmg&_nc_tpa=Q5bMBQGh6nM711T7CTpHq9iJ3ZmHriQvTJJ_cLhWpKz_qdbWGOo1dSY8lO9QAyFln6ohaNacgOXMUHRU&oh=01_Q5Aa3gFkMzAJ9UVyTcsktZSX_iSulPFkxxLP31djyZkWr4Ggcg&oe=698C7B80"
                    ]
                }
            },
            {
                "type": "BODY",
                "text": "Ciao *{{1}}*,\nIn offerta per i nostri clienti, in quanto prossimo alla scadenza {{2}}\n\n*{{3}}*\na soli € _{{4}}_ invece di € ~{{5}}~",
                "example": {
                    "body_text": [
                        [
                            "Michele",
                            "GOLDEN TURTLE YAKINORI GOLD 50 FOGLI",
                            "50%",
                            "5.50",
                            "11"
                        ]
                    ]
                }
            },
            {
                "type": "BUTTONS",
                "buttons": [
                    {
                        "type": "URL",
                        "text": "Acquista ora!",
                        "url": "https://scelgofullservice.com/e-store{{1}}",
                        "example": [
                            "https://scelgofullservice.com/e-store"
                        ]
                    }
                ]
            }
        ],
        "language": "it",
        "status": "APPROVED",
        "category": "MARKETING",
        "id": "1174202217332137"
    },
    {
        "name": "avec_test",
        "parameter_format": "POSITIONAL",
        "components": [
            {
                "type": "BODY",
                "text": "Ciao, grazie per averci contattato. Un operatore si metterà in contatto con te appena possibile per risolvere il tuo problema."
            }
        ],
        "language": "it",
        "status": "APPROVED",
        "category": "MARKETING",
        "id": "308811858779019"
    },
    {
        "name": "documento_scaduto",
        "parameter_format": "POSITIONAL",
        "components": [
            {
                "type": "HEADER",
                "format": "TEXT",
                "text": "Documento di identità scaduto"
            },
            {
                "type": "BODY",
                "text": "Gentile Cliente,\n\nCi rivolgiamo a Lei per informarla gentilmente che il documento d'identità attualmente registrato presso la nostra banca risulta scaduto. Per garantire la sicurezza e l'aggiornamento delle informazioni del suo profilo, La invitiamo cortesemente a caricare un documento d'identità in corso di validità.\n\nLe saremmo grati se potesse procedere con l'invio del nuovo documento direttamente tramite questa chat oppure attraverso il nostro sistema online dedicato o recandosi presso una delle nostre filiali.\n\nRestiamo a disposizione per qualsiasi ulteriore assistenza di cui possa aver bisogno.\n\nDistinti saluti"
            },
            {
                "type": "FOOTER",
                "text": "La Tua Banca di Fiducia"
            },
            {
                "type": "BUTTONS",
                "buttons": [
                    {
                        "type": "QUICK_REPLY",
                        "text": "Sostituisci il documento"
                    }
                ]
            }
        ],
        "language": "it",
        "status": "APPROVED",
        "category": "MARKETING",
        "id": "386162327381553"
    },
    {
        "name": "ordine_in_giacenza",
        "parameter_format": "POSITIONAL",
        "components": [
            {
                "type": "HEADER",
                "format": "IMAGE",
                "example": {
                    "header_handle": [
                        "https://scontent.whatsapp.net/v/t61.29466-34/442733288_1651922365347415_3342935787758643458_n.jpg?ccb=1-7&_nc_sid=8b1bef&_nc_ohc=BwXGrfhSLLAQ7kNvwH9nXDj&_nc_oc=Adkngf325JeUg9TMQMJYJkswo0lWV7BpxL00QbA6Q7RUdFJTCx-N3lh6d_5yWvItONA&_nc_zt=3&_nc_ht=scontent.whatsapp.net&edm=AH51TzQEAAAA&_nc_gid=YGYSiiPoBI4ue25tN9eSmg&_nc_tpa=Q5bMBQEFM-VfNYtTqrIxSydHSj6C41b6Xi3aytqzRpGXgj05AozrbaGPhuN4cXODGx_eGfu0uZjQsz3x&oh=01_Q5Aa3gFsry2N-S58HQWwV-6aFYV-COx-gfiPFpIdobP1JEuCYQ&oe=698C93E0"
                    ]
                }
            },
            {
                "type": "BODY",
                "text": "Ciao {{1}}! 🌟\n\nSperiamo tu stia avendo una giornata fantastica! Volevamo darti un piccolo aggiornamento sul tuo ordine {{2}}. Al momento è in pausa nel nostro magazzino, ma non preoccuparti, siamo qui per sistemare tutto! 📦\n\nCi piacerebbe coordinare una nuova spedizione che si adatti perfettamente alla tua routine. Quando hai un attimo, rispondici qui con il momento migliore per te e se hai preferenze specifiche per la consegna.\n\nGrazie mille per la tua pazienza! 🙏 Non vediamo l'ora di assicurarci che il tuo ordine arrivi nelle tue mani al più presto possibile.\n\nA presto! 👋",
                "example": {
                    "body_text": [
                        [
                            "Mauro",
                            "ABCD1234"
                        ]
                    ]
                }
            },
            {
                "type": "FOOTER",
                "text": "Tiledesk S.r.l."
            }
        ],
        "language": "it",
        "status": "APPROVED",
        "category": "UTILITY",
        "id": "1577136542825998"
    },
    {
        "name": "store_fisico",
        "parameter_format": "POSITIONAL",
        "components": [
            {
                "type": "HEADER",
                "format": "LOCATION"
            },
            {
                "type": "BODY",
                "text": "Le offerte imperdibile proseguono nel nostro store fisico.\nVieni a trovarci a in \n📍_via Bruxelles, 30 - Z.I. Soleto, Lecce, Italia_"
            }
        ],
        "language": "it",
        "status": "APPROVED",
        "category": "MARKETING",
        "id": "553774293614329"
    },
    {
        "name": "hello_world",
        "parameter_format": "POSITIONAL",
        "components": [
            {
                "type": "HEADER",
                "format": "TEXT",
                "text": "Hello World"
            },
            {
                "type": "BODY",
                "text": "Welcome and congratulations!! This message demonstrates your ability to send a message notification from WhatsApp Business Platform’s Cloud API. Thank you for taking the time to test with us."
            },
            {
                "type": "FOOTER",
                "text": "WhatsApp Business API Team"
            }
        ],
        "language": "en_US",
        "status": "APPROVED",
        "category": "MARKETING",
        "id": "1233049530602952"
    },
    {
        "name": "sample_happy_hour_announcement",
        "previous_category": "APPOINTMENT_UPDATE",
        "parameter_format": "POSITIONAL",
        "components": [
            {
                "type": "HEADER",
                "format": "VIDEO"
            },
            {
                "type": "BODY",
                "text": "O happy hour chegou! 🍺😀🍸\nSeja feliz e aproveite o dia. 🎉\nLocal: {{1}}\nHorário: {{2}}"
            },
            {
                "type": "FOOTER",
                "text": "Esta mensagem é de uma empresa não verificada."
            }
        ],
        "language": "pt_BR",
        "status": "APPROVED",
        "category": "MARKETING",
        "id": "5494905530555654"
    },
    {
        "name": "sample_purchase_feedback",
        "previous_category": "ISSUE_RESOLUTION",
        "parameter_format": "POSITIONAL",
        "components": [
            {
                "type": "HEADER",
                "format": "IMAGE"
            },
            {
                "type": "BODY",
                "text": "¡Gracias por comprar {{1}}! Valoramos tus comentarios y nos gustaría saber cómo fue tu experiencia."
            },
            {
                "type": "FOOTER",
                "text": "Este mensaje proviene de un negocio no verificado."
            },
            {
                "type": "BUTTONS",
                "buttons": [
                    {
                        "type": "URL",
                        "text": "Responder encuesta",
                        "url": "https://www.example.com/"
                    }
                ]
            }
        ],
        "language": "es",
        "status": "APPROVED",
        "category": "MARKETING",
        "id": "5285989788148746"
    },
    {
        "name": "sample_flight_confirmation",
        "previous_category": "TICKET_UPDATE",
        "parameter_format": "POSITIONAL",
        "components": [
            {
                "type": "HEADER",
                "format": "DOCUMENT"
            },
            {
                "type": "BODY",
                "text": "Esta é a sua confirmação de voo para {{1}}-{{2}} em {{3}}."
            },
            {
                "type": "FOOTER",
                "text": "Esta mensagem é de uma empresa não verificada."
            }
        ],
        "language": "pt_BR",
        "status": "APPROVED",
        "category": "UTILITY",
        "id": "5210071325772143"
    },
    {
        "name": "sample_shipping_confirmation",
        "previous_category": "SHIPPING_UPDATE",
        "parameter_format": "POSITIONAL",
        "components": [
            {
                "type": "BODY",
                "text": "ó tu paquete. La entrega se realizará en {{1}} dí."
            },
            {
                "type": "FOOTER",
                "text": "Este mensaje proviene de un negocio no verificado."
            }
        ],
        "language": "es",
        "status": "APPROVED",
        "category": "UTILITY",
        "id": "3303500303229221"
    },
    {
        "name": "sample_flight_confirmation",
        "previous_category": "TICKET_UPDATE",
        "parameter_format": "POSITIONAL",
        "components": [
            {
                "type": "HEADER",
                "format": "DOCUMENT"
            },
            {
                "type": "BODY",
                "text": "Confirmamos tu vuelo a {{1}}-{{2}} para el {{3}}."
            },
            {
                "type": "FOOTER",
                "text": "Este mensaje proviene de un negocio no verificado."
            }
        ],
        "language": "es",
        "status": "APPROVED",
        "category": "UTILITY",
        "id": "3239265063027780"
    }
  ]
  
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
    public brandService: BrandService,
  ) { 
    const brand = brandService.getBrand();
    this.hideHelpLink = brand['DOCS'];
  }

  ngOnInit(): void {
    this.roleService.checkRoleForCurrentProject('new-broadcast')
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
      this.templates_list = templates;
      
    }, (error) => {

      this.logger.error("[AUTOMATION-CREATE] - GET WA TEMPLATES - ERROR: ", error)
       this.logger.log(error.error.message)
      if (error.error.message.includes('WhatsApp not installed for the project_id')  ) {
        this.logger.log('[AUTOMATION-CREATE] - WA not installed');
        this.presentDialogWANotInstalledFoTheCurrentProject()
      }

    }, () => {

      this.logger.log('[AUTOMATION-CREATE] - GET WA TEMPLATES * COMPLETE *');

    });
  }

  presentDialogWANotInstalledFoTheCurrentProject() {
     Swal.fire({
      title: this.translate.instant('WhatsAppNotConfigured'),
      text: this.translate.instant('UnableToCreateBroadcastWAIsNotInstalled'),
      icon: "warning",
      showCloseButton: true,
      showCancelButton: true,
      showConfirmButton: true,
      showDenyButton: false,
      confirmButtonText: this.translate.instant('OnboardPage.Configure'),
      cancelButtonText: this.translate.instant('Cancel'),
      focusConfirm: false,
      reverseButtons: true,
      // buttons: ["Cancel", "Delete"],
      // dangerMode: true,
    }).then((result) => {
        if (result.isConfirmed) { 
          this.router.navigate(['project/' + this.projectId + '/integrations'], { queryParams: { 'name': 'whatsapp' } })
        }

    })
  }

  onSelectTemplate() {
    if (!this.templates_list?.length) {
      console.warn('templates_list non inizializzato');
      return;
    }
    console.log('[AUTOMATION-CREATE] onSelectTemplate  this.templateName ', this.templateName) 
    this.selected_template = this.templates_list.find(t => t.name === this.templateName) || null;
    console.log('[AUTOMATION-CREATE] onSelectTemplate selected_template', this.selected_template)
    this.selected_template_name = this.selected_template.name
    this.selected_template_lang = this.selected_template.language

    this.logger.log('[AUTOMATION-CREATE] onSelectTemplate selected_template_name', this.selected_template_name)
    const phoneNumbers = ['3931234567'];
    this.csvOutput = this.generateCSVFromWhatsAppTemplate(this.selected_template, phoneNumbers);

    console.log('[AUTOMATION-CREATE] csvOutput', this.csvOutput)
 
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
    this.logger.log('[AUTOMATION-CREATE] AutomationUploadCsv this.selected_template ',this.selected_template)
    if (!this.selected_template) {
      return
    }
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

  goToWABroadcastsDoc() {
     const url = URL_WA_BroadcastsDocs;
    window.open(url, '_blank');
  }



  presentDialogBeforeToSendToServer() {
    this.logger.log('[AUTOMATION-CREATE] SEND TO SERVER selected_template ', this.selected_template);
    if (!this.selected_template) {
      return
    }

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

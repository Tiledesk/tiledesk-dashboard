import { Component, OnInit, ɵɵtrustConstantResourceUrl } from '@angular/core';
import { AuthService } from 'app/core/auth.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { FaqKbService } from '../../services/faq-kb.service';
@Component({
  selector: 'appdashboard-templates',
  templateUrl: './templates.component.html',
  styleUrls: ['./templates.component.scss']
})
export class TemplatesComponent implements OnInit {
  isChromeVerGreaterThan100: boolean;
 templates = [{
 
"_id": "635b982a448a230012464b13", 
 "webhook_enabled": false, 
 "type": "tilebot", 
 "language": "en", 
 "public": true, 
 "certified": true, 
 "name": "Dean for Quick Replies", 
 "id_project": "635b97cc7d7275001a2ab3e0", 
 "trashed": false, 
 "createdBy": "5ede2716cc3cc30019c7011c", 
 "createdAt": "2022-10-28T08:51:54.650Z", 
 "updatedAt": "2022-10-28T14:55:18.469Z", "__v": 0, 
 "url": "http://localhost:3000/modules/tilebot/ext/635b982a448a230012464b13", 
 "description": "Dynamic quick reply chatbot" 
}, 
 { 
   "_id": "635ba04abbce5900198ed90f", 
 "webhook_enabled": false, 
 "type": "tilebot", 
 "language": "en", 
 "public": true, 
 "certified": true, 
 "name": "Tommy for Customer Service", 
 "id_project": "635b97cc7d7275001a2ab3e0", 
 "trashed": false, "createdBy": "628257a7cf1f68001abc87bd", 
 "createdAt": "2022-10-28T09:26:34.513Z", 
 "updatedAt": "2022-11-09T13:30:11.631Z", "__v": 0, 
 "url": "http://localhost:3000/modules/tilebot/ext/635ba04abbce5900198ed90f" 
}, 
{ 
  "_id": "635bb2a1bbce590019902024", 
  "webhook_enabled": false, 
  "type": "tilebot", 
  "language": "en", 
  "public": true, 
  "certified": true, 
  "name": "Raja for Customer Rating", 
  "description":"A key factor for any business is customer satisfaction. Collect surveys automatically!",
  "id_project": "635b97cc7d7275001a2ab3e0", 
  "trashed": false, "createdBy": 
  "6335a703f5f192001328e652", 
  "createdAt": "2022-10-28T10:44:49.375Z", 
  "updatedAt": "2022-10-28T15:00:31.028Z", "__v": 0, 
  "url": "http://localhost:3000/modules/tilebot/ext/635bb2a1bbce590019902024" 
}, 
{"_id":"635bca36bbce59001991a729",
"webhook_enabled":false,
"type":"tilebot",
"language":"en",
"public":true,
"certified":true,
"name":"Lily for Lead Generation",
"description":"leads",
"certifiedTags":[{"color":"#00699e","name":"Pre-Sale"},{"color":"#a16300","name":"Lead-Gen"}],
"bigImage":"https://tiledesk.com/wp-content/uploads/2022/11/Get-Leads.png",
"id_project":"635b97cc7d7275001a2ab3e0",
"trashed":false,
"createdBy":"5ede2716cc3cc30019c7011c",
"createdAt":"2022-10-28T12:25:26.250Z",
"updatedAt":"2022-10-28T18:51:15.659Z",
"__v":0,
"url":"http://localhost:3000/modules/tilebot/ext/635bca36bbce59001991a729"
},
{ 
"_id": "635c02cd2b8e28001c4f51cb", 
"webhook_enabled": false, "type": "tilebot", 
"language": "en", "public": true, 
"certified": true, 
"name": "Hans for Live Agent handoff", 
"description": "A combination of Live chat and Chatbots ", 
"id_project": "635b97cc7d7275001a2ab3e0", 
"trashed": false, "createdBy": "627941586b5bbf001a0cf76b", 
"createdAt": "2022-10-28T16:26:53.807Z", "updatedAt": "2022-10-28T19:10:21.278Z", 
"__v": 0, "url": "http://localhost:3000/modules/tilebot/ext/635c02cd2b8e28001c4f51cb" 
}, 
{ 
  "_id": "635c2e65bbce590019981159", 
  "webhook_enabled": false, 
  "type": "tilebot", 
  "language": "en", 
  "public": true, 
  "certified": true, 
  "name": "Fabi for FAQ", 
  "id_project": "635b97cc7d7275001a2ab3e0", 
  "trashed": false, 
  "createdBy": "628257a7cf1f68001abc87bd", 
  "createdAt": "2022-10-28T19:32:53.200Z", 
  "updatedAt": "2022-10-28T19:32:53.211Z", 
  "__v": 0, 
  "url": "http://localhost:3000/modules/tilebot/ext/635c2e65bbce590019981159" 
}, { 
  "_id": "635f9f60a6a44e001a7c9640", 
  "webhook_enabled": false, 
  "type": "tilebot", 
  "language": "en", 
  "public": true, 
  "certified": true, 
  "name": "Spooks",
   "description": "Halloween-themed", 
   "id_project": "635b97cc7d7275001a2ab3e0", 
   "trashed": false, 
   "createdBy": "5ede2716cc3cc30019c7011c", 
   "createdAt": "2022-10-31T10:11:44.708Z", 
   "updatedAt": "2022-10-31T10:23:06.017Z", 
   "__v": 0, 
   "url": "http://localhost:3000/modules/tilebot/ext/635f9f60a6a44e001a7c9640" 
  }, { 
    "_id": "636a2f3e7da70a001a86ac36", 
    "webhook_enabled": false, "type": 
    "tilebot", 
    "language": "en", 
    "public": true, 
    "certified": true, 
    "name": "Emma", 
    "description": "Ecommerce", 
    "id_project": "635b97cc7d7275001a2ab3e0", 
    "trashed": false, 
    "createdBy": "5ede2716cc3cc30019c7011c", 
    "createdAt": "2022-11-08T10:28:14.152Z", 
    "updatedAt": "2022-11-16T08:56:18.741Z",
    "__v": 0, 
    "url": "http://localhost:3000/modules/tilebot/ext/636a2f3e7da70a001a86ac36" 
  }, { 
    "_id": "637265d87ac0f7001947fadd", 
    "webhook_enabled": false, 
    "type": "tilebot", 
    "language": "en", 
    "public": true, 
    "certified": true, 
    "name": "Disco", 
    "description": "discount", 
    "id_project": "635b97cc7d7275001a2ab3e0", 
    "trashed": false, 
    "createdBy": "5ede2716cc3cc30019c7011c", 
    "createdAt": "2022-11-14T15:59:20.381Z", 
    "updatedAt": "2022-11-16T08:48:21.822Z", 
    "__v": 0,
    "url": "http://localhost:3000/modules/tilebot/ext/637265d87ac0f7001947fadd" 
  }, 
  { 
    "_id": "637362d9c09a330019f45424", 
    "webhook_enabled": false,
     "type": "tilebot", 
     "language": "en", 
     "public": true, 
     "certified": true, 
     "name": "Xtine", 
     "description": "Xmas special edition", 
     "id_project": "635b97cc7d7275001a2ab3e0", 
     "trashed": false, 
     "createdBy": "5ede2716cc3cc30019c7011c", 
     "createdAt": "2022-11-15T09:58:49.128Z", 
     "updatedAt": "2022-11-16T11:33:18.557Z", 
     "__v": 0, 
     "url": "http://localhost:3000/modules/tilebot/ext/637362d9c09a330019f45424" 
    }, 
    { 
      "_id": "6373d57d7ac0f700196568e3", 
      "webhook_enabled": false, 
      "type": "tilebot", 
      "language": "en", 
      "public": true, 
      "certified": true, 
      "name": "Pacey", 
      "description": "Place an order bot", 
      "id_project": "635b97cc7d7275001a2ab3e0", 
      "trashed": false, 
      "createdBy": "628257a7cf1f68001abc87bd", 
      "createdAt": "2022-11-15T18:07:57.541Z", 
      "updatedAt": "2022-11-15T21:49:07.575Z", 
      "__v": 0, 
      "url": "http://localhost:3000/modules/tilebot/ext/6373d57d7ac0f700196568e3" 
    }]

  constructor(
    private auth: AuthService,
    private faqKbService: FaqKbService,
    private logger: LoggerService
  ) { }

  ngOnInit(): void {
    this.getBrowserVersion();
    // this.getTemplates()
    this.generateTagsBackground()
  }

  generateTagsBackground() {
    this.templates.forEach(template => {
      console.log('generateTagsBackground template', template) 
      if (template && template.certifiedTags) {
        template.certifiedTags.forEach(tag => {
          console.log('generateTagsBackground tag', tag) 

          const tagbckgnd = this.hexToRgba(tag.color)
          console.log('generateTagsBackground tagbckgnd ', tagbckgnd) 
          // template.certifiedTags.push({ 'background': `${tagbckgn}`})
        });
      }

    });
  }

  hexToRgba(hex) {
    var c;
    if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
      c = hex.substring(1).split('');
      if (c.length == 3) {
        c = [c[0], c[0], c[1], c[1], c[2], c[2]];
      }
      c = '0x' + c.join('');
      return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + ',0.5)';
    }
    throw new Error('Bad Hex');
  }

  getBrowserVersion() {
    this.auth.isChromeVerGreaterThan100.subscribe((isChromeVerGreaterThan100: boolean) => {
      this.isChromeVerGreaterThan100 = isChromeVerGreaterThan100;
    })
  }
  
  getTemplates() {
    this.faqKbService.getTemplates().subscribe((res: any) => {
      console.log('[BOTS-TEMPLATES] - GET TEMPLATES', res);
  

    }, (error) => {
      console.error('[BOTS-TEMPLATES] GET TEMPLATES ERROR ', error);
 
    }, () => {
      console.log('[BOTS-TEMPLATES] GET TEMPLATES COMPLETE');
     
    
    });
  }

  installTemplate(botid) {
    this.faqKbService.installTemplate(botid).subscribe((res: any) => {
      this.logger.log('[BOTS-TEMPLATES] - INSTALL TEMPLATE RES', res);
  

    }, (error) => {
      this.logger.error('[BOTS-TEMPLATES] INSTALL TEMPLATE - ERROR ', error);
 
    }, () => {
      this.logger.log('[BOTS-TEMPLATES] INSTALL TEMPLATE COMPLETE');
    
    
    });
  }

}

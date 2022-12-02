import { Component, OnInit, ɵɵtrustConstantResourceUrl } from '@angular/core';
import { AuthService } from 'app/core/auth.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { FaqKbService } from '../../services/faq-kb.service';
import { MatDialog } from '@angular/material/dialog';
import { TemplateDetailComponent } from './template-detail/template-detail.component';
import { Router } from '@angular/router';
@Component({
  selector: 'appdashboard-templates',
  templateUrl: './templates.component.html',
  styleUrls: ['./templates.component.scss']
})

// interface certifiedTags {
//   name: string;
//   [others: string]: any;
// }

export class TemplatesComponent implements OnInit {
  isChromeVerGreaterThan100: boolean;
  templates: Array<any>
  allTemplatesCount: number;

  customerSatisfactionTemplates: Array<any>
  customerSatisfactionTemplatesCount: number;

  increaseSalesTemplates: Array<any>
  increaseSalesTemplatesCount: number;

  project: any;
  route: string
  showSpinner: boolean
  myChatbotOtherCount: number;
  
  constructor(
    private auth: AuthService,
    private faqKbService: FaqKbService,
    private logger: LoggerService,
    public dialog: MatDialog,
    private router: Router
  ) { }

  openDialog(template) {
    const dialogRef = this.dialog.open(TemplateDetailComponent, {
      data: {
        template: template
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }

  ngOnInit(): void {
    this.getBrowserVersion();
    this.getTemplates()
    this.getCurrentProject()
    this.getAllFaqKbByProjectId()
  }
  // Lead-gen ->  #a16300
  // Pre-sale -> #00699e
  //  Support -> #25833e
  // Self-serve -> #0049bd

  // mainCategory
  // bigImage
  // templateFeatures

  // certifiedTags
  // "certifiedTags": [{ "color": "#00699e", "name": "Pre-Sale" }, { "color": "#a16300", "name": "Lead-Gen" }],


  getAllFaqKbByProjectId() {
    this.faqKbService.getAllBotByProjectId().subscribe((faqKb: any) => {
      if (faqKb) {
        this.myChatbotOtherCount = faqKb.length
        console.log('[BOTS-TEMPLATES] - GET BOTS BY PROJECT ID - myChatbotOtherCount',  this.myChatbotOtherCount);
      }

    }, (error) => {
      this.logger.error('[BOTS-TEMPLATES] GET BOTS ERROR ', error);
    
    }, () => {
      this.logger.log('[BOTS-TEMPLATES] GET BOTS COMPLETE');

    });

  }

  getCurrentProject() {
    // this.project = this.auth.project_bs.value;
    this.auth.project_bs.subscribe((project) => {
      if (project) {
        this.project = project;
      }
    });
  }

  getBrowserVersion() {
    this.auth.isChromeVerGreaterThan100.subscribe((isChromeVerGreaterThan100: boolean) => {
      this.isChromeVerGreaterThan100 = isChromeVerGreaterThan100;
    })
  }

  getTemplates() {
    this.showSpinner = true;
    this.faqKbService.getTemplates().subscribe((res: any) => {

      if (res) {
        this.templates = res
        console.log('[BOTS-TEMPLATES] - GET ALL TEMPLATES', this.templates);
        this.allTemplatesCount = this.templates.length;
        console.log('[BOTS-TEMPLATES] - GET ALL TEMPLATES COUNT', this.allTemplatesCount);
      
        // ---------------------------------------------------------------------
        // Customer Satisfaction templates
        // ---------------------------------------------------------------------
        this.customerSatisfactionTemplates = this.templates.filter((obj) => {
          return obj.mainCategory === "Customer Satisfaction"
        });
        console.log('[BOTS-TEMPLATES] - Customer Satisfaction TEMPLATES', this.customerSatisfactionTemplates);
        if (this.customerSatisfactionTemplates ) {
          this.customerSatisfactionTemplatesCount = this.customerSatisfactionTemplates.length;
          console.log('[BOTS-TEMPLATES] - Customer Satisfaction COUNT', this.customerSatisfactionTemplatesCount);
        }

        // ---------------------------------------------------------------------
        // Customer Increase Sales
        // ---------------------------------------------------------------------
        this.increaseSalesTemplates = this.templates.filter((obj) => {
          return obj.mainCategory === "Increase Sales"
        });
        console.log('[BOTS-TEMPLATES] - Increase Sales TEMPLATES', this.increaseSalesTemplates);
        if (this.increaseSalesTemplates ) {
          this.increaseSalesTemplatesCount = this.increaseSalesTemplates.length;
          console.log('[BOTS-TEMPLATES] - Increase Sales COUNT', this.increaseSalesTemplatesCount);
        }

        this.route = this.router.url
        if (this.route.indexOf('bots/templates/all') !== -1) {
          this.templates = this.templates 
          console.log('[BOTS-TEMPLATES] ROUTE templates/all');
        } else if (this.route.indexOf('bots/templates/customer-satisfaction') !== -1) {
          this.templates = this.customerSatisfactionTemplates
          console.log('[BOTS-TEMPLATES] ROUTE templates/customer-satisfaction templates ', this.templates);
        } else if (this.route.indexOf('bots/templates/increase-sales') !== -1) {
         
          this.templates = this.increaseSalesTemplates
          console.log('[BOTS-TEMPLATES] ROUTE templates/increase-sales templates ', this.templates);
        }

        console.log('[BOTS-TEMPLATES] - GET TEMPLATES - All TEMPLATES COUNT ', this.allTemplatesCount);
        this.generateTagsBackground(this.templates)
      }

    }, (error) => {
      console.error('[BOTS-TEMPLATES] GET TEMPLATES ERROR ', error);
      this.showSpinner = false;
    }, () => {
      console.log('[BOTS-TEMPLATES] GET TEMPLATES COMPLETE');
      this.showSpinner = false;
      // this.generateTagsBackground(this.templates)
    });
  }



  generateTagsBackground(templates) {
    templates.forEach(template => {
      // console.log('generateTagsBackground template', template)
      if (template && template.certifiedTags) {
        template.certifiedTags.forEach(tag => {
          // console.log('generateTagsBackground tag', tag)
          let tagbckgnd = ''
          if (tag.color === "#a16300" || tag.color === "#A16300") {
            tagbckgnd = 'rgba(255,221,167,1)'
          } else if (tag.color === "#00699E" || tag.color === "#00699e") {
            tagbckgnd = 'rgba(208,239,255, 1)'
          } else if (tag.color === "#25833e" || tag.color === "#25833E") {
            tagbckgnd = 'rgba(204,241,213, 1)'
          } else if (tag.color === "#0049bd" || tag.color === "#0049BD") {
            tagbckgnd = 'rgba(220,233,255, 1)'
          } else if (tag.color !== "#a16300" && tag.color !== "#A16300" && tag.color !== "#00699E" && tag.color !== "#00699e" && tag.color !== "#25833e" && tag.color !== "#25833E" && tag.color !== "#0049bd" && tag.color !== "#0049BD") {

            tagbckgnd = this.hexToRgba(tag.color)
            console.log('generateTagsBackground tagbckgnd ', tagbckgnd)
          }

          // let b = {background : tagbckgnd}

          tag.background = tagbckgnd
          // template.certifiedTags.find(t => t.color === t.background).background = tagbckgnd;

          // if (tag.color === tag.background) {
          //   // template.certifiedTags.push({ 'background': `${tagbckgnd}` })
          //   template.certifiedTags['background']=  tagbckgnd
          // }
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
      return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + ',0.3)';
    }
    throw new Error('Bad Hex');

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

  createBlankTilebot() {
    this.router.navigate(['project/' + this.project._id + '/bots/create/tilebot/blank']);
  }

}

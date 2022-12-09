import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BrandService } from 'app/services/brand.service';
import { FaqKbService } from 'app/services/faq-kb.service';
import { LoggerService } from 'app/services/logger/logger.service';

@Component({
  selector: 'appdashboard-install-template',
  templateUrl: './install-template.component.html',
  styleUrls: ['./install-template.component.scss']
})
export class InstallTemplateComponent implements OnInit {

  projectId: string;
  selectedTemplate: string;

  public companyLogoBlack_Url: string;
  public tparams: any;
  public company_name: any;
  public company_site_url: any;
  public templateImg: string;
  public templateNameOnSite: string;
  templates: any;
  constructor(
    private route: ActivatedRoute,
    private faqKbService: FaqKbService,
    private logger: LoggerService,
    public brandService: BrandService,
  ) { 
    const brand = brandService.getBrand();
    this.companyLogoBlack_Url = brand['company_logo_black__url'];
    this.tparams = brand;
    this.company_name = brand['company_name'];
    this.company_site_url = brand['company_site_url'];
  }

  ngOnInit(): void {
    this.getParamsAndTemplates()
  }

  getParamsAndTemplates() {
    this.route.params.subscribe((params) => {

      console.log('[INSTALL-TEMPLATE] params ', params)
      this.projectId = params.projectid;
      this.getTemplates(params['botid'])
    })
  }



  getTemplates(botid) {
    this.faqKbService.getTemplates().subscribe((res: any) => {

      if (res) {
        console.log('[INSTALL-TEMPLATE] GET TEMPLATES - RES ', res)

        const selectedTemplate = res.filter((obj) => {
          return obj._id === botid
        });
        this.templates = selectedTemplate
        console.log('[INSTALL-TEMPLATE] GET TEMPLATES - SELECTED TEMPALTES ', this.templates)


        this.templateImg =  this.templates['bigImage'];
        this.templateNameOnSite  =  this.selectedTemplate['nameOnSite'];
        // console.log('[GET START CHATBOT FORK] GET TEMPLATES - SELECTED TEMPALTES templateImg ', this.templateImg)
        // console.log('[GET START CHATBOT FORK] GET TEMPLATES - SELECTED TEMPALTES templateNameOnSite ', this.templateNameOnSite)
      }

    }, (error) => {
      this.logger.error('[INSTALL-TEMPLATE] GET TEMPLATE BY ID - ERROR ', error);

    }, () => {
      this.logger.log('[GET START CHATBOT FORK] GET TEMPLATE BY ID * COMPLETE *');

    });
  }

}

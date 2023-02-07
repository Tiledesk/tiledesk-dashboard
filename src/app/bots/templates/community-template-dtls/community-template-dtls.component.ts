import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'app/core/auth.service';
import { FaqKbService } from 'app/services/faq-kb.service';

@Component({
  selector: 'appdashboard-community-template-dtls',
  templateUrl: './community-template-dtls.component.html',
  styleUrls: ['./community-template-dtls.component.scss']
})

export class CommunityTemplateDtlsComponent implements OnInit {
  public templateId: string;
  public template: any;
  public isChromeVerGreaterThan100: boolean;
  constructor(
    private route: ActivatedRoute,
    private faqKbService: FaqKbService,
    private auth: AuthService,
  ) { }

  ngOnInit(): void {
    this.getParamsAndTemplateDetails();
    this.getBrowserVersion();
  }

  getParamsAndTemplateDetails() {
    this.route.params.subscribe((params) => {
      console.log('[COMMUNITY-TEMPLATE-DTLS] GET PARAMS - params ', params);
      if (params) {
        this.templateId = params.templateid
        this.getCommunityTemplateDetails(this.templateId)
      }
    });
  }

  getBrowserVersion() {
    this.auth.isChromeVerGreaterThan100.subscribe((isChromeVerGreaterThan100: boolean) => {
      this.isChromeVerGreaterThan100 = isChromeVerGreaterThan100;
    })
  }

  getCommunityTemplateDetails(templateId) {
    this.faqKbService.getCommunityTemplateDetail(templateId)
      .subscribe((_template) => {
        console.log('[COMMUNITY-TEMPLATE-DTLS] GET COMMUNITY TEMPLATE - template ', _template);
        if (_template) {
          this.template = _template
        }
      })
  }








}

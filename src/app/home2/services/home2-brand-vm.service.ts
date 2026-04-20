import { Injectable } from '@angular/core';
import { BrandService } from 'app/services/brand.service';

export interface Home2BrandVm {
  companyName: string;
  customCompanyHomeLogo: string;
  companyLogoNoText: string;
  displayNewsAndDocumentation: string;
  salesEmail: string;
  tparams: any;
}

@Injectable({ providedIn: 'root' })
export class Home2BrandVmService {
  constructor(private brandService: BrandService) {}

  getBrandVm(): Home2BrandVm {
    const brand = this.brandService.getBrand();
    return {
      companyName: brand['BRAND_NAME'],
      customCompanyHomeLogo: brand['CUSTOM_COMPANY_HOME_LOGO'],
      companyLogoNoText: brand['BASE_LOGO_NO_TEXT'],
      displayNewsAndDocumentation: brand['display-news-and-documentation'],
      salesEmail: brand['CONTACT_SALES_EMAIL'],
      tparams: brand
    };
  }
}


import { Component, OnInit } from '@angular/core';
import { BrandService } from 'app/services/brand.service';
import { URL_install_tiledesk_on_bigcommerce } from 'app/utils/util';

@Component({
  selector: 'appdashboard-bigcommerce-installation',
  templateUrl: './bigcommerce-installation.component.html',
  styleUrls: ['./bigcommerce-installation.component.scss']
})
export class BigcommerceInstallationComponent implements OnInit {
  URL_install_tiledesk_on_bigcommerce = URL_install_tiledesk_on_bigcommerce 
  public hideHelpLink: boolean;
  constructor(
    public brandService: BrandService
  ) { 
    const brand = brandService.getBrand(); 
    this.hideHelpLink= brand['DOCS'];
  }

  ngOnInit(): void {
  }

}

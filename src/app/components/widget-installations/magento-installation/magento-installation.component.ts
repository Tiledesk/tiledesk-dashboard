import { Component, OnInit } from '@angular/core';
import { BrandService } from 'app/services/brand.service';
import { URL_install_tiledesk_on_magento } from 'app/utils/util';

@Component({
  selector: 'appdashboard-magento-installation',
  templateUrl: './magento-installation.component.html',
  styleUrls: ['./magento-installation.component.scss']
})
export class MagentoInstallationComponent implements OnInit {
  URL_install_tiledesk_on_magento = URL_install_tiledesk_on_magento;
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

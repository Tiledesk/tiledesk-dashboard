import { Component, OnInit } from '@angular/core';
import { BrandService } from 'app/services/brand.service';
import { URL_install_tiledesk_on_wix } from 'app/utils/util';

@Component({
  selector: 'appdashboard-wix',
  templateUrl: './wix.component.html',
  styleUrls: ['./wix.component.scss']
})
export class WixComponent implements OnInit {
  URL_install_tiledesk_on_wix = URL_install_tiledesk_on_wix 
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

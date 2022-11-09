import { Component, OnInit } from '@angular/core';
import {
  URL_install_tiledesk_on_prestashop
} from 'app/utils/util';
@Component({
  selector: 'appdashboard-prestashop-installation',
  templateUrl: './prestashop-installation.component.html',
  styleUrls: ['./prestashop-installation.component.scss']
})
export class PrestashopInstallationComponent implements OnInit {
  URL_install_tiledesk_on_prestashop = URL_install_tiledesk_on_prestashop;
  constructor() { }

  ngOnInit() {
  }

}

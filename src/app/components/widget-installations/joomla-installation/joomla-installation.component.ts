import { Component, OnInit } from '@angular/core';
import {
  URL_install_tiledesk_on_joomla
} from 'app/utils/util';

@Component({
  selector: 'appdashboard-joomla-installation',
  templateUrl: './joomla-installation.component.html',
  styleUrls: ['./joomla-installation.component.scss']
})
export class JoomlaInstallationComponent implements OnInit {
  URL_install_tiledesk_on_joomla = URL_install_tiledesk_on_joomla;
  constructor() { }

  ngOnInit() {
  }

}

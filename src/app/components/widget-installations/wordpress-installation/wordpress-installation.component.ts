import { Component, OnInit } from '@angular/core';
import {
  URL_install_tiledesk_on_wordpress
} from 'app/utils/util';


@Component({
  selector: 'appdashboard-wordpress-installation',
  templateUrl: './wordpress-installation.component.html',
  styleUrls: ['./wordpress-installation.component.scss']
})
export class WordpressInstallationComponent implements OnInit {

  URL_install_tiledesk_on_wordpress = URL_install_tiledesk_on_wordpress;
  constructor() { }

  ngOnInit() {
  }

}

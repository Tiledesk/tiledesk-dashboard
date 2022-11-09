import { Component, OnInit } from '@angular/core';
import {
  URL_google_tag_manager_add_tiledesk_to_your_sites
} from 'app/utils/util';

@Component({
  selector: 'appdashboard-google-tag-manager-installation',
  templateUrl: './google-tag-manager-installation.component.html',
  styleUrls: ['./google-tag-manager-installation.component.scss']
})
export class GoogleTagManagerInstallationComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  goToInstallWithTagManagerDocs() {
    const url = URL_google_tag_manager_add_tiledesk_to_your_sites;
    window.open(url, '_blank');
  }
}

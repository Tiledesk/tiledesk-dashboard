import { Component, OnInit } from '@angular/core';
import { AuthService } from 'app/core/auth.service';

@Component({
  selector: 'appdashboard-templates',
  templateUrl: './templates.component.html',
  styleUrls: ['./templates.component.scss']
})
export class TemplatesComponent implements OnInit {
  isChromeVerGreaterThan100: boolean;
  constructor(
    private auth: AuthService,
  ) { }

  ngOnInit(): void {
    this.getBrowserVersion();
  }
  getBrowserVersion() {
    this.auth.isChromeVerGreaterThan100.subscribe((isChromeVerGreaterThan100: boolean) => {
      this.isChromeVerGreaterThan100 = isChromeVerGreaterThan100;
    })
  }

}

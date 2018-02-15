import { Component, OnInit } from '@angular/core';
import { AuthService } from './core/auth.service';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {

  constructor(private translate: TranslateService) {
    translate.setDefaultLang('it');

    const browserLang = this.translate.getBrowserLang();
    if (browserLang) {
      if (browserLang === 'en') {
        this.translate.use('en');
      } else {
        this.translate.use('it');
      }
    }
  }

  switchLanguage(language: string) {
    this.translate.use(language);
  }
}

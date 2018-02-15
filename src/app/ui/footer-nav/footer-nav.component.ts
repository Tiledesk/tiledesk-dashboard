import { Component, NgModule } from '@angular/core';
// import { TranslateService, TranslateModule, TranslateLoader, TranslatePipe } from '@ngx-translate/core';
import { SharedModule } from '../../shared/shared.module';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'footer-nav',
  templateUrl: './footer-nav.component.html',
  styleUrls: ['./footer-nav.component.scss'],
})
export class FooterNavComponent {

  constructor(
    private translate: TranslateService,
    // private translateModule: TranslateModule,

  ) {}

  switchLanguage(language: string) {
    this.translate.use(language);
  }

}

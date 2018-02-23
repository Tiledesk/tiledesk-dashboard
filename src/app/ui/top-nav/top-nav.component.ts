import { Component } from '@angular/core';
import { AuthService } from '../../core/auth.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'top-nav',
  templateUrl: './top-nav.component.html',
  styleUrls: ['./top-nav.component.scss'],
})
export class TopNavComponent {

  show = false;
  hasClickedOpenDropDown: boolean;
  // set to none the property display of the modal
  display = 'none';
  HAS_CLICKED_BTN_OPEN_DROPDOWN = false;

  toggleCollapse() {
    this.show = !this.show;
  }

  constructor(
    public auth: AuthService,
    private translate: TranslateService,
  ) {
    console.log('-> UTENTE AUTENTICATO ', auth.user);
  }

  switchLanguage(language: string) {
    this.translate.use(language);
  }

  openCurrentUserDropDown(hasClickedOpenDropDown: boolean) {
    this.hasClickedOpenDropDown = hasClickedOpenDropDown;
    if (this.hasClickedOpenDropDown) {
      this.display = 'block';
    }

    if (!this.hasClickedOpenDropDown) {
      this.display = 'none';
    }
    this.HAS_CLICKED_BTN_OPEN_DROPDOWN = hasClickedOpenDropDown;
    console.log('HAS_CLICKED_BTN_OPEN_DROPDOWN ', hasClickedOpenDropDown);

  }

  logout() {
    this.auth.signOut();
    this.display = 'none';
  }
}

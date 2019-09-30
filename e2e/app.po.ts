import { browser, element, by } from 'protractor';

export class MaterialDashboardAngularPage {
  navigateTo() {
    return browser.get('/');
  }

  getParagraphText() {
    return element(by.css('appdashboard-root h1')).getText();
  }
}

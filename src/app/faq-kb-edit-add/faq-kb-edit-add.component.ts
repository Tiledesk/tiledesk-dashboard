import { Component, OnInit } from '@angular/core';
import { FaqKbService } from '../services/faq-kb.service';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

import { Project } from '../models/project-model';
import { AuthService } from '../core/auth.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'faq-kb-edit-add',
  templateUrl: './faq-kb-edit-add.component.html',
  styleUrls: ['./faq-kb-edit-add.component.scss']
})
export class FaqKbEditAddComponent implements OnInit {

  faqKbName: string;
  faqKbUrl: string;

  id_faq_kb: string;

  faqKbNameToUpdate: string;
  faqKbUrlToUpdate: string;

  CREATE_VIEW = false;
  EDIT_VIEW = false;

  showSpinner = true;

  project: Project;

  displayInfoModal = 'none';
  SHOW_CIRCULAR_SPINNER = false;
  goToEditBot = true;

  newBot_name: string;
  newBot_Id: string;
  browser_lang: string;

  CREATE_BOT_ERROR: boolean;

  constructor(
    private faqKbService: FaqKbService,
    private router: Router,
    private route: ActivatedRoute,
    private auth: AuthService,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    console.log('»»»» HELLO FAQ-KB-EDIT-ADD')
    this.auth.checkRoleForCurrentProject();

    this.detectBrowserLang();

    // BASED ON THE URL PATH DETERMINE IF THE USER HAS SELECTED (IN FAQ-KB PAGE) 'CREATE' OR 'EDIT'
    // if (this.router.url === '/createfaqkb') {
    if (this.router.url.indexOf('/createfaqkb') !== -1) {
      console.log('HAS CLICKED CREATE ');
      this.CREATE_VIEW = true;
      this.showSpinner = false;
    } else {
      console.log('HAS CLICKED EDIT ');
      this.EDIT_VIEW = true;

      // GET THE ID OF FAQ-KB PASSED BY FAQ-KB PAGE
      this.getFaqKbId();

      // GET THE DETAIL OF FAQ-KB BY THE ID AS ABOVE
      this.getFaqKbById();
    }

    this.getCurrentProject();
  }

  detectBrowserLang() {
    this.browser_lang = this.translate.getBrowserLang();
    console.log('»» »» FAQ-KB-EDIT-ADD COMP - BROWSER LANGUAGE ', this.browser_lang);
  }
  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      this.project = project
      // console.log('00 -> FAQ-KB EDIT ADD COMP project ID from AUTH service subscription  ', this.project._id)
    });
  }

  getFaqKbId() {
    this.id_faq_kb = this.route.snapshot.params['faqkbid'];
    console.log('FAQ KB HAS PASSED id_faq_kb ', this.id_faq_kb);
  }

  /**
   * GET FAQ-KB BY ID
   */
  getFaqKbById() {
    this.faqKbService.getMongDbFaqKbById(this.id_faq_kb).subscribe((faqKb: any) => {
      console.log('MONGO DB FAQ-KB GET BY ID', faqKb);
      this.faqKbNameToUpdate = faqKb.name;
      this.faqKbUrlToUpdate = faqKb.url;
      console.log('MONGO DB FAQ-KB NAME', this.faqKbNameToUpdate);

      this.showSpinner = false;
    });
  }


  // CREATE (mongoDB)
  create() {
    this.displayInfoModal = 'block'
    this.SHOW_CIRCULAR_SPINNER = true;
    this.CREATE_BOT_ERROR = false;

    console.log('HAS CLICKED CREATE NEW FAQ-KB');
    console.log('Create Faq Kb - NAME ', this.faqKbName);
    console.log('Create Faq Kb - URL ', this.faqKbUrl);
    console.log('Create Faq Kb - PROJ ID ', this.project._id);
    this.faqKbService.addMongoDbFaqKb(this.faqKbName, this.faqKbUrl)
      .subscribe((faqKb) => {
        console.log('CREATE FAQKB - POST DATA ', faqKb);

        if (faqKb) {
          this.newBot_name = faqKb.name;
          this.newBot_Id = faqKb._id;
        }
        // this.bot_fullname = '';

        // RE-RUN GET CONTACT TO UPDATE THE TABLE
        // this.getDepartments();
        // this.ngOnInit();
      },
        (error) => {
          console.log('CREATE FAQKB - POST REQUEST ERROR ', error);
          setTimeout(() => {
            this.SHOW_CIRCULAR_SPINNER = false
            this.CREATE_BOT_ERROR = true;
          }, 300);

          // IF THERE IS AN ERROR, PREVENT THAT THE USER BE ADDRESSED TO THE PAGE 'EDIT BOT'
          // WHEN CLICK ON THE BUTTON 'CONTINUE' OF THE MODAL 'CREATE BOT'
          this.goToEditBot = false;
        },
        () => {
          console.log('CREATE FAQKB - POST REQUEST * COMPLETE *');

          // this.faqKbService.createFaqKbKey()
          // .subscribe((faqKbKey) => {

          //   console.log('CREATE FAQKB KEY - POST DATA ', faqKbKey);

          // });
          setTimeout(() => {
            this.SHOW_CIRCULAR_SPINNER = false
          }, 300);

          // this.router.navigate(['project/' + this.project._id + '/faqkb']);
        });
  }

  // WHEN A BOT IS CREATED IN THE MODAL WINDOW 'CREATE BOT', TWO ACTIONS ARE POSSIBLE:
  // "ADD FAQS NOW" and "RETURN TO THE BOT LIST (ADD AFTER)". DEFAULT IS SELECTED THE FIRST ACTION.
  // WHEN THE USER CLICK ON "CONTINUE" WILL BE ADDRESSED: TO THE VIEW OF "EDIT BOT" or,
  // IF THE USER SELECT THE SECOND OPTION, TO THE LIST OF BOT
  actionAfterGroupCreation(goToEditBot) {
    this.goToEditBot = goToEditBot;
    console.log('»»» »»» GO TO EDIT BOT ', goToEditBot)
  }

  onCloseInfoModalHandled() {
    // this.router.navigate(['project/' + this.project._id + '/faqkb']);
    if (this.goToEditBot === true) {
      this.router.navigate(['project/' + this.project._id + '/bots/' + this.newBot_Id]);
    } else {
      this.router.navigate(['project/' + this.project._id + '/bots']);
    }
  }

  onCloseModal() {
    this.displayInfoModal = 'none';
  }

  // !!! NO MORE USED IN THIS COMPONENT - MOVED IN faq.component.html
  edit() {
    console.log('FAQ KB NAME TO UPDATE ', this.faqKbNameToUpdate);
    console.log('FAQ KB URL TO UPDATE ', this.faqKbUrlToUpdate);

    this.faqKbService.updateMongoDbFaqKb(this.id_faq_kb, this.faqKbNameToUpdate, this.faqKbUrlToUpdate).subscribe((data) => {
      console.log('PUT DATA ', data);

      // RE-RUN GET CONTACT TO UPDATE THE TABLE
      // this.getDepartments();
      this.ngOnInit();
    },
      (error) => {

        console.log('PUT REQUEST ERROR ', error);

      },
      () => {
        console.log('PUT REQUEST * COMPLETE *');

        this.router.navigate(['project/' + this.project._id + '/faqkb']);
      });
  }

  goBackToFaqKbList() {
    // this.router.navigate(['project/' + this.project._id + '/faqkb']);
    this.router.navigate(['project/' + this.project._id + '/bots']);
  }




}

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { MongodbFaqService } from '../services/mongodb-faq.service';

import { Project } from '../models/project-model';
import { AuthService } from '../core/auth.service';
import { NotifyService } from '../core/notify.service';
import { Location } from '@angular/common';

@Component({
  selector: 'faq-edit-add',
  templateUrl: './faq-edit-add.component.html',
  styleUrls: ['./faq-edit-add.component.scss'],
})
export class FaqEditAddComponent implements OnInit {

  question: string;
  answer: string;

  id_toUpdate: any;

  question_toUpdate: string;
  answer_toUpdate: string;

  CREATE_VIEW = false;
  EDIT_VIEW = false;

  showSpinner = true;

  id_faq_kb: string;
  id_faq: string;
  faq_creationDate: any;
  project: Project;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private mongodbFaqService: MongodbFaqService,
    private auth: AuthService,
    private notify: NotifyService,
    public location: Location
  ) { }

  ngOnInit() {

    // BASED ON THE URL PATH DETERMINE IF THE USER HAS SELECTED (IN FAQ PAGE) 'CREATE' OR 'EDIT'
    // if (this.router.url === '/createfaq') {
    if (this.router.url.indexOf('/createfaq') !== -1) {
      console.log('HAS CLICKED CREATE ');
      this.CREATE_VIEW = true;
      this.showSpinner = false;
      // GET THE ID OF FAQ-KB PASSED BY FAQ PAGE (AND THAT FAQ PAGE HAS RECEIVED FROM FAQ-KB)
      this.getFaqKbId();
    } else {
      console.log('HAS CLICKED EDIT ');
      this.EDIT_VIEW = true;
      // GET THE ID OF FAQ PASSED BY FAQ PAGE &
      // GET THE ID OF FAQ-KB PASSED BY FAQ PAGE (AND THAT FAQ PAGE HAS RECEIVED FROM FAQ-KB)
      this.getFaqKbIdAndFaqId();

      // IF EXIST THE FAQ ID (GET WITH getFaqKbIdAndFaqId RUN A CALLBACK TO OBTAIN THE FAQ OBJECT BY THE FAQ ID)
      if (this.id_faq) {
        this.getFaqById();
      }
    }
    this.getCurrentProject();
  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      this.project = project
      // console.log('00 -> FAQ EDIT/ADD COMP project ID from AUTH service subscription  ', this.project._id)
    });
  }

  getFaqKbId() {
    this.id_faq_kb = this.route.snapshot.params['faqkbid'];
    console.log('FAQ HAS PASSED id_faq_kb ', this.id_faq_kb);
  }

  // GET FROM ROUTE PARAMS (PASSED FROM FAQ COMPONET):
  // THE FAQ ID - WHEN THE CALLBACK IS COMPLETED RUN GET-FAQ-BY-ID THAT RETURN THE OBJECT FAQ
  // AND THE FAQ KB ID (THEN USED IN THE GOBACK)
  getFaqKbIdAndFaqId() {
    this.route.params.subscribe((params) => {
      this.id_faq_kb = params.faqkbid;
      this.id_faq = params.faqid;
      // console.log(params);
      console.log('FAQ-KB ID ', this.id_faq_kb);
      console.log('FAQ ID ', this.id_faq);
    });
  }

  /**
   * GET FAQ BY ID (GET THE DATA OF THE FAQ BY THE ID PASSED FROM FAQ LIST)
   * USED TO SHOW IN THE TEXAREA THE QUESTION AND THE ANSWER THAT USER WANT UPDATE
   */
  getFaqById() {
    this.mongodbFaqService.getMongDbFaqById(this.id_faq).subscribe((faq: any) => {
      console.log('FAQ GET BY ID', faq);
      if (faq) {
        this.question_toUpdate = faq.question;
        this.answer_toUpdate = faq.answer;
        this.faq_creationDate = faq.createdAt
        console.log('FAQ QUESTION TO UPDATE', this.question_toUpdate);
        console.log('FAQ ANSWER TO UPDATE', this.answer_toUpdate);
      }

    }, (error) => {
      console.log('FAQ GET BY ID - ERROR ', error);
      this.showSpinner = false;
    }, () => {
      console.log('FAQ GET BY ID - COMPLETE ');
      this.showSpinner = false;
    });
  }

  // GO BACK TO FAQ COMPONENT
  goBackToFaqList() {
    // this.router.navigate(['project/' + this.project._id  + '/faq', this.id_faq_kb]);
    this.router.navigate(['project/' + this.project._id + '/bots', this.id_faq_kb]);
  }


  goBack() {
    this.location.back();
  }


  /**
   * ADD FAQ
   */
  create() {
    console.log('MONGO DB CREATE FAQ - QUESTION: ', this.question, ' - ANSWER: ', this.answer, ' - ID FAQ KB ', this.id_faq_kb);
    this.mongodbFaqService.addMongoDbFaq(this.question, this.answer, this.id_faq_kb)
      .subscribe((faq) => {
        console.log('CREATED FAQ ', faq);

        // this.question = '';
        // this.answer = '';
        // RE-RUN GET FAQ TO UPDATE THE TABLE
        // this.getDepartments();
        // this.ngOnInit();
      },
        (error) => {

          console.log('CREATED FAQ - ERROR ', error);
          // =========== NOTIFY ERROR ===========
          this.notify.showNotification('An error occurred while creating the FAQ', 4, 'report_problem');

        },
        () => {
          console.log('CREATED FAQ * COMPLETE *');
          // =========== NOTIFY SUCCESS===========
          this.notify.showNotification('FAQ successfully created', 2, 'done');

          // this.router.navigate(['project/' + this.project._id  + '/faq', this.id_faq_kb]);
          this.router.navigate(['project/' + this.project._id + '/bots', this.id_faq_kb]);
        });

  }

  edit() {
    console.log('FAQ QUESTION TO UPDATE ', this.question_toUpdate);
    console.log('FAQ ANSWER TO UPDATE ', this.answer_toUpdate);

    this.mongodbFaqService.updateMongoDbFaq(this.id_faq, this.question_toUpdate, this.answer_toUpdate).subscribe((data) => {
      console.log('PUT DATA (UPDATE FAQ)', data);

      // RE-RUN TO UPDATE THE TABLE
      // this.ngOnInit();
    },
      (error) => {
        console.log('PUT (UPDATE FAQ) REQUEST ERROR ', error);
        // =========== NOTIFY ERROR ===========
        this.notify.showNotification('An error occurred while updating the FAQ', 4, 'report_problem');

      },
      () => {
        console.log('PUT (UPDATE FAQ) REQUEST * COMPLETE *');
        // =========== NOTIFY SUCCESS===========
        this.notify.showNotification('FAQ successfully updated', 2, 'done');

        // this.router.navigate(['project/' + this.project._id  + '/faq', this.id_faq_kb]);
        this.router.navigate(['project/' + this.project._id + '/bots', this.id_faq_kb]);
      });
  }



}

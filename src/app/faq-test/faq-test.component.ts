import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { Project } from '../models/project-model';
import { ActivatedRoute } from '@angular/router';
import { MongodbFaqService } from '../services/mongodb-faq.service';

@Component({
  selector: 'app-faq-test',
  templateUrl: './faq-test.component.html',
  styleUrls: ['./faq-test.component.scss']
})
export class FaqTestComponent implements OnInit {
  project: Project;
  questionToTest: string;
  remote_faq_kb_key: string;

  constructor(
    private router: Router,
    private auth: AuthService,
    private route: ActivatedRoute,
    private faqService: MongodbFaqService

  ) { }

  ngOnInit() {
    this.getCurrentProject();
    this.getRemoteFaqKbKey();
  }

  getRemoteFaqKbKey() {
    this.remote_faq_kb_key = this.route.snapshot.params['remoteFaqKbKey'];
    console.log('FAQ-KB COMP HAS PASSED remote_faq_kb_key', this.remote_faq_kb_key);
  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      this.project = project
      // console.log('00 -> FAQ-KB EDIT ADD COMP project ID from AUTH service subscription  ', this.project._id)
    });
  }

  goBackToFaqKbList() {
    this.router.navigate(['project/' + this.project._id + '/faqkb']);
  }

  searchRemoteFaq() {
    console.log('SEARCH QUESTION ', this.questionToTest)
    this.faqService.searchRemoteFaqByRemoteFaqKbKey(this.remote_faq_kb_key, this.questionToTest )
    .subscribe((remoteFaq) => {
      console.log('REMOTE FAQ FOUND - POST DATA ', remoteFaq);
    },
    (error) => {
      console.log('REMOTE FAQ - POST REQUEST ERROR ', error);
    },
    () => {
      console.log('REMOTE FAQ - POST REQUEST * COMPLETE *');
    });
  }

}

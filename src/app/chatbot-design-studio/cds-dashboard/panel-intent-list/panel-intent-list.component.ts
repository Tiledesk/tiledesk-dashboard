import { FaqService } from './../../../services/faq.service';
import { Component, OnInit, Input } from '@angular/core';
import { Faq } from 'app/models/faq-model';

@Component({
  selector: 'appdashboard-panel-intent-list',
  templateUrl: './panel-intent-list.component.html',
  styleUrls: ['./panel-intent-list.component.scss']
})
export class PanelIntentListComponent implements OnInit {

  @Input() id_faq_kb: string;

  predefined_faqs = [];
  faqs = [];

  constructor(private faqService: FaqService) { }

  ngOnInit(): void {
    console.log("Panel-intent-list ngOnInit()")
    console.log("Selected chatbot: ", this.id_faq_kb);
    this.getAllIntents(this.id_faq_kb);

  }

  getAllIntents(id_faq_kb) {

    this.faqService.getAllFaqByFaqKbId(id_faq_kb).subscribe((faqs: any) => {
      console.log("faqs: ", faqs);
      this.faqs = faqs;

      let faq_start = faqs.find(o => o.name === '//start');
      console.log("faq_start: ", faq_start)


    }), (error) => {
      console.error("error: ", error)
    }, () => {
      console.log("End.")
    }
  }

}

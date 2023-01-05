import { FaqService } from './../../../services/faq.service';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Faq } from 'app/models/faq-model';

@Component({
  selector: 'appdashboard-panel-intent-list',
  templateUrl: './panel-intent-list.component.html',
  styleUrls: ['./panel-intent-list.component.scss']
})
export class PanelIntentListComponent implements OnInit {

  @Input() id_faq_kb: string;
  @Output() selected_intent = new EventEmitter();

  intent_start: any;
  intent_defaultFallback: any;
  predefined_faqs = [];
  filtered_intents = [];
  intents = [];

  constructor(private faqService: FaqService) { }

  ngOnInit(): void {
    console.log("[PANEL-INTENT-LIST] ngOnInit()")
    console.log("[PANEL-INTENT-LIST] - Selected chatbot ID: ", this.id_faq_kb);
    this.getAllIntents(this.id_faq_kb);

  }

  getAllIntents(id_faq_kb) {

    this.faqService.getAllFaqByFaqKbId(id_faq_kb).subscribe((faqs: any) => {
      this.intents = faqs;


      this.intent_start = this.intents.splice(this.intents.indexOf(this.intents.find(o => o.intent_display_name === 'start')), 1)[0]
      console.log("[PANEL-INTENT-LIST] - GET ALL FAQ BY BOT ID - intent_start: ", this.intent_start);
      this.intent_defaultFallback = this.intents.splice(this.intents.indexOf(this.intents.find(o => o.intent_display_name === 'defaultFallback')), 1)[0]
      console.log("[PANEL-INTENT-LIST] - GET ALL FAQ BY BOT ID - intent_defaultFallback: ", this.intent_defaultFallback);
      this.filtered_intents = this.intents;

      console.log("[PANEL-INTENT-LIST] - GET ALL FAQ BY BOT ID - others INTENTS: ", this.intents);

      // this.faq_start = faqs.find(o => o.intent_display_name === 'start');
      // let s_index = this.faqs.indexOf(faqs.find(o => o.intent_display_name === 'start'))
      // this.intents.splice(s_index, 1)
      // this.all_faqs.splice(s_index, 1)

      // this.faq_defaultFallback = faqs.find(o => o.intent_display_name === 'defaultFallback')
      // let df_index = this.faqs.indexOf(faqs.find(o => o.intent_display_name === 'defaultFallback'))
      // this.faqs.splice(df_index, 1)
      // this.all_faqs.splice(s_index, 1)

      //console.log("faqs: ", faqs)

    }), (error) => {
      console.error("[PANEL-INTENT-LIST] - GET ALL FAQ BY BOT ID - ERROR: ", error)
    }, () => {
      console.log("[PANEL-INTENT-LIST] - GET ALL FAQ BY BOT ID * COMPLETE")
    }
  }

  livesearch(text: string) {
    this.filtered_intents = this.intents;
    this.filtered_intents = this.filtered_intents.filter(element => element.intent_display_name.toLowerCase().includes(text.toLowerCase()));
    //console.log("found those: ", this.filtered_intents)
  }

  selectIntent(intent, index) {
    console.log("[PANEL-INTENT-LIST] selectIntent - intent selected: ", intent);
    console.log("[PANEL-INTENT-LIST] selectIntent - index: ", index)

    let elements = Array.from(document.getElementsByClassName('intent active'));
    elements.forEach((el) => {
      el.classList.remove('active');
    })

    const element = document.getElementById('intent_' + index);
    element.classList.toggle("active")

    this.selected_intent.emit(intent);
  }

}

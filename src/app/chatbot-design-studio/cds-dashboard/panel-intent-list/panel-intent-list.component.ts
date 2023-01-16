import { FaqService } from './../../../services/faq.service';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Faq } from 'app/models/faq-model';
import { Router } from '@angular/router';
import { Intent } from 'app/models/intent-model';
import { Action } from 'rxjs/internal/scheduler/Action';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'appdashboard-panel-intent-list',
  templateUrl: './panel-intent-list.component.html',
  styleUrls: ['./panel-intent-list.component.scss']
})
export class PanelIntentListComponent implements OnInit {

  @Input() id_faq_kb: string;
  @Input() projectID: string;
  @Input() events: Observable<any>;
  private eventsSubscription: Subscription;
  @Output() selected_intent = new EventEmitter();
  @Output() returnListOfIntents = new EventEmitter();
  @Output() createIntent = new EventEmitter();

  intent_start: any;
  intent_defaultFallback: any;
  predefined_faqs = [];
  filtered_intents = [];
  intents: Intent[];

  constructor(
    private faqService: FaqService,
    private router: Router
    ) { }

  ngOnInit(): void {
    console.log("[PANEL-INTENT-LIST] ngOnInit()")
    console.log("[PANEL-INTENT-LIST] - Selected chatbot ID: ", this.id_faq_kb);
    this.getAllIntents(this.id_faq_kb);
    this.listeToNewIntentCreated()
  }

  listeToNewIntentCreated() {
    console.log("[PANEL-INTENT-LIST] listeToNewIntentCreated")
    this.eventsSubscription = this.events.subscribe(() => {
      this.getAllIntents(this.id_faq_kb)
    })
  }
  

  getAllIntents(id_faq_kb) {

    this.faqService._getAllFaqByFaqKbId(id_faq_kb).subscribe((faqs: Intent[]) => {
      this.intents = faqs;


      this.intent_start = this.intents.splice(this.intents.indexOf(this.intents.find(o => o.intent_display_name === 'start')), 1)[0]
      console.log("[PANEL-INTENT-LIST] - GET ALL FAQ BY BOT ID - intent_start: ", this.intent_start);
      this.intent_defaultFallback = this.intents.splice(this.intents.indexOf(this.intents.find(o => o.intent_display_name === 'defaultFallback')), 1)[0]
      console.log("[PANEL-INTENT-LIST] - GET ALL FAQ BY BOT ID - intent_defaultFallback: ", this.intent_defaultFallback);
      this.filtered_intents = this.intents;

      console.log("[PANEL-INTENT-LIST] - GET ALL FAQ BY BOT ID - others INTENTS: ", this.intents);
      console.log("[PANEL-INTENT-LIST] - GET ALL FAQ BY BOT ID - others  typeof INTENTS: ",typeof this.intents[0]);

      // this.faq_start = faqs.find(o => o.intent_display_name === 'start');
      // let s_index = this.faqs.indexOf(faqs.find(o => o.intent_display_name === 'start'))
      // this.intents.splice(s_index, 1)
      // this.all_faqs.splice(s_index, 1)

      // this.faq_defaultFallback = faqs.find(o => o.intent_display_name === 'defaultFallback')
      // let df_index = this.faqs.indexOf(faqs.find(o => o.intent_display_name === 'defaultFallback'))
      // this.faqs.splice(df_index, 1)
      // this.all_faqs.splice(s_index, 1)

      //console.log("faqs: ", faqs)
      this.returnListOfIntents.emit(this.intents);

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

  selectIntent(intent: Intent, index: number) {
    console.log("[PANEL-INTENT-LIST] selectIntent - intent selected: ", intent);
    console.log("[PANEL-INTENT-LIST] selectIntent - index: ", index)

    // this.router.navigate(['project/' + intent.id_project + '/editfaq', this.id_faq_kb, intent.id, 'tilebot']);
    // this.router.navigate(['project/' + intent.id_project + '/createfaq', this.id_faq_kb, 'tilebot', intent.language]);
    

    let elements = Array.from(document.getElementsByClassName('intent active'));
    elements.forEach((el) => {
      el.classList.remove('active');
    })

    const element = document.getElementById('intent_' + index);
    element.classList.toggle("active")

    this.selected_intent.emit(intent);
  }

  addNewIntent() {

    this.createIntent.emit(true);
    // this.router.navigate(['project/' + this.projectID  + '/createfaq', this.id_faq_kb, 'tilebot', 'en']);
    
  }

}

import { Intent } from 'app/models/intent-model';
import { Chatbot } from './../../../models/faq_kb-model';
import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { FaqKbService } from 'app/services/faq-kb.service';
import { Rule } from 'app/models/rule-model';

@Component({
  selector: 'cds-rules',
  templateUrl: './rules.component.html',
  styleUrls: ['./rules.component.scss']
})
export class RulesComponent implements OnInit {

  @Input() selectedChatbot: Chatbot;
  @Input() listOfIntents: Intent[];

  addClicked: boolean = false;
  listOfRules: Rule[]=[];
  constructor(private faqkbService: FaqKbService) { }

  ngOnInit(): void {

  }

  ngOnChanges(changes: SimpleChanges){
    this.getAllRules();
  }

  addNew(){
    console.log('add Ruless')
    this.addClicked = true;
  }

  ngOnDestroy(){
    this.addClicked = false;
  }

  getAllRules(){
    console.log('rulessss', this.selectedChatbot)
    if(this.selectedChatbot.attributes && this.selectedChatbot.attributes['rules']){
      this.listOfRules = this.selectedChatbot.attributes['rules'] as Rule[]
    }
  }

}

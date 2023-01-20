import { LoggerService } from 'app/services/logger/logger.service';
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
  constructor(private logger: LoggerService) { }

  ngOnInit(): void {

  }

  ngOnChanges(changes: SimpleChanges){
    this.getAllRules();
  }
  
  ngOnDestroy(){
    this.addClicked = false;
  }

  addNew(){
    this.addClicked = true;
  }

  getAllRules(){
    this.logger.debug('[RULES] getAllRules: selectedChatbot-->', this.selectedChatbot)
    if(this.selectedChatbot.attributes && this.selectedChatbot.attributes['rules']){
      this.listOfRules = this.selectedChatbot.attributes['rules'] as Rule[]
    }
  }

  onRuleAdded(rule: Rule){
    this.listOfRules.unshift(rule)
    this.addClicked = false;
  }

}

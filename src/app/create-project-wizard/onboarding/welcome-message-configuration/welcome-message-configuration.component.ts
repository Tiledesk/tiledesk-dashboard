import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { LoggerService } from '../../../services/logger/logger.service';
// import{htmlEntities, stripEmojis} from '../../../utils/util';

@Component({
  selector: 'appdashboard-welcome-message-configuration',
  templateUrl: './welcome-message-configuration.component.html',
  styleUrls: ['./welcome-message-configuration.component.scss']
})
export class WelcomeMessageConfigurationComponent implements OnInit {
  @Output() prevPage = new EventEmitter();
  @Output() nextPage = new EventEmitter();
  @Input() welcomeMessage: string;
  @Input() DISPLAY_SPINNER_SECTION: boolean;
  @Input() primaryColor: string;
  @Input() secondaryColor: string;
  @Input() projectName: string;

  limitChars: number = 300;
  numChars: number = 0;
  messegeError = false;
  constructor(
    private logger: LoggerService
  ) { }

  ngOnInit() {
    this.init();
  }

  init(){
    this.numChars = this.welcomeMessage.length;
  }

  goToPrevPage() {
    let event = { step:'step0'}
    this.prevPage.emit(event);
  }

  goToNextPage() {
    if(this.messegeError === false){
      let event = { step:'step2', msg: this.welcomeMessage }
      this.nextPage.emit(event);
    }
  }

  messageChange(event:string) {
    this.numChars = event.length;
    this.welcomeMessage = event;
    if(this.numChars > this.limitChars){
      this.welcomeMessage = this.welcomeMessage.substring(0,this.limitChars);
      this.numChars = this.limitChars;
      this.messegeError = true;
    } else {
      this.messegeError = false;
    }
  }

}

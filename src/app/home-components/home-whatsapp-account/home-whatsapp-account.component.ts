import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChange, SimpleChanges } from '@angular/core';
import { LoggerService } from 'app/services/logger/logger.service';


@Component({
  selector: 'appdashboard-home-whatsapp-account',
  templateUrl: './home-whatsapp-account.component.html',
  styleUrls: ['./home-whatsapp-account.component.scss']
})

export class HomeWhatsappAccountComponent implements OnInit, OnChanges {
  @Input() solution_channel_for_child: string;
  @Input() solution_for_child: string;
  @Output() onClickOnGoToLearnMoreOrManageApp = new EventEmitter();

  constructor(
    private logger: LoggerService,
  ) { }

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  ngOnInit(): void { }


  ngOnChanges(changes: SimpleChanges) {
    this.logger.log('[HOME-WA] ngOnChanges changes ', changes);
    this.logger.log('[HOME-WA] ngOnChanges solution_channel_for_child ', this.solution_channel_for_child);
    this.logger.log('[HOME-WA] ngOnChanges solution_for_child ', this.solution_for_child);
  }


  gotToLearMoreOrManageApp() {
    this.onClickOnGoToLearnMoreOrManageApp.emit()
  }


}

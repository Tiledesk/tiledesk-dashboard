import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { LoggerService } from 'app/services/logger/logger.service';

@Component({
  selector: 'cds-radio-buttons',
  templateUrl: './radio-button.component.html',
  styleUrls: ['./radio-button.component.scss']
})
export class CDSRadioButtonComponent implements OnInit {

  @Input() items: [{label: string, value: any, disabled: boolean, checked: boolean}]
  @Input() itemSelected: {label: string, value: any, disabled: boolean, checked: boolean}
  @Input() row: number = 1;
  @Input() column: number = 1;
  @Output() changeButtonSelect = new EventEmitter<any>();

  constructor(private logger: LoggerService) { }

  ngOnInit(): void {
    this.logger.log('[RADIO-BUTTON] itemSelected', this.itemSelected)
  }

  onChangeButton(event){
    this.changeButtonSelect.emit(event.value)
  }

}

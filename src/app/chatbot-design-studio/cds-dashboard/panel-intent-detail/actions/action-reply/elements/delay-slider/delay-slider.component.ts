import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'appdashboard-delay-slider',
  templateUrl: './delay-slider.component.html',
  styleUrls: ['./delay-slider.component.scss']
})
export class DelaySliderComponent implements OnInit {
  
  @Output() changeDelayTime = new EventEmitter();
  @Input() delayTime: number;
  @Input() step : number = 0.1;
  @Input() min: number = 0;
  @Input() max: number = 10;

  delayOpen: boolean;
  focusSlider: boolean;

  constructor() { }

  ngOnInit(): void {
    this.delayOpen = false;
    this.focusSlider = true;
  }


  // EVENTS //
  formatLabel(value: number): string {
    this.delayTime = value;
    return `${value}`+ 's';
  }

  closeDelaySlider(){
    this.delayOpen = false;
    this.changeDelayTime.emit(this.delayTime);
  }


  onFocusOutDelay(){
    if( this.focusSlider === false){
      this.closeDelaySlider();
    }
  }

  onFocusSlider(){
    this.focusSlider = true;
    this.delayOpen = true;
  }

  onFocusOutSlider(){
    this.focusSlider = false;
    this.closeDelaySlider();
  }

  onDelayClick(){
    if(this.delayOpen === true){
      this.closeDelaySlider();
    } else {
      this.delayOpen = true;
    }
  }



}

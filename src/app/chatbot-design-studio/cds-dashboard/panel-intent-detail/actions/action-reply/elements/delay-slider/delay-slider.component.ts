import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'appdashboard-delay-slider',
  templateUrl: './delay-slider.component.html',
  styleUrls: ['./delay-slider.component.scss']
})
export class DelaySliderComponent implements OnInit {
  
  @Output() changeDelayTime = new EventEmitter();
  @Input() delayTime: number;

  delayOpen: boolean;
  delayTimeMin: number;
  delayTimeMax: number;
  delayTimeStep: number;
  focusSlider: boolean;

  constructor() { }

  ngOnInit(): void {
    this.delayOpen = false;
    this.delayTimeMin = 0;
    this.delayTimeMax = 10;
    this.delayTimeStep = 0.1;
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

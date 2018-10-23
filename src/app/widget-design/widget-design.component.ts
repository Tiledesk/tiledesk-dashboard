import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { slideInOutAnimation } from './slide-in-out.animation';
import { ColorPickerService, Cmyk } from 'ngx-color-picker';
@Component({
  selector: 'appdashboard-widget-design',
  templateUrl: './widget-design.component.html',
  styleUrls: ['./widget-design.component.scss']
})


export class WidgetDesignComponent implements OnInit {
  public color = '#2889e9';

  constructor(
    public location: Location,
    private cpService: ColorPickerService
  ) { }

  ngOnInit() {

  }

  colorPickerChange($event) {
    console.log('WIDGET DESIGN COLOR PICKER CHANGE ', $event) 
  }

  onChangeColor($event) {
    this.color = $event
    console.log('+ WIDGET DESIGN COLOR PICKER CHANGE ', $event) 
  }
  goBack() {
    this.location.back();
  }


}

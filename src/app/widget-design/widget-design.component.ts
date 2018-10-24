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
  public primaryColor = '#2889e9';
  public secondaryColor = '#ffffff'
  constructor(
    public location: Location,
    private cpService: ColorPickerService
  ) { }

  ngOnInit() {

  }

 
  onChangePrimaryColor($event) {
    this.primaryColor = $event
    console.log('+ WIDGET DESIGN - ON CHANGE PRIMARY COLOR ', $event);
  }

  onChangeSecondaryColor($event) {
    this.secondaryColor = $event
    console.log('+ WIDGET DESIGN - ON CHANGE SECONDARY COLOR ', $event);
  }

  goBack() {
    this.location.back();
  }


}

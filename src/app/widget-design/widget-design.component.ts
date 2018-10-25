import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { slideInOutAnimation } from './slide-in-out.animation';
import { ColorPickerService, Cmyk } from 'ngx-color-picker';
import { WidgetService } from '../services/widget.service';

@Component({
  selector: 'appdashboard-widget-design',
  templateUrl: './widget-design.component.html',
  styleUrls: ['./widget-design.component.scss']
})


export class WidgetDesignComponent implements OnInit {
  // '#2889e9'
  public primaryColor: string;
  public secondaryColor: string;



  constructor(
    public location: Location,
    private cpService: ColorPickerService,
    private widgetService: WidgetService
  ) { }

  ngOnInit() {
    this.primaryColor = 'rgb(40, 137, 233)';
    this.secondaryColor = 'rgb(255, 255, 255)';

    this.subscribeToSelectedPrimaryColor();

    this.subscribeToSelectedSecondaryColor();
  }


  /**
   * IF THE USER SELECT A COLOR IN THE WIDGET DESIGN (THIS COMP) AND THEN GO BACK IN THE WIDGET PAGE AND THEN RETURN IN THE
   * THE WIDGET DESIGN PAGE (THIS COMP), THE WIDGET DESIGN PAGE IS RE-INITIALIZATED SO THE PRIMARY AND THE SECONDARY COLORS
   * ARE NOT THOSE PREVIOUS SELECTED BUT ARE THE DEFAULT COLORS SETTED IN THE ONINIT LIFEHOOK.
   * TO AVOID THIS ALSO THE WIDGET DESIGN PAGE (THIS COMP) IS SUBSCRIBED TO THE PRIMARY AND THE SECONDARY COLOR SELECTED IN ITSELF */
  subscribeToSelectedPrimaryColor() {
    this.widgetService.primaryColorBs.subscribe((primary_color: string) => {
      if (primary_color) {
        this.primaryColor = primary_color
      }
    })
  }
  subscribeToSelectedSecondaryColor() {
    this.widgetService.secondaryColorBs.subscribe((secondary_color: string) => {
      if (secondary_color) {
        this.secondaryColor = secondary_color
      }
    })
  }


  onChangePrimaryColor($event) {
    this.primaryColor = $event
    console.log('+ WIDGET DESIGN - ON CHANGE PRIMARY COLOR ', $event);

    this.widgetService.publishPrimaryColorSelected(this.primaryColor);
  }

  onChangeSecondaryColor($event) {
    this.secondaryColor = $event
    console.log('+ WIDGET DESIGN - ON CHANGE SECONDARY COLOR ', $event);

    this.widgetService.publishSecondaryColorSelected(this.secondaryColor);
  }

  goBack() {
    this.location.back();
  }


}

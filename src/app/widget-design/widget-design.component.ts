import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Location } from '@angular/common';
import { slideInOutAnimation } from './slide-in-out.animation';
import { ColorPickerService, Cmyk } from 'ngx-color-picker';
import { WidgetService } from '../services/widget.service';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'appdashboard-widget-design',
  templateUrl: './widget-design.component.html',
  styleUrls: ['./widget-design.component.scss']
})


export class WidgetDesignComponent implements OnInit, AfterViewInit {
  // '#2889e9'
  public primaryColor: string;
  public secondaryColor: string;
  public primaryColorRgba: string;
  public primaryColorGradiend: string;
  public primaryColorBorder: string;

  hasSelectedLeftAlignment = false
  hasSelectedRightAlignment = true
  private fragment: string;
  constructor(
    public location: Location,
    private cpService: ColorPickerService,
    private widgetService: WidgetService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.route.fragment.subscribe(fragment => {
      this.fragment = fragment;
      console.log('+ WIDGET DESIGN - FRAGMENT ', this.fragment)
    });
    this.primaryColor = 'rgb(40, 137, 233)';
    this.secondaryColor = 'rgb(255, 255, 255)';
    this.primaryColorRgba = 'rgba(40, 137, 233, 0.50)';
    this.primaryColorGradiend = `linear-gradient(${this.primaryColor}, ${this.primaryColorRgba})`;
    this.primaryColorBorder = `2.4px solid ${this.primaryColorRgba}`;

    this.subscribeToSelectedPrimaryColor();

    this.subscribeToSelectedSecondaryColor();

    this.subscribeToWidgetAlignment();

  }

  ngAfterViewInit(): void {
    try {
      // name of the class of the html div = . + fragment
      const test = <HTMLElement>document.querySelector('.' + this.fragment)
      console.log('+ WIDGET DESIGN - QUERY SELECTOR TEST  ', test)
      test.scrollIntoView();
      // document.querySelector('#' + this.fragment).scrollIntoView();
      // console.log( document.querySelector('#' + this.fragment).scrollIntoView())
    } catch (e) {
      console.log('+ WIDGET DESIGN - QUERY SELECTOR ERROR  ', e)
    }
  }

  // WIDGET ALIGNMENT
  aligmentLeftSelected(left_selected: boolean) {
    console.log('+ WIDGET DESIGN - LEFT ALIGNMENT SELECTED ', left_selected);
    this.hasSelectedLeftAlignment = true;
    this.hasSelectedRightAlignment = false;

    this.widgetService.publishWidgetAligmentSelected('left');
  }

  aligmentRightSelected(right_selected: boolean) {
    console.log('+ WIDGET DESIGN - RIGHT ALIGNMENT SELECTED ', right_selected);
    this.hasSelectedLeftAlignment = false;
    this.hasSelectedRightAlignment = true;
    this.widgetService.publishWidgetAligmentSelected('right');
  }

  subscribeToWidgetAlignment() {
    this.widgetService.widgetAlignmentBs
      .subscribe((alignment) => {
        console.log('WIDGET COMP - SUBSCRIBE TO WIDGET ALIGNMENT ', alignment);
        if (alignment === 'right') {
          this.hasSelectedLeftAlignment = false;
          this.hasSelectedRightAlignment = true;

        } else if (alignment === 'left') {
          this.hasSelectedLeftAlignment = true;
          this.hasSelectedRightAlignment = false;
        }

      });
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


  /**
   * REPLACED WITH onSelectPrimaryColor($event)  */
  onChangePrimaryColor($event) {
    this.primaryColor = $event

    this.getPrimaryColorRgbaAndGradient(this.primaryColor);

    // console.log('+ WIDGET DESIGN - ON CHANGE PRIMARY COLOR ', $event);
    this.widgetService.publishPrimaryColorSelected(this.primaryColor);
  }



  onSelectPrimaryColor($event) {
    this.primaryColor = $event
    console.log('+ WIDGET DESIGN - ON SELECT PRIMARY COLOR ', this.primaryColor);

    this.getPrimaryColorRgbaAndGradient(this.primaryColor);

    this.widgetService.publishPrimaryColorSelected(this.primaryColor);
  }

  getPrimaryColorRgbaAndGradient(primaryColor: string) {
    const new_col = primaryColor.replace(/rgb/i, 'rgba');
    this.primaryColorRgba = new_col.replace(/\)/i, ',0.50)');
    console.log('+ WIDGET DESIGN - ON SELECT PRIMARY COLOR (RGBA) ', this.primaryColorRgba);

    this.primaryColorGradiend = `linear-gradient(${this.primaryColor}, ${this.primaryColorRgba})`;
    this.primaryColorBorder = `2.4px solid ${this.primaryColorRgba}`;
  }

  /**
   * REPLACED WITH onSelectSecondaryColor($event)  */
  // onChangeSecondaryColor($event) {
  //   this.secondaryColor = $event
  //   console.log('+ WIDGET DESIGN - ON CHANGE SECONDARY COLOR ', $event);
  //   this.widgetService.publishSecondaryColorSelected(this.secondaryColor);
  // }

  onSelectSecondaryColor($event) {
    console.log('++++++ WIDGET DESIGN - ON SELECT SECONDARY COLOR ', $event);
    this.secondaryColor = $event
    this.widgetService.publishSecondaryColorSelected(this.secondaryColor);
  }

  goBack() {
    this.location.back();
  }


}

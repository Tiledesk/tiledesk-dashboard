import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'appdashboard-metriche',
  templateUrl: './metriche.component.html',
  styleUrls: ['./metriche.component.scss']
})
export class MetricheComponent implements OnInit {
  @Input()  autoselected
 ì
  selected='richieste'
  constructor() { }

  ngOnInit() {

    console.log("»» !!! ANALYTICS - Metriche component - autoselected", this.autoselected)

    if (this.autoselected === 'visitors') {
      this.selected='visitors';
    } 

    if (this.autoselected === 'messages') {
      this.selected='messages';
    } 
  }

  goTo(component){
    this.selected=component;
    console.log("Move to:",component)
  }
}

import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'appdashboard-metriche',
  templateUrl: './metriche.component.html',
  styleUrls: ['./metriche.component.scss']
})
export class MetricheComponent implements OnInit {

  selected='richieste'
  constructor() { }

  ngOnInit() {
  }

  goTo(component){
    this.selected=component;
    console.log("Move to:",component)
  }
}

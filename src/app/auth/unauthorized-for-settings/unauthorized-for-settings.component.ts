import { Component, Input, OnChanges, OnInit } from '@angular/core';

@Component({
  selector: 'unauthorized-for-settings',
  templateUrl: './unauthorized-for-settings.component.html',
  styleUrls: ['./unauthorized-for-settings.component.scss']
})
export class UnauthorizedForSettingsComponent implements OnInit , OnChanges{
  @Input() customHeight: string;

  constructor() { }

  ngOnInit(): void {
  }
  
  ngOnChanges() {  
    console.log('unauthorized-for-settings customHeight', this.customHeight)
  }

}

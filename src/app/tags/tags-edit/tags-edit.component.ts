import { Component, OnInit , Input, Output, EventEmitter} from '@angular/core';

@Component({
  selector: 'appdashboard-tags-edit',
  templateUrl: './tags-edit.component.html',
  styleUrls: ['./tags-edit.component.scss']
})
export class TagsEditComponent implements OnInit {


  displayModalEditTag = 'block'
  @Input() tagid: string;


  constructor() { }

  ngOnInit() {
  }

}

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'add-content-menu',
  templateUrl: './add-content-menu.component.html',
  styleUrls: ['./add-content-menu.component.scss']
})
export class AddContentMenuComponent implements OnInit {
  @Output() openAddKnowledgeBaseModal = new EventEmitter();

  items = [{"label": "Single URL", "type":"url-page"},{"label": "URL(s)", "type":"urls"}, {"label": "Plain Text", "type":"text-file"}];
  menuTitle: string = "";

  constructor() { }

  ngOnInit(): void {
  }

  onOpenAddKnowledgeBaseModal(event){
    // console.log('onOpenAddKnowledgeBaseModal:', event);
    this.openAddKnowledgeBaseModal.emit(event);
  }
}
import { ActionEmail } from 'app/models/intent-model';
import { Component, OnInit, Input, ElementRef, OnChanges, Output, EventEmitter } from '@angular/core';
import { LoggerService } from 'app/services/logger/logger.service';
import { ControllerService } from 'app/chatbot-design-studio/services/controller.service';


@Component({
  selector: 'cds-action-email',
  templateUrl: './cds-action-email.component.html',
  styleUrls: ['./cds-action-email.component.scss']
})
export class CdsActionEmailComponent implements OnInit, OnChanges {

  @Input() action: ActionEmail;
  @Input() previewMode: boolean = true;
  @Output() updateAndSaveAction = new EventEmitter();
  @Input() last: boolean;
  email_error: boolean = false;
  actionTo: string = ''
  actionSubject: string = ''
  actionBody: string = ''

  // isOpenSetAttributesPanel: boolean = false
  // intents = ['uno', 'due', 'tre'];


  constructor(
    private logger: LoggerService,
    private eRef: ElementRef,
    private controllerService: ControllerService
  ) { }

  ngOnInit(): void {
  console.log("[ACTION-EMAIL] elementSelected: ", this.action)
    this.actionTo = this.action.to
    this.actionSubject = this.action.subject
    this.actionBody = this.action.text
  }

  ngOnChanges() {
    this.logger.log("[CDS-ACTION-EMAIL] ngOnChanges: this.action", this.action)
  }


  onEditableDivTextChange($event: string, property: string) {

    console.log("[CDS-ACTION-EMAIL] onEditableDivTextChange event", $event)
    console.log("[CDS-ACTION-EMAIL] onEditableDivTextChange property", property)
    this.action[property] = $event
    // this.updateAndSaveAction.emit();
  }



  // placeCaretAtEnd(el) {
  //   el.focus();
  //   if (typeof window.getSelection != "undefined" && typeof document.createRange != "undefined") {
  //     var range = document.createRange();
  //     range.selectNodeContents(el);
  //     range.collapse(false);
  //     var sel = window.getSelection();
  //     sel.removeAllRanges();
  //     sel.addRange(range);
  //   }
  // }


  onChangeActionButton(event) {
    //this.logger.log("event: ", event)
  }

  onToChange(event) {
    console.log("[CDS-ACTION-EMAIL] onToChange event: ", event);
    this.action.to = event;
  }

  // https://stackoverflow.com/questions/45686432/need-to-add-tags-and-normal-text-in-same-input-box
  // http://jsfiddle.net/timdown/jwvha/527/


  // onOpenActionDetails() {
  //   console.log( '[CDS-ACTION-EMAIL] onOpenActionDetails' )
  //   this.controllerService.openActionDetailPanel('email');
  // }


}

import { ActionEmail } from 'app/models/intent-model';
import { Component, OnInit, Input } from '@angular/core';
import { TEXT_CHARS_LIMIT } from './../../../../utils';
import { LoggerService } from 'app/services/logger/logger.service';

@Component({
  selector: 'cds-action-email',
  templateUrl: './action-email.component.html',
  styleUrls: ['./action-email.component.scss']
})
export class ActionEmailComponent implements OnInit {

  @Input() action: ActionEmail;

  email_error: boolean = false;
  // intents = ['uno', 'due', 'tre'];


  constructor(
    private logger: LoggerService,
  ) { }

  ngOnInit(): void {
    this.logger.log("[ACTION-EMAIL] elementSelected: ", this.action)
  }


  onChangeActionButton(event) {
    //this.logger.log("event: ", event)
  }

  onToChange(event) {
    this.logger.log("[ACTION-EMAIL] onToChange event: ", event);
    this.action.to = event;
  }

  // document.querySelector('.selectable-icons').addEventListener('click', function(e) {
  //   var el = e.target.cloneNode(true);
  //   el.setAttribute('contenteditable', false);
  //   document.querySelector('[contenteditable]').appendChild(el);

  // });
  // https://stackoverflow.com/questions/45686432/need-to-add-tags-and-normal-text-in-same-input-box
  onOpenPopover() {
    const imputEle = document.querySelector('#' + 'email-subject') as HTMLElement 
    const caretPositon =  this.getCaretCharacterOffsetWithin(imputEle)
    console.log("[ACTION-EMAIL] caretPositon: ", caretPositon);
  } 

  // mousedown(event) {
  //   console.log("[ACTION-EMAIL] mousedown: ", event);
  //   const imputEle = document.querySelector('#' + 'email-subject') as HTMLElement 
  //   const caretPositon =  this.getCaretCharacterOffsetWithin(imputEle)
  //   console.log("[ACTION-EMAIL] mousedown caretPositon: ", caretPositon);
  // }

  mouseUp() {
    console.log("[ACTION-EMAIL] mouseUp: ");
    const imputEle = document.querySelector('#' + 'email-subject') as HTMLElement 
    const caretPositon =  this.getCaretCharacterOffsetWithin(imputEle)
    console.log("[ACTION-EMAIL] mouseUp caretPositon: ", caretPositon);
  }
  // mouseleave() {
  //   console.log("[ACTION-EMAIL] mouseleave: ");
  //   const imputEle = document.querySelector('#' + 'email-subject') as HTMLElement 
  //   const caretPositon =  this.getCaretCharacterOffsetWithin(imputEle)
  //   console.log("[ACTION-EMAIL] mouseleave caretPositon: ", caretPositon);

  // }

  onKeyUp(event) {
    console.log("[ACTION-EMAIL] onKeyUp: ", event);
    const imputEle = document.querySelector('#' + 'email-subject') as HTMLElement 
    const caretPositon =  this.getCaretCharacterOffsetWithin(imputEle)
    console.log("[ACTION-EMAIL] onKeyUp caretPositon: ", caretPositon);
  }

  selectedAttibute(attribute) {
    console.log("[ACTION-EMAIL] selectedAttibute attribute: ", attribute);
    const imputEle = document.querySelector('#' + 'email-subject') as any        
    console.log("[ACTION-EMAIL] selectedAttibute imputEle: ", imputEle);

    // var range = document.createRange()
    // var sel = window.getSelection()
    
    // range.setStart(imputEle.childNodes[2], 5)
    // range.collapse(true)
    
    // sel.removeAllRanges()
    // sel.addRange(range)
 


    // console.log('imputEl' , imputEle) 
    setTimeout(() => {

    imputEle.focus()        
  
    // var range = document.createRange()
    // var sel = window.getSelection()
    
    // range.setStart(imputEle.childNodes[2], 5)
    // range.collapse(true)
    
    // sel.removeAllRanges()
    // sel.addRange(range)
    
    this.pasteHtmlAtCaret('<div contenteditable="false" style=" background: #ffdc66;cursor: pointer;-webkit-transition: all 0.3s;  transition: all 0.3s; border-radius: 10px;-webkit-box-decoration-break: clone; box-decoration-break: clone; display: inline; padding: 0 5px;">' + attribute +'</div>')
     }, 500);



   




    // const selectedEl = document.querySelector('#' + eleid) as any
    
   
    // var el = selectedEl.cloneNode(true);
    // const attribute = selectedEl.setAttribute('contenteditable', false);
    // this.pasteHtmlAtCaret('<div contenteditable="false" style=" background: #ffdc66;cursor: pointer;-webkit-transition: all 0.3s;  transition: all 0.3s; border-radius: 10px;-webkit-box-decoration-break: clone; box-decoration-break: clone; display: inline; padding: 0 5px;">' + attribute +'</div>')
   

    // document.querySelector('[contenteditable]').appendChild(el);

    //   const imputEle = document.querySelector('#' + 'email-subject') as any 
    //   console.log("[ACTION-EMAIL] imputEle : ", imputEle);

    //  let s = window.getSelection();
    //  let r = s.getRangeAt(0)
    //  console.log("[ACTION-EMAIL] getRangeAt : ", r);
    //  let elx = r.startContainer.parentElement
    //  console.log("[ACTION-EMAIL] elx : ", elx);
    // //  select-category-row-name
    // if (elx.classList.contains('select-category-row-name')) {
    //   // Check if we are exactly at the end of the .label element
    //   if (r.startOffset == r.endOffset && r.endOffset == elx.textContent.length) {
    //     // prevent the default delete behavior
    //     event.preventDefault();
    //     if (elx.classList.contains('highlight')) {
    //       // remove the element
    //       elx.remove();
    //     } else {
    //       elx.classList.add('highlight');
    //     }
    //     return;
    //   }
    // }

  }


  getCaretCharacterOffsetWithin(element) {
    var caretOffset = 0;
    var doc = element.ownerDocument || element.document;
    var win = doc.defaultView || doc.parentWindow;
    var sel;
    if (typeof win.getSelection != "undefined") {
        sel = win.getSelection();
        if (sel.rangeCount > 0) {
            var range = win.getSelection().getRangeAt(0);
            var preCaretRange = range.cloneRange();
            preCaretRange.selectNodeContents(element);
            preCaretRange.setEnd(range.endContainer, range.endOffset);
            caretOffset = preCaretRange.toString().length;
        }
    } else if ( (sel = doc.selection) && sel.type != "Control") {
        var textRange = sel.createRange();
        var preCaretTextRange = doc.body.createTextRange();
        preCaretTextRange.moveToElementText(element);
        preCaretTextRange.setEndPoint("EndToEnd", textRange);
        caretOffset = preCaretTextRange.text.length;
    }
    console.log('getCaretCharacterOffsetWithin caretOffset', caretOffset )
    return caretOffset;
}

  pasteHtmlAtCaret(html) {
    var sel, range;
    if (window.getSelection) {
      // IE9 and non-IE
      sel = window.getSelection();
      console.log('sel' ,sel)
      if (sel.getRangeAt && sel.rangeCount) {
        range = sel.getRangeAt(0);
        range.deleteContents();
      
        console.log('range' ,range)
        // Range.createContextualFragment() would be useful here but is
        // only relatively recently standardized and is not supported in
        // some browsers (IE9, for one)
        var el = document.createElement("div");
        console.log('el' ,el)
        el.innerHTML = html;
        var frag = document.createDocumentFragment(), node, lastNode;
        console.log('frag' ,frag)
        while ((node = el.firstChild)) {
          console.log('node' ,node)
          lastNode = frag.appendChild(node);
          console.log('lastNode 1' ,lastNode)
        }
        var firstNode = frag.firstChild;
        range.insertNode(frag);

        // Preserve the selection
        if (lastNode) {
          console.log('lastNode 2 ' ,lastNode)
          range = range.cloneRange();
          console.log('range 2 ' ,range)
          range.setStartAfter(lastNode);
          // if (selectPastedContent) {
          //     range.setStartBefore(firstNode);
          // } else {
          range.collapse(true);
          // }
          sel.removeAllRanges();
          sel.addRange(range);
        }
      }
    }
    // else if ( (sel = <HTMLElement>document.selection) && sel.type != "Control") {
    //     // IE < 9
    //     var originalRange = sel.createRange();
    //     originalRange.collapse(true);
    //     sel.createRange().pasteHTML(html);
    //     if (selectPastedContent) {
    //         range = sel.createRange();
    //         range.setEndPoint("StartToStart", originalRange);
    //         range.select();
    //     }
    // }
  }

  insertAtCursor(myField, myValue) {
    this.logger.log('[CANNED-RES-EDIT-CREATE] - insertAtCursor - myValue ', myValue);

    // if (this.addWhiteSpaceBefore === true) {
    //   myValue = ' ' + myValue;
    //   this.logger.log('[CANNED-RES-EDIT-CREATE] - GET TEXT AREA - QUI ENTRO myValue ', myValue);
    // }

    //IE support
    if (myField.selection) {
      myField.focus();
      let sel = myField.selection.createRange();
      sel.text = myValue;
      // this.cannedResponseMessage = sel.text;
    }
    //MOZILLA and others
    else if (myField.selectionStart || myField.selectionStart == '0') {
      var startPos = myField.selectionStart;
      this.logger.log('[CANNED-RES-EDIT-CREATE] - insertAtCursor - startPos ', startPos);

      var endPos = myField.selectionEnd;
      this.logger.log('[CANNED-RES-EDIT-CREATE] - insertAtCursor - endPos ', endPos);

      myField.value = myField.value.substring(0, startPos) + myValue + myField.value.substring(endPos, myField.value.length);

      // place cursor at end of text in text input element
      myField.focus();
      var val = myField.value; //store the value of the element
      myField.value = ''; //clear the value of the element
      myField.value = val + ' '; //set that value back. 



      // myField.select();
    } else {
      myField.value += myValue;

    }
  }

  // onTextChange(event) {
  //   this.logger.log("[ACTION-EMAIL] onTextChange event: ", event);
  //   //this.elementSelected.intentName = event;
  // }

}

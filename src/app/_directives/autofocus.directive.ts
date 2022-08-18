import { Directive, ElementRef, OnInit} from '@angular/core';

@Directive({
  selector: '[appdashboardAutofocus]'
})
export class AutofocusDirective {

  constructor(private elementRef: ElementRef) { }

  ngOnInit(): void {
    this.elementRef.nativeElement.focus();
  }


}

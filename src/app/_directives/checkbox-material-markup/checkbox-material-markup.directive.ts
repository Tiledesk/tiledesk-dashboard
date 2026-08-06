import { AfterViewInit, Directive, ElementRef, OnDestroy } from '@angular/core';

/**
 * Replaces bootstrap-material-design checkbox/radio init without jQuery:
 * - `.checkbox` → `<span class="checkbox-material"><span class="check"></span></span>`
 * - `.radio` → `<span class="circle"></span><span class="check"></span>`
 */
@Directive({
  selector: '.checkbox, .radio',
})
export class CheckboxMaterialMarkupDirective implements AfterViewInit, OnDestroy {
  private observer: MutationObserver | null = null;

  constructor(private readonly host: ElementRef<HTMLElement>) {}

  ngAfterViewInit(): void {
    this.apply();
    this.observer = new MutationObserver(() => this.apply());
    this.observer.observe(this.host.nativeElement, { childList: true, subtree: true });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  private apply(): void {
    if (this.host.nativeElement.classList.contains('radio')) {
      this.applyRadioMarkup();
    } else {
      this.applyCheckboxMarkup();
    }
  }

  private applyCheckboxMarkup(): void {
    const inputs = this.host.nativeElement.querySelectorAll<HTMLInputElement>(
      'label > input[type="checkbox"], label.checkbox-inline > input[type="checkbox"]'
    );
    inputs.forEach((input) => {
      if (input.nextElementSibling?.classList.contains('checkbox-material')) {
        return;
      }
      const material = document.createElement('span');
      material.className = 'checkbox-material';
      const check = document.createElement('span');
      check.className = 'check';
      material.appendChild(check);
      input.insertAdjacentElement('afterend', material);
    });
  }

  private applyRadioMarkup(): void {
    const inputs = this.host.nativeElement.querySelectorAll<HTMLInputElement>(
      'label > input[type="radio"], label.radio-inline > input[type="radio"]'
    );
    inputs.forEach((input) => {
      if (input.nextElementSibling?.classList.contains('circle')) {
        return;
      }
      const circle = document.createElement('span');
      circle.className = 'circle';
      const check = document.createElement('span');
      check.className = 'check';
      input.insertAdjacentElement('afterend', circle);
      circle.insertAdjacentElement('afterend', check);
    });
  }
}

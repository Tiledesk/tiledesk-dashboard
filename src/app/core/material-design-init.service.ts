import { Injectable, NgZone, OnDestroy } from '@angular/core';

/**
 * Ripples + floating labels for bootstrap-material-design markup, without jQuery/$.material.init.
 * Checkbox/radio DOM markup stays in CheckboxMaterialMarkupDirective.
 */
@Injectable({ providedIn: 'root' })
export class MaterialDesignInitService implements OnDestroy {
  private static readonly RIPPLE_SELECTOR = [
    '.btn:not(.btn-link)',
    '.card-image',
    '.navbar a:not(.withoutripple)',
    '.dropdown-menu a',
    '.nav-tabs a:not(.withoutripple)',
    '.withripple',
    '.pagination li:not(.active):not(.disabled) a:not(.withoutripple)',
  ].join(',');

  private static readonly FORM_CONTROL_SELECTOR =
    'input.form-control, textarea.form-control, select.form-control';

  private static readonly BOUND_ATTR = 'data-md-ripple-bound';
  private static readonly INPUT_PROC_ATTR = 'data-md-input-init';

  private initialized = false;
  private observer: MutationObserver | null = null;
  private readonly boundRippleElements = new WeakSet<HTMLElement>();

  private readonly onKeydownFormControl = (event: Event) => {
    if (!isPrintableKey(event as KeyboardEvent)) {
      return;
    }
    const input = event.target as HTMLInputElement;
    input.closest('.form-group')?.classList.remove('is-empty');
  };

  private readonly onKeyupChangeFormControl = (event: Event) => {
    syncFormGroupEmptyState(event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement);
  };

  private readonly onFocusFormControl = (event: Event) => {
    const target = event.target as HTMLElement;
    if (target instanceof HTMLInputElement && target.disabled) {
      return;
    }
    target.closest('.form-group')?.classList.add('is-focused');
  };

  private readonly onBlurFormControl = (event: Event) => {
    (event.target as HTMLElement).closest('.form-group')?.classList.remove('is-focused');
  };

  private readonly onChangeFormGroupInput = (event: Event) => {
    const input = event.target as HTMLInputElement;
    if (input.type === 'file') {
      return;
    }
    syncFormGroupEmptyState(input);
  };

  private readonly onChangeFileInput = (event: Event) => {
    const input = event.target as HTMLInputElement;
    const formGroup = input.closest('.form-group');
    if (!formGroup) {
      return;
    }
    const names = Array.from(input.files ?? []).map((f) => f.name).join(', ');
    if (names) {
      formGroup.classList.remove('is-empty');
    } else {
      formGroup.classList.add('is-empty');
    }
    const readonly = formGroup.querySelector<HTMLInputElement>('input.form-control[readonly]');
    if (readonly) {
      readonly.value = names;
    }
  };

  constructor(private readonly ngZone: NgZone) {}

  init(): void {
    if (this.initialized || typeof document === 'undefined') {
      return;
    }

    this.ngZone.runOutsideAngular(() => {
      this.initFormControls(document);
      this.attachFormControlListeners();
      this.bindRipplesIn(document);
      this.observeDomChanges();
    });

    this.initialized = true;
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    document.removeEventListener('keydown', this.onKeydownFormControl, true);
    document.removeEventListener('paste', this.onKeydownFormControl, true);
    document.removeEventListener('keyup', this.onKeyupChangeFormControl, true);
    document.removeEventListener('change', this.onKeyupChangeFormControl, true);
    document.removeEventListener('focus', this.onFocusFormControl, true);
    document.removeEventListener('blur', this.onBlurFormControl, true);
    document.removeEventListener('change', this.onChangeFormGroupInput, true);
    document.removeEventListener('change', this.onChangeFileInput, true);
  }

  private attachFormControlListeners(): void {
    document.addEventListener('keydown', this.onKeydownFormControl, true);
    document.addEventListener('paste', this.onKeydownFormControl, true);
    document.addEventListener('keyup', this.onKeyupChangeFormControl, true);
    document.addEventListener('change', this.onKeyupChangeFormControl, true);
    document.addEventListener('focus', this.onFocusFormControl, true);
    document.addEventListener('blur', this.onBlurFormControl, true);
    document.addEventListener('change', this.onChangeFormGroupInput, true);
    document.addEventListener('change', this.onChangeFileInput, true);
  }

  private initFormControls(root: ParentNode): void {
    root.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
      MaterialDesignInitService.FORM_CONTROL_SELECTOR
    ).forEach((input) => {
      if (input.hasAttribute(MaterialDesignInitService.INPUT_PROC_ATTR)) {
        return;
      }
      input.setAttribute(MaterialDesignInitService.INPUT_PROC_ATTR, 'true');
      syncFormGroupEmptyState(input);
      const formGroup = input.closest('.form-group');
      if (formGroup?.querySelector('input[type=file]')) {
        formGroup.classList.add('is-fileinput');
      }
    });
  }

  private bindRipplesIn(root: ParentNode): void {
    root.querySelectorAll<HTMLElement>(MaterialDesignInitService.RIPPLE_SELECTOR).forEach((el) => {
      this.bindRipple(el);
    });
  }

  private bindRipple(element: HTMLElement): void {
    if (this.boundRippleElements.has(element) || element.hasAttribute(MaterialDesignInitService.BOUND_ATTR)) {
      return;
    }
    this.boundRippleElements.add(element);
    element.setAttribute(MaterialDesignInitService.BOUND_ATTR, 'true');

    const onStart = (event: MouseEvent | TouchEvent) => {
      if (isTouchDevice() && event.type === 'mousedown') {
        return;
      }
      startRipple(element, event);
    };

    element.addEventListener('mousedown', onStart);
    element.addEventListener('touchstart', onStart, { passive: true });
  }

  private observeDomChanges(): void {
    this.observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) {
            return;
          }
          this.initFormControls(node);
          if (node.matches(MaterialDesignInitService.RIPPLE_SELECTOR)) {
            this.bindRipple(node);
          } else {
            this.bindRipplesIn(node);
          }
        });
      }
    });
    this.observer.observe(document.body, { childList: true, subtree: true });
  }
}

function syncFormGroupEmptyState(
  input: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
): void {
  const formGroup = input.closest('.form-group');
  if (!formGroup) {
    return;
  }
  if (input.value === '') {
    formGroup.classList.add('is-empty');
  } else {
    formGroup.classList.remove('is-empty');
  }
}

function isPrintableKey(event: KeyboardEvent): boolean {
  if (event.which === undefined) {
    return true;
  }
  if (typeof event.which === 'number' && event.which > 0) {
    return (
      !event.ctrlKey &&
      !event.metaKey &&
      !event.altKey &&
      event.which !== 8 &&
      event.which !== 9 &&
      event.which !== 13 &&
      event.which !== 16 &&
      event.which !== 17 &&
      event.which !== 20 &&
      event.which !== 27
    );
  }
  return false;
}

function isTouchDevice(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function startRipple(host: HTMLElement, event: MouseEvent | TouchEvent): void {
  let container = host.querySelector<HTMLElement>('.ripple-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'ripple-container';
    host.appendChild(container);
  }

  const pos = getRipplePosition(container, event);
  if (pos.relX === null || pos.relY === null) {
    return;
  }

  const ripple = document.createElement('div');
  ripple.className = 'ripple';
  ripple.style.left = `${pos.relX}px`;
  ripple.style.top = `${pos.relY}px`;
  ripple.style.backgroundColor = host.dataset['rippleColor'] ?? getComputedStyle(host).color;
  container.appendChild(ripple);

  void getComputedStyle(ripple).opacity;

  const scale = getRippleScale(host, ripple);
  ripple.style.transform = `scale(${scale})`;
  ripple.classList.add('ripple-on');
  ripple.dataset['animating'] = 'on';
  ripple.dataset['mousedown'] = 'on';

  window.setTimeout(() => {
    ripple.dataset['animating'] = 'off';
    if (ripple.dataset['mousedown'] === 'off') {
      fadeRippleOut(ripple);
    }
  }, 500);

  const onEnd = () => {
    ripple.dataset['mousedown'] = 'off';
    if (ripple.dataset['animating'] === 'off') {
      fadeRippleOut(ripple);
    }
    host.removeEventListener('mouseup', onEnd);
    host.removeEventListener('mouseleave', onEnd);
    host.removeEventListener('touchend', onEnd);
  };

  host.addEventListener('mouseup', onEnd);
  host.addEventListener('mouseleave', onEnd);
  host.addEventListener('touchend', onEnd);
}

function getRipplePosition(
  container: HTMLElement,
  event: MouseEvent | TouchEvent
): { relX: number | null; relY: number | null } {
  const rect = container.getBoundingClientRect();

  if (!isTouchDevice() && event instanceof MouseEvent) {
    return {
      relX: event.clientX - rect.left,
      relY: event.clientY - rect.top,
    };
  }

  const touch = (event as TouchEvent).touches[0] ?? (event as TouchEvent).changedTouches[0];
  if (!touch) {
    return { relX: null, relY: null };
  }
  return {
    relX: touch.clientX - rect.left,
    relY: touch.clientY - rect.top,
  };
}

function getRippleScale(host: HTMLElement, ripple: HTMLElement): number {
  const hostSize = Math.max(host.offsetWidth, host.offsetHeight);
  const rippleSize = ripple.offsetWidth || 20;
  return (hostSize / rippleSize) * 2.5;
}

function fadeRippleOut(ripple: HTMLElement): void {
  ripple.classList.add('ripple-out');
  const remove = () => ripple.remove();
  ripple.addEventListener('transitionend', remove, { once: true });
  ripple.addEventListener('webkitTransitionEnd', remove, { once: true });
}

import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import type { KbNamespace } from '../../models/kb-types';

@Component({
  selector: 'appdashboard-kb-selected-namespace-header',
  templateUrl: './kb-selected-namespace-header.component.html',
  styleUrls: ['./kb-selected-namespace-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KbSelectedNamespaceHeaderComponent {
  @Input() selectedNamespace: KbNamespace | null = null;
  @Input() namespaceIsEditable = false;

  @Output() installOnWebsite = new EventEmitter<void>();
  @Output() mouseOverName = new EventEmitter<void>();
  @Output() mouseOutName = new EventEmitter<void>();
  @Output() clickName = new EventEmitter<void>();

  @Output() nameKeypress = new EventEmitter<KeyboardEvent>();
  @Output() nameFocus = new EventEmitter<string>();
  @Output() nameChange = new EventEmitter<string>();
  @Output() nameBlur = new EventEmitter<FocusEvent>();

  onMouseOver(): void {
    this.mouseOverName.emit();
  }

  onMouseOut(): void {
    this.mouseOutName.emit();
  }

  onClickName(): void {
    this.clickName.emit();
  }

  onKeypress(event: KeyboardEvent): void {
    this.nameKeypress.emit(event);
  }

  onFocus(value: string): void {
    this.nameFocus.emit(value);
  }

  onChange(value: string): void {
    this.nameChange.emit(value);
  }

  onBlur(event: FocusEvent): void {
    this.nameBlur.emit(event);
  }

  onInstallOnWebsite(): void {
    this.installOnWebsite.emit();
  }
}


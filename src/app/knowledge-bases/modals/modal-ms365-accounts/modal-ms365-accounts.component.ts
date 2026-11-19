import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

/** "Microsoft 365 accounts" dialog, opened from the KB page header. Closes with { changed, cascade }. */
@Component({
  selector: 'modal-ms365-accounts',
  templateUrl: './modal-ms365-accounts.component.html',
  styleUrls: ['./modal-ms365-accounts.component.scss']
})
export class ModalMs365AccountsComponent {
  private changed = false;
  private cascade = false;

  constructor(public dialogRef: MatDialogRef<ModalMs365AccountsComponent>) { }

  onChanged(ev: { cascade: boolean }) {
    this.changed = true;
    this.cascade = this.cascade || !!(ev && ev.cascade);
  }

  close() {
    this.dialogRef.close({ changed: this.changed, cascade: this.cascade });
  }
}

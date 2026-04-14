import { Injectable } from '@angular/core';
import { NotifyService } from 'app/core/notify.service';
import Swal from 'sweetalert2';

@Injectable({ providedIn: 'root' })
export class Home2ModalService {
  constructor(private notify: NotifyService) {}

  fire(options: any): Promise<any> {
    return Swal.fire(options);
  }

  displayContactUsModal(open: boolean, reason: string): void {
    this.notify._displayContactUsModal(open, reason);
  }

  presentOnlyOwnerCanManageAccountPlan(message: string, learnMoreLabel: string): void {
    this.notify.presentModalOnlyOwnerCanManageTheAccountPlan(message, learnMoreLabel);
  }
}


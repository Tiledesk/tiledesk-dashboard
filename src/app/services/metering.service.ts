import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { CreditsService } from './credits.service';
import { CREDITS_ERROR_CODES, CREDITS_REFUSAL_TEXTS, ProjectMetering } from 'app/utils/metering.util';

interface CurrentMetering {
  projectId: string | null;
  metering: ProjectMetering;
}

@Injectable({
  providedIn: 'root'
})
export class MeteringService {

  private current = new BehaviorSubject<CurrentMetering>({ projectId: null, metering: 'quotes' });
  isCredits$: Observable<boolean> = this.current.pipe(map((c) => c.metering === 'credits'), distinctUntilChanged());

  /** Codes of the refusals shown or waiting: the same code is never shown twice at the same time */
  private pendingRefusals: number[] = [];
  private alertOpen = false;

  constructor(
    private creditsService: CreditsService,
    private router: Router,
    private translate: TranslateService
  ) {
    this.creditsService.metering$.subscribe((value) => {
      if (value && value.projectId === this.current.value.projectId) {
        this.current.next(value);
      }
    });
  }

  /** Called by ProjectPlanService with the fresh project object */
  setProject(projectId: string, metering: ProjectMetering) {
    console.log('[METERING-DEBUG] MeteringService.setProject', projectId, metering);
    this.current.next({ projectId, metering });
  }

  get isCredits(): boolean {
    return this.current.value.metering === 'credits';
  }

  private currentProjectId(): string | null {
    const match = this.router.url.match(/\/project\/([^\/?#]+)/);
    return match ? match[1] : null;
  }

  /**
   * The server refused an operation for the credits. The same refusal is shown once at a time (several requests can
   * fail together); a different one waits for the alert in view to be closed. The alert has the way to the credits page.
   */
  presentCreditsRefused(code: number) {
    if (!this.currentProjectId() || this.pendingRefusals.includes(code)) {
      return;
    }
    this.pendingRefusals.push(code);
    this.showNextRefusal();
  }

  private showNextRefusal() {
    if (this.alertOpen || !this.pendingRefusals.length) {
      return;
    }
    const texts = CREDITS_REFUSAL_TEXTS[this.pendingRefusals[0]] || CREDITS_REFUSAL_TEXTS[CREDITS_ERROR_CODES.INSUFFICIENT_CREDITS];
    this.alertOpen = true;
    Swal.fire({
      title: this.translate.instant(texts.title),
      text: this.translate.instant(texts.text),
      icon: 'warning',
      showCancelButton: true,
      cancelButtonText: this.translate.instant('Cancel'),
      confirmButtonText: this.translate.instant('Credits.SeeCosts'),
      reverseButtons: true,
    }).then((result) => {
      this.alertOpen = false;
      const projectId = this.currentProjectId();
      if (result.isConfirmed && projectId) {
        // the credits page explains the costs: the refusals still waiting are dropped
        this.pendingRefusals = [];
        this.router.navigate(['/project', projectId, 'credits']);
      } else {
        this.pendingRefusals.shift();
        this.showNextRefusal();
      }
    });
  }
}

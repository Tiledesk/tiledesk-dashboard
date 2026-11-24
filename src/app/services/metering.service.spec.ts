import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import Swal from 'sweetalert2';
import { CreditsService } from './credits.service';
import { MeteringService } from './metering.service';
import { CREDITS_ERROR_CODES, ProjectMetering } from 'app/utils/metering.util';

describe('MeteringService', () => {
  let service: MeteringService;
  let metering$: BehaviorSubject<{ projectId: string; metering: ProjectMetering } | null>;
  let router: { url: string; navigate: jasmine.Spy };

  beforeEach(() => {
    metering$ = new BehaviorSubject<{ projectId: string; metering: ProjectMetering } | null>(null);
    router = { url: '/project/p1/home', navigate: jasmine.createSpy('navigate') };
    TestBed.configureTestingModule({
      providers: [
        MeteringService,
        { provide: CreditsService, useValue: { metering$ } },
        { provide: Router, useValue: router },
        { provide: TranslateService, useValue: { instant: (k: string) => k } },
      ]
    });
    service = TestBed.inject(MeteringService);
  });

  it('is not credits before a project is set', () => {
    expect(service.isCredits).toBe(false);
  });

  it('follows the metering of the project object', () => {
    service.setProject('p1', 'credits');
    expect(service.isCredits).toBe(true);
    service.setProject('p2', 'quotes');
    expect(service.isCredits).toBe(false);
  });

  it('follows the credits API for the current project', () => {
    service.setProject('p1', 'quotes');
    metering$.next({ projectId: 'p1', metering: 'credits' });
    expect(service.isCredits).toBe(true);
  });

  it('ignores the credits API of another project', () => {
    service.setProject('p1', 'quotes');
    metering$.next({ projectId: 'p2', metering: 'credits' });
    expect(service.isCredits).toBe(false);
  });

  describe('presentCreditsRefused', () => {
    let fire: jasmine.Spy;

    beforeEach(() => {
      fire = spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: false }) as any);
    });

    const flush = () => new Promise((resolve) => setTimeout(resolve));

    it('shows the same refusal once when several requests fail together', () => {
      service.presentCreditsRefused(CREDITS_ERROR_CODES.INSUFFICIENT_CREDITS);
      service.presentCreditsRefused(CREDITS_ERROR_CODES.INSUFFICIENT_CREDITS);
      expect(fire).toHaveBeenCalledTimes(1);
    });

    it('shows a different refusal after the alert in view is closed, never two together', async () => {
      let close: (result: any) => void;
      fire.and.returnValue(new Promise((resolve) => { close = resolve; }) as any);
      service.presentCreditsRefused(CREDITS_ERROR_CODES.INSUFFICIENT_CREDITS);
      service.presentCreditsRefused(CREDITS_ERROR_CODES.TRIAL_ENDED);
      expect(fire).toHaveBeenCalledTimes(1);

      close({ isConfirmed: false });
      await flush();
      expect(fire).toHaveBeenCalledTimes(2);
      expect((fire.calls.mostRecent().args[0] as any).title).toBe('Credits.TrialEndedTitle');
    });

    it('ignores a code that is waiting and shows it again once it was closed', async () => {
      let close: (result: any) => void;
      fire.and.returnValue(new Promise((resolve) => { close = resolve; }) as any);
      service.presentCreditsRefused(CREDITS_ERROR_CODES.INSUFFICIENT_CREDITS);
      service.presentCreditsRefused(CREDITS_ERROR_CODES.TRIAL_ENDED);
      service.presentCreditsRefused(CREDITS_ERROR_CODES.TRIAL_ENDED);
      close({ isConfirmed: false });
      await flush();
      expect(fire).toHaveBeenCalledTimes(2);

      fire.and.returnValue(Promise.resolve({ isConfirmed: false }) as any);
      service.presentCreditsRefused(CREDITS_ERROR_CODES.INSUFFICIENT_CREDITS);
      expect(fire).toHaveBeenCalledTimes(3);
    });

    it('goes to the credits page on confirm and drops the refusals still waiting', async () => {
      fire.and.returnValue(Promise.resolve({ isConfirmed: true }) as any);
      service.presentCreditsRefused(CREDITS_ERROR_CODES.INSUFFICIENT_CREDITS);
      service.presentCreditsRefused(CREDITS_ERROR_CODES.DAILY_LIMIT);
      await flush();
      expect(router.navigate).toHaveBeenCalledWith(['/project', 'p1', 'credits']);
      expect(fire).toHaveBeenCalledTimes(1);
    });

    it('uses the texts of the trial ended refusal', () => {
      service.presentCreditsRefused(CREDITS_ERROR_CODES.TRIAL_ENDED);
      const options: any = fire.calls.mostRecent().args[0];
      expect(options.title).toBe('Credits.TrialEndedTitle');
      expect(options.text).toBe('Credits.TrialEndedText');
    });

    it('does nothing outside a project page', () => {
      router.url = '/login';
      service.presentCreditsRefused(CREDITS_ERROR_CODES.INSUFFICIENT_CREDITS);
      expect(fire).not.toHaveBeenCalled();
    });
  });
});

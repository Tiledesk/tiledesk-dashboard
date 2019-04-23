import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';
import { Location } from '@angular/common';
import { Subscription } from 'rxjs/Subscription';

@Injectable()
export class ProjectProfileGuard implements CanActivate {

  constructor(
    private auth: AuthService,
    private router: Router,
    public location: Location
  ) {
    console.log('HELLO PROJECT-PROFILE GUARD !!!')
  }


  async canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {

    // console.log('»> »> PROJECT-PROFILE GUARD  canActivate next ', next)
    // console.log('»> »> PROJECT-PROFILE GUARD  canActivate state ', state)
    const prjct_id = next.params.projectid
    console.log('»> »> PROJECT-PROFILE GUARD canActivate next > ****** PRJCT ID ****** ', prjct_id)
    const url = state.url
    console.log('»> »> PROJECT-PROFILE GUARD canActivate state > ****** URL ****** ', url)

    let trial_expired = await this.auth.checkTrialExpired();
    console.log('»> »> PROJECT-PROFILE GUARD canActivate await (from checkTrialExpired IN auth) trial expired: ********** ', trial_expired);

    if (trial_expired === undefined) {
      const storedProjectJson = localStorage.getItem(prjct_id);

      if (storedProjectJson !== null) {
        const storedProjectObject = JSON.parse(storedProjectJson);
        trial_expired = storedProjectObject.trial_expired
        console.log('»> »> PROJECT-PROFILE GUARD canActivate ******  (from stored) TRIAL EXPIRED ****** ', trial_expired)
      }
    }

    let authorized: boolean

    trial_expired === true ? authorized = false : authorized = true;

    if (!authorized) {

      this.router.navigate([url + '-demo']);

    }
    return authorized;

  }

}

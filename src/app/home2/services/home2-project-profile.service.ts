import { Injectable } from '@angular/core';
import { AuthService } from 'app/core/auth.service';

@Injectable({ providedIn: 'root' })
export class Home2ProjectProfileService {
  constructor(private auth: AuthService) {}

  setProfileNameForSegment(profileName: string): void {
    this.auth.projectProfile(profileName);
  }
}


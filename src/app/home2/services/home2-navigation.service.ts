import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class Home2NavigationService {
  constructor(private router: Router) {}

  goToCreateNewProject(): void {
    this.router.navigate(['/create-new-project']);
  }

  goToBotsAll(projectId: string): void {
    this.router.navigate([`project/${projectId}/bots/my-chatbots/all`]);
  }

  goToIntegrationsWhatsApp(projectId: string): void {
    this.router.navigate([`project/${projectId}/integrations`], { queryParams: { name: 'whatsapp' } });
  }

  goToPricing(projectId: string): void {
    this.router.navigate([`project/${projectId}/pricing`]);
  }

  goToPayments(projectId: string): void {
    this.router.navigate([`project/${projectId}/project-settings/payments`]);
  }

  goToProjectSettingsGeneral(projectId: string): void {
    this.router.navigate([`project/${projectId}/project-settings/general`]);
  }

  goToOperatingHours(projectId: string): void {
    this.router.navigate([`project/${projectId}/hours`]);
  }

  openExternal(url: string): void {
    window.open(url, '_blank');
  }

  openMailTo(url: string): void {
    window.open(url);
  }
}


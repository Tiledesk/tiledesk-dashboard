import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'appdashboard-onboarding2',
  templateUrl: './onboarding2.component.html',
  styleUrls: ['./onboarding2.component.scss'],
})
export class Onboarding2Component implements OnInit {
  projectId: string;

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.projectId = this.route.snapshot?.params?.projectid;
  }

  goToKnowledgeBases(): void {
    if (!this.projectId) return;
    this.router.navigate([`/project/${this.projectId}/knowledge-bases`]);
  }
}


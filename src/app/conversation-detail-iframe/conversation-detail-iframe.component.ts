import { Component, OnInit, OnDestroy } from '@angular/core';
import { AppConfigService } from '../services/app-config.service';
import { LoggerService } from '../services/logger/logger.service';
import { Router, NavigationStart } from '@angular/router';
import { ConversationDetailIframeService } from '../services/conversation-detail-iframe.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-conversation-detail-iframe',
  templateUrl: './conversation-detail-iframe.component.html',
  styleUrls: ['./conversation-detail-iframe.component.scss']
})
export class ConversationDetailIframeComponent implements OnInit, OnDestroy {
  
  // Tracking istanza componente per badge debug
  private static instanceCounter = 0;
  public componentInstanceId: number;
  public componentCreatedAt: Date;
  public componentCreatedAtFormatted: string;
  
  // Flag per mostrare/nascondere badge debug
  public showDebugBadge = false;
  
  // Contatore reload iframe per badge
  public iframeLoadCount = 0;
  
  constructor(
    public appConfigService: AppConfigService,
    private logger: LoggerService,
    private iframeService: ConversationDetailIframeService,
    private router: Router
  ) {
    ConversationDetailIframeComponent.instanceCounter++;
    this.componentInstanceId = ConversationDetailIframeComponent.instanceCounter;
    this.componentCreatedAt = new Date();
    this.componentCreatedAtFormatted = this.componentCreatedAt.toLocaleTimeString('it-IT');
    
    this.setupNavigationListener();
  }

  /**
   * Setup listener per navigazione
   * Mostra/nasconde iframe automaticamente in base alla route corrente
   */
  private setupNavigationListener(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationStart)
    ).subscribe((event: NavigationStart) => {
      const url = event.url;
      
      if (url.includes('/conversation-detail')) {
        // Navigando VERSO questa route
        this.iframeService.show();
        
        // Aggiorna contatore badge
        setTimeout(() => {
          this.iframeLoadCount = this.iframeService.getLoadCount();
        }, 100);
      } else {
        // Navigando VIA da questa route
        this.iframeService.hide();
      }
    });
  }

  ngOnInit() {
    this.logger.log('[CONVERSATION-DETAIL-IFRAME] Componente inizializzato');
    
    // Mostra iframe globale (gestito dal service)
    this.iframeService.show();
    
    // Aggiorna contatore per badge debug
    this.iframeLoadCount = this.iframeService.getLoadCount();
  }

  ngAfterViewInit() {
    // Aggiorna contatore per badge
    this.iframeLoadCount = this.iframeService.getLoadCount();
  }

  ngOnDestroy() {
    this.logger.log('[CONVERSATION-DETAIL-IFRAME] Componente distrutto');
    // Nascondi iframe (gestito dal service)
    this.iframeService.hide();
  }

  /**
   * Force reload - Usa il service per ricaricare l'iframe
   */
  forceReload(): void {
    this.iframeService.forceReload();
    this.iframeLoadCount = this.iframeService.getLoadCount();
  }
}


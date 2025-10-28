import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AppConfigService } from '../services/app-config.service';
import { LoggerService } from '../services/logger/logger.service';
import { RouteReuseStrategy, Router, NavigationStart } from '@angular/router';
import { CustomRouteReuseStrategy } from '../utils/custom-route-reuse-strategy';
import { environment } from '../../environments/environment';
import { ConversationDetailIframeService } from '../services/conversation-detail-iframe.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-conversation-detail-iframe',
  templateUrl: './conversation-detail-iframe.component.html',
  styleUrls: ['./conversation-detail-iframe.component.scss']
})
export class ConversationDetailIframeComponent implements OnInit, OnDestroy {
  CONVERSATION_DETAIL_URL: SafeResourceUrl;
  actualHeight: any;
  navbarAndFooterHeight = 67;
  newInnerHeight: any;
  iframeHeight: any;

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
    private sanitizer: DomSanitizer,
    public appConfigService: AppConfigService,
    private logger: LoggerService,
    private routeReuseStrategy: RouteReuseStrategy,
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
    this.getAndSanitizeConversationDetailUrl();
    this.onInitframeHeight();
    
    // Mostra iframe globale
    this.iframeService.show();
    
    // Aggiorna contatore per badge
    this.iframeLoadCount = this.iframeService.getLoadCount();
  }

  ngAfterViewInit() {
    // Aggiorna contatore per badge
    this.iframeLoadCount = this.iframeService.getLoadCount();
  }

  ngOnDestroy() {
    this.logger.log('[CONVERSATION-DETAIL-IFRAME] Componente distrutto');
    
    // Nascondi iframe
    this.iframeService.hide();
  }

  getAndSanitizeConversationDetailUrl() {
    const conversationDetailUrl = 'https://stage.eks.tiledesk.com/chat/#/conversation-detail/';
    this.CONVERSATION_DETAIL_URL = this.sanitizer.bypassSecurityTrustResourceUrl(conversationDetailUrl);
    this.logger.log('[CONVERSATION-DETAIL-IFRAME] URL:', conversationDetailUrl);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.newInnerHeight = event.target.innerHeight;
    this.iframeHeight = this.newInnerHeight - this.navbarAndFooterHeight;
  }

  onInitframeHeight(): any {
    this.actualHeight = window.innerHeight;
    this.logger.log('[CONVERSATION-DETAIL-IFRAME] ACTUAL HEIGHT', this.actualHeight);
    this.iframeHeight = this.actualHeight - this.navbarAndFooterHeight;
    this.logger.log('[CONVERSATION-DETAIL-IFRAME] ON INIT -> IFRAME HEIGHT', this.iframeHeight);
    return { 'height': this.iframeHeight += 'px' };
  }

  /**
   * Force reload - Usa il service per ricaricare l'iframe
   */
  forceReload(): void {
    this.iframeService.forceReload();
    this.iframeLoadCount = this.iframeService.getLoadCount();
  }
}

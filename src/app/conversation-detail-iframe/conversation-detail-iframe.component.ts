import { Component, OnInit, OnDestroy } from '@angular/core';
import { AppConfigService } from '../services/app-config.service';
import { LoggerService } from '../services/logger/logger.service';
import { Router, NavigationStart,ActivatedRoute } from '@angular/router';
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
  
  private messageHandler: (event: MessageEvent) => void;

  constructor(
    public appConfigService: AppConfigService,
    private logger: LoggerService,
    private iframeService: ConversationDetailIframeService,
    private router: Router,
    private route: ActivatedRoute

  ) {
    ConversationDetailIframeComponent.instanceCounter++;
    this.componentInstanceId = ConversationDetailIframeComponent.instanceCounter;
    this.componentCreatedAt = new Date();
    this.componentCreatedAtFormatted = this.componentCreatedAt.toLocaleTimeString('it-IT');
    
    this.setupNavigationListener();
    this.setupPostMessageListener();
  }

  /**
   * Sottoscrizione a postMessage per event onConversationChanged
   */
  private setupPostMessageListener(): void {
    this.messageHandler = (event: MessageEvent) => {
      const type = event?.data?.type
      const conversation = event?.data?.data;
      this.logger.log('[CONVERSATION-DETAIL-IFRAME] onConversationChanged:', event);
      if (type === 'onConversationChanged' && conversation) {
        this.logger.log('[CONVERSATION-DETAIL-IFRAME] onConversationChanged:', conversation);
        this.updateRouteFromConversation(conversation);
      }
    };
    window.addEventListener('message', this.messageHandler);
  }

  /**
   * Aggiorna i parametri della route corrente in base alla conversation ricevuta
   */
  private updateRouteFromConversation(conversation: any): void {
    const idConv = conversation.uid ?? conversation.request_id ?? conversation.id;
    const fullNameConv = conversation.conversation_with_fullname ?? conversation.lead?.fullname ?? '';
    const convType = conversation.archived === false ? 'active' : 'archived';

    if (!idConv) {
      this.logger.warn('[CONVERSATION-DETAIL-IFRAME] onConversationChanged: id conversation non trovato');
      return;
    }

    const projectId = this.route.snapshot.params['projectid'] ?? this.route.parent?.snapshot?.params['projectid'];
    const navCommands = projectId
      ? ['project', projectId, 'conversation-detail', idConv, fullNameConv, convType]
      : ['conversation-detail', idConv, fullNameConv, convType];

    this.router.navigate(navCommands, { replaceUrl: true });
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
        // Prima: this.iframeService.show() — poteva inizializzare l’iframe senza route.params (NavigationStart prima di ngOnInit).
        // this.iframeService.show();
        this.iframeService.revealContainerIfInitialized();

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
    // this.iframeService.show();

    // Leggi parametri di route (IDConv, Convtype, FullNameConv) e passali al service
    this.route.params.subscribe(params => {
      const routeParams = {
        IDConv: params['IDConv'] || undefined,
        Convtype: params['Convtype'] || undefined,
        FullNameConv: params['FullNameConv'] || undefined
      };
      this.logger.log('[CONVERSATION-DETAIL-IFRAME] Route params:', routeParams);
      this.iframeService.show(routeParams);
    });

    
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


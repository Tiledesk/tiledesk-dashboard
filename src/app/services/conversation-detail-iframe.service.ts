import { Injectable } from '@angular/core';
import { AppConfigService } from './app-config.service';

/**
 * Service che gestisce iframe globale
 * 
 * L'iframe viene creato NEL BODY, FUORI dal controllo di Angular.
 * Angular può solo mostrare/nascondere il container, ma NON può mai:
 * - Distruggere l'iframe
 * - Ricrearlo
 * - Causare reload
 */
@Injectable({
  providedIn: 'root'
})
export class ConversationDetailIframeService {
  
  // Riferimenti agli elementi DOM globali
  private iframeContainer: HTMLDivElement | null = null;
  private iframeElement: HTMLIFrameElement | null = null;
  
  // Stato
  private isVisible = false;
  private isInitialized = false;
  
  // Configurazione
  private IFRAME_URL: string;
  private readonly CONTAINER_ID = 'global-iframe-container';
  
  // Contatore per debug
  private loadCount = 0;

  CHAT_BASE_URL: string;
  
  
  constructor(
    public appConfigService: AppConfigService
  ) {}

  /**
   * Inizializza il container globale e l'iframe
   * Chiamato automaticamente alla prima show()
   */
  private initialize(): void {
    if (this.isInitialized) {
      return;
    }
    
    this.CHAT_BASE_URL = this.appConfigService.getConfig().CHAT_BASE_URL;
    this.IFRAME_URL = this.CHAT_BASE_URL + '#/conversation-detail/?tiledesk_supportMode=true';
    
    this.createGlobalContainer();
    this.createGlobalIframe();
    
    this.isInitialized = true;
  }

  /**
   * Crea container globale nel body
   */
  private createGlobalContainer(): void {
    const existing = document.getElementById(this.CONTAINER_ID);
    if (existing) {
      this.iframeContainer = existing as HTMLDivElement;
      return;
    }
    
    this.iframeContainer = document.createElement('div');
    this.iframeContainer.id = this.CONTAINER_ID;
    
    // Stili per il container
    this.iframeContainer.style.position = 'fixed';
    this.iframeContainer.style.top = '0px';
    this.iframeContainer.style.left = '0';
    this.iframeContainer.style.width = '100%';
    this.iframeContainer.style.height = 'calc(100vh - 0px)';
    this.iframeContainer.style.zIndex = '999';
    this.iframeContainer.style.display = 'none';
    this.iframeContainer.style.backgroundColor = '#fff';
    
    document.body.appendChild(this.iframeContainer);
  }

  /**
   * Crea iframe nel container globale
   */
  private createGlobalIframe(): void {
    if (this.iframeElement) {
      return;
    }
    
    this.iframeElement = document.createElement('iframe');
    
    // Configurazione iframe
    this.iframeElement.src = this.IFRAME_URL;
    this.iframeElement.style.width = '100%';
    this.iframeElement.style.height = '100%';
    this.iframeElement.style.border = 'none';
    this.iframeElement.style.display = 'block';
    
    this.iframeElement.setAttribute('frameBorder', '0');
    this.iframeElement.setAttribute('allowfullscreen', '');
    this.iframeElement.setAttribute('id', 'global-conversation-iframe');
    
    // Setup listener per contatore
    this.setupLoadListener();
    
    // Attacca al container
    this.iframeContainer!.appendChild(this.iframeElement);
  }

  /**
   * Setup listener per contare i load
   */
  private setupLoadListener(): void {
    if (!this.iframeElement) { return; }

    this.iframeElement.addEventListener('load', () => {
      this.loadCount++;
    });
  }

  /**
   * Mostra iframe
   */
  public show(): void {
    if (!this.isInitialized) {
      this.initialize();
    }
    
    if (this.iframeContainer) {
      this.iframeContainer.style.display = 'block';
      this.isVisible = true;
    }
  }

  /**
   * Nascondi iframe
   */
  public hide(): void {
    if (this.iframeContainer) {
      this.iframeContainer.style.display = 'none';
      this.isVisible = false;
    }
  }

  /**
   * Verifica se iframe è visibile
   */
  public isIframeVisible(): boolean {
    return this.isVisible;
  }

  /**
   * Ottieni contatore load per debug
   */
  public getLoadCount(): number {
    return this.loadCount;
  }

  /**
   * Forza reload iframe
   */
  public forceReload(): void {
    if (this.iframeElement) {
      this.iframeElement.src = this.iframeElement.src;
    }
  }

  /**
   * Cleanup completo
   */
  public destroy(): void {
    if (this.iframeContainer && this.iframeContainer.parentNode) {
      this.iframeContainer.parentNode.removeChild(this.iframeContainer);
    }
    
    this.iframeContainer = null;
    this.iframeElement = null;
    this.isInitialized = false;
    this.isVisible = false;
    this.loadCount = 0;
  }
}


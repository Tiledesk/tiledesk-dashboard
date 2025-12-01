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
  private urlManuallySet = false; // Flag per indicare se l'URL è stato impostato manualmente
  
  // Configurazione
  private IFRAME_URL: string;
  private readonly CONTAINER_ID = 'global-iframe-container';
  private readonly STORAGE_KEY = 'conversation-detail-iframe-url'; // Chiave per sessionStorage
  
  // Contatore per debug
  private loadCount = 0;

  CHAT_BASE_URL: string;
  
  
  constructor(
    public appConfigService: AppConfigService
  ) {}

  /**
   * Normalizza CHAT_BASE_URL rimuovendo eventuali percorsi hash esistenti
   * @param baseUrl URL base da normalizzare
   * @returns URL base senza percorsi hash
   */
  private normalizeBaseUrl(baseUrl: string): string {
    let normalized = baseUrl;
    console.log('[CONVERSATION-DETAIL-IFRAME-SERVICE] normalizeBaseUrl - baseUrl:', baseUrl);
    // Rimuovi #/chat/ se presente alla fine (con slash finale)
    if (normalized.endsWith('#/chat/')) {
      normalized = normalized.replace(/#\/chat\/$/, '');
    }
    // Rimuovi #/chat se presente alla fine (senza slash finale)
    if (normalized.endsWith('#/chat')) {
      normalized = normalized.replace(/#\/chat$/, '');
    }
    // Rimuovi #/conversation-detail/ se presente alla fine
    if (normalized.endsWith('#/conversation-detail/')) {
      normalized = normalized.replace(/#\/conversation-detail\/$/, '');
    }
    // Rimuovi anche #/conversation-detail senza slash finale
    if (normalized.endsWith('#/conversation-detail')) {
      normalized = normalized.replace(/#\/conversation-detail$/, '');
    }
    return normalized;
  }

  /**
   * Inizializza il container globale e l'iframe
   * Chiamato automaticamente alla prima show()
   */
  private initialize(): void {
    if (this.isInitialized) {
      return;
    }
    
    this.CHAT_BASE_URL = this.appConfigService.getConfig().CHAT_BASE_URL;
    const normalizedBaseUrl = this.normalizeBaseUrl(this.CHAT_BASE_URL);
    
    // Prova a ripristinare l'URL salvato in sessionStorage (dopo un refresh)
    const savedUrl = sessionStorage.getItem(this.STORAGE_KEY);
    if (savedUrl) {
      this.IFRAME_URL = savedUrl;
      this.urlManuallySet = true; // Imposta il flag perché l'URL è stato ripristinato
      console.log('[CONVERSATION-DETAIL-IFRAME-SERVICE] initialize - URL ripristinato da sessionStorage:', savedUrl);
    } else {
      // URL di default se non c'è un URL salvato
      this.IFRAME_URL = normalizedBaseUrl + '#/conversation-detail/';
    }
    
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
    this.iframeContainer.style.height = '100vh';
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
    
    // Listener per rilevare i cambiamenti dell'URL dell'iframe quando l'utente naviga all'interno dell'iframe
    // Questo permette di salvare l'URL quando l'utente seleziona un'altra conversazione dalla chat
    // In produzione (stesso dominio) possiamo accedere a contentWindow.location.href
    this.iframeElement.addEventListener('load', () => {
      // Usa un piccolo delay per assicurarsi che l'iframe sia completamente caricato
      setTimeout(() => {
        if (this.iframeElement && this.iframeElement.contentWindow) {
          try {
            // Prova ad accedere all'URL dell'iframe (funziona se stesso dominio, fallisce se cross-origin)
            const currentUrl = this.iframeElement.contentWindow.location.href;
            
            // Verifica se l'URL contiene un ID conversazione (non è l'URL generico)
            if (currentUrl && currentUrl.includes('/conversation-detail/')) {
              const urlParts = currentUrl.split('/conversation-detail/');
              if (urlParts.length > 1 && urlParts[1].split('/').length > 0 && urlParts[1].split('/')[0].trim() !== '') {
                // L'URL contiene un ID conversazione, aggiorna quello salvato
                this.IFRAME_URL = currentUrl;
                sessionStorage.setItem(this.STORAGE_KEY, currentUrl);
                this.urlManuallySet = true;
                console.log('[CONVERSATION-DETAIL-IFRAME-SERVICE] iframe load - URL aggiornato e salvato:', currentUrl);
              }
            }
          } catch (e) {
            // Cross-origin error: non possiamo accedere all'URL dell'iframe se è su un dominio diverso
            // In questo caso, usiamo l'attributo src come fallback
            console.log('[CONVERSATION-DETAIL-IFRAME-SERVICE] iframe load - Cross-origin, uso src attribute');
            if (this.iframeElement.src && this.iframeElement.src.includes('/conversation-detail/')) {
              const urlParts = this.iframeElement.src.split('/conversation-detail/');
              if (urlParts.length > 1 && urlParts[1].split('/').length > 0 && urlParts[1].split('/')[0].trim() !== '') {
                this.IFRAME_URL = this.iframeElement.src;
                sessionStorage.setItem(this.STORAGE_KEY, this.iframeElement.src);
                this.urlManuallySet = true;
                console.log('[CONVERSATION-DETAIL-IFRAME-SERVICE] iframe load - URL aggiornato da src:', this.iframeElement.src);
              }
            }
          }
        }
      }, 100); // Delay per assicurarsi che l'iframe sia completamente caricato
    });
    
    // Listener per postMessage dalla chat per notificare cambiamenti di conversazione (fallback)
    // Utile se la chat supporta postMessage per notificare cambiamenti
    window.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'conversation-changed') {
        const conversationUrl = event.data.url;
        if (conversationUrl && conversationUrl.includes('/conversation-detail/')) {
          // Aggiorna l'URL salvato quando la chat notifica un cambio di conversazione
          this.IFRAME_URL = conversationUrl;
          sessionStorage.setItem(this.STORAGE_KEY, conversationUrl);
          this.urlManuallySet = true;
          console.log('[CONVERSATION-DETAIL-IFRAME-SERVICE] postMessage - URL aggiornato e salvato:', conversationUrl);
        }
      }
    });
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
   * Resetta l'URL dell'iframe all'URL generico (senza ID conversazione)
   * @param force Se true, forza il reset anche se l'URL è stato impostato manualmente
   */
  public resetToDefaultUrl(force: boolean = false): void {
    // Non resettare se l'URL è stato impostato manualmente (a meno che non sia forzato)
    console.log('[CONVERSATION-DETAIL-IFRAME-SERVICE] resetToDefaultUrl - chiamato, urlManuallySet:', this.urlManuallySet, 'force:', force);
    if (this.urlManuallySet && !force) {
      console.log('[CONVERSATION-DETAIL-IFRAME-SERVICE] resetToDefaultUrl - URL impostato manualmente, non resetto');
      return;
    }
    console.log('[CONVERSATION-DETAIL-IFRAME-SERVICE] resetToDefaultUrl - Procedendo con il reset');

    if (!this.isInitialized) {
      this.initialize();
    }

    // Assicurati che CHAT_BASE_URL sia inizializzato
    if (!this.CHAT_BASE_URL) {
      this.CHAT_BASE_URL = this.appConfigService.getConfig().CHAT_BASE_URL;
    }

    if (!this.iframeElement) {
      return;
    }

    // URL generico senza ID conversazione
    const defaultUrl = this.CHAT_BASE_URL + '#/conversation-detail/';
    
    // Aggiorna l'URL dell'iframe
    this.iframeElement.src = defaultUrl;
    this.IFRAME_URL = defaultUrl; // Aggiorna anche la variabile interna per coerenza
    
    // Rimuovi l'URL salvato da sessionStorage quando si resetta all'URL generico
    sessionStorage.removeItem(this.STORAGE_KEY);
    console.log('[CONVERSATION-DETAIL-IFRAME-SERVICE] resetToDefaultUrl - URL rimosso da sessionStorage');
    
    // Reset del flag quando si resetta all'URL generico
    this.urlManuallySet = false;
  }

  /**
   * Aggiorna l'URL dell'iframe con l'ID conversazione specifica
   * @param requestId ID della conversazione/request
   * @param requesterFullname Nome completo del richiedente (opzionale)
   * @param status Stato della conversazione: 'active', 'new', ecc. (opzionale, default: 'active')
   */
  public updateConversationUrl(requestId: string, requesterFullname?: string, status: string = 'active'): void {
    console.log('[CONVERSATION-DETAIL-IFRAME-SERVICE] updateConversationUrl - requestId:', requestId, 'requesterFullname:', requesterFullname, 'status:', status);
    if (!this.isInitialized) {
      this.initialize();
    }

    // Assicurati che CHAT_BASE_URL sia inizializzato
    if (!this.CHAT_BASE_URL) {
      this.CHAT_BASE_URL = this.appConfigService.getConfig().CHAT_BASE_URL;
    }

    if (!this.iframeElement) {
      console.error('[CONVERSATION-DETAIL-IFRAME-SERVICE] updateConversationUrl - iframeElement non disponibile');
      return;
    }

    // Assicurati che l'iframe sia visibile prima di impostare l'URL
    // Se l'iframe è nascosto, potrebbe non caricare correttamente l'URL
    if (!this.isVisible && this.iframeContainer) {
      this.iframeContainer.style.display = 'block';
      this.isVisible = true;
      console.log('[CONVERSATION-DETAIL-IFRAME-SERVICE] updateConversationUrl - iframe reso visibile prima di impostare URL');
    }

    // Pulisci il nome se contiene #
    let cleanedFullname = requesterFullname || '';
    if (cleanedFullname && cleanedFullname.indexOf('#') !== -1) {
      cleanedFullname = cleanedFullname.replace(/#/g, '%23'); //to use encode uri component
    }

    // Costruisci l'URL con l'ID conversazione
    // Normalizza CHAT_BASE_URL rimuovendo eventuali percorsi hash esistenti
    const normalizedBaseUrl = this.normalizeBaseUrl(this.CHAT_BASE_URL);
    const baseUrl = normalizedBaseUrl + '#/conversation-detail/';
    console.log('[CONVERSATION-DETAIL-IFRAME-SERVICE] updateConversationUrl - baseUrl:', baseUrl);
    const url = baseUrl + requestId + '/' + (cleanedFullname ? cleanedFullname.trim() : '') + '/' + status;
    console.log('[CONVERSATION-DETAIL-IFRAME-SERVICE] updateConversationUrl - url:', url);

    
    // Aggiorna l'URL dell'iframe
    // Se l'iframe è già caricato con un URL diverso, forziamo il reload impostando src
    const currentSrc = this.iframeElement.src;
    this.iframeElement.src = url;
    this.IFRAME_URL = url; // Aggiorna anche la variabile interna per coerenza
    
    // Se l'URL è cambiato, forziamo il reload dell'iframe per assicurarci che carichi il nuovo URL
    if (currentSrc && currentSrc !== url) {
      // Forza il reload solo se l'URL è effettivamente cambiato
      console.log('[CONVERSATION-DETAIL-IFRAME-SERVICE] updateConversationUrl - URL cambiato da', currentSrc, 'a', url);
      // Non serve fare nulla di più, impostare src forza automaticamente il reload
    }
    
    // Salva l'URL in sessionStorage per ripristinarlo dopo un refresh
    sessionStorage.setItem(this.STORAGE_KEY, url);
    console.log('[CONVERSATION-DETAIL-IFRAME-SERVICE] updateConversationUrl - URL salvato in sessionStorage:', url);
    
    // Imposta il flag per indicare che l'URL è stato impostato manualmente
    // Questo impedirà che resetToDefaultUrl() resetti l'URL quando si naviga alla route
    this.urlManuallySet = true;
    console.log('[CONVERSATION-DETAIL-IFRAME-SERVICE] updateConversationUrl - URL impostato:', url);
    console.log('[CONVERSATION-DETAIL-IFRAME-SERVICE] updateConversationUrl - urlManuallySet impostato a TRUE');
  }

  /**
   * Apre una conversazione esistente (active o archived)
   * @param requestId ID della conversazione/request
   * @param requesterFullname Nome completo del richiedente (opzionale)
   * @param status Stato della conversazione: 'active' o 'archived' (opzionale, default: 'active')
   */
  public openExistingConversation(requestId: string, requesterFullname?: string, status: string = 'active'): void {
    console.log('[CONVERSATION-DETAIL-IFRAME-SERVICE] openExistingConversation - requestId:', requestId, 'requesterFullname:', requesterFullname, 'status:', status);
    this.updateConversationUrl(requestId, requesterFullname, status);
  }

  /**
   * Apre una nuova chat diretta con un agente
   * @param agentId ID dell'agente
   * @param agentFullname Nome completo dell'agente (opzionale)
   */
  public openDirectChat(agentId: string, agentFullname?: string): void {
    console.log('[CONVERSATION-DETAIL-IFRAME-SERVICE] openDirectChat - agentId:', agentId, 'agentFullname:', agentFullname);
    this.updateConversationUrl(agentId, agentFullname, 'new');
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


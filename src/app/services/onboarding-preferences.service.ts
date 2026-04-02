import { Injectable } from '@angular/core';

// ─── Interfacce pubbliche ─────────────────────────────────────────────────────

export interface ChildOrder {
  pos: number;
  type: string;
}

export interface DashletConfig {
  displayAnalyticsConvsGraph: boolean;
  displayAnalyticsIndicators: boolean;
  displayConnectWhatsApp: boolean;
  displayWhatsappAccountWizard: boolean;
  displayCreateChatbot: boolean;
  displayInviteTeammate: boolean;
  displayKnowledgeBase: boolean;
  displayCustomizeWidget: boolean;
  displayNewsFeed: boolean;
  displayKbHeroSection: boolean;
  childListOrder: ChildOrder[];
  solution: string | undefined;
  solutionChannel: string | undefined;
  useCase: string | undefined;
}

// ─── Ordini child di default e per use-case ───────────────────────────────────

const ORDER_DEFAULT: ChildOrder[] = [
  { pos: 1, type: 'child1' }, { pos: 2, type: 'child2' },
  { pos: 3, type: 'child5' }, { pos: 4, type: 'child7' },
  { pos: 5, type: 'child6' }, { pos: 6, type: 'child8' },
  { pos: 7, type: 'child3' }, { pos: 8, type: 'child4' },
];

const ORDER_WA: ChildOrder[] = [
  { pos: 1, type: 'child1' }, { pos: 2, type: 'child2' },
  { pos: 3, type: 'child3' }, { pos: 4, type: 'child4' },
  { pos: 5, type: 'child5' }, { pos: 6, type: 'child7' },
  { pos: 7, type: 'child6' }, { pos: 8, type: 'child8' },
];

const ORDER_WA_SALES: ChildOrder[] = [
  { pos: 1, type: 'child1' }, { pos: 2, type: 'child2' },
  { pos: 3, type: 'child3' }, { pos: 4, type: 'child4' },
  { pos: 5, type: 'child5' }, { pos: 6, type: 'child6' },
  { pos: 7, type: 'child7' }, { pos: 8, type: 'child8' },
];

const ORDER_TALK_WA: ChildOrder[] = [
  { pos: 1, type: 'child1' }, { pos: 2, type: 'child2' },
  { pos: 3, type: 'child3' }, { pos: 4, type: 'child4' },
  { pos: 5, type: 'child6' }, { pos: 6, type: 'child5' },
  { pos: 7, type: 'child7' }, { pos: 8, type: 'child8' },
];

const ORDER_TALK_WEB: ChildOrder[] = [
  { pos: 1, type: 'child1' }, { pos: 2, type: 'child2' },
  { pos: 3, type: 'child6' }, { pos: 4, type: 'child8' },
  { pos: 5, type: 'child5' }, { pos: 6, type: 'child7' },
  { pos: 7, type: 'child3' }, { pos: 8, type: 'child4' },
];

// ─── Configurazioni use-case ──────────────────────────────────────────────────

type UseCaseKey = string; // `${solution}|${channel}|${use_case}`

type UseCaseFlags = Pick<DashletConfig,
  'displayConnectWhatsApp' | 'displayWhatsappAccountWizard' |
  'displayCreateChatbot'   | 'displayInviteTeammate'        |
  'displayKnowledgeBase'   | 'displayCustomizeWidget'
> & { childListOrder: ChildOrder[] };

const USE_CASE_MAP: Record<UseCaseKey, UseCaseFlags> = {
  // UC1 — automate + web + solve
  'want_to_automate_conversations|web_mobile|solve_customer_problems': {
    childListOrder: ORDER_DEFAULT,
    displayConnectWhatsApp: false, displayWhatsappAccountWizard: false,
    displayCreateChatbot: true,    displayInviteTeammate: true,
    displayKnowledgeBase: true,    displayCustomizeWidget: true,
  },
  // UC2 — automate + web + sales
  'want_to_automate_conversations|web_mobile|increase_online_sales': {
    childListOrder: ORDER_DEFAULT,
    displayConnectWhatsApp: false, displayWhatsappAccountWizard: false,
    displayCreateChatbot: true,    displayInviteTeammate: true,
    displayKnowledgeBase: false,   displayCustomizeWidget: true,
  },
  // UC3 — automate + wa + solve
  'want_to_automate_conversations|whatsapp_fb_messenger|solve_customer_problems': {
    childListOrder: ORDER_WA,
    displayConnectWhatsApp: true,  displayWhatsappAccountWizard: true,
    displayCreateChatbot: true,    displayInviteTeammate: true,
    displayKnowledgeBase: true,    displayCustomizeWidget: false,
  },
  // UC4 — automate + wa + sales
  'want_to_automate_conversations|whatsapp_fb_messenger|increase_online_sales': {
    childListOrder: ORDER_WA_SALES,
    displayConnectWhatsApp: true,  displayWhatsappAccountWizard: true,
    displayCreateChatbot: true,    displayInviteTeammate: true,
    displayKnowledgeBase: false,   displayCustomizeWidget: false,
  },
  // UC5 — talk + web + solve
  'want_to_talk_to_customers|web_mobile|solve_customer_problems': {
    childListOrder: ORDER_TALK_WEB,
    displayConnectWhatsApp: false, displayWhatsappAccountWizard: false,
    displayCreateChatbot: true,    displayInviteTeammate: true,
    displayKnowledgeBase: true,    displayCustomizeWidget: true,
  },
  // UC6 — talk + web + sales
  'want_to_talk_to_customers|web_mobile|increase_online_sales': {
    childListOrder: ORDER_TALK_WEB,
    displayConnectWhatsApp: false, displayWhatsappAccountWizard: false,
    displayCreateChatbot: true,    displayInviteTeammate: true,
    displayKnowledgeBase: false,   displayCustomizeWidget: true,
  },
  // UC7 — talk + wa + solve
  'want_to_talk_to_customers|whatsapp_fb_messenger|solve_customer_problems': {
    childListOrder: ORDER_TALK_WA,
    displayConnectWhatsApp: true,  displayWhatsappAccountWizard: true,
    displayCreateChatbot: true,    displayInviteTeammate: true,
    displayKnowledgeBase: true,    displayCustomizeWidget: false,
  },
  // UC8 — talk + wa + sales
  'want_to_talk_to_customers|whatsapp_fb_messenger|increase_online_sales': {
    childListOrder: ORDER_TALK_WA,
    displayConnectWhatsApp: true,  displayWhatsappAccountWizard: true,
    displayCreateChatbot: true,    displayInviteTeammate: true,
    displayKnowledgeBase: false,   displayCustomizeWidget: false,
  },
};

const DEFAULT_CONFIG: DashletConfig = {
  displayAnalyticsConvsGraph:   false,
  displayAnalyticsIndicators:   false,
  displayConnectWhatsApp:       false,
  displayWhatsappAccountWizard: false,
  displayCreateChatbot:         true,
  displayInviteTeammate:        true,
  displayKnowledgeBase:         true,
  displayCustomizeWidget:       false,
  displayNewsFeed:              true,
  displayKbHeroSection:         false,
  childListOrder:               ORDER_DEFAULT,
  solution:                     undefined,
  solutionChannel:              undefined,
  useCase:                      undefined,
};

@Injectable({
  providedIn: 'root'
})
export class OnboardingPreferencesService {

  /**
   * Calcola la configurazione dashlet a partire da `project.attributes`.
   *
   * Priorità:
   * 1. Se `attributes.userPreferences` è presente → use-case matching
   * 2. Se non presente → configurazione di default
   * 3. In entrambi i casi, se `attributes.dashlets` è presente → le sue
   *    proprietà sovrascrivono la configurazione calcolata (override server-side)
   *
   * Funzione pura: nessun side-effect, nessuna dipendenza iniettata.
   */
  resolveConfig(attributes: any): DashletConfig {
    if (!attributes) {
      return { ...DEFAULT_CONFIG, childListOrder: [...DEFAULT_CONFIG.childListOrder] };
    }

    let config: DashletConfig;

    if (attributes.userPreferences) {
      config = this.fromUserPreferences(attributes.userPreferences);
    } else {
      config = { ...DEFAULT_CONFIG, childListOrder: [...DEFAULT_CONFIG.childListOrder] };
    }

    // Applica override dashlet salvati sul server
    if (attributes.dashlets) {
      config = this.applyDashletOverrides(config, attributes.dashlets);
    }

    return config;
  }

  // ─── Logica privata (pubblica per testabilità) ────────────────────────────

  fromUserPreferences(prefs: any): DashletConfig {
    const solution        = prefs.solution;
    const solutionChannel = prefs.solution_channel;
    const useCase         = prefs.use_case;

    const displayKbHeroSection =
      prefs.onboarding_type === 'kb' ? true : false;

    const key: UseCaseKey = `${solution}|${solutionChannel}|${useCase}`;
    const ucFlags = USE_CASE_MAP[key];

    if (ucFlags) {
      return {
        ...DEFAULT_CONFIG,
        ...ucFlags,
        childListOrder: [...ucFlags.childListOrder],
        displayKbHeroSection,
        solution,
        solutionChannel,
        useCase,
      };
    }

    // Combinazione non riconosciuta → valori di default con metadati
    return {
      ...DEFAULT_CONFIG,
      childListOrder: [...DEFAULT_CONFIG.childListOrder],
      displayKbHeroSection,
      solution,
      solutionChannel,
      useCase,
    };
  }

  /**
   * Determina se i chatbot sono visibili in base a `profile.customization.chatbot`.
   * Funzione pura: restituisce `true` se il flag manca (default permissive).
   */
  resolveChatbotVisibility(profileData: any): boolean {
    const chatbot = profileData?.customization?.chatbot;
    if (chatbot === false) return false;
    return true; // undefined or true → visible
  }

  /**
   * Determina se la quota vocale è visibile in base a `profile.customization.voice`.
   * Funzione pura: restituisce `false` se il flag manca (default restrictive).
   */
  resolveVoiceVisibility(profileData: any): boolean {
    const voice = profileData?.customization?.voice;
    return voice === true;
  }

  applyDashletOverrides(config: DashletConfig, dashlets: any): DashletConfig {
    return {
      ...config,
      displayAnalyticsConvsGraph:   dashlets.convsGraph          ?? config.displayAnalyticsConvsGraph,
      displayAnalyticsIndicators:   dashlets.analyticsIndicators  ?? config.displayAnalyticsIndicators,
      displayConnectWhatsApp:       dashlets.connectWhatsApp      ?? config.displayConnectWhatsApp,
      displayCreateChatbot:         dashlets.createChatbot        ?? config.displayCreateChatbot,
      displayKnowledgeBase:         dashlets.knowledgeBase        ?? config.displayKnowledgeBase,
      displayInviteTeammate:        dashlets.inviteTeammate       ?? config.displayInviteTeammate,
      displayCustomizeWidget:       dashlets.customizeWidget      ?? config.displayCustomizeWidget,
      displayNewsFeed:              dashlets.newsFeed             ?? config.displayNewsFeed,
    };
  }
}

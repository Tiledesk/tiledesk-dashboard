import { TestBed } from '@angular/core/testing';
import { OnboardingPreferencesService, DashletConfig } from './onboarding-preferences.service';

function buildService(): OnboardingPreferencesService {
  TestBed.configureTestingModule({ providers: [OnboardingPreferencesService] });
  return TestBed.inject(OnboardingPreferencesService);
}

// Helpers
const prefs = (solution: string, channel: string, useCase: string, extras: any = {}) => ({
  userPreferences: { solution, solution_channel: channel, use_case: useCase, ...extras }
});

describe('OnboardingPreferencesService', () => {

  // ── T6.1 — null / undefined attributes → default config ──────────────────
  describe('T6.1 — attributi null o undefined → config di default', () => {
    it('dovrebbe restituire la config di default se attributes è null', () => {
      const svc = buildService();
      const cfg = svc.resolveConfig(null);
      expect(cfg.displayCreateChatbot).toBe(true);
      expect(cfg.displayConnectWhatsApp).toBe(false);
      expect(cfg.displayKnowledgeBase).toBe(true);
      expect(cfg.childListOrder.length).toBe(8);
    });

    it('dovrebbe restituire la config di default se userPreferences è undefined', () => {
      const svc = buildService();
      const cfg = svc.resolveConfig({});
      expect(cfg.displayCreateChatbot).toBe(true);
      expect(cfg.displayConnectWhatsApp).toBe(false);
    });
  });

  // ── T6.2 — UC1: automate + web + solve ───────────────────────────────────
  describe('T6.2 — UC1: want_to_automate_conversations + web_mobile + solve_customer_problems', () => {
    it('dovrebbe avere displayCustomizeWidget=true, displayConnectWhatsApp=false, KB=true', () => {
      const svc = buildService();
      const cfg = svc.resolveConfig(prefs(
        'want_to_automate_conversations', 'web_mobile', 'solve_customer_problems'
      ));
      expect(cfg.displayConnectWhatsApp).toBe(false);
      expect(cfg.displayWhatsappAccountWizard).toBe(false);
      expect(cfg.displayCreateChatbot).toBe(true);
      expect(cfg.displayInviteTeammate).toBe(true);
      expect(cfg.displayKnowledgeBase).toBe(true);
      expect(cfg.displayCustomizeWidget).toBe(true);
    });
  });

  // ── T6.3 — UC3: automate + wa + solve → WhatsApp enabled ─────────────────
  describe('T6.3 — UC3: want_to_automate_conversations + whatsapp_fb_messenger + solve_customer_problems', () => {
    it('dovrebbe avere displayConnectWhatsApp=true e displayWhatsappAccountWizard=true', () => {
      const svc = buildService();
      const cfg = svc.resolveConfig(prefs(
        'want_to_automate_conversations', 'whatsapp_fb_messenger', 'solve_customer_problems'
      ));
      expect(cfg.displayConnectWhatsApp).toBe(true);
      expect(cfg.displayWhatsappAccountWizard).toBe(true);
      expect(cfg.displayKnowledgeBase).toBe(true);
      expect(cfg.displayCustomizeWidget).toBe(false);
    });
  });

  // ── T6.4 — UC2: automate + web + sales → KB=false ────────────────────────
  describe('T6.4 — UC2: want_to_automate_conversations + web_mobile + increase_online_sales', () => {
    it('dovrebbe avere displayKnowledgeBase=false e displayCustomizeWidget=true', () => {
      const svc = buildService();
      const cfg = svc.resolveConfig(prefs(
        'want_to_automate_conversations', 'web_mobile', 'increase_online_sales'
      ));
      expect(cfg.displayKnowledgeBase).toBe(false);
      expect(cfg.displayCustomizeWidget).toBe(true);
      expect(cfg.displayConnectWhatsApp).toBe(false);
    });
  });

  // ── T6.5 — childListOrder diverso per WhatsApp vs web ────────────────────
  describe('T6.5 — childListOrder diverso per canale WhatsApp vs web', () => {
    it('UC3 (WA) dovrebbe avere child3 in posizione 3, non child5', () => {
      const svc = buildService();
      const cfg = svc.resolveConfig(prefs(
        'want_to_automate_conversations', 'whatsapp_fb_messenger', 'solve_customer_problems'
      ));
      expect(cfg.childListOrder[2].type).toBe('child3'); // pos 3
    });

    it('UC1 (web) dovrebbe avere child5 in posizione 3', () => {
      const svc = buildService();
      const cfg = svc.resolveConfig(prefs(
        'want_to_automate_conversations', 'web_mobile', 'solve_customer_problems'
      ));
      expect(cfg.childListOrder[2].type).toBe('child5'); // pos 3
    });
  });

  // ── T6.6 — override dashlet server ───────────────────────────────────────
  describe('T6.6 — override dashlet da server', () => {
    it('i valori dashlets dovrebbero sovrascrivere la config use-case', () => {
      const svc = buildService();
      const attrs = {
        ...prefs('want_to_automate_conversations', 'web_mobile', 'solve_customer_problems'),
        dashlets: { connectWhatsApp: true, knowledgeBase: false }
      };
      const cfg = svc.resolveConfig(attrs);
      expect(cfg.displayConnectWhatsApp).toBe(true);   // override: true
      expect(cfg.displayKnowledgeBase).toBe(false);     // override: false
      expect(cfg.displayCreateChatbot).toBe(true);      // non overridden: mantiene valore UC
    });
  });

  // ── T6.7 — displayKbHeroSection da onboarding_type ───────────────────────
  describe('T6.7 — displayKbHeroSection basato su onboarding_type', () => {
    it('dovrebbe essere true se onboarding_type === "kb"', () => {
      const svc = buildService();
      const cfg = svc.resolveConfig({
        userPreferences: {
          solution: 'want_to_automate_conversations',
          solution_channel: 'web_mobile',
          use_case: 'solve_customer_problems',
          onboarding_type: 'kb'
        }
      });
      expect(cfg.displayKbHeroSection).toBe(true);
    });

    it('dovrebbe essere false se onboarding_type !== "kb"', () => {
      const svc = buildService();
      const cfg = svc.resolveConfig(prefs(
        'want_to_automate_conversations', 'web_mobile', 'solve_customer_problems'
      ));
      expect(cfg.displayKbHeroSection).toBe(false);
    });
  });

  // ── T6.8 — combinazione non riconosciuta → default ────────────────────────
  describe('T6.8 — combinazione use-case non riconosciuta → default', () => {
    it('dovrebbe restituire config di default con i metadati della preferenza', () => {
      const svc = buildService();
      const cfg = svc.resolveConfig(prefs('unknown_solution', 'unknown_channel', 'unknown_usecase'));
      expect(cfg.displayCreateChatbot).toBe(true);      // default
      expect(cfg.displayConnectWhatsApp).toBe(false);   // default
      expect(cfg.solution).toBe('unknown_solution');    // metadati preservati
    });
  });

  // ── T6.9 — resolveConfig è una funzione pura (non muta input) ────────────
  describe('T6.9 — resolveConfig non muta l\'oggetto in input', () => {
    it('dovrebbe restituire nuovi oggetti senza mutare attributes', () => {
      const svc = buildService();
      const input = prefs('want_to_automate_conversations', 'web_mobile', 'solve_customer_problems');
      const cfg1 = svc.resolveConfig(input);
      const cfg2 = svc.resolveConfig(input);
      // I due config sono oggetti distinti
      expect(cfg1).not.toBe(cfg2);
      expect(cfg1.childListOrder).not.toBe(cfg2.childListOrder);
    });
  });

  // ── T6.10 — tutti gli 8 use-case restituiscono 8 elementi nell'ordine ─────
  describe('T6.10 — childListOrder ha sempre 8 elementi', () => {
    const cases = [
      ['want_to_automate_conversations', 'web_mobile', 'solve_customer_problems'],
      ['want_to_automate_conversations', 'web_mobile', 'increase_online_sales'],
      ['want_to_automate_conversations', 'whatsapp_fb_messenger', 'solve_customer_problems'],
      ['want_to_automate_conversations', 'whatsapp_fb_messenger', 'increase_online_sales'],
      ['want_to_talk_to_customers', 'web_mobile', 'solve_customer_problems'],
      ['want_to_talk_to_customers', 'web_mobile', 'increase_online_sales'],
      ['want_to_talk_to_customers', 'whatsapp_fb_messenger', 'solve_customer_problems'],
      ['want_to_talk_to_customers', 'whatsapp_fb_messenger', 'increase_online_sales'],
    ];

    cases.forEach(([sol, ch, uc]) => {
      it(`UC ${sol}|${ch}|${uc} → 8 elementi`, () => {
        const svc = buildService();
        const cfg = svc.resolveConfig(prefs(sol, ch, uc));
        expect(cfg.childListOrder.length).toBe(8);
      });
    });
  });
});

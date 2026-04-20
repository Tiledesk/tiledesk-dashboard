import { getProjectAttributesVm, mapUserPreferencesToOnboardingVm } from './home2-project-attributes-vm.service';

describe('Home2ProjectAttributesVmService', () => {
  it('getVm() should map dashlets flags', () => {
    const vm = getProjectAttributesVm({
      dashlets: {
        convsGraph: true,
        analyticsIndicators: false,
        connectWhatsApp: true,
        createChatbot: true,
        knowledgeBase: false,
        inviteTeammate: true,
        customizeWidget: false,
        newsFeed: true
      }
    });

    expect(vm.dashlets).toEqual({
      displayAnalyticsConvsGraph: true,
      displayAnalyticsIndicators: false,
      displayConnectWhatsApp: true,
      displayCreateChatbot: true,
      displayKnowledgeBase: false,
      displayInviteTeammate: true,
      displayCustomizeWidget: false,
      displayNewsFeed: true
    });
  });

  it('mapUserPreferencesToOnboardingVm() should map usecase 8', () => {
    const onboarding = mapUserPreferencesToOnboardingVm({
      onboarding_type: 'kb',
      solution: 'want_to_talk_to_customers',
      solution_channel: 'whatsapp_fb_messenger',
      use_case: 'increase_online_sales'
    });

    expect(onboarding.displayKbHeroSection).toBe(true);
    expect(onboarding.displayWhatsappAccountWizard).toBe(true);
    expect(onboarding.displayConnectWhatsApp).toBe(true);
    expect(onboarding.displayKnowledgeBase).toBe(false);
    expect(onboarding.displayCustomizeWidget).toBe(false);
    expect(onboarding.child_list_order[0]).toEqual({ pos: 1, type: 'child1' });
    expect(onboarding.child_list_order[7]).toEqual({ pos: 8, type: 'child8' });
  });
});


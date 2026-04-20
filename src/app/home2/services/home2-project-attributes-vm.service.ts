export interface Home2DashletsVm {
  displayAnalyticsConvsGraph: boolean;
  displayAnalyticsIndicators: boolean;
  displayConnectWhatsApp: boolean;
  displayCreateChatbot: boolean;
  displayKnowledgeBase: boolean;
  displayInviteTeammate: boolean;
  displayCustomizeWidget: boolean;
  displayNewsFeed: boolean;
}

export interface Home2OnboardingVm {
  displayKbHeroSection: boolean;
  solution: string | undefined;
  solution_channel: string | undefined;
  use_case: string | undefined;

  child_list_order: Array<{ pos: number; type: string }>;

  displayWhatsappAccountWizard: boolean;
  displayConnectWhatsApp: boolean;
  displayCreateChatbot: boolean;
  displayInviteTeammate: boolean;
  displayCustomizeWidget: boolean;
  displayKnowledgeBase: boolean;
}

export interface Home2ProjectAttributesVm {
  dashlets?: Home2DashletsVm;
  onboarding?: Home2OnboardingVm;
}

export function getProjectAttributesVm(projectAttributes: any): Home2ProjectAttributesVm {
  const vm: Home2ProjectAttributesVm = {};

  if (projectAttributes?.dashlets) {
    const d = projectAttributes.dashlets;
    vm.dashlets = {
      displayAnalyticsConvsGraph: !!d.convsGraph,
      displayAnalyticsIndicators: !!d.analyticsIndicators,
      displayConnectWhatsApp: !!d.connectWhatsApp,
      displayCreateChatbot: !!d.createChatbot,
      displayKnowledgeBase: !!d.knowledgeBase,
      displayInviteTeammate: !!d.inviteTeammate,
      displayCustomizeWidget: !!d.customizeWidget,
      displayNewsFeed: !!d.newsFeed
    };
  }

  if (projectAttributes?.userPreferences) {
    vm.onboarding = mapUserPreferencesToOnboardingVm(projectAttributes.userPreferences);
  }

  return vm;
}

export function mapUserPreferencesToOnboardingVm(userPreferences: any): Home2OnboardingVm {
  const displayKbHeroSection = userPreferences?.onboarding_type === 'kb';

  const solution: string | undefined = userPreferences?.solution;
  const solution_channel: string | undefined = userPreferences?.solution_channel;
  const use_case: string | undefined = userPreferences?.use_case;

  // Default values (keep in sync with current component behavior)
  const defaults = getDefaultOnboarding();

  // Usecase selection mirrors the existing component logic.
  // If no prefs are set, we keep defaults.
  if (solution === undefined && solution_channel === undefined && use_case === undefined) {
    return { ...defaults, displayKbHeroSection, solution, solution_channel, use_case };
  }

  const usecaseVm = resolveUsecaseVm(solution, solution_channel, use_case);
  return {
    ...defaults,
    ...usecaseVm,
    displayKbHeroSection,
    solution,
    solution_channel,
    use_case
  };
}

function getDefaultOnboarding(): Omit<Home2OnboardingVm, 'displayKbHeroSection' | 'solution' | 'solution_channel' | 'use_case'> {
  return {
    child_list_order: [
      { pos: 1, type: 'child1' },
      { pos: 2, type: 'child2' },
      { pos: 3, type: 'child5' },
      { pos: 4, type: 'child7' },
      { pos: 5, type: 'child6' },
      { pos: 6, type: 'child8' },
      { pos: 7, type: 'child3' },
      { pos: 8, type: 'child4' }
    ],
    displayWhatsappAccountWizard: false,
    displayConnectWhatsApp: false,
    displayCreateChatbot: true,
    displayInviteTeammate: true,
    displayCustomizeWidget: false,
    displayKnowledgeBase: true
  };
}

function resolveUsecaseVm(
  solution: string | undefined,
  solution_channel: string | undefined,
  use_case: string | undefined
): Partial<Omit<Home2OnboardingVm, 'displayKbHeroSection' | 'solution' | 'solution_channel' | 'use_case'>> {
    // USECASE 1
    if (solution === 'want_to_automate_conversations' && solution_channel === 'web_mobile' && use_case === 'solve_customer_problems') {
      return {
        child_list_order: [
          { pos: 1, type: 'child1' },
          { pos: 2, type: 'child2' },
          { pos: 3, type: 'child5' },
          { pos: 4, type: 'child7' },
          { pos: 5, type: 'child6' },
          { pos: 6, type: 'child8' },
          { pos: 7, type: 'child3' },
          { pos: 8, type: 'child4' }
        ],
        displayWhatsappAccountWizard: false,
        displayConnectWhatsApp: false,
        displayCreateChatbot: true,
        displayInviteTeammate: true,
        displayKnowledgeBase: true,
        displayCustomizeWidget: true
      };
    }

    // USECASE 2
    if (solution === 'want_to_automate_conversations' && solution_channel === 'web_mobile' && use_case === 'increase_online_sales') {
      return {
        child_list_order: [
          { pos: 1, type: 'child1' },
          { pos: 2, type: 'child2' },
          { pos: 3, type: 'child5' },
          { pos: 4, type: 'child7' },
          { pos: 5, type: 'child6' },
          { pos: 6, type: 'child8' },
          { pos: 7, type: 'child3' },
          { pos: 8, type: 'child4' }
        ],
        displayWhatsappAccountWizard: false,
        displayConnectWhatsApp: false,
        displayCreateChatbot: true,
        displayInviteTeammate: true,
        displayKnowledgeBase: false,
        displayCustomizeWidget: true
      };
    }

    // USECASE 3
    if (solution === 'want_to_automate_conversations' && solution_channel === 'whatsapp_fb_messenger' && use_case === 'solve_customer_problems') {
      return {
        child_list_order: [
          { pos: 1, type: 'child1' },
          { pos: 2, type: 'child2' },
          { pos: 3, type: 'child3' },
          { pos: 4, type: 'child4' },
          { pos: 5, type: 'child5' },
          { pos: 6, type: 'child7' },
          { pos: 7, type: 'child6' },
          { pos: 8, type: 'child8' }
        ],
        displayWhatsappAccountWizard: true,
        displayConnectWhatsApp: true,
        displayCreateChatbot: true,
        displayInviteTeammate: true,
        displayKnowledgeBase: true,
        displayCustomizeWidget: false
      };
    }

    // USECASE 4
    if (solution === 'want_to_automate_conversations' && solution_channel === 'whatsapp_fb_messenger' && use_case === 'increase_online_sales') {
      return {
        child_list_order: [
          { pos: 1, type: 'child1' },
          { pos: 2, type: 'child2' },
          { pos: 3, type: 'child3' },
          { pos: 4, type: 'child4' },
          { pos: 5, type: 'child5' },
          { pos: 6, type: 'child6' },
          { pos: 7, type: 'child7' },
          { pos: 8, type: 'child8' }
        ],
        displayWhatsappAccountWizard: true,
        displayConnectWhatsApp: true,
        displayCreateChatbot: true,
        displayInviteTeammate: true,
        displayKnowledgeBase: false,
        displayCustomizeWidget: false
      };
    }

    // USECASE 5
    if (solution === 'want_to_talk_to_customers' && solution_channel === 'web_mobile' && use_case === 'solve_customer_problems') {
      return {
        child_list_order: [
          { pos: 1, type: 'child1' },
          { pos: 2, type: 'child2' },
          { pos: 3, type: 'child6' },
          { pos: 4, type: 'child8' },
          { pos: 5, type: 'child5' },
          { pos: 6, type: 'child7' },
          { pos: 7, type: 'child3' },
          { pos: 8, type: 'child4' }
        ],
        displayWhatsappAccountWizard: false,
        displayConnectWhatsApp: false,
        displayCreateChatbot: true,
        displayInviteTeammate: true,
        displayKnowledgeBase: true,
        displayCustomizeWidget: true
      };
    }

    // USECASE 6
    if (solution === 'want_to_talk_to_customers' && solution_channel === 'web_mobile' && use_case === 'increase_online_sales') {
      return {
        child_list_order: [
          { pos: 1, type: 'child1' },
          { pos: 2, type: 'child2' },
          { pos: 3, type: 'child6' },
          { pos: 4, type: 'child8' },
          { pos: 5, type: 'child5' },
          { pos: 6, type: 'child7' },
          { pos: 7, type: 'child3' },
          { pos: 8, type: 'child4' }
        ],
        displayWhatsappAccountWizard: false,
        displayConnectWhatsApp: false,
        displayCreateChatbot: true,
        displayInviteTeammate: true,
        displayKnowledgeBase: false,
        displayCustomizeWidget: true
      };
    }

    // USECASE 7
    if (solution === 'want_to_talk_to_customers' && solution_channel === 'whatsapp_fb_messenger' && use_case === 'solve_customer_problems') {
      return {
        child_list_order: [
          { pos: 1, type: 'child1' },
          { pos: 2, type: 'child2' },
          { pos: 3, type: 'child3' },
          { pos: 4, type: 'child4' },
          { pos: 5, type: 'child6' },
          { pos: 6, type: 'child5' },
          { pos: 7, type: 'child7' },
          { pos: 8, type: 'child8' }
        ],
        displayWhatsappAccountWizard: true,
        displayConnectWhatsApp: true,
        displayCreateChatbot: true,
        displayInviteTeammate: true,
        displayKnowledgeBase: true,
        displayCustomizeWidget: false
      };
    }

    // USECASE 8
    if (solution === 'want_to_talk_to_customers' && solution_channel === 'whatsapp_fb_messenger' && use_case === 'increase_online_sales') {
      return {
        child_list_order: [
          { pos: 1, type: 'child1' },
          { pos: 2, type: 'child2' },
          { pos: 3, type: 'child3' },
          { pos: 4, type: 'child4' },
          { pos: 5, type: 'child6' },
          { pos: 6, type: 'child5' },
          { pos: 7, type: 'child7' },
          { pos: 8, type: 'child8' }
        ],
        displayWhatsappAccountWizard: true,
        displayConnectWhatsApp: true,
        displayCreateChatbot: true,
        displayInviteTeammate: true,
        displayKnowledgeBase: false,
        displayCustomizeWidget: false
      };
    }

    // Other cases: keep defaults
    return {};
}


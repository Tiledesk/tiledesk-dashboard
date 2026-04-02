import { of } from 'rxjs';

const MOCK_PROJECT = {
  _id: 'test-project-id',
  name: 'Test Project',
  createdAt: new Date().toISOString(),
  trialExpired: false,
  isActiveSubscription: true,
  activeOperatingHours: false,
  profile: {
    _id: 'profile-id',
    name: 'Basic',
    type: 'payment',
    subEnd: new Date()
  },
  attributes: {}
};

export class ProjectServiceStub {
  getProjectById(_id: string) {
    return of({ ...MOCK_PROJECT });
  }

  updateProjectName(_id: string, _val: any) {
    return of({});
  }

  updateDashletsPreferences(
    _convsGraph: boolean,
    _analyticsIndicators: boolean,
    _connectWhatsApp: boolean,
    _createChatbot: boolean,
    _knowledgeBase: boolean,
    _inviteTeammate: boolean,
    _customizeWidget: boolean,
    _newsFeed: boolean
  ) {
    return of({});
  }

  activateAppSumoTier() { return of({}); }
  updateAppSumoTier()   { return of({}); }
  downgradeAppSumoTier() { return of({}); }
  refundAppSumoTier()   { return of({}); }
}

export const MOCK_PROJECT_DATA = MOCK_PROJECT;

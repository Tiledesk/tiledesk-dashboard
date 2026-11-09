import { isRequestVisibleToAgent } from './request-visibility.util';

describe('isRequestVisibleToAgent', () => {
  const agent1 = '65aa11111111111111111111';
  const agent2 = '65aa22222222222222222222';
  const agent3 = '65aa33333333333333333333';
  const agent4 = '65aa44444444444444444444';

  describe('legacy (no visibility)', () => {
    const request = {
      request_id: 'support-group-aaa-111',
      participants: ['bot_65f0'],
      snapshot: {
        agents: [
          { id_user: agent1 },
          { id_user: agent2 },
        ],
      },
    };

    it('is visible to an agent listed in snapshot.agents', () => {
      expect(isRequestVisibleToAgent(request, agent1, null)).toBe(true);
    });

    it('is not visible to an agent not in snapshot.agents', () => {
      expect(isRequestVisibleToAgent(request, agent3, null)).toBe(false);
    });

    it('compares ids as strings', () => {
      expect(isRequestVisibleToAgent(request, agent1 as any, null)).toBe(true);
    });

    it('is not visible when agents is missing or empty (and not in participants)', () => {
      expect(isRequestVisibleToAgent({ participants: [], snapshot: {} }, agent1, null)).toBe(false);
      expect(isRequestVisibleToAgent({ participants: [], snapshot: { agents: [] } }, agent1, null)).toBe(false);
    });
  });

  describe('visibility agents', () => {
    const request = {
      request_id: 'support-group-aaa-222',
      participants: [agent1],
      snapshot: {
        visibility: 'agents',
        agentIds: [agent1, agent2, agent3],
        agents: [
          { id_user: agent1 },
          { id_user: agent2 },
          { id_user: agent3 },
        ],
      },
    };

    it('is visible via agentIds even if not in participants', () => {
      expect(isRequestVisibleToAgent(request, agent3, null)).toBe(true);
    });

    it('is not visible when user is not in agentIds', () => {
      expect(isRequestVisibleToAgent(request, agent4, null)).toBe(false);
    });

    it('falls back to snapshot.agents when agentIds is missing', () => {
      const noIds = {
        participants: [],
        snapshot: {
          visibility: 'agents',
          agents: [{ id_user: agent2 }],
        },
      };
      expect(isRequestVisibleToAgent(noIds, agent2, null)).toBe(true);
      expect(isRequestVisibleToAgent(noIds, agent1, null)).toBe(false);
    });

    it('is visible via participants regardless of agentIds', () => {
      const onlyParticipant = {
        participants: [agent4],
        snapshot: { visibility: 'agents', agentIds: [agent1] },
      };
      expect(isRequestVisibleToAgent(onlyParticipant, agent4, null)).toBe(true);
    });
  });

  describe('visibility project', () => {
    const request = {
      request_id: 'support-group-aaa-333',
      participants: ['bot_65f0'],
      snapshot: {
        visibility: 'project',
        visibilitySince: '2026-10-27T14:05:00.000Z',
        agents: [],
      },
    };

    it('is visible when project_user.createdAt is on or before visibilitySince', () => {
      expect(isRequestVisibleToAgent(request, agent1, '2026-01-10T09:00:00.000Z')).toBe(true);
    });

    it('is not visible when project_user.createdAt is after visibilitySince', () => {
      expect(isRequestVisibleToAgent(request, agent1, '2026-10-28T08:00:00.000Z')).toBe(false);
    });

    it('is not visible when projectUserCreatedAt is missing', () => {
      expect(isRequestVisibleToAgent(request, agent1, null)).toBe(false);
      expect(isRequestVisibleToAgent(request, agent1, undefined)).toBe(false);
      expect(isRequestVisibleToAgent(request, agent1, '')).toBe(false);
    });

    it('empty agents does not hide a project-visible request', () => {
      expect(isRequestVisibleToAgent(request, agent1, '2026-01-10T09:00:00.000Z')).toBe(true);
    });

    it('is visible via participants even when createdAt is after visibilitySince', () => {
      const withParticipant = {
        request_id: 'support-group-aaa-333',
        participants: [agent4],
        snapshot: {
          visibility: 'project',
          visibilitySince: '2026-10-27T14:05:00.000Z',
          agents: [],
        },
      };
      expect(isRequestVisibleToAgent(withParticipant, agent4, '2026-10-28T08:00:00.000Z')).toBe(true);
    });
  });
});

import { BehaviorSubject, Subject, of } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

const MOCK_QUOTAS_DATA = {
  projectId: 'test-project-id',
  projectLimits: {
    messages: 1000,
    requests: 500,
    email: 200,
    tokens: 100000,
    voice_duration: 3600
  },
  allQuotes: {
    requests:       { quote: 50  },
    messages:       { quote: 100 },
    email:          { quote: 10  },
    tokens:         { quote: 500 },
    voice_duration: { quote: 60  }
  }
};

export class QuotesServiceStub {
  hasOpenNavbarQuotasMenu$      = new BehaviorSubject<boolean>(null);
  hasReachedQuotasLimitInHome$  = new BehaviorSubject<boolean>(null);

  private quotasDataSubject = new BehaviorSubject<any>(MOCK_QUOTAS_DATA);
  quotesData$ = this.quotasDataSubject.asObservable().pipe(shareReplay(1));

  requestQuotasUpdate(): void {}

  getProjectQuotes(_projectId: string): Promise<any> {
    return Promise.resolve(MOCK_QUOTAS_DATA.projectLimits);
  }

  getAllQuotes(_projectId: string) {
    return of({ quotes: MOCK_QUOTAS_DATA.allQuotes });
  }
}

export const MOCK_QUOTAS = MOCK_QUOTAS_DATA;

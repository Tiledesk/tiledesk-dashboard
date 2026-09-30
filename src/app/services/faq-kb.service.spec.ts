import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { BehaviorSubject } from 'rxjs';

import { FaqKbService } from './faq-kb.service';
import { AppConfigService } from './app-config.service';
import { AuthService } from '../core/auth.service';
import { LoggerService } from '../services/logger/logger.service';

describe('FaqKbService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FaqKbService]
    });
  });

  it('should be created', inject([FaqKbService], (service: FaqKbService) => {
    expect(service).toBeTruthy();
  }));
});

/** The version label an agent is born with decides which Design Studio editor opens on it.
 *  Only an agent created from scratch gets it, and only when the runtime configuration
 *  carries a version -- so it can be switched on per environment, and off, without a
 *  release. A template, a copy or an imported chatbot keeps the version it already has. */
describe('FaqKbService — the editor version of a new agent', () => {
  let service: FaqKbService;
  let http: HttpTestingController;
  let config: any;

  function build(chatbotVersion: any) {
    config = { SERVER_BASE_URL: 'http://server/', chatbotVersion: chatbotVersion };
    const auth: any = {
      user_bs: new BehaviorSubject({ token: 'tok' }),
      project_bs: new BehaviorSubject({ _id: 'p1' })
    };
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        FaqKbService,
        { provide: AppConfigService, useValue: { getConfig: () => config } },
        { provide: AuthService, useValue: auth },
        { provide: LoggerService, useValue: { log: () => {}, error: () => {} } }
      ]
    });
    service = TestBed.inject(FaqKbService);
    http = TestBed.inject(HttpTestingController);
  }

  /** The body of the single POST the call under test sent. */
  function sentBody(): any {
    const request = http.expectOne(req => req.method === 'POST' && req.url.endsWith('/faq_kb/'));
    const body = JSON.parse(request.request.body);
    request.flush({});
    return body;
  }

  afterEach(() => http?.verify());

  it('labels an agent created from scratch with the configured version', () => {
    build('v3');
    service.createChatbotFromScratch('Bot', 'tilebot', 'chatbot', 'en').subscribe();
    expect(sentBody().attributes).toEqual({ dsVersion: 'v3' });
  });

  it('labels every kind of agent the picker offers', () => {
    build('v3');
    ['chatbot', 'voice', 'voice_twilio', 'webhook', 'copilot'].forEach(subtype => {
      service.createChatbotFromScratch('Bot', 'tilebot', subtype, 'en').subscribe();
      const body = sentBody();
      expect(body.subtype).toBe(subtype);
      expect(body.attributes).toEqual({ dsVersion: 'v3' });
    });
  });

  it('keeps the rest of the payload as it was', () => {
    build('v3');
    service.createChatbotFromScratch('Bot', 'tilebot', 'chatbot', 'en', 'ns1').subscribe();
    const body = sentBody();
    expect(body.name).toBe('Bot');
    expect(body.id_project).toBe('p1');
    expect(body.type).toBe('tilebot');
    expect(body.language).toBe('en');
    expect(body.template).toBe('blank');
    expect(body.namespace_id).toBe('ns1');
  });

  it('writes no version when the configuration carries none', () => {
    build('');
    service.createChatbotFromScratch('Bot', 'tilebot', 'chatbot', 'en').subscribe();
    expect(sentBody().attributes).toBeUndefined();
  });

  it('writes no version when the configuration key is missing altogether', () => {
    build(undefined);
    service.createChatbotFromScratch('Bot', 'tilebot', 'chatbot', 'en').subscribe();
    expect(sentBody().attributes).toBeUndefined();
  });

  // The runtime configuration is filled in at container start: an environment variable that
  // was never set leaves the placeholder behind, and that must not become a version.
  it('writes no version when the placeholder was never replaced', () => {
    build('${CHATBOT_VERSION}');
    service.createChatbotFromScratch('Bot', 'tilebot', 'chatbot', 'en').subscribe();
    expect(sentBody().attributes).toBeUndefined();
  });

  // Creation paths that are not "from scratch" are left exactly as they were: an agent built
  // from a template, from an import or from a copy keeps whatever version it carries.
  it('leaves the other ways of creating an agent untouched', () => {
    build('v3');
    service.createFaqKb('Bot', 'http://bot', 'tilebot', 'a bot', 'en', 'blank').subscribe();
    expect(sentBody().attributes).toBeUndefined();

    service.createRasaBot('Bot', 'rasa', 'a bot').subscribe();
    expect(sentBody().attributes).toBeUndefined();
  });
});

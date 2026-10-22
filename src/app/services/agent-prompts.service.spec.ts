import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AppConfigService } from './app-config.service';
import { LoggerService } from './logger/logger.service';
import { AGENT_PROMPT_SAVE_TIMEOUT_MS, AgentPromptRecord, AgentPromptsService } from './agent-prompts.service';

describe('AgentPromptsService', () => {
  let service: AgentPromptsService;
  let http: HttpTestingController;

  const record: AgentPromptRecord = { id_faq_kb: 'bot1', text: '  build me an agent  ', language: 'it', source: 'home' };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AgentPromptsService,
        { provide: AppConfigService, useValue: { getConfig: () => ({ SERVER_BASE_URL: 'https://api.test/' }) } },
        { provide: LoggerService, useValue: { log: () => {}, error: () => {} } },
      ],
    });
    service = TestBed.inject(AgentPromptsService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('posts the prompt with its agent to the project endpoint, with the user token', () => {
    let result: any = 'none';
    service.save('p1', 'JWT abc', record).subscribe((saved) => result = saved);

    const req = http.expectOne('https://api.test/p1/agent-prompts');
    expect(req.request.method).toBe('POST');
    expect(req.request.headers.get('Authorization')).toBe('JWT abc');
    expect(JSON.parse(req.request.body)).toEqual({
      id_faq_kb: 'bot1', text: 'build me an agent', language: 'it', source: 'home', attachments: [],
    });
    req.flush({ _id: 'ap1' });
    expect(result).toEqual({ _id: 'ap1' });
  });

  it('sends nothing without a prompt, an agent, a project or a session', () => {
    const results: any[] = [];
    service.save('p1', 'JWT abc', { ...record, text: '   ' }).subscribe((r) => results.push(r));
    service.save('p1', 'JWT abc', { ...record, id_faq_kb: '' }).subscribe((r) => results.push(r));
    service.save('', 'JWT abc', record).subscribe((r) => results.push(r));
    service.save('p1', null, record).subscribe((r) => results.push(r));

    http.expectNone('https://api.test/p1/agent-prompts');
    expect(results).toEqual([null, null, null, null]);
  });

  it('answers null on a server error, so the agent opens anyway', () => {
    let result: any = 'none';
    service.save('p1', 'JWT abc', record).subscribe((saved) => result = saved);
    http.expectOne('https://api.test/p1/agent-prompts').flush('Not found', { status: 404, statusText: 'Not Found' });
    expect(result).toBeNull();
  });

  it('gives up after the time limit when the server does not answer', fakeAsync(() => {
    let result: any = 'none';
    service.save('p1', 'JWT abc', record).subscribe((saved) => result = saved);
    const req = http.expectOne('https://api.test/p1/agent-prompts');
    tick(AGENT_PROMPT_SAVE_TIMEOUT_MS + 1);
    expect(result).toBeNull();
    expect(req.cancelled).toBe(true);
  }));
});

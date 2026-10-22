import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, timeout } from 'rxjs/operators';
import { AppConfigService } from './app-config.service';
import { LoggerService } from './logger/logger.service';
import { MAX_PROMPT_LENGTH } from '../utils/agent-from-prompt.util';

/** Where the prompt was written: one endpoint for every entry point, told apart by this. */
export type AgentPromptSource = 'home' | 'website' | 'bots_list' | 'onboarding';

/** A file attached to the prompt: only its link is kept, the file itself lives in the file storage. */
export interface AgentPromptAttachment {
  name: string;
  type: string;
  size: number;
  url: string;
}

/** What the dashboard sends. Author, project and date are not here: the server takes the author
 *  from the token, the project from the URL and sets the date itself. */
export interface AgentPromptRecord {
  id_faq_kb: string;
  text: string;
  language: string;
  source: AgentPromptSource;
  attachments?: AgentPromptAttachment[];
}

/** The agent opens in the same tab right after the save, which would cancel a request still in
 *  flight: the caller waits for the answer, but never longer than this. */
export const AGENT_PROMPT_SAVE_TIMEOUT_MS = 2000;

@Injectable({ providedIn: 'root' })
export class AgentPromptsService {

  constructor(
    private appConfigService: AppConfigService,
    private http: HttpClient,
    private logger: LoggerService
  ) { }

  /** Saves the prompt an agent was created from, with the agent it belongs to.
   *
   *  Never fails and always ends within AGENT_PROMPT_SAVE_TIMEOUT_MS: it emits the saved record,
   *  or null when there is nothing to save, no session, an error or no answer in time. The agent
   *  exists already, so it must open whatever happens here.
   *  `token` is the user's JWT: the server takes the author from it. */
  save(projectId: string, token: string, record: AgentPromptRecord): Observable<any | null> {
    const text = (record?.text || '').trim().slice(0, MAX_PROMPT_LENGTH);
    if (!projectId || !record?.id_faq_kb || !text || !token) {
      return of(null);
    }

    const url = this.appConfigService.getConfig().SERVER_BASE_URL + projectId + '/agent-prompts';
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': token
      })
    };
    const body: AgentPromptRecord = {
      id_faq_kb: record.id_faq_kb,
      text: text,
      language: record.language || 'en',
      source: record.source,
      attachments: record.attachments || []
    };

    return this.http.post(url, JSON.stringify(body), httpOptions).pipe(
      timeout(AGENT_PROMPT_SAVE_TIMEOUT_MS),
      map((saved) => saved || null),
      catchError((error) => {
        this.logger.error('[AGENT-PROMPTS] save prompt error', error);
        return of(null);
      })
    );
  }
}

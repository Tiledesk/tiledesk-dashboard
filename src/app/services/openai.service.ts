import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LoggerService } from './logger/logger.service';
import { AppConfigService } from './app-config.service';
import { AuthService } from 'app/core/auth.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OpenaiService {

  SERVER_BASE_PATH: string;
  TOKEN: string;
  GPT_API_URL: string;
  user: any;
  project_id: any;
  OPENAI_API_URL: string;


  constructor(
    public appConfigService: AppConfigService,
    private auth: AuthService,
    private httpClient: HttpClient,
    private logger: LoggerService
  ) { 
    this.user = auth.user_bs.value
    this.checkIfUserExistAndGetToken()

    this.auth.user_bs.subscribe((user) => {
      this.user = user;
      this.checkIfUserExistAndGetToken()
    });
    this.getCurrentProject();
    this.getAppConfig();
    //this.GPT_API_URL = "http://tiledesk-backend.h8dahhe4edc7cahh.francecentral.azurecontainer.io:8000/api";
    this.GPT_API_URL = "https://tiledesk-dev.blackwave-d2bf4ee1.westus2.azurecontainerapps.io/api";
    this.OPENAI_API_URL = "https://api.openai.com/v1";

  }

  checkIfUserExistAndGetToken() {
    if (this.user) {
      this.TOKEN = this.user.token
    } else {
      this.logger.log('[OPENAI.SERVICE] - No user signed in');
    }
  }

  getAppConfig() {
    this.SERVER_BASE_PATH = this.appConfigService.getConfig().SERVER_BASE_URL;
  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      if (project) {
        this.project_id = project._id
      }
    }, (error) => {
      this.logger.error('[OPENAI.SERVICE] - get current project ERROR: ', error);
    }, () => {
      this.logger.debug('[OPENAI.SERVICE] - get current project *COMPLETE*');
    });
  }

  ////////////////////////////////////////////////////////
  //////////////////// OPENAI - START ////////////////////
  ////////////////////////////////////////////////////////

  previewPrompt(data) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    }

    const url = this.SERVER_BASE_PATH + this.project_id + "/openai/";
    this.logger.debug('[OPENAI.SERVICE] - preview prompt URL: ', url);

    return this.httpClient.post(url, data, httpOptions);
  }

  ////////////////////////////////////////////////////////
  //////////////////// OPENAI - START ////////////////////
  ////////////////////////////////////////////////////////


  askGpt(data) {
    console.log('[OPENAI.SERVICE] askGpt',  data) 
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN // remove it for pugliai endpoint
      })
    }
    // const url = this.GPT_API_URL + "/qa";
    const url = this.SERVER_BASE_PATH + this.project_id + "/kb/qa";
    //const url = this.SERVER_BASE_PATH + this.project_id + "/kbsettings/qa";
    this.logger.debug('[OPENAI.SERVICE] - ask gpt URL: ', url);
    return this.httpClient.post(url, data, httpOptions);
  }

  /**
   * Chunk stream KB/QA: `text` = delta da concatenare; `fullAnswer` = risposta completa (sostituisce lo stream).
   * Il backend può mandare `content` in streaming e poi un evento con `answer` piena: non vanno concatenate.
   */
    askGptStream(data: any): Observable<{
    text?: string;
    fullAnswer?: string;
    done?: boolean;
    response?: any;
  }> {
    this.logger.log('[OPENAI.SERVICE] askGptStream', data);
    const url = this.SERVER_BASE_PATH + this.project_id + '/kb/qa';
    this.logger.debug('[OPENAI.SERVICE] - ask gpt stream URL: ', url);
    const body = { ...data, stream: true };

    const emitParsed = (
      parsed: any,
      lastStreamMeta: { value: any },
      observer: { next: (v: any) => void; error: (e: any) => void }
    ): boolean => {
      if (parsed.success === false && parsed.error) {
        observer.error({ error: parsed.error, success: false });
        return false;
      }
      lastStreamMeta.value = parsed;
      if (parsed.answer !== undefined) {
        observer.next({ fullAnswer: String(parsed.answer), response: parsed });
      } else if (parsed.delta !== undefined) {
        observer.next({ text: String(parsed.delta), response: parsed });
      } else if (parsed.content !== undefined) {
        observer.next({ text: String(parsed.content), response: parsed });
      } else if (parsed.choices?.[0]?.delta?.content) {
        observer.next({ text: String(parsed.choices[0].delta.content), response: parsed });
      } else {
        observer.next({ response: parsed });
      }
      return true;
    };

    return new Observable((observer) => {
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.TOKEN || ''
        },
        body: JSON.stringify(body)
      }).then((res) => {
        if (!res.ok) {
          res.text().then((errText) => {
            try {
              const err = JSON.parse(errText);
              observer.error(err);
            } catch {
              observer.error({ error: errText, status: res.status });
            }
          }).catch(() => observer.error({ status: res.status }));
          return;
        }
        const reader = res.body?.getReader();
        if (!reader) {
          observer.error(new Error('No response body'));
          return;
        }
        const decoder = new TextDecoder();
        let buffer = '';
        const lastStreamMeta = { value: null as any };

        const read = (): Promise<void> => {
          return reader.read().then(({ done, value }) => {
            if (done) {
              if (buffer.trim()) {
                try {
                  const parsed = JSON.parse(buffer);
                  if (!emitParsed(parsed, lastStreamMeta, observer)) {
                    return;
                  }
                } catch (_) {}
              }
              observer.next({ done: true, response: lastStreamMeta.value });
              observer.complete();
              return;
            }
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split(/\r?\n/);
            buffer = lines.pop() || '';

            for (const line of lines) {
              const trimmed = line.trim();
              if (trimmed.startsWith('data:')) {
                const dataStr = trimmed.slice(5).trim();
                if (dataStr === '[DONE]') continue;
                try {
                  const parsed = JSON.parse(dataStr);
                  if (!emitParsed(parsed, lastStreamMeta, observer)) {
                    return;
                  }
                } catch (_) {}
              } else if (trimmed) {
                try {
                  const parsed = JSON.parse(trimmed);
                  if (!emitParsed(parsed, lastStreamMeta, observer)) {
                    return;
                  }
                } catch (_) {}
              }
            }
            return read();
          });
        };

        read().catch((err) => observer.error(err));
      }).catch((err) => observer.error(err));
    });
  }

  askGptPrev(data) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN // remove it for pugliai endpoint
      })
    }

    // const url = this.GPT_API_URL + "/qa";
    //const url = this.SERVER_BASE_PATH + this.project_id + "/kb/qa";
    const url = this.SERVER_BASE_PATH + this.project_id + "/kbsettings/qa";
    this.logger.debug('[OPENAI.SERVICE] - ask gpt URL: ', url);
    return this.httpClient.post(url, data, httpOptions);
  }

  startScraping(data) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    }
    // const url = this.GPT_API_URL + "/scrape";
    // const url = this.SERVER_BASE_PATH + this.project_id + "/kbsettings/startscrape";
    const url = this.SERVER_BASE_PATH + this.project_id + "/kb/scrape/single";
    this.logger.debug('[OPENAI.SERVICE] - scraping URL: ', url);
    return this.httpClient.post(url, JSON.stringify(data), httpOptions);
  }

  startScrapingPrev(data) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    }
    // const url = this.GPT_API_URL + "/scrape";
    const url = this.SERVER_BASE_PATH + this.project_id + "/kbsettings/startscrape";
    //const url = this.SERVER_BASE_PATH + this.project_id + "/kb/scrape/single";
    this.logger.debug('[OPENAI.SERVICE] - scraping URL: ', url);
    return this.httpClient.post(url, JSON.stringify(data), httpOptions);
  }

  
  checkScrapingStatus(data) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN // remove it for pugliai endpoint
      })
    }
    //const url = this.GPT_API_URL + "/scrape/status";
    //const url = this.SERVER_BASE_PATH + this.project_id + "/kbsettings/checkstatus";
    const url = this.SERVER_BASE_PATH + this.project_id + "/kb/scrape/status?returnObject=true";
    this.logger.debug('[OPENAI.SERVICE] - check scraping URL: ', url);
    return this.httpClient.post(url, JSON.stringify(data), httpOptions);
  }

  checkScrapingStatusPrev(data) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN // remove it for pugliai endpoint
      })
    }
    //const url = this.GPT_API_URL + "/scrape/status";
    const url = this.SERVER_BASE_PATH + this.project_id + "/kbsettings/checkstatus";
    // const url = this.SERVER_BASE_PATH + this.project_id + "/kb/scrape/status";
    this.logger.debug('[OPENAI.SERVICE] - check scraping URL: ', url);
    return this.httpClient.post(url, JSON.stringify(data), httpOptions);
  }

  checkKeyValidity(key) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + key
      })
    }

    const url = this.OPENAI_API_URL + "/models";
    this.logger.debug('[OPENAI.SERVICE] - key validity URL: ', url);

    return this.httpClient.get(url, httpOptions);
  }


}

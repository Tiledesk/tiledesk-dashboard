import { Injectable } from '@angular/core';

export interface Home2QuotesVm {
  projectId: string;

  // limits
  messages_limit: number;
  requests_limit: number;
  email_limit: number;
  tokens_limit: number;
  voice_limit_in_sec: number;
  voice_limit: number;

  // used
  requests_count: number;
  messages_count: number;
  email_count: number;
  tokens_count: number;
  voice_count: number;
  voice_count_min_sec: string;

  // perc
  requests_perc: number;
  messages_perc: number;
  email_perc: number;
  tokens_perc: number;
  voice_perc: number;

  // runned out
  conversationsRunnedOut: boolean;
  emailsRunnedOut: boolean;
  tokensRunnedOut: boolean;
  voiceRunnedOut: boolean;

  quotaResetEndDateLabel: string | null;

  // raw (kept for compatibility with current component fields)
  quotasLimits: any;
  allQuotas: any;
}

@Injectable({ providedIn: 'root' })
export class Home2QuotesVmService {
  /**
   * Maps the quotes payload coming from `quotesService.quotesData$` into a VM used by Home2.
   * The mapping preserves the current Home2 behavior (null -> 0, capped percentages, runnedOut flags).
   */
  mapQuotesDataToVm(data: any, currentProjectId: string, diplayVXMLVoiceQuota: boolean): Home2QuotesVm | null {
    if (!data || data['projectId'] !== currentProjectId) {
      return null;
    }

    const quotasLimits = data.projectLimits;
    const allQuotas = data.allQuotes;
    const quotaResetEndDateLabel: string | null = data.slot?.endDate ?? null;

    const messages_limit = quotasLimits?.messages ?? 0;
    const requests_limit = quotasLimits?.requests ?? 0;
    const email_limit = quotasLimits?.email ?? 0;
    const tokens_limit = quotasLimits?.tokens ?? 0;

    const voice_limit_in_sec = quotasLimits?.voice_duration ?? 0;
    const voice_limit = Math.floor(voice_limit_in_sec / 60);

    // normalize nulls to 0 (current behavior)
    if (allQuotas?.requests?.quote === null) allQuotas.requests.quote = 0;
    if (allQuotas?.messages?.quote === null) allQuotas.messages.quote = 0;
    if (allQuotas?.email?.quote === null) allQuotas.email.quote = 0;
    if (allQuotas?.tokens?.quote === null) allQuotas.tokens.quote = 0;
    if (allQuotas?.voice_duration && allQuotas.voice_duration.quote === null) {
      allQuotas.voice_duration.quote = 0;
    }

    const requests_count = allQuotas?.requests?.quote ?? 0;
    const messages_count = allQuotas?.messages?.quote ?? 0;
    const email_count = allQuotas?.email?.quote ?? 0;
    const tokens_count = allQuotas?.tokens?.quote ?? 0;
    const voice_count = allQuotas?.voice_duration?.quote ?? 0;

    const conversationsRunnedOut = requests_limit > 0 ? requests_count >= requests_limit : false;
    const emailsRunnedOut = email_limit > 0 ? email_count >= email_limit : false;
    const tokensRunnedOut = tokens_limit > 0 ? tokens_count >= tokens_limit : false;

    const voiceRunnedOut =
      diplayVXMLVoiceQuota && voice_limit_in_sec > 0 ? voice_count >= voice_limit_in_sec : false;

    const requests_perc = requests_limit > 0 ? Math.min(100, Math.floor((requests_count / requests_limit) * 100)) : 0;
    const messages_perc = messages_limit > 0 ? Math.min(100, Math.floor((messages_count / messages_limit) * 100)) : 0;
    const email_perc = email_limit > 0 ? Math.min(100, Math.floor((email_count / email_limit) * 100)) : 0;
    const tokens_perc = tokens_limit > 0 ? Math.min(100, Math.floor((tokens_count / tokens_limit) * 100)) : 0;
    const voice_perc =
      voice_limit_in_sec > 0 ? Math.min(100, Math.floor((voice_count / voice_limit_in_sec) * 100)) : 0;

    return {
      projectId: currentProjectId,

      messages_limit,
      requests_limit,
      email_limit,
      tokens_limit,
      voice_limit_in_sec,
      voice_limit,

      requests_count,
      messages_count,
      email_count,
      tokens_count,
      voice_count,
      voice_count_min_sec: this.secondsToMinutesSeconds(voice_count),

      requests_perc,
      messages_perc,
      email_perc,
      tokens_perc,
      voice_perc,

      conversationsRunnedOut,
      emailsRunnedOut,
      tokensRunnedOut,
      voiceRunnedOut,

      quotaResetEndDateLabel,

      quotasLimits,
      allQuotas
    };
  }

  private secondsToMinutesSeconds(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  }
}


/** The note the dashboard leaves for the Design Studio when an agent is created from a description.
 *
 *  The two applications are served from the same origin -- CDS_BASE_URL is a relative path
 *  (`/cds/`) -- and `goToCDSVersion` stays in the same tab, so `sessionStorage` survives the
 *  handover and no round trip through the server is needed to carry the text across.
 *
 *  This file is the whole contract: the Design Studio reads the same key and the same shape.
 *  Change either one here and there, or the note is written and never found.
 */

/** Where the note is left. The Design Studio removes it as it reads it, so it is used once. */
export const AGENT_FROM_PROMPT_KEY = 'cds-agent-from-prompt';

/** Past this, it is not a description any more. Better noticed here than at the far end. */
export const MAX_PROMPT_LENGTH = 2000;

export interface PendingAgentPrompt {
    /** The agent the description belongs to: the note is ignored if another agent is opened. */
    botId: string;
    prompt: string;
    /** The language every message of the new flow has to be written in. */
    language: string;
    /** When it was left. A note nobody collected must not fire hours later, on some other visit. */
    createdAt: number;
}

/** Leaves the description for the agent that was just created.
 *
 *  Never throws: `sessionStorage` raises in a private window and where site data is blocked, and
 *  an agent that exists must not be reported as failed because a note could not be put down.
 *  The agent then opens empty, exactly as it did before this feature. */
export function saveAgentPrompt(pending: PendingAgentPrompt): boolean {
    const prompt = (pending?.prompt || '').trim().slice(0, MAX_PROMPT_LENGTH);
    if (!pending?.botId || !prompt) {
        return false;
    }
    try {
        sessionStorage.setItem(AGENT_FROM_PROMPT_KEY, JSON.stringify({
            botId: pending.botId,
            prompt: prompt,
            language: pending.language || 'en',
            createdAt: Date.now()
        }));
        return true;
    } catch (error) {
        return false;
    }
}

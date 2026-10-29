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
    /** Set when the person was not asked for a name (29/10/2026): the name the agent was created
     *  with, which the Design Studio replaces with the title the runtime generates for the agent's
     *  conversation -- only while the agent still has it. */
    provisionalName?: string;
}

/** Past this many words or characters the provisional name stops being a name. */
const PROVISIONAL_NAME_WORDS = 6;
const PROVISIONAL_NAME_CHARS = 40;

/** A name for an agent created from a description, until the Design Studio names it after the
 *  title of its conversation: the first words of the description, on one line. */
export function provisionalAgentName(prompt: string): string {
    const words = (prompt || '').replace(/\s+/g, ' ').trim().split(' ').filter(Boolean);
    let name = words.slice(0, PROVISIONAL_NAME_WORDS).join(' ');
    if (name.length > PROVISIONAL_NAME_CHARS) {
        const cut = name.slice(0, PROVISIONAL_NAME_CHARS);
        const space = cut.lastIndexOf(' ');
        name = space > PROVISIONAL_NAME_CHARS / 2 ? cut.slice(0, space) : cut;
    }
    name = name.replace(/[\s.,;:!?\-]+$/, '');
    return name.length >= 2 ? name : 'AI Agent';
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
            createdAt: Date.now(),
            ...(pending.provisionalName ? { provisionalName: pending.provisionalName } : {})
        }));
        return true;
    } catch (error) {
        return false;
    }
}

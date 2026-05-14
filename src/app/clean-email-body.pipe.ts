import { Pipe, PipeTransform } from '@angular/core';

/**
 * Strips noise from email message bodies that arrive raw from the
 * email-ticketing pipeline.
 *
 * The pipe operates in two modes:
 *  - 'cleaned' (default): strips both cosmetic noise (CID references,
 *    Outlook alt-text, redundant URL artifacts, disclaimers, eco-print
 *    reminders, trailing alt-text-only lines) AND the entire reply chain
 *    (forward markers, "Da:/From:" headers, "On ... wrote:", quoted ">"
 *    lines, RFC 3676 signature delimiter). Best for the default view of
 *    an inbound message: the agent sees just the new content.
 *  - 'full': strips only the cosmetic noise but keeps the reply chain
 *    visible. Use it when the agent expands the message to inspect the
 *    full email history (e.g. legal correspondence forwarded into the
 *    conversation that does not exist as separate bubbles).
 *
 * Acts only when the channel is 'email'; for any other channel the input
 * is returned unchanged, so the pipe can be safely applied in shared
 * templates without affecting widget/social channels.
 *
 * Markdown attachment links of the form "[image001.png](https://...)"
 * are intentionally preserved so that the marked pipe downstream can
 * still render them as clickable links to the attachment endpoint.
 */
@Pipe({ name: 'cleanEmailBody' })
export class CleanEmailBodyPipe implements PipeTransform {

  transform(
    text: string | undefined | null,
    channelName?: string,
    mode: 'cleaned' | 'full' = 'cleaned'
  ): string {
    if (!text) {
      return '';
    }
    if (channelName !== 'email') {
      return text;
    }

    let cleaned = text;

    // ---------------------------------------------------------------
    // Reply chain — stripped only in 'cleaned' mode.
    // ---------------------------------------------------------------
    if (mode === 'cleaned') {
      // Outlook / Apple Mail / localized forward and reply markers.
      cleaned = cleaned.replace(
        /^-{2,}\s*(?:Original Message|Forwarded message|Messaggio originale|Messaggio inoltrato|Message d'origine|Message transféré|Ursprüngliche Nachricht|Weitergeleitete Nachricht)\s*-{2,}[\s\S]*$/im,
        ''
      );

      // Outlook-style header block in EN / IT / FR / DE / ES.
      // Drop from the first localized "From:" line onwards.
      cleaned = cleaned.replace(
        /^(?:From|Da|De|Von):\s+[\s\S]*?(?:Sent|Inviato|Envoyé|Gesendet|Enviado):\s+[\s\S]*$/im,
        ''
      );

      // Gmail / Apple Mail quoted reply chain ("On <date> ... wrote:" + IT/FR/DE/ES variants).
      cleaned = cleaned.replace(
        /^(?:On|Il|Le|Am|El)\s.+(?:wrote|ha scritto|a écrit|schrieb|escribió):[\s\S]*$/im,
        ''
      );

      // Plain-text quoted lines (RFC 3676) — lines starting with ">".
      cleaned = cleaned.replace(/^>.*$/gm, '');

      // RFC 3676 signature delimiter ("-- " on its own line) — drop signature.
      cleaned = cleaned.replace(/^--\s*$[\s\S]*$/m, '');
    }

    // ---------------------------------------------------------------
    // Cosmetic noise — always stripped in both modes.
    // ---------------------------------------------------------------

    // CID inline-image references: [cid:filename@id]
    cleaned = cleaned.replace(/\[cid:[^\]]+\]/gi, '');

    // Inline image placeholders left by mail clients: [image: filename].
    cleaned = cleaned.replace(/\[image:\s*[^\]]+\]/gi, '');

    // Outlook plain-text alt-text for inline images, possibly multi-line.
    // Restricted to localized "Description" prefixes so it does not match
    // markdown attachment links like "[image001.png](url)".
    cleaned = cleaned.replace(
      /\[(?:Description|Descripción|Descrizione|Beschreibung)[^\]]*?\.(?:png|jpe?g|gif|bmp|svg|webp)[^\]]*?\]/gi,
      ''
    );

    // Outlook plain-text URL artifacts: "user@dom.com<mailto:user@dom.com>",
    // "site.com<http://site.com>". Strip the <url> portion, keep visible text.
    cleaned = cleaned.replace(/<(?:mailto:|https?:\/\/)[^>]+>/gi, '');

    // Lines containing only bracketed alt-text leftovers, including multi-bracket
    // lines like "[Trustpilot Human score]   [Trustpilot Stars]   [Trustpilot Logo]".
    cleaned = cleaned.replace(/^(?:[ \t]*\[[^\]\n]+\][ \t]*)+$/gm, '');

    // Localized confidentiality / GDPR disclaimers — drop the paragraph
    // (until the next blank line or end of input).
    cleaned = cleaned.replace(
      /^(?:Avviso di riservatezza|Confidentiality Notice|Avis de confidentialité|Vertraulichkeitshinweis|Aviso de confidencialidad|DISCLAIMER)(?:(?!\n\n)[\s\S])*/im,
      ''
    );

    // Localized eco-print reminders.
    cleaned = cleaned.replace(
      /^(?:P\s+)?(?:Pensa all'ambiente|Please consider (?:the )?environment|Pensez à l'environnement|Bitte denken Sie an die Umwelt|Por favor,?\s+piensa en el medio ambiente)[^\n]*$/gim,
      ''
    );

    // Collapse runs of 3+ blank lines into 2 to keep paragraphs readable.
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

    return cleaned.trim();
  }
}

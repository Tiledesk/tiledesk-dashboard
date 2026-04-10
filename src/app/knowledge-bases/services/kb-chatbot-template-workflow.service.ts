import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';

import { FaqKbService } from 'app/services/faq-kb.service';
import { ACTION_TYPE_ASKGPTV2, CHATBOT_TEMPLATE_TAG_KB_OFFICIAL_RESPONDER } from 'app/utils/constants';

@Injectable({ providedIn: 'root' })
export class KbChatbotTemplateWorkflowService {
  constructor(private faqKbService: FaqKbService) {}

  /**
   * Recupera il template certificato `kb-official-responder`, lo esporta in JSON e lo "patcha"
   * impostando il `namespaceId` su tutte le azioni `askgptv2`.
   */
  exportKbOfficialResponderPatchedJson(params: { namespaceId: string }): Observable<any> {
    const namespaceId = params?.namespaceId;
    if (!namespaceId) {
      return throwError(() => new Error('Missing namespaceId'));
    }

    return this.faqKbService.getTemplates().pipe(
      take(1),
      map((certifiedTemplates: any[]) => {
        const kbOfficialResponderTemplate = certifiedTemplates?.find((c: any) =>
          c?.certifiedTags?.some((t: any) => t?.name === CHATBOT_TEMPLATE_TAG_KB_OFFICIAL_RESPONDER),
        );
        if (!kbOfficialResponderTemplate?._id) {
          throw new Error('kb-official-responder template not found');
        }
        return kbOfficialResponderTemplate._id as string;
      }),
      switchMap((templateId: string) => this.faqKbService.exportChatbotToJSON(templateId).pipe(take(1))),
      map((chatbotJson: any) => {
        const intents: any[] = chatbotJson?.intents ?? [];
        intents.forEach((intent: any) => {
          const actions: any[] = intent?.actions ?? [];
          actions.forEach((action: any) => {
            if (action?._tdActionType === ACTION_TYPE_ASKGPTV2) {
              action.namespace = namespaceId;
            }
          });
        });
        return chatbotJson;
      }),
    );
  }
}


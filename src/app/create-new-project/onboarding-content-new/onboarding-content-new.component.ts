import { Component, HostListener, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { take } from 'rxjs/operators';
import { AuthService } from 'app/core/auth.service';
import { FaqKbService } from 'app/services/faq-kb.service';
import { KnowledgeBaseService } from 'app/services/knowledge-base.service';
import { BrandService } from 'app/services/brand.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { OnboardingChatbotSetupService } from 'app/services/onboarding-chatbot-setup.service';
import { WidgetSetUpBaseComponent } from 'app/widget_components/widget-set-up/widget-set-up-base/widget-set-up-base.component';
import { ACTION_TYPE_ASKGPTV2, CHATBOT_TEMPLATE_TAG_KB_OFFICIAL_RESPONDER, DEFAULT_CHATBOT_NAME } from 'app/utils/constants';

/**
 * Onboarding "new" eseguito subito dopo la creazione di un progetto.
 *
 * Responsabilità:
 * - mostra un overlay con loader (o errore) mentre viene creato l'agente/chatbot di default
 * - al termine, reindirizza alla pagina Knowledge Bases del progetto
 */
@Component({
  selector: 'cnp-onboarding-content-new',
  templateUrl: './onboarding-content-new.component.html',
  styleUrls: ['./onboarding-content-new.component.scss']
})
export class OnboardingContentNewComponent extends WidgetSetUpBaseComponent implements OnInit {
  CLOSE_BTN_IS_HIDDEN = false;
  DISPLAY_SPINNER = true;

  companyLogo: string;
  companyLogoNoText: string;
  newProject: any;
  projectName: string;
  projectID: string;
  displayLogoWithText: boolean = true;

  /** Se valorizzato, l'overlay mostra l'interfaccia di errore. */
  creationErrorMessage: string = '';

  /** Flag di debug: forza la UI di errore al primo load. */
  private simulateErrorUi = false;

  constructor(
    private auth: AuthService,
    private router: Router,
    public location: Location,
    public brandService: BrandService,
    private logger: LoggerService,
    private route: ActivatedRoute,
    public translate: TranslateService,
    private faqKbService: FaqKbService,
    private onboardingChatbotSetupService: OnboardingChatbotSetupService,
    private kbService: KnowledgeBaseService,
  ) {
    super(translate);
    const brand = brandService.getBrand();
    this.companyLogo = brand['BASE_LOGO'];
    this.companyLogoNoText = brand['BASE_LOGO_NO_TEXT'];
    this.projectID = this.route.snapshot.params['projectid'];
  }

  /**
   * Entrypoint del componente:
   * - imposta il logo in base alla viewport
   * - aggancia il progetto corrente
   * - avvia automaticamente `createChatbot()`
   */
  ngOnInit() {
    this.onInitWindowHeight();

    this.auth.project_bs.subscribe((project) => {
      if (project) {
        this.newProject = project;
        this.projectName = project.name;
      }
    });

    if (this.simulateErrorUi) {
      this.DISPLAY_SPINNER = false;
      this.creationErrorMessage = 'Errore simulato: creazione non completata. Premi “Riprova”.';
    } else {
      this.createChatbot();
    }
  }

  /**
   * Initializes logo rendering based on the current viewport width.
   * This keeps the header compact on very small screens.
   */
  onInitWindowHeight(): any {
    if (window.innerWidth < 371) {
      this.displayLogoWithText = false
    } else {
      this.displayLogoWithText = true
    }
  }

  @HostListener('window:resize', ['$event'])
  /**
   * Keeps header logo responsive on resize.
   */
  onResize(_event: any) {
    if (window.innerWidth < 371) {
      this.displayLogoWithText = false
    } else {
      this.displayLogoWithText = true
    }
  }

  /**
   * Closes the onboarding and returns to the previous page.
   */
  goBack() {
    this.location.back();
  }

  /**
   * Final CTA: exits onboarding to Knowledge Bases for the current project.
   * Uses the route param when available, otherwise falls back to the selected project stream.
   */
  goToExitOnboarding() {
    const pid = this.projectID || this.newProject?._id || this.newProject?.id;
    if (pid) {
      this.router.navigate([`project/${pid}/knowledge-bases`]);
    }
  }

  /**
   * Crea l'agente/chatbot di default (template certificato `CHATBOT_TEMPLATE_TAG_KB_OFFICIAL_RESPONDER`)
   * e collega la Knowledge Base.
   *
   * Passi eseguiti:
   * 1) Recupera il `projectId` dal progetto selezionato (stream `AuthService.project_bs`).
   * 2) Recupera i namespaces della Knowledge Base e seleziona il primo (`namespaceId`).
   * 3) Recupera i template chatbot e individua quello certificato con tag `kb-official-responder`.
   * 4) Esporta il template in JSON.
   * 5) Modifica il JSON:
   *    - imposta il nome chatbot (`chatbotJson.name = DEFAULT_CHATBOT_NAME`)
   *    - per ogni azione di tipo `ACTION_TYPE_ASKGPTV2`, imposta `action.namespace = namespaceId`
   * 6) Importa il chatbot nel progetto e rinomina il namespace KB per allinearlo al nome del chatbot
   *    (via `OnboardingChatbotSetupService.importChatbotAndRenameNamespace`).
   * 7) Pubblica il chatbot e, se necessario, lo aggancia al dipartimento di default
   *    (via `OnboardingChatbotSetupService.publishAndHookToDefaultDeptIfNeeded`).
   * 8) In caso di successo: nasconde il loader e naviga alla pagina Knowledge Bases.
   * 9) In caso di errore: nasconde il loader e mostra un messaggio + pulsante "Riprova".
   */
  createChatbot() {
    const chatbotName = DEFAULT_CHATBOT_NAME;
    const kbOfficialResponderTag = CHATBOT_TEMPLATE_TAG_KB_OFFICIAL_RESPONDER;

    this.simulateErrorUi = false;

    this.creationErrorMessage = '';
    this.DISPLAY_SPINNER = true;

    this.auth.project_bs.pipe(take(1)).subscribe((project: any) => {
      const projectId = project?._id || project?.id;
      if (!projectId) {
        this.logger.error('[ONBOARDING-CONTENT-NEW] createChatbot - missing projectId');
        this.creationErrorMessage = 'Impossibile determinare il progetto corrente.';
        this.DISPLAY_SPINNER = false;
        return;
      }

      this.kbService.getAllNamespaces().pipe(take(1)).subscribe((namespaces: any[]) => {
        const firstNamespace = namespaces?.[0];
        const namespaceId = firstNamespace?.id;
        if (!namespaceId) {
          this.logger.error('[ONBOARDING-CONTENT-NEW] createChatbot - missing namespaceId');
          this.creationErrorMessage = 'Impossibile determinare la knowledge base del progetto.';
          this.DISPLAY_SPINNER = false;
          return;
        }

        this.faqKbService.getTemplates().pipe(take(1)).subscribe((templates: any[]) => {
          const kbOfficialResponderTemplate = templates?.find((t: any) =>
            t?.certifiedTags?.some((tag: any) => tag?.name === kbOfficialResponderTag)
          );
          if (!kbOfficialResponderTemplate?._id) {
            this.logger.error('[ONBOARDING-CONTENT-NEW] createChatbot - kb-official-responder template not found');
            this.creationErrorMessage = 'Template chatbot non disponibile.';
            this.DISPLAY_SPINNER = false;
            return;
          }

          this.faqKbService.exportChatbotToJSON(kbOfficialResponderTemplate._id).pipe(take(1)).subscribe((chatbotJson: any) => {
            if (!chatbotJson) {
              this.logger.error('[ONBOARDING-CONTENT-NEW] createChatbot - exportChatbotToJSON returned empty payload');
              this.creationErrorMessage = 'Impossibile preparare il chatbot (export JSON).';
              this.DISPLAY_SPINNER = false;
              return;
            }

            chatbotJson['name'] = chatbotName;
            if (Array.isArray(chatbotJson?.intents)) {
              chatbotJson.intents.forEach((intent: any) => {
                const actions = intent?.actions;
                if (!Array.isArray(actions)) return;
                actions.forEach((action: any) => {
                  if (action?._tdActionType === ACTION_TYPE_ASKGPTV2) {
                    action.namespace = namespaceId;
                  }
                });
              });
            }

            this.onboardingChatbotSetupService.importChatbotAndRenameNamespace({
              chatbotJson,
              chatbotName,
              projectId,
              namespaceId,
            }).subscribe({
              next: ({ faqkb }) => {
                this.onboardingChatbotSetupService.publishAndHookToDefaultDeptIfNeeded(faqkb).subscribe({
                  next: () => {
                    this.logger.log('[ONBOARDING-CONTENT-NEW] createChatbot - completed');
                    this.DISPLAY_SPINNER = false;
                    this.goToExitOnboarding();
                  },
                  error: (err) => {
                    this.logger.error('[ONBOARDING-CONTENT-NEW] createChatbot - publish/hook ERROR', err);
                    this.creationErrorMessage = 'Errore durante la pubblicazione/attivazione dell’agente.';
                    this.DISPLAY_SPINNER = false;
                  }
                });
              },
              error: (err) => {
                this.logger.error('[ONBOARDING-CONTENT-NEW] createChatbot - ERROR', err);
                this.creationErrorMessage = 'Errore durante la creazione dell’agente.';
                this.DISPLAY_SPINNER = false;
              }
            });
          });
        });
      });
    });
  }
}


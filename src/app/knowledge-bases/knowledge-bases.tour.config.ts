import { Router } from '@angular/router';
import { ShepherdService } from 'angular-shepherd';
import Shepherd from 'shepherd.js';
import { TranslateService } from '@ngx-translate/core';
import { BrandService } from 'app/services/brand.service';




export const STEPS_BUTTONS = {
  back: {
    classes: 'back-button',
    secondary: true,
    text: 'Back',
    type: 'back',
  },
  cancel: {
    classes: 'cancel-button',
    secondary: true,
    text: 'Exit',
    type: 'cancel',
  },
  next: {
    classes: 'next-button',
    text: 'Next',
    type: 'next',
  },
};

export const defaultStepOptions = {
  classes: 'shepherd-theme-arrows custom-default-class',
  scrollTo: true,
  cancelIcon: {
    enabled: true,
  },
  when: {
    show() {
      const currentStep = Shepherd.activeTour?.getCurrentStep();
      const currentStepElement = currentStep?.getElement();
      const footer = currentStepElement?.querySelector('.shepherd-footer');
      const progress = document.createElement('span');
      progress.className = 'shepherd-progress';
      progress.innerText = `${Shepherd.activeTour?.steps.indexOf(currentStep) + 1} of ${Shepherd.activeTour?.steps.length}`;
      footer?.insertBefore(progress, currentStepElement.querySelector('.shepherd-button:last-child'));
    }
  }
 
};

export function getSteps(router: Router, service: ShepherdService, translation: TranslateService, brandService: BrandService) {

  const brand = brandService.getBrand();
  return [

    {
      attachTo: {
        // .tour-card:nth-child(3) h2
        element: '.buttons-div #kb-add-content' ,
        on: 'bottom',
      },
      // STEPS_BUTTONS.cancel,STEPS_BUTTONS.back,
      buttons: [STEPS_BUTTONS.next],
      classes: 'custom-class-shepherd-bottom custom-class-name-2',
      id: 'kb-tour-step-1',
      title: 'Add contents',
      text: 'Add contents (URLs, PDFs, etc.) to your Knowledge Base. The contents of a knowledge base are structured to assist users in finding solutions to their queries quickly and efficiently',
    },

    {
      attachTo: {
        // .tour-card:nth-child(3) h2
        element: '.buttons-div #kb-preview' ,
        on: 'bottom',
      },
      // STEPS_BUTTONS.cancel,
      buttons: [ STEPS_BUTTONS.back, STEPS_BUTTONS.next],
      classes: 'custom-class-shepherd-bottom custom-class-name-2',
      id: 'kb-tour-step-2',
      title: 'Knowledge Base Preview',
      text: `Preview knowledge base responses based on your contents and AI parameters so you can find the best setup for your needs
      
      <div class="image-container">
            <img 
                src="assets/img/igor-bastidas-1.gif"
                class="image-style"
                frameBorder="0" 
                allowFullScreen>
            </img>
        </div>
      
      `,
      // igor-bastidas-1.gif
    },

    {
      // .tour-card:nth-child(2) h2
      attachTo: {
        element: '.buttons-div #ai-settings',
        on: 'bottom',
      },
      buttons: [STEPS_BUTTONS.back, STEPS_BUTTONS.next],
      classes: 'custom-class-shepherd-bottom custom-class-name-2',
      id: 'kb-tour-step-3',
      title: 'AI settings',
      text: 'Select an AI model and manage its parameters. Parameters (such as Max Tokens, Temperature, and Chunks) essentially define the behavior of an AI model.' //One intriguing parameter is the \"temperature.\" Temperature is a parameter that controls the randomness of the output; a higher temperature results in more diverse and less predictable responses, while a lower temperature produces more focused and deterministic answers.',
    },

    {
      attachTo: {
        // .tour-card:nth-child(3) h2
        element: '#kb-chatbot' ,
        on: 'bottom',
      },
      // STEPS_BUTTONS.cancel, ,STEPS_BUTTONS.next
      buttons: [STEPS_BUTTONS.back,STEPS_BUTTONS.next],
      classes: 'custom-class-shepherd-bottom custom-class-name-2',
      id: 'kb-tour-step-4-A',
      title: 'AI chatbot',
      text: 'Your advanced AI chatbot connected to your contents ready to reply timely and precise to your users\' answers and questions',
    },
    {
      attachTo: {
        // .tour-card:nth-child(3) h2
        element: '#kb-no-chatbot' ,
        on: 'bottom',
      },
      // STEPS_BUTTONS.cancel,
      buttons: [STEPS_BUTTONS.back,STEPS_BUTTONS.next],
      classes: 'custom-class-shepherd-bottom custom-class-name-2',
      id: 'kb-tour-step-4-B',
      title: 'AI chatbot',
      text: 'Create your advanced AI chatbot connected to your contents ready to reply timely and precise to your users\' answers and questions',
    },
    {
      attachTo: {
        // .tour-card:nth-child(3) h2
        element: '' ,
        on: '',
      },
      // STEPS_BUTTONS.cancel,
      buttons: [ STEPS_BUTTONS.cancel],
      classes: 'step-with-image custom-class-name-2',
      id: 'kb-tour-step-5',
      title: 'That\'s it!',
      text:`
      <div class="tour-text-container">
        <div class="image-container">
            <img 
                src="assets/img/success.png"
                class="image-style"
                frameBorder="0" 
                allowFullScreen>
            </img>
        </div>
      </div>
      <div class="step-image-text"> 
        You're ready to start on your own work. If you need more guidance, <a href='mailto:${brand['CONTACT_US_EMAIL']}?subject=Knowledge Base tour support'>CONTACT US</a>
       </div>
      `
    },
  
    
    // {
    //   attachTo: {
    //     element: '#selected-namespace-name',
    //     on: 'bottom',
    //   },
    //   buttons: [STEPS_BUTTONS.next],
    //   classes: 'custom-class-shepherd-bottom custom-class-name-2',
    //   id: 'kb-tour-step-1',
    //   // title: 'Current knowledge base name',
    //   title: translation.instant('KbPage.CurrentKnowledgeBaseName'),

    //   text: 'Click anywhere in this paragraph to edit the knowledge base name',
    // },
    // {
    //   attachTo: {
    //     // element: '.main-content h2',
    //     element: '#select-namespace',
    //     on: 'bottom',
    //   },
    //   // STEPS_BUTTONS.cancel,
    //   buttons: [STEPS_BUTTONS.back, STEPS_BUTTONS.next],
    //   classes: 'custom-class-shepherd-bottom',
    //   id: 'kb-tour-step-2',
    //   title: 'Create or select',
    //   text: 'By clicking this button you have the possibility to switch knowledge base or create a new one',
    // },
    // {
    //   attachTo: {
    //     // .tour-card:nth-child(1) h2
    //     element: '.buttons-div #delete-kb',
    //     on: 'bottom',
        
    //   },
    //   // STEPS_BUTTONS.cancel, 
    //   buttons: [STEPS_BUTTONS.back, STEPS_BUTTONS.next],
    //   classes: 'custom-class-shepherd-bottom custom-class-name-2',
    //   id: 'kb-tour-step-3',
    //   title: 'Remove',
    //   text: 'Remove the selected knowledge base',
    // },
  
    

    // {
    //   attachTo: {
    //     element: 'footer',
    //     on: 'top',
    //   },
    //   buttons: [ STEPS_BUTTONS.cancel,
    //     {
    //       text: 'Next',
    //       classes: 'dx-button-mode-contained dx-button-default dx-state-hover',
    //       action: function () {
    //         router.navigateByUrl(
    //           '/promotion?showGuide=true'
    //         );
    //         service.complete();
    //       },
    //     },
    //   ],
    //   classes: 'custom-class-name-1 custom-class-name-2',
    //   id: 'footer',
    //   title: 'Adventure Tours',
    //   text: '© 2023 Adventure Tours. All rights reserved.',
    // },
  ];
}




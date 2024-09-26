import { Router } from '@angular/router';
import { ShepherdService } from 'angular-shepherd';
import Shepherd from 'shepherd.js';
import { TranslateService } from '@ngx-translate/core';
import { BrandService } from 'app/services/brand.service';

// export const STEPS_BUTTONS = {
//   back: {
//     classes: 'back-button',
//     secondary: true,
//     text: 'Back',
//     type: 'back',
//   },
//   cancel: {
//     classes: 'cancel-button',
//     secondary: true,
//     text: 'Exit',
//     type: 'cancel',
//   },
//   next: {
//     classes: 'next-button',
//     text: 'Next',
//     type: 'next',
//   },
// };

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
  let self = this
  const STEPS_BUTTONS = {
    back: {
      classes: 'back-button',
      secondary: true,
      text: translation.instant('KbPage.Back'), // 'Back',
      type: 'back',
    },
    cancel: {
      classes: 'cancel-button',
      secondary: true,
      text: translation.instant('KbPage.ThatsIsAll'), //'Exit',
      type: 'cancel',
    },
    next: {
      classes: 'next-button',
      text: translation.instant('KbPage.Next'), // 'Next',
      type: 'next',
    },
  };
  
  return [

    // {
    //   attachTo: {
    //     // .tour-card:nth-child(3) h2
    //     element: '.buttons-div .add-kb-div #kb-add-content' ,
    //     on: 'bottom',
    //   },
    //   // STEPS_BUTTONS.cancel,STEPS_BUTTONS.back,
    //   buttons: [STEPS_BUTTONS.next],
    //   classes: 'custom-class-shepherd-bottom-l step-with-gif',
    //   id: 'kb-tour-step-1',
    //   title: translation.instant('KbPage.AddContentsTourTitle'), //'Add contents',
    //   text: `${translation.instant('KbPage.AddContentsTourText')}
      
    //   <div class="image-container">
    //         <img 
    //             src="assets/img/add-content.gif"
    //             class="image-style"
    //             frameBorder="0" 
    //             allowFullScreen>
    //         </img>
    //     </div>`
    // },

    // {
    //   attachTo: {
    //     // .tour-card:nth-child(3) h2
    //     element: '.buttons-div #kb-preview' ,
    //     on: 'bottom',
    //   },
    //   // STEPS_BUTTONS.cancel custom-class-shepherd-bottom,
    //   buttons: [ STEPS_BUTTONS.back, STEPS_BUTTONS.next],
    //   classes: 'custom-class-shepherd-bottom-l step-with-gif',
    //   id: 'kb-tour-step-2',
    //   title: translation.instant('KbPage.KnowledgeBasePreview'), //'Knowledge Base Preview',
    //   text: `${translation.instant('KbPage.PreviewKbTourText')} 
      
    //    <div class="image-container">
    //         <img 
    //             src="assets/img/kb_preview.gif"
    //             class="image-style"
    //             frameBorder="0" 
    //             allowFullScreen>
    //         </img>
    //     </div>`
      
      
      
    // },

    // {
    //   // .tour-card:nth-child(2) h2
    //   // custom-class-shepherd-bottom
    //   attachTo: {
    //     element: '.buttons-div #ai-settings',
    //     on: 'bottom',
    //   },
    //   buttons: [STEPS_BUTTONS.back, STEPS_BUTTONS.next],
    //   classes: 'custom-class-shepherd-bottom-l step-with-gif',
    //   id: 'kb-tour-step-3',
    //   title:  translation.instant('KbPage.AISettingsTourTitle'), //'AI settings',
    //   text:  `${translation.instant('KbPage.AISettingsTourText')} 

    //   <div class="image-container">
    //         <img 
    //             src="assets/img/kb_settings_step.gif"
    //             class="image-style"
    //             frameBorder="0" 
    //             allowFullScreen>
    //         </img>
    //     </div>`
    // },

    // {
    //   attachTo: {
    //     // .tour-card:nth-child(3) h2
    //     element: '#kb-chatbot' ,
    //     on: 'bottom',
    //   },
    //   // STEPS_BUTTONS.cancel, ,STEPS_BUTTONS.next, custom-class-shepherd-bottom
    //   buttons: [STEPS_BUTTONS.back,STEPS_BUTTONS.next],
    //   classes: 'custom-class-shepherd-bottom-l step-with-gif',
    //   id: 'kb-tour-step-4-A',
    //   title: translation.instant('KbPage.AIChatbotTourTitle'), //' AI chatbot',
    //   text: `${translation.instant('KbPage.AIChatbotTourText')}
    //   <div class="image-container">
    //     <img 
    //         src="assets/img/kb_step_chatbot.gif"
    //         class="image-style"
    //         frameBorder="0" 
    //         allowFullScreen>
    //     </img>
    //   </div>` 
    // },
    // {
    //   attachTo: {
    //     // .tour-card:nth-child(3) h2
    //     element: '#kb-no-chatbot' ,
    //     on: 'bottom',
    //   },
    //   // STEPS_BUTTONS.cancel,
    //   buttons: [STEPS_BUTTONS.back,STEPS_BUTTONS.next],
    //   classes: 'custom-class-shepherd-bottom custom-class-name-2',
    //   id: 'kb-tour-step-4-B',
    //   title: translation.instant('KbPage.AIChatbotTourTitle'), //'AI chatbot',
    //   text: translation.instant('KbPage.NoAIChatbotTourText')  // 'Create your advanced AI chatbot connected to your contents ready to reply timely and precise to your users\' answers and questions',
    // },
    {
      attachTo: {
        // .tour-card:nth-child(3) h2
        element: '#support-anchor' ,
        on: 'right',
      },
      // STEPS_BUTTONS.cancel, STEPS_BUTTONS.back,
      buttons: [  STEPS_BUTTONS.cancel],
      classes: 'step-with-image custom-cancel-button padding-4',
      id: 'sb-tour-step-1',
      title: translation.instant('WelcomeToYourHelpCenter'), //'Welcome to your Help Center!',
      
      text:`${translation.instant('TheHelpCenterIsDesignedToProvide')}
      <div class="tour-text-container">
        <div class="image-container">
            <img 
                src="assets/img/support-2.gif"
                class="image-style"
                frameBorder="0" 
                allowFullScreen>
            </img>
        </div>
      </div>
     
      `
      // <div class="step-image-text"> 
      // ${translation.instant('KbPage.LastStepText')} <a href='mailto:${brand['CONTACT_US_EMAIL']}?subject=Knowledge Base tour support'>${translation.instant('KbPage.LastStepContactUs')}</a>
      // </div>
     // text: `${translation.instant('TheHelpCenterIsDesignedToProvide')}  ` // `The Help Center is designed to provide a complete support option. You can get information from our documentation or turn to the community. If you can't find an answer, you can send a request directly to one of our agents via email or live chat.
   
     
    },
  
    
   
  ];
}




import { Router } from '@angular/router';
import { ShepherdService } from 'angular-shepherd';
import Shepherd from 'shepherd.js';

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
    enabled: false,
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

export function getSteps(router: Router, service: ShepherdService) {
  return [
    {
      attachTo: {
        element: '#selected-namespace-name',
        on: 'bottom',
      },
      buttons: [STEPS_BUTTONS.cancel, STEPS_BUTTONS.next],
      classes: 'custom-class-shepherd-bottom custom-class-name-2',
      id: 'kb-tour-step-1',
      title: 'Current knowledge base name',
      text: 'Click anywhere in this paragraph to edit the knowledge base name',
    },
    {
      attachTo: {
        element: '.main-content h2',
        on: 'bottom',
      },
      buttons: [STEPS_BUTTONS.cancel, STEPS_BUTTONS.back, STEPS_BUTTONS.next],
      classes: 'orange',
      id: 'choose-adventure',
      title: 'Choose Your First Adventure',
      text: '',
    },
    {
      attachTo: {
        element: '.tour-card:nth-child(1) h2',
        on: 'bottom',
      },
      buttons: [STEPS_BUTTONS.cancel, STEPS_BUTTONS.back, STEPS_BUTTONS.next],
      classes: 'custom-class-name-1 custom-class-name-2',
      id: 'tour1',
      title: 'Tour 1: Mountain Expedition',
      text: 'Explore breathtaking mountain landscapes and challenge yourself with thrilling hikes.',
    },
    {
      attachTo: {
        element: '.tour-card:nth-child(2) h2',
        on: 'bottom',
      },
      buttons: [STEPS_BUTTONS.cancel, STEPS_BUTTONS.next],
      classes: 'custom-class-name-1 custom-class-name-2',
      id: 'tour2',
      title: 'Tour 2: Beach Paradise',
      text: 'Relax on pristine beaches, snorkel in crystal-clear waters, and enjoy the tropical sun.',
    },
    {
      attachTo: {
        element: '.tour-card:nth-child(3) h2',
        on: 'bottom',
      },
      buttons: [STEPS_BUTTONS.cancel, STEPS_BUTTONS.back, STEPS_BUTTONS.next],
      classes: 'custom-class-name-1 custom-class-name-2',
      id: 'tour3',
      title: 'Tour 3: Cultural Experience',
      text: 'Immerse yourself in the rich culture and history of the destinations we offer.',
    },
    {
      attachTo: {
        element: 'footer',
        on: 'top',
      },
      buttons: [
        STEPS_BUTTONS.cancel,
        {
          text: 'Next',
          classes: 'dx-button-mode-contained dx-button-default dx-state-hover',
          action: function () {
            router.navigateByUrl(
              '/promotion?showGuide=true'
            );
            service.complete();
          },
        },
      ],
      classes: 'custom-class-name-1 custom-class-name-2',
      id: 'footer',
      title: 'Adventure Tours',
      text: '© 2023 Adventure Tours. All rights reserved.',
    },
  ];
}

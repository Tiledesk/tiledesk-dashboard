import { CanDeactivate } from '@angular/router';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';


// 1st method:  https://stackoverflow.com/questions/35922071/warn-user-of-unsaved-changes-before-leaving-page?rq=1

// 2nd method: https://stackoverflow.com/questions/49803776/how-to-prompt-user-when-leaving-the-angular-4-page-if-there-are-any-changes-made 


// ----------------------------------------------------------------------------------------------------------------------------------------------------
// @ 1st method: modified to display a custom modal (the custom modal is managed in the component that implements the ComponentCanDeactivate interface)
// ----------------------------------------------------------------------------------------------------------------------------------------------------

export interface ComponentCanDeactivate {
  canDeactivate: () => boolean | Observable<boolean>;
}


@Injectable()
export class PendingChangesGuard implements CanDeactivate<ComponentCanDeactivate> {

  

  canDeactivate(component: ComponentCanDeactivate): boolean | Observable<boolean> {
    // if there are no pending changes, just allow deactivation; else confirm first
    return component.canDeactivate() 
    // // ?
    //   true :
    //   // NOTE: this warning message will only be shown when navigating elsewhere within your angular app;
    //   // when navigating away from your angular app, the browser will show a generic warning message
    //   // see http://stackoverflow.com/a/42207299/7307355
    //   confirm('WARNING: You have unsaved changes. Press Cancel to go back and save these changes, or OK to lose these changes.');
  
  }


}



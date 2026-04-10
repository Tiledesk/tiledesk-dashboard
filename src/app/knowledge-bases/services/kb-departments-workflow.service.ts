import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';

import { DepartmentService } from 'app/services/department.service';

@Injectable({ providedIn: 'root' })
/**
 * Workflow per dipartimenti (Departments) nel contesto Knowledge Bases.
 *
 * Azioni:
 * - carica i dipartimenti del progetto corrente
 * - aggancia un bot ad un dipartimento (`updateExistingDeptWithSelectedBot`)
 *
 * Quando viene invocato:
 * - dopo la creazione/import di un bot, per agganciarlo al default dept (se necessario)
 * - quando l’utente seleziona un dept nella modale “Hook bot”
 *
 * Da chi viene invocato:
 * - `KnowledgeBasesFacadeService.departments.*`
 * - `KnowledgeBasesComponent.hookBotToDept()` tramite `kbFacade.hookBotToDept()`
 */
export class KbDepartmentsWorkflowService {
  constructor(private departmentService: DepartmentService) {}

  loadDepartments(): Observable<any[]> {
    return this.departmentService.getDeptsByProjectId();
  }

  hookBotToDept(deptId: string, botId: string): Observable<any> {
    if (!deptId) return throwError(() => new Error('deptId is required'));
    if (!botId) return throwError(() => new Error('botId is required'));
    return this.departmentService.updateExistingDeptWithSelectedBot(deptId, botId);
  }
}


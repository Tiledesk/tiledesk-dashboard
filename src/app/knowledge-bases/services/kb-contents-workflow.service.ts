import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';

import { KnowledgeBaseService } from 'app/services/knowledge-base.service';

@Injectable({ providedIn: 'root' })
export class KbContentsWorkflowService {
  constructor(private kbService: KnowledgeBaseService) {}

  list(params: any): Observable<any> {
    return this.kbService.getListOfKb(params);
  }

  exportContents(namespaceId: string): Observable<any> {
    if (!namespaceId) return throwError(() => new Error('namespaceId is required'));
    return this.kbService.exportContents(namespaceId);
  }

  importContents(namespaceId: string, formData: FormData): Observable<any> {
    if (!namespaceId) return throwError(() => new Error('namespaceId is required'));
    if (!formData) return throwError(() => new Error('formData is required'));
    return this.kbService.importContents(formData, namespaceId);
  }

  addKb(body: any): Observable<any> {
    if (!body) return throwError(() => new Error('body is required'));
    return this.kbService.addKb(body);
  }

  updateKbContent(kb: any): Observable<any> {
    if (!kb) return throwError(() => new Error('kb is required'));
    return this.kbService.updateKbContent(kb);
  }

  addMultiKb(namespaceId: string, body: any): Observable<any> {
    if (!namespaceId) return throwError(() => new Error('namespaceId is required'));
    if (!body) return throwError(() => new Error('body is required'));
    return this.kbService.addMultiKb(body, namespaceId);
  }

  deleteKb(data: any): Observable<any> {
    if (!data) return throwError(() => new Error('data is required'));
    return this.kbService.deleteKb(data);
  }

  importSitemap(namespaceId: string, body: any): Observable<any> {
    if (!namespaceId) return throwError(() => new Error('namespaceId is required'));
    if (!body) return throwError(() => new Error('body is required'));
    return this.kbService.importSitemap(body, namespaceId);
  }

  addSitemap(body: any): Observable<any> {
    if (!body) return throwError(() => new Error('body is required'));
    return this.kbService.addSitemap(body);
  }
}


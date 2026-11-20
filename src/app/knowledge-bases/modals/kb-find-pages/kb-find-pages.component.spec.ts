import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { of, Subject, throwError } from 'rxjs';
import { KnowledgeBaseService } from 'app/services/knowledge-base.service';
import { KbFindPagesComponent } from './kb-find-pages.component';
import { CrawlDiscoverResult } from './kb-find-pages.util';

const RESULT: CrawlDiscoverResult = {
  pages: [
    { url: 'https://a.com/docs/setup', kind: 'page', depth: 1 },
    { url: 'https://a.com/docs/api', kind: 'page', depth: 1 },
    { url: 'https://a.com/pricing', kind: 'page', depth: 1 },
  ],
  truncated: false,
  fetched: 3,
};

describe('KbFindPagesComponent', () => {
  let fixture: ComponentFixture<KbFindPagesComponent>;
  let component: KbFindPagesComponent;
  let kb: jasmine.SpyObj<KnowledgeBaseService>;

  beforeEach(async () => {
    kb = jasmine.createSpyObj('KnowledgeBaseService', ['discoverPages']);
    await TestBed.configureTestingModule({
      declarations: [KbFindPagesComponent],
      imports: [FormsModule, TranslateModule.forRoot()],
      providers: [{ provide: KnowledgeBaseService, useValue: kb }],
    }).compileComponents();
    fixture = TestBed.createComponent(KbFindPagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('refuses a non-http address without calling the server', () => {
    component.source = 'ftp://x';
    component.scan();
    expect(kb.discoverPages).not.toHaveBeenCalled();
    expect(component.errorKey).toBe('KbPage.FindPagesInvalidUrl');
  });

  it('caps max pages at 300', () => {
    kb.discoverPages.and.returnValue(of(RESULT));
    component.source = ' https://a.com ';
    component.maxPages = 900;
    component.scan();
    expect(kb.discoverPages).toHaveBeenCalledWith('https://a.com', 300, 45);
  });

  it('shows the found pages grouped by section', () => {
    kb.discoverPages.and.returnValue(of(RESULT));
    component.source = 'https://a.com';
    component.scan();
    expect(component.phase).toBe('picking');
    expect(component.groups.map((g) => g.key)).toEqual(['/docs', '/pricing']);
  });

  it('marks a section partial when one of its pages is unticked', () => {
    kb.discoverPages.and.returnValue(of(RESULT));
    component.source = 'https://a.com';
    component.scan();
    const docs = component.groups[0];
    component.toggleGroup(docs);
    expect(component.groupState(docs)).toBe('all');
    component.togglePage(docs.urls[0]);
    expect(component.groupState(docs)).toBe('some');
    expect(component.selected.size).toBe(docs.urls.length - 1);
  });

  it('emits the picked urls on add and goes back to idle', () => {
    kb.discoverPages.and.returnValue(of(RESULT));
    const emitted: string[][] = [];
    component.pagesPicked.subscribe((u) => emitted.push(u));
    component.source = 'https://a.com';
    component.scan();
    component.togglePage('https://a.com/pricing');
    component.togglePage('https://a.com/docs/api');
    component.add();
    expect(emitted).toEqual([['https://a.com/docs/api', 'https://a.com/pricing']]);
    expect(component.phase).toBe('idle');
  });

  it('says no pages were found on an empty result', () => {
    kb.discoverPages.and.returnValue(of({ pages: [], truncated: false, fetched: 0 }));
    component.source = 'https://a.com';
    component.scan();
    expect(component.errorKey).toBe('KbPage.FindPagesNoneFound');
    expect(component.phase).toBe('idle');
  });

  it('maps server errors to messages', () => {
    component.source = 'https://a.com';
    kb.discoverPages.and.returnValue(throwError({ status: 504 }));
    component.scan();
    expect(component.errorKey).toBe('KbPage.FindPagesTimeout');
    kb.discoverPages.and.returnValue(throwError({ status: 501 }));
    component.scan();
    expect(component.errorKey).toBe('KbPage.FindPagesUnavailable');
    kb.discoverPages.and.returnValue(throwError({ status: 500 }));
    component.scan();
    expect(component.errorKey).toBe('KbPage.FindPagesFailed');
    expect(component.phase).toBe('idle');
  });

  it('keeps Esc inside the panel so the dialog stays open, and closes the panel', () => {
    const closed: number[] = [];
    component.closed.subscribe(() => closed.push(1));
    let reachedDocument = false;
    const onDoc = () => (reachedDocument = true);
    document.addEventListener('keydown', onDoc);
    document.body.appendChild(fixture.nativeElement);
    const panel: HTMLElement = fixture.nativeElement.querySelector('.find-pages');
    panel.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    document.removeEventListener('keydown', onDoc);
    expect(reachedDocument).toBe(false);
    expect(closed.length).toBe(1);
  });

  it('cancels a running scan when destroyed', () => {
    const pending = new Subject<CrawlDiscoverResult>();
    kb.discoverPages.and.returnValue(pending);
    component.source = 'https://a.com';
    component.scan();
    expect(component.phase).toBe('scanning');
    fixture.destroy();
    expect(pending.observers.length).toBe(0);
  });
});

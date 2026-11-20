import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { KbPagePickerComponent } from './kb-page-picker.component';
import { PickerItem } from '../kb-find-pages/kb-find-pages.util';

const D = 'https://drexel.edu/cpp';
const ITEMS: PickerItem[] = [
  { url: D + '/policy/tools', title: 'Policy tools' },
  { url: D + '/policy/faq', title: 'FAQ' },
  { url: D + '/compliance/matrix', title: 'Compliance matrix' },
  { url: D + '/~/media/Plan.pdf', title: 'Plan.pdf', type: 'pdf' },
];

describe('KbPagePickerComponent', () => {
  let fixture: ComponentFixture<KbPagePickerComponent>;
  let c: KbPagePickerComponent;
  let emitted: Set<string>[];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [KbPagePickerComponent],
      imports: [FormsModule, TranslateModule.forRoot()],
    }).compileComponents();
    fixture = TestBed.createComponent(KbPagePickerComponent);
    c = fixture.componentInstance;
    c.items = ITEMS;
    c.selected = new Set();
    emitted = [];
    c.selectedChange.subscribe((s) => emitted.push(new Set(s)));
    fixture.detectChanges();
  });

  it('groups items into sections with files last', () => {
    expect(c.groups().map((g) => g.key)).toEqual(['/compliance', '/policy', 'files']);
  });

  it('selects only what search shows, and keeps it when search is cleared', () => {
    c.query = 'tools';
    c.toggleAllShown();
    expect(Array.from(c.selected)).toEqual([D + '/policy/tools']);
    c.query = '';
    expect(c.selected.size).toBe(1);
    expect(c.allShownState()).toBe('some');
    expect(emitted.length).toBe(1);
  });

  it('filters files and pages', () => {
    c.kind = 'files';
    expect(c.visible().map((i) => i.url)).toEqual([D + '/~/media/Plan.pdf']);
    c.kind = 'pages';
    expect(c.visible().length).toBe(3);
    expect(c.countOf('files')).toBe(1);
    expect(c.countOf('pages')).toBe(3);
  });

  it('section checkbox is tri-state and toggles its visible pages', () => {
    const policy = c.groups().find((g) => g.key === '/policy')!;
    c.toggleGroup(policy);
    expect(c.groupState(policy)).toBe('all');
    c.togglePage(D + '/policy/faq');
    expect(c.groupState(policy)).toBe('some');
    c.toggleGroup(policy);
    expect(c.groupState(policy)).toBe('all');
    c.toggleGroup(policy);
    expect(c.groupState(policy)).toBe('none');
  });

  it('select all shown clears when everything shown is selected', () => {
    c.toggleAllShown();
    expect(c.selected.size).toBe(4);
    c.toggleAllShown();
    expect(c.selected.size).toBe(0);
  });

  it('renders titles, paths and file badges', () => {
    c.expanded.add('/policy');
    c.expanded.add('files');
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Policy tools');
    expect(text).toContain('/cpp/policy/tools');
    expect(fixture.nativeElement.querySelector('.kb-picker__badge').textContent.trim()).toBe('PDF');
  });
});

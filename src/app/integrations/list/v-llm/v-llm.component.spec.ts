import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { VLLMComponent } from './v-llm.component';
import { VllmEndpointTableComponent } from './vllm-endpoint-table/vllm-endpoint-table.component';

describe('VLLMComponent', () => {
  let component: VLLMComponent;
  let fixture: ComponentFixture<VLLMComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VLLMComponent, VllmEndpointTableComponent],
      imports: [FormsModule, TranslateModule.forRoot()],
    })
    .compileComponents();

    fixture = TestBed.createComponent(VLLMComponent);
    component = fixture.componentInstance;
    component.integration = {
      value: {
        servers: [],
      },
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

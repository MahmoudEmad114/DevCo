import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkspaceDetailsComponent } from './workspace-details.component';

describe('WorkspaceDetailsComponent', () => {
  let component: WorkspaceDetailsComponent;
  let fixture: ComponentFixture<WorkspaceDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WorkspaceDetailsComponent]
    });
    fixture = TestBed.createComponent(WorkspaceDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

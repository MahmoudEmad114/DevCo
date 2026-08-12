import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectChatComponent } from './project-chat.component';

describe('ProjectChatComponent', () => {
  let component: ProjectChatComponent;
  let fixture: ComponentFixture<ProjectChatComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProjectChatComponent]
    });
    fixture = TestBed.createComponent(ProjectChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

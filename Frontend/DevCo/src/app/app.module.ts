import { DragDropModule } from '@angular/cdk/drag-drop';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { LoginComponent } from './pages/auth/login/login.component';
import { SignupComponent } from './pages/auth/signup/signup.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ForgotPasswordComponent } from './pages/auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './pages/auth/reset-password/reset-password.component';

import { MainLayoutComponent } from './shared/layout/main-layout/main-layout.component';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { HeaderComponent } from './shared/components/header/header.component';
import { WorkspacesComponent } from './pages/workspaces/workspaces.component';
import { WorkspaceDetailsComponent } from './pages/workspaces/workspace-details/workspace-details.component';
import { CreateTaskModalComponent } from './shared/components/create-task-modal/create-task-modal.component';import { TaskDetailComponent } from './shared/components/task-detail/task-detail.component';
import { TaskBoardComponent } from './pages/tasks/task-board/task-board.component';
import { ProjectDetailsComponent } from './pages/projects/project-details/project-details.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent,
    SignupComponent,
    ResetPasswordComponent,
    ForgotPasswordComponent,
    MainLayoutComponent,
    SidebarComponent,
    HeaderComponent,
    WorkspacesComponent,
    WorkspaceDetailsComponent,
    CreateTaskModalComponent,
    TaskDetailComponent,
    TaskBoardComponent,
    ProjectDetailsComponent,
  ],
  imports: [
    BrowserModule,
    CommonModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    AppRoutingModule,
    DragDropModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
import { NgModule } from '@angular/core';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import {
  HttpClientModule,
  HTTP_INTERCEPTORS
} from '@angular/common/http';

import { AuthInterceptor } from './core/interceptors/auth.interceptor';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { LoginComponent } from './pages/auth/login/login.component';
import { SignupComponent } from './pages/auth/signup/signup.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ForgotPasswordComponent } from './pages/auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './pages/auth/reset-password/reset-password.component';

import { IssuesComponent } from './pages/issues/issues.component';
import { NotificationsComponent } from './pages/notifications/notifications.component';

import { MainLayoutComponent } from './shared/layout/main-layout/main-layout.component';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { HeaderComponent } from './shared/components/header/header.component';

import { WorkspacesComponent } from './pages/workspaces/workspaces.component';
import { WorkspaceDetailsComponent } from './pages/workspaces/workspace-details/workspace-details.component';

@NgModule({
  declarations: [
    AppComponent,

    LoginComponent,
    SignupComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,

    DashboardComponent,

    IssuesComponent,
    NotificationsComponent,

    MainLayoutComponent,
    SidebarComponent,
    HeaderComponent,

    WorkspacesComponent,
    WorkspaceDetailsComponent
  ],

  imports: [
    BrowserModule,
    CommonModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    AppRoutingModule
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
export class AppModule {}
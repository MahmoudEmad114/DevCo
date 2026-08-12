import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './pages/auth/login/login.component';
import { SignupComponent } from './pages/auth/signup/signup.component';
import { ForgotPasswordComponent } from './pages/auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './pages/auth/reset-password/reset-password.component';

import { DashboardComponent } from './pages/dashboard/dashboard.component';
// import { IssuesComponent } from './pages/issues/issues.component';

import { MainLayoutComponent } from './shared/layout/main-layout/main-layout.component';

import { WorkspacesComponent } from './pages/workspaces/workspaces.component';
import { WorkspaceDetailsComponent } from './pages/workspaces/workspace-details/workspace-details.component';

import { ProjectDetailsComponent } from './pages/projects/project-details/project-details.component';

import { ProjectsComponent } from './pages/projects/projects.component';

import { TaskDetailsComponent } from './pages/tasks/task-details/task-details.component';

import { TasksComponent } from './pages/tasks/tasks.component';

import { IssueDetailsComponent } from './pages/issues/issue-details/issue-details.component'; 
import { IssueListComponent } from './pages/issues/issues.component'

import { AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [
  // Auth Routes
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'signup',
    component: SignupComponent
  },
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent
  },
  {
    path: 'reset-password/:token',
    component: ResetPasswordComponent
  },

  // Protected Routes
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent
      },
    
      {
        path: 'workspaces',
        component: WorkspacesComponent
      },
      {
        path: 'workspaces/:id',
        component: WorkspaceDetailsComponent
      },
      {
        path: 'projects',
        component: ProjectsComponent
      },
      {
        path: 'projects/:id',
        component: ProjectDetailsComponent
      },
      {
        path: 'tasks',
        component: TasksComponent
      },
      {
        path: 'tasks/:id',
        component: TaskDetailsComponent
      },
      {
        path: 'issues',
        component: IssueListComponent
      },
      {
        path: 'issues/:id',
        component: IssueDetailsComponent
      }
    ]
  },

  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },

  {
    path: '**',
    redirectTo: '/login'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
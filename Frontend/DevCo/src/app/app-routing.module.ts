import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProjectDetailsComponent } from './pages/projects/project-details/project-details.component';
import { LoginComponent } from './pages/auth/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { SignupComponent } from './pages/auth/signup/signup.component';
import { ForgotPasswordComponent }
  from './pages/auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent }
  from './pages/auth/reset-password/reset-password.component';

import { MainLayoutComponent } from './shared/layout/main-layout/main-layout.component';

import { WorkspacesComponent }
  from './pages/workspaces/workspaces.component';

import { WorkspaceDetailsComponent } from './pages/workspaces/workspace-details/workspace-details.component';
import { TaskBoardComponent } from './pages/tasks/task-board/task-board.component';
import { AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [

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
        path: 'projects/:id',
        component: ProjectDetailsComponent
      },

      {
        path: 'projects/:projectId/tasks',
        component: TaskBoardComponent
      },

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
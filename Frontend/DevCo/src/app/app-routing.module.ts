import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './pages/auth/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { SignupComponent } from './pages/auth/signup/signup.component';
import { ForgotPasswordComponent }
  from './pages/auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent }
  from './pages/auth/reset-password/reset-password.component';
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
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard]
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
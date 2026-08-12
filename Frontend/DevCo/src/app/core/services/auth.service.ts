import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { ApiService } from './api.service';
import { AuthResponse } from '../models/auth.model';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly TOKEN_KEY = 'devcollab_token';
  private readonly USER_KEY = 'devcollab_user';

  constructor(private api: ApiService) {}

  signup(data: {
    name: string;
    email: string;
    password: string;
    passwordConfirm: string;
  }): Observable<AuthResponse> {

    return this.api.post<AuthResponse>(
      '/auth/signup',
      data
    ).pipe(
      tap(response => this.handleAuthSuccess(response))
    );
  }

  login(
    email: string,
    password: string
  ): Observable<AuthResponse> {

    return this.api.post<AuthResponse>(
      '/auth/login',
      {
        email,
        password
      }
    ).pipe(
      tap(response => this.handleAuthSuccess(response))
    );
  }

  logout(): Observable<any> {

    return this.api.get<any>(
      '/auth/logout'
    ).pipe(
      tap(() => {
        this.clearAuthData();
      })
    );
  }

  forgotPassword(email: string): Observable<any> {

    return this.api.post<any>(
      '/auth/forgotPassword',
      { email }
    );
  }

  resetPassword(
    token: string,
    password: string,
    passwordConfirm: string
  ): Observable<AuthResponse> {

    return this.api.post<AuthResponse>(
      `/auth/resetPassword/${token}`,
      {
        password,
        passwordConfirm
      }
    ).pipe(
      tap(response => this.handleAuthSuccess(response))
    );
  }

  updatePassword(
    passwordCurrent: string,
    password: string,
    passwordConfirm: string
  ): Observable<AuthResponse> {

    return this.api.patch<AuthResponse>(
      '/auth/updateMyPassword',
      {
        passwordCurrent,
        password,
        passwordConfirm
      }
    ).pipe(
      tap(response => this.handleAuthSuccess(response))
    );
  }

  getMe(): Observable<{ status: string; data: { user: User } }> {

    return this.api.get<{ status: string; data: { user: User } }>(
      '/users/me'
    ).pipe(
      tap(response => {
        localStorage.setItem(
          this.USER_KEY,
          JSON.stringify(response.data.user)
        );
      })
    );
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getCurrentUser(): User | null {

    const user = localStorage.getItem(this.USER_KEY);

    if (!user) {
      return null;
    }

    try {
      return JSON.parse(user) as User;
    } catch {
      return null;
    }
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  private handleAuthSuccess(response: AuthResponse): void {

    localStorage.setItem(
      this.TOKEN_KEY,
      response.token
    );

    localStorage.setItem(
      this.USER_KEY,
      JSON.stringify(response.data.user)
    );
  }

  private clearAuthData(): void {

    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }
}
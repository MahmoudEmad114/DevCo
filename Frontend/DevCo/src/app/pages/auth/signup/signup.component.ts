import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {

  signupForm: FormGroup;

  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.signupForm = this.fb.group({
      name: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50)
      ]],

      email: ['', [
        Validators.required,
        Validators.email
      ]],

      password: ['', [
        Validators.required,
        Validators.minLength(8)
      ]],

      passwordConfirm: ['', [
        Validators.required
      ]]
    });
  }

  onSubmit(): void {

    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const {
      name,
      email,
      password,
      passwordConfirm
    } = this.signupForm.value;

    this.authService.signup({
      name,
      email,
      password,
      passwordConfirm
    }).subscribe({
      next: () => {

        this.isLoading = false;

        this.router.navigate(['/dashboard']);
      },

      error: (error) => {

        this.isLoading = false;

        this.errorMessage =
          error?.error?.message ||
          'Something went wrong. Please try again.';
      }
    });
  }
}
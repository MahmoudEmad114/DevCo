import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {

  resetForm: FormGroup;

  token = '';

  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.resetForm = this.fb.group({
      password: ['', [
        Validators.required,
        Validators.minLength(8)
      ]],

      passwordConfirm: ['', [
        Validators.required
      ]]
    });
  }

  ngOnInit(): void {

    this.token = this.route.snapshot.paramMap.get('token') || '';

    if (!this.token) {
      this.errorMessage = 'Invalid or missing reset token.';
    }
  }

  onSubmit(): void {

    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }

    if (!this.token) {
      this.errorMessage = 'Invalid or missing reset token.';
      return;
    }

    const {
      password,
      passwordConfirm
    } = this.resetForm.value;

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService
      .resetPassword(
        this.token,
        password,
        passwordConfirm
      )
      .subscribe({

        next: () => {

          this.isLoading = false;

          this.successMessage =
            'Password reset successfully. Redirecting to login...';

          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 1500);
        },

        error: (error) => {

          this.isLoading = false;

          this.errorMessage =
            error?.error?.message ||
            'Invalid or expired reset token.';
        }

      });
  }
}
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../core/services/user.service';
import { User } from '../../core/models/user.model';
import { LoadingComponent } from '../../shared/components/loading/loading.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingComponent],
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  loading = true;
  saving = false;
  errorMessage = '';
  successMessage = '';

  avatarFile: File | null = null;
  avatarPreview: string | null = null;

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    bio: [''],
  });

  constructor(private fb: FormBuilder, private userService: UserService) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading = true;
    this.userService.getMe().subscribe({
      next: (user) => {
        this.user = user;
        this.form.patchValue({
          name: user.name,
          email: user.email,
          bio: user.bio || '',
        });
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Could not load your profile. Please try again.';
        this.loading = false;
      },
    });
  }

  onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.avatarFile = file;
    const reader = new FileReader();
    reader.onload = () => (this.avatarPreview = reader.result as string);
    reader.readAsDataURL(file);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Note: email is intentionally NOT sent in this update call — changing
    // an email address usually needs a separate verification flow on the
    // backend. Wire this up to a dedicated endpoint if/when you build that.
    this.userService
      .updateProfile({
        name: this.form.value.name || '',
        bio: this.form.value.bio || '',
        avatar: this.avatarFile,
      })
      .subscribe({
        next: (updatedUser) => {
          this.user = updatedUser;
          this.successMessage = 'Profile updated successfully.';
          this.saving = false;
          this.avatarFile = null;
        },
        error: () => {
          this.errorMessage = 'Something went wrong while saving. Please try again.';
          this.saving = false;
        },
      });
  }
}

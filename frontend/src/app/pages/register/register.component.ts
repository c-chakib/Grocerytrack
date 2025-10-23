// Register Component
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  authService = inject(AuthService);

  // Form data
  name = '';
  email = '';
  password = '';
  confirmPassword = '';

  onRegister(): void {
    // Validate input
    if (!this.name || !this.email || !this.password || !this.confirmPassword) {
      this.authService.error.set('Please fill all fields');
      return;
    }

    // Validate password match
    if (this.password !== this.confirmPassword) {
      this.authService.error.set('Passwords do not match');
      return;
    }

    // Validate password length
    if (this.password.length < 6) {
      this.authService.error.set('Password must be at least 6 characters');
      return;
    }

    // Call auth service
    this.authService.register(this.email, this.password, this.name).subscribe({
      next: () => {
        // Success! Service handles navigation
      },
      error: (err) => {
        console.error('Register error:', err);
      }
    });
  }
}
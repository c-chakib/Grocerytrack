// Login Component
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  authService = inject(AuthService);

  // Form data
  email = '';
  password = '';

  onLogin(): void {
    // Validate input
    if (!this.email || !this.password) {
      this.authService.error.set('Please fill all fields');
      return;
    }

    // Call auth service
    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        // Success! Service handles navigation
      },
      error: (err) => {
        console.error('Login error:', err);
      }
    });
  }
}
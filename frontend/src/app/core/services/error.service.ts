// Error Handling Service - Global error management for the app
import { Injectable, signal } from '@angular/core';

export interface AppError {
  id: string;
  message: string;
  type: 'error' | 'warning' | 'info';
  timestamp: Date;
  context?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ErrorService {
  private errors = signal<AppError[]>([]);

  // Computed signal for current errors
  currentErrors = this.errors.asReadonly();

  // Add a new error
  addError(message: string, type: 'error' | 'warning' | 'info' = 'error', context?: string): string {
    const error: AppError = {
      id: crypto.randomUUID(),
      message,
      type,
      timestamp: new Date(),
      context
    };

    this.errors.update(errors => [...errors, error]);

    // Auto-remove after 5 seconds for non-error types
    if (type !== 'error') {
      setTimeout(() => this.removeError(error.id), 5000);
    }

    return error.id;
  }

  // Remove an error by ID
  removeError(id: string): void {
    this.errors.update(errors => errors.filter(error => error.id !== id));
  }

  // Clear all errors
  clearErrors(): void {
    this.errors.set([]);
  }

  // Clear errors by type
  clearErrorsByType(type: 'error' | 'warning' | 'info'): void {
    this.errors.update(errors => errors.filter(error => error.type !== type));
  }

  // Get errors by type
  getErrorsByType(type: 'error' | 'warning' | 'info'): AppError[] {
    return this.errors().filter(error => error.type === type);
  }

  // Check if there are any errors
  hasErrors(): boolean {
    return this.errors().length > 0;
  }

  // Check if there are errors of specific type
  hasErrorsOfType(type: 'error' | 'warning' | 'info'): boolean {
    return this.errors().some(error => error.type === type);
  }
}
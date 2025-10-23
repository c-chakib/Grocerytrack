// Loading Service - Global loading state management
import { Injectable, signal, computed } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  // Track active loading operations
  private loadingOperations = signal<Set<string>>(new Set());

  // Computed signal for overall loading state
  isLoading = computed(() => this.loadingOperations().size > 0);

  // Computed signal for loading count
  loadingCount = computed(() => this.loadingOperations().size);

  // Start a loading operation
  startLoading(operationId: string): void {
    this.loadingOperations.update(operations => {
      const newOperations = new Set(operations);
      newOperations.add(operationId);
      return newOperations;
    });
  }

  // Stop a loading operation
  stopLoading(operationId: string): void {
    this.loadingOperations.update(operations => {
      const newOperations = new Set(operations);
      newOperations.delete(operationId);
      return newOperations;
    });
  }

  // Check if a specific operation is loading
  isOperationLoading(operationId: string): boolean {
    return this.loadingOperations().has(operationId);
  }

  // Get all active loading operations
  getActiveOperations(): string[] {
    return Array.from(this.loadingOperations());
  }

  // Clear all loading operations (useful for error states)
  clearAllLoading(): void {
    this.loadingOperations.set(new Set());
  }

  // Create a loading wrapper for observables
  createLoadingWrapper<T>(operationId: string) {
    return {
      start: () => this.startLoading(operationId),
      stop: () => this.stopLoading(operationId),
      isLoading: () => this.isOperationLoading(operationId)
    };
  }
}
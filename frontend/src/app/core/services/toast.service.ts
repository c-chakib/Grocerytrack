// ToastService - Global toast notification manager
import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private toastsSignal = signal<Toast[]>([]);
  private nextId = 1;

  get toasts() {
    return this.toastsSignal;
  }

  show(message: string, type: Toast['type'] = 'info', duration = 3000) {
    const toast: Toast = {
      id: this.nextId++,
      message,
      type,
      duration
    };
    this.toastsSignal.set([...this.toastsSignal(), toast]);
    setTimeout(() => this.dismiss(toast.id), duration);
  }

  dismiss(id: number) {
    this.toastsSignal.set(this.toastsSignal().filter(t => t.id !== id));
  }

  clear() {
    this.toastsSignal.set([]);
  }
}

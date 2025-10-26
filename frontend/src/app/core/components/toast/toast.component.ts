import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.css'
})
export class ToastComponent {
  toasts = computed(() => this.toastService.toasts());

  constructor(public toastService: ToastService) {}

  dismiss(id: number) {
    this.toastService.dismiss(id);
  }
}

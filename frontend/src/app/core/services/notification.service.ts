// Notification Service - Frontend Implementation
import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface NotificationPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  notifyDaysBefore: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = `${environment.apiUrl}/notifications`;

  // State
  preferences = signal<NotificationPreferences>({
    emailNotifications: true,
    pushNotifications: false,
    notifyDaysBefore: 3
  });

  pushPermission = signal<NotificationPermission>('default');

  constructor(private http: HttpClient) {
    this.checkPushPermission();
  }

  /**
   * Request push notification permission
   */
  async requestPushPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('Push notifications not supported');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      this.pushPermission.set(permission);
      
      if (permission === 'granted') {
        console.log('✅ Push notification permission granted');
        return true;
      } else {
        console.log('⚠️ Push notification permission denied');
        return false;
      }
    } catch (error) {
      console.error('Error requesting push permission:', error);
      return false;
    }
  }

  /**
   * Check current push permission
   */
  checkPushPermission(): void {
    if ('Notification' in window) {
      this.pushPermission.set(Notification.permission);
    }
  }

  /**
   * Show browser notification
   */
  showNotification(title: string, options?: NotificationOptions): void {
    if (this.pushPermission() === 'granted') {
      new Notification(title, {
        icon: '/assets/icon.png',
        badge: '/assets/badge.png',
        ...options
      });
    }
  }

  /**
   * Show expiring item notification
   */
  notifyExpiringItem(itemName: string, daysLeft: number): void {
    const title = '🥬 GroceryTrack Alert';
    const body = daysLeft === 0
      ? `${itemName} expires today!`
      : `${itemName} expires in ${daysLeft} day${daysLeft > 1 ? 's' : ''}`;

    this.showNotification(title, {
      body,
      tag: 'expiring-item',
      requireInteraction: true
    });
  }

  /**
   * Update notification preferences (backend)
   */
  updatePreferences(preferences: Partial<NotificationPreferences>): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/preferences`, preferences).pipe(
      tap(response => {
        if (response.data) {
          this.preferences.set(response.data);
          console.log('✅ Notification preferences updated');
        }
      }),
      catchError(error => {
        console.error('Error updating preferences:', error);
        return of({ data: null });
      })
    );
  }

  /**
   * Get notification preferences (backend)
   */
  getPreferences(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/preferences`).pipe(
      tap(response => {
        if (response.data) {
          this.preferences.set(response.data);
        }
      }),
      catchError(error => {
        console.error('Error fetching preferences:', error);
        return of({ data: null });
      })
    );
  }

  /**
   * Check expiring items and show notifications
   */
  checkExpiringItems(groceries: any[]): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    groceries.forEach(item => {
      const expiryDate = new Date(item.expirationDate);
      expiryDate.setHours(0, 0, 0, 0);
      
      const daysUntilExpiry = Math.floor(
        (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      const notifyBefore = this.preferences().notifyDaysBefore;

      if (daysUntilExpiry >= 0 && daysUntilExpiry <= notifyBefore) {
        this.notifyExpiringItem(item.name, daysUntilExpiry);
      }
    });
  }
}
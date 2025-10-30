// Analytics Service - Frontend Implementation
import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DashboardStats {
  overview: {
    totalItems: number;
    activeItems: number;
    expiredItems: number;
    expiringSoon: number;
    freshItems: number;
    wasteReductionRate: number;
    moneySaved: number;
  };
  categoryStats: Array<{ _id: string; count: number }>;
  locationStats: Array<{ _id: string; count: number }>;
  monthlyTrend: Array<{ _id: { year: number; month: number }; count: number }>;
}

export interface WasteStats {
  totalWasted: number;
  estimatedCost: number;
  co2Emissions: number;
  wastedItems: any[];
  wasteByCategory: any[];
  timeframe: number;
}

export interface SavingsReport {
  overview: {
    totalItems: number;
    savedItems: number;
    expiredItems: number;
    savingsRate: number;
  };
  financial: {
    moneySaved: number;
    moneyWasted: number;
    totalSavings: number;
  };
  environmental: {
    co2Saved: number;
    waterSaved: number;
    wasteReduced: number;
  };
  monthlySavings: any[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private apiUrl = `${environment.apiUrl}/analytics`;

  // State
  dashboardStats = signal<DashboardStats | null>(null);
  wasteStats = signal<WasteStats | null>(null);
  savingsReport = signal<SavingsReport | null>(null);
  achievements = signal<Achievement[]>([]);
  isLoading = signal(false);

  constructor(private http: HttpClient) {}

  /**
   * Get dashboard statistics
   */
  getDashboardStats(): Observable<any> {
    this.isLoading.set(true);
    
    return this.http.get<any>(`${this.apiUrl}/dashboard`).pipe(
      tap(response => {
        if (response.data) {
          this.dashboardStats.set(response.data);
          console.log('✅ Dashboard stats loaded');
        }
        this.isLoading.set(false);
      }),
      catchError(error => {
        console.error('❌ Error loading dashboard stats:', error);
        this.isLoading.set(false);
        return of({ data: null });
      })
    );
  }

  /**
   * Get waste statistics
   */
  getWasteStats(timeframe: number = 30): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/waste`, {
      params: { timeframe: timeframe.toString() }
    }).pipe(
      tap(response => {
        if (response.data) {
          this.wasteStats.set(response.data);
          console.log('✅ Waste stats loaded');
        }
      }),
      catchError(error => {
        console.error('❌ Error loading waste stats:', error);
        return of({ data: null });
      })
    );
  }

  /**
   * Get savings report
   */
  getSavingsReport(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/savings`).pipe(
      tap(response => {
        if (response.data) {
          this.savingsReport.set(response.data);
          console.log('✅ Savings report loaded');
        }
      }),
      catchError(error => {
        console.error('❌ Error loading savings report:', error);
        return of({ data: null });
      })
    );
  }

  /**
   * Get category insights
   */
  getCategoryInsights(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/category-insights`).pipe(
      tap(response => console.log('✅ Category insights loaded')),
      catchError(error => {
        console.error('❌ Error loading category insights:', error);
        return of({ data: [] });
      })
    );
  }

  /**
   * Get user achievements
   */
  getAchievements(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/achievements`).pipe(
      tap(response => {
        if (response.data?.achievements) {
          this.achievements.set(response.data.achievements);
          console.log('✅ Achievements loaded:', response.data.achievements.length);
        }
      }),
      catchError(error => {
        console.error('❌ Error loading achievements:', error);
        return of({ data: { achievements: [] } });
      })
    );
  }

  /**
   * Calculate waste reduction percentage
   */
  calculateWasteReduction(saved: number, total: number): number {
    return total > 0 ? Math.round((saved / total) * 100) : 0;
  }

  /**
   * Format currency
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  /**
   * Format number with comma separator
   */
  formatNumber(num: number): string {
    return new Intl.NumberFormat('en-US').format(num);
  }

  /**
   * Get month name from number
   */
  getMonthName(month: number): string {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return months[month - 1] || '';
  }

  /**
   * Reset all analytics data
   */
  reset(): void {
    this.dashboardStats.set(null);
    this.wasteStats.set(null);
    this.savingsReport.set(null);
    this.achievements.set([]);
    this.isLoading.set(false);
  }
}
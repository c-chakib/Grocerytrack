import { Component, OnInit, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';

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

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.css'],
  imports: [CommonModule, RouterModule] // ✅ Added CommonModule for *ngIf and *ngFor
})
export class AnalyticsComponent implements OnInit {
  // Signals for state management
  dashboardStats = signal<DashboardStats | null>(null);
  wasteStats = signal<WasteStats | null>(null);
  savingsReport = signal<SavingsReport | null>(null);
  achievements = signal<Achievement[]>([]);
  isLoading = signal(false);

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadAnalyticsData();
  }

  /**
   * Load all analytics data
   */
  loadAnalyticsData(): void {
    this.isLoading.set(true);
    
    // Load dashboard stats
    this.getDashboardStats().subscribe();
    
    // Load waste stats
    this.getWasteStats().subscribe();
    
    // Load savings report
    this.getSavingsReport().subscribe();
    
    // Load achievements
    this.getAchievements().subscribe();
  }

  /**
   * Refresh all data
   */
  refresh(): void { // ✅ Added missing refresh method
    this.isLoading.set(true);
    this.loadAnalyticsData();
  }

  /**
   * Get dashboard statistics
   */
  getDashboardStats(): Observable<any> {
  return this.http.get<any>(`${environment.apiUrl}/analytics/dashboard`).pipe(
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
    return this.http.get<any>(`${environment.apiUrl}/analytics/waste`, {
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
  return this.http.get<any>(`${environment.apiUrl}/analytics/savings`).pipe(
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
   * Get user achievements
   */
  getAchievements(): Observable<any> {
  return this.http.get<any>(`${environment.apiUrl}/analytics/achievements`).pipe(
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

  // ✅ Added missing utility methods used in template

  /**
   * Format currency
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  }

  /**
   * Format number with comma separator
   */
  formatNumber(num: number): string {
    return new Intl.NumberFormat('en-US').format(num || 0);
  }

  /**
   * Get status color for progress circle
   */
  getStatusColor(rate: number): string {
    if (rate >= 80) return '#10b981';
    if (rate >= 60) return '#f59e0b';
    if (rate >= 40) return '#f97316';
    return '#ef4444';
  }
}
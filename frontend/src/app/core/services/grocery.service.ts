// Grocery Service - CRUD + Filtering + Sorting + Search
import { Injectable, signal, computed } from '@angular/core';
import { ToastService } from './toast.service';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError } from 'rxjs';
import { throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

// Interface matching backend Grocery model
export interface Grocery {
  _id?: string;
  userId?: string;
  name: string;
  category: 'Dairy' | 'Vegetables' | 'Fruits' | 'Meat' | 'Pantry' | 'Frozen' | 'Other';
  purchaseDate?: Date;
  expirationDate: string;
  quantity: number;
  unit: 'L' | 'ml' | 'kg' | 'g' | 'pieces' | 'packs';
  location: 'Fridge' | 'Freezer' | 'Pantry' | 'Counter';
  status?: 'fresh' | 'expiring-soon' | 'expired';
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class GroceryService {
  private apiUrl = `${environment.apiUrl}/groceries`;
  constructor(private http: HttpClient, private toast: ToastService) {
    this.loadGroceries();
  }
  
  // ===== CORE STATE =====
  groceries = signal<Grocery[]>([]);
  isLoading = signal(false);
  error = signal('');
  
  // ===== FILTER & SORT STATE ===== (NEW!)
  selectedCategory = signal<string>('all');
  searchQuery = signal<string>('');
  sortBy = signal<'expiration-asc' | 'expiration-desc'>('expiration-asc');
  
  // ===== COMPUTED: Filtered & Sorted Groceries ===== (NEW!)
  filteredGroceries = computed(() => {
    let filtered = this.groceries() || [];
    
    // Ensure filtered is always an array
    if (!Array.isArray(filtered)) {
      filtered = [];
    }
    
    // Filter by category
    const category = this.selectedCategory();
    if (category !== 'all') {
      filtered = filtered.filter(g => g.category === category);
    }
    
    // Filter by search query
    const search = this.searchQuery().toLowerCase();
    if (search) {
      filtered = filtered.filter(g => 
        g.name.toLowerCase().includes(search) ||
        g.category.toLowerCase().includes(search)
      );
    }
    
    // Sort by expiration date
    const sortDir = this.sortBy();
    if (Array.isArray(filtered)) {
      filtered.sort((a, b) => {
        const dateA = new Date(a.expirationDate).getTime();
        const dateB = new Date(b.expirationDate).getTime();
        
        if (sortDir === 'expiration-asc') {
          return dateA - dateB; // Soonest first
        } else {
          return dateB - dateA; // Latest first
        }
      });
    }
    
    return filtered;
  });
  
  // ===== COMPUTED: Categories ===== (NEW!)
  categories = computed(() => {
    const cats = new Set(this.groceries().map(g => g.category));
    return Array.from(cats).sort();
  });
  
  // ===== COMPUTED: Statistics ===== (NEW!)
  categoryStats = computed(() => {
    const stats: Record<string, number> = {};
    this.groceries().forEach(g => {
      stats[g.category] = (stats[g.category] || 0) + 1;
    });
    return stats;
  });

  // Removed duplicate constructor

  // ===== LOAD ALL GROCERIES =====
  loadGroceries(): Observable<Grocery[]> {
    this.isLoading.set(true);
    return this.http.get<any>(this.apiUrl).pipe(
      tap((response) => {
        const groceries = response.data?.groceries || [];
        this.groceries.set(groceries);
        this.isLoading.set(false);
        this.error.set('');
      }),
      catchError((error) => {
        this.isLoading.set(false);
        this.error.set(error.error?.error || 'Failed to load groceries');
        return throwError(() => error);
      })
    );
  }

  // ===== CREATE GROCERY =====
  createGrocery(grocery: Omit<Grocery, '_id' | 'userId' | 'createdAt' | 'updatedAt'>): Observable<Grocery> {
    this.isLoading.set(true);
    return this.http.post<any>(this.apiUrl, grocery).pipe(
      tap(() => {
        this.isLoading.set(false);
        this.error.set('');
      }),
      catchError((error) => {
        this.isLoading.set(false);
        this.error.set(error.error?.error || 'Failed to create grocery');
        return throwError(() => error);
      })
    );
  }

  // ===== GET SINGLE GROCERY =====
  getGrocery(id: string): Observable<Grocery> {
    return this.http.get<Grocery>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
      }),
      catchError((error) => {
        this.error.set(error.error?.error || 'Failed to fetch grocery');
        return throwError(() => error);
      })
    );
  }

  // ===== UPDATE GROCERY =====
  updateGrocery(id: string, grocery: Omit<Grocery, '_id' | 'userId' | 'createdAt' | 'updatedAt'>): Observable<Grocery> {
    this.isLoading.set(true);
    return this.http.put<Grocery>(`${this.apiUrl}/${id}`, grocery).pipe(
      tap((updatedGrocery) => {
        const updated = this.groceries().map(g => 
          g._id === id ? updatedGrocery : g
        );
        this.groceries.set(updated);
        this.isLoading.set(false);
        this.error.set('');
      }),
      catchError((error) => {
        this.isLoading.set(false);
        this.error.set(error.error?.error || 'Failed to update grocery');
        return throwError(() => error);
      })
    );
  }

  // ===== DELETE GROCERY =====
  deleteGrocery(id: string): Observable<any> {
    this.isLoading.set(true);
    return this.http.delete<any>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.groceries.set(this.groceries().filter(g => g._id !== id));
        this.isLoading.set(false);
        this.error.set('');
      }),
      catchError((error) => {
        this.isLoading.set(false);
        this.error.set(error.error?.error || 'Failed to delete grocery');
        return throwError(() => error);
      })
    );
  }

  // ===== FILTER & SORT METHODS ===== (NEW!)
  
  setCategory(category: string): void {
    this.selectedCategory.set(category);
  }

  setSearchQuery(query: string): void {
    this.searchQuery.set(query);
  }

  setSortBy(sort: 'expiration-asc' | 'expiration-desc'): void {
    this.sortBy.set(sort);
  }

  clearFilters(): void {
    this.selectedCategory.set('all');
    this.searchQuery.set('');
    this.sortBy.set('expiration-asc');
  }

  // ===== UTILITY METHODS =====
  
  getGroceryById(id: string): Grocery | undefined {
    return this.groceries().find(g => g._id === id);
  }

  calculateStatus(expirationDate: string): 'fresh' | 'expiring-soon' | 'expired' {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expiry = new Date(expirationDate);
    expiry.setHours(0, 0, 0, 0);

    const daysUntilExpiry = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) return 'expired';
    if (daysUntilExpiry <= 3) return 'expiring-soon';
    return 'fresh';
  }
  
  // ===== GET DAYS UNTIL EXPIRY ===== (NEW!)
  getDaysUntilExpiry(expirationDate: string): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expiry = new Date(expirationDate);
    expiry.setHours(0, 0, 0, 0);

    return Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }
}
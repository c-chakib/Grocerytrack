// Product Service - Complete Implementation
import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Product {
  id: string;
  name: string;
  category: string;
  image?: string;
  barcode?: string;
  brands?: string;
  nutritionGrade?: string;
  ingredients?: string;
}

export interface ExpirationSuggestion {
  suggestedDate: string;
  shelfLifeDays: number;
  originalShelfLife: number;
  locationMultiplier: number;
  locationNote: string;
  confidence: 'low' | 'medium' | 'high';
  isEstimated: boolean;
  category: string;
  location: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = `${environment.apiUrl}/products`;

  // State signals
  searchResults = signal<Product[]>([]);
  isSearching = signal(false);
  lastSuggestion = signal<ExpirationSuggestion | null>(null);

  constructor(private http: HttpClient) {}

  /**
   * Search products by name
   * @param query Search term
   * @returns Observable with search results
   */
  searchProducts(query: string): Observable<any> {
    if (!query || query.length < 2) {
      this.searchResults.set([]);
      return of({ data: [] });
    }

    this.isSearching.set(true);

    return this.http.get<any>(`${this.apiUrl}/search`, {
      params: { query, limit: '20' }
    }).pipe(
      tap(response => {
        const products = response.data || [];
        console.log('✅ Products found:', products.length);
        this.searchResults.set(products);
        this.isSearching.set(false);
      }),
      catchError(error => {
        console.error('❌ Product search error:', error);
        this.isSearching.set(false);
        this.searchResults.set([]);
        return of({ data: [] });
      })
    );
  }

  /**
   * Get products by category
   * @param category Category name
   * @param limit Number of results
   * @returns Observable with products
   */
  getProductsByCategory(category: string, limit: number = 50): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/category/${category}`, {
      params: { limit: limit.toString() }
    }).pipe(
      tap(response => console.log('✅ Category products:', response.data?.length)),
      catchError(error => {
        console.error('❌ Category fetch error:', error);
        return of({ data: [] });
      })
    );
  }

  /**
   * Get product by barcode
   * @param barcode Product barcode
   * @returns Observable with product
   */
  getProductByBarcode(barcode: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/barcode/${barcode}`).pipe(
      tap(response => {
        if (response.data) {
          console.log('✅ Barcode scan successful:', response.data.name);
        } else {
          console.log('⚠️ Product not found for barcode');
        }
      }),
      catchError(error => {
        console.error('❌ Barcode scan error:', error);
        return of({ data: null });
      })
    );
  }

  /**
   * Get suggested expiration date
   * @param name Item name
   * @param category Item category
   * @param location Storage location
   * @returns Observable with suggestion
   */
  getSuggestedExpiration(
    name: string, 
    category: string, 
    location: string = 'Fridge'
  ): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/suggest-expiration`, {
      name,
      category,
      location
    }).pipe(
      tap(response => {
        if (response.data) {
          this.lastSuggestion.set(response.data);
          console.log('✅ Expiration suggested:', {
            days: response.data.shelfLifeDays,
            confidence: response.data.confidence,
            date: response.data.suggestedDate
          });
        }
      }),
      catchError(error => {
        console.error('❌ Suggestion error:', error);
        this.lastSuggestion.set(null);
        return of({ data: null });
      })
    );
  }

  /**
   * Get all items and shelf life for a category
   * @param category Category name
   * @returns Observable with items
   */
  getCategoryItems(category: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/category-items/${category}`).pipe(
      tap(response => console.log('✅ Category items:', response.data?.length)),
      catchError(error => {
        console.error('❌ Category items error:', error);
        return of({ data: [] });
      })
    );
  }

  /**
   * Get recommended storage location for category
   * @param category Category name
   * @returns Observable with location
   */
  getRecommendedLocation(category: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/recommended-location/${category}`).pipe(
      tap(response => console.log('✅ Recommended location:', response.data?.recommendedLocation)),
      catchError(error => {
        console.error('❌ Recommended location error:', error);
        return of({ data: { recommendedLocation: 'Fridge' } });
      })
    );
  }

  /**
   * Clear search results
   */
  clearSearchResults(): void {
    this.searchResults.set([]);
  }

  /**
   * Reset service state
   */
  reset(): void {
    this.searchResults.set([]);
    this.isSearching.set(false);
    this.lastSuggestion.set(null);
  }
}
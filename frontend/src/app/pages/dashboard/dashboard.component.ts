// Dashboard Component - OPTIMIZED VERSION
import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { GroceryService, Grocery } from '../../core/services/grocery.service';
import { AuthService } from '../../core/services/auth.service';
import { SocketService } from '../../core/services/socket.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ProductService, Product } from '../../core/services/product.service';
import { ToastService } from '../../core/services/toast.service';
import { PWAService } from '../../core/services/pwa.service';
import { Subscription, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError, filter } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  // ===== INJECTED SERVICES =====
  groceryService: GroceryService;
  authService: AuthService;
  productService: ProductService;
  
  // ===== FORM =====
  groceryForm!: FormGroup;
  
  // ===== PRODUCT SEARCH PROPERTIES =====
  productSearchControl = new FormControl('');
  private searchSubscription!: Subscription;
  searchResults = signal<Product[]>([]);
  showSearchResults = signal(false);
  selectedProduct = signal<Product | null>(null);
  useAutoExpiration = signal(true);
  suggestedExpiration = signal<string>('');
  suggestionInfo = signal<string>('');

  // ===== MODAL STATE =====
  showAddModal = signal(false);
  showEditModal = signal(false);
  showDeleteConfirm = signal(false);
  selectedGrocery = signal<Grocery | null>(null);

  constructor(
    groceryService: GroceryService,
    authService: AuthService,
    private socketService: SocketService,
    private fb: FormBuilder,
    private translate: TranslateService,
    productService: ProductService,
    public pwaService: PWAService,
    private toast: ToastService
  ) {
    this.groceryService = groceryService;
    this.authService = authService;
    this.productService = productService;
    this.initializeForm();
  }

  ngOnInit(): void {
    console.log('📊 Dashboard initialized');
    this.groceryService.loadGroceries().subscribe();
    this.setupProductSearchDebounce();

    // ADD SOCKET CONNECTION
    const token = localStorage.getItem('token');
    if (token) {
      this.socketService.connect(token);

      // Listen for real-time updates
      this.socketService.on<Grocery>('grocery:created').subscribe(grocery => {
        console.log('🔔 New grocery:', grocery);
        this.groceryService.groceries.update(items => [grocery, ...items]);
      });

      this.socketService.on<Grocery>('grocery:updated').subscribe(grocery => {
        console.log('🔔 Updated grocery:', grocery);
        this.groceryService.groceries.update(items =>
          items.map(item => item._id === grocery._id ? grocery : item)
        );
      });

      this.socketService.on('grocery:deleted').subscribe((data: any) => {
        const deletedId = data.id || data._id;
        console.log('🔔 Deleted grocery:', deletedId);
        this.groceryService.groceries.update(items =>
          items.filter(item => item._id !== deletedId)
        );
      });
    }
  }

  ngOnDestroy(): void {
    this.socketService.disconnect();
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  // ===== INITIALIZE FORM =====
  private initializeForm(): void {
    this.groceryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      category: ['Other'],
      expirationDate: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unit: ['pieces'],
      location: ['Fridge'],
      notes: ['']
    });
  }

  async installPWA() {
    await this.pwaService.promptInstall();
  }

  // ===== PRODUCT SEARCH METHODS =====

  /**
   * **OPTIMIZED: Sets up an RxJS stream to debounce search input.**
   * This prevents API calls on every keystroke.
   */
  private setupProductSearchDebounce(): void {
    this.searchSubscription = this.productSearchControl.valueChanges.pipe(
      debounceTime(400), // Wait 400ms after last keystroke
      distinctUntilChanged(), // Only emit if value changed
      switchMap(query => {
        if (query == null || query.length < 2) {
          this.searchResults.set([]);
          this.showSearchResults.set(false);
          return of(null); // Return empty observable
        }
        // Let the service handle its own loading state
        return this.productService.searchProducts(query).pipe(
          catchError(() => of({ data: [] })) // Handle errors gracefully
        );
      })
    ).subscribe(response => {
      if (response) { // Only update if we got a real response
        const products = response.data || [];
        this.searchResults.set(products);
        this.showSearchResults.set(products.length > 0);
      }
    });
  }

  /**
   * Select product from search results
   */
  selectProduct(product: Product): void {
    console.log('✅ Product selected:', product.name);
    this.selectedProduct.set(product);
    
    // Auto-fill form
    this.groceryForm.patchValue({
      name: product.name,
      category: product.category
    });
    
    // Hide search results
    this.showSearchResults.set(false);
    this.productSearchControl.setValue(product.name, { emitEvent: false }); // Update input without firing stream

    // Get suggested expiration date if auto-expiration is enabled
    if (this.useAutoExpiration()) {
      this.getSuggestedExpiration();
    }
  }

  /**
   * Get suggested expiration date based on current form values
   */
  getSuggestedExpiration(): void {
    const name = this.groceryForm.get('name')?.value;
    const category = this.groceryForm.get('category')?.value;
    const location = this.groceryForm.get('location')?.value;

    if (!name || !category) {
      console.warn('⚠️ Name or category missing');
      return;
    }

    this.productService.getSuggestedExpiration(name, category, location).subscribe(response => {
      if (response.data) {
        const suggestion = response.data;
        const dateOnly = suggestion.suggestedDate.split('T')[0];
        
        this.suggestedExpiration.set(dateOnly);
        this.suggestionInfo.set(
          `${suggestion.shelfLifeDays} days (${suggestion.confidence} confidence) - ${suggestion.locationNote}`
        );
        
        // Auto-fill expiration date if enabled
        if (this.useAutoExpiration()) {
          this.groceryForm.patchValue({
            expirationDate: dateOnly
          });
          console.log('✅ Auto-filled expiration:', dateOnly);
        }
      }
    });
  }

  /**
   * Toggle auto-expiration on/off
   */
  toggleAutoExpiration(): void {
    const newValue = !this.useAutoExpiration();
    this.useAutoExpiration.set(newValue);
    
    if (newValue) {
      // If turning on, calculate expiration
      this.getSuggestedExpiration();
    } else {
      // If turning off, clear suggestion
      this.suggestedExpiration.set('');
      this.suggestionInfo.set('');
    }
    
    console.log('🔄 Auto-expiration:', newValue ? 'ON' : 'OFF');
  }

  /**
   * Clear search results (with delay for click to register)
   */
  clearSearchResults(): void {
    setTimeout(() => {
      this.showSearchResults.set(false);
    }, 200);
  }

  /**
   * Handle category change - update recommended location
   */
  onCategoryChangeWithSuggestion(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const category = target.value;
    
    // Call existing category filter
    this.onCategoryChange(event);
    
    // Get recommended location for this category
    this.productService.getRecommendedLocation(category).subscribe(response => {
      if (response.data?.recommendedLocation) {
        const recommendedLocation = response.data.recommendedLocation;
        
        // Update location if it's still default
        const currentLocation = this.groceryForm.get('location')?.value;
        if (currentLocation === 'Fridge' || !currentLocation) {
          this.groceryForm.patchValue({ location: recommendedLocation });
          console.log('✅ Recommended location:', recommendedLocation);
        }
      }
    });
    
    // Recalculate expiration
    if (this.useAutoExpiration()) {
      this.getSuggestedExpiration();
    }
  }

  /**
   * Handle location change - recalculate expiration
   */
  onLocationChange(event: Event): void {
    console.log('📍 Location changed');
    if (this.useAutoExpiration()) {
      this.getSuggestedExpiration();
    }
  }

  /**
   * Reset product search state
   */
  private resetProductSearch(): void {
    this.searchResults.set([]);
    this.showSearchResults.set(false);
    this.selectedProduct.set(null);
    this.useAutoExpiration.set(true);
    this.suggestedExpiration.set('');
    this.suggestionInfo.set('');
    this.productSearchControl.setValue('', { emitEvent: false });
  }

  // ===== COMPUTED SIGNALS FOR STATISTICS =====
  expiringCount = computed(() =>
    this.groceryService.groceries()
      .filter(g => this.getStatus(g.expirationDate) === 'expiringSoon')
      .length
  );

  expiredCount = computed(() =>
    this.groceryService.groceries()
      .filter(g => this.getStatus(g.expirationDate) === 'expired')
      .length
  );

  freshCount = computed(() =>
    this.groceryService.groceries()
      .filter(g => this.getStatus(g.expirationDate) === 'fresh')
      .length
  );

  // ===== MODAL METHODS =====
  openAddModal(): void {
    console.log('➕ Opening add modal');
    this.showAddModal.set(true);
    this.resetProductSearch();
    this.groceryForm.reset({ 
      quantity: 1, 
      category: 'Other',
      unit: 'pieces',
      location: 'Fridge'
    });
  }

  openEditModal(grocery: Grocery): void {
    console.log('✏️ Opening edit modal for:', grocery.name);
    this.selectedGrocery.set(grocery);
    this.showEditModal.set(true);
    
    const expDate = grocery.expirationDate.split('T')[0];
    
    this.groceryForm.patchValue({
      name: grocery.name,
      category: grocery.category,
      expirationDate: expDate,
      quantity: grocery.quantity,
      unit: grocery.unit,
      location: grocery.location,
      notes: grocery.notes || ''
    });
  }

  openDeleteConfirm(grocery: Grocery): void {
    console.log('❓ Opening delete confirmation for:', grocery.name);
    this.selectedGrocery.set(grocery);
    this.showDeleteConfirm.set(true);
  }

  closeModals(): void {
    console.log('❌ Closing modals');
    this.showAddModal.set(false);
    this.showEditModal.set(false);
    this.showDeleteConfirm.set(false);
    this.selectedGrocery.set(null);
    this.groceryForm.reset();
  }

  // ===== CRUD METHODS =====
  addGrocery(): void {
    if (this.groceryForm.invalid) {
      this.translate.get('dashboard.requiredField').subscribe(message => {
        this.toast.show(message, 'error');
      });
      return;
    }

    const formData = {
      ...this.groceryForm.value,
      useAutoExpiration: this.useAutoExpiration()
    };
    
    console.log('➕ Submitting new grocery:', formData);
    
    this.groceryService.createGrocery(formData).subscribe({
      next: () => {
        console.log('✅ Grocery added successfully');
        this.translate.get('dashboard.addSuccess').subscribe(message => {
          this.toast.show(message, 'success');
        });
        this.resetProductSearch();
        this.closeModals();
      },
      error: (error) => {
        console.error('❌ Error adding grocery:', error);
        this.translate.get('dashboard.addError').subscribe(message => {
          this.toast.show(message + ': ' + (error.error?.error || 'Unknown error'), 'error');
        });
      }
    });
  }

  updateGrocery(): void {
    if (this.groceryForm.invalid || !this.selectedGrocery()?._id) {
      this.translate.get('dashboard.requiredField').subscribe(message => {
        this.toast.show(message, 'error');
      });
      return;
    }

    const groceryId = this.selectedGrocery()!._id!;
    const formData = this.groceryForm.value;
    console.log('✏️ Submitting update for ID:', groceryId, formData);

    this.groceryService.updateGrocery(groceryId, formData).subscribe({
      next: () => {
        console.log('✅ Grocery updated successfully');
        this.translate.get('dashboard.updateSuccess').subscribe(message => {
          this.toast.show(message, 'success');
        });
        this.closeModals();
      },
      error: (error) => {
        console.error('❌ Error updating grocery:', error);
        this.translate.get('dashboard.updateError').subscribe(message => {
          this.toast.show(message + ': ' + (error.error?.error || 'Unknown error'), 'error');
        });
      }
    });
  }

  deleteGrocery(): void {
    const id = this.selectedGrocery()?._id;
    if (!id) {
      this.toast.show('Error: No grocery selected', 'error');
      return;
    }

    console.log('🗑️ Deleting grocery:', id);
    this.groceryService.deleteGrocery(id).subscribe({
      next: () => {
        console.log('✅ Grocery deleted successfully');
        this.translate.get('dashboard.deleteSuccess').subscribe(message => {
          this.toast.show(message, 'success');
        });
        this.closeModals();
      },
      error: (error) => {
        console.error('❌ Error deleting grocery:', error);
        this.translate.get('dashboard.deleteError').subscribe(message => {
          this.toast.show(message + ': ' + (error.error?.error || 'Unknown error'), 'error');
        });
      }
    });
  }

  // ===== FILTER & SORT METHODS =====
  onCategoryChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const category = target.value;
    console.log('🏷️ Filtering by category:', category);
    this.groceryService.setCategory(category);
  }

  onSearchChange(query: string): void {
    console.log('🔍 Searching:', query);
    this.groceryService.setSearchQuery(query);
  }

  handleSortChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const value = target.value;
    console.log('📊 Sorting by:', value);
    if (value === 'expiration-asc' || value === 'expiration-desc') {
      this.groceryService.setSortBy(value as 'expiration-asc' | 'expiration-desc');
    }
  }

  clearAllFilters(): void {
    console.log('🧹 Clearing all filters');
    this.groceryService.clearFilters();
  }

  // ===== UTILITY METHODS =====
  getStatus(expirationDate: string): 'fresh' | 'expiringSoon' | 'expired' {
    const status = this.groceryService.calculateStatus(expirationDate);
    if (status === 'expiring-soon') return 'expiringSoon';
    if (status === 'expired') return 'expired';
    return 'fresh';
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      'fresh': '#10b981',
      'expiring-soon': '#f59e0b',
      'expired': '#ef4444'
    };
    return colors[status] || '#757575';
  }

  getDaysUntilExpiry(expirationDate: string): number {
    return this.groceryService.getDaysUntilExpiry(expirationDate);
  }

  // ===== SIGNALS (for template binding) =====
  get groceries() {
    return this.groceryService.groceries;
  }

  get filteredGroceries() {
    return this.groceryService.filteredGroceries;
  }

  get categories() {
    return this.groceryService.categories;
  }

  get categoryStats() {
    return this.groceryService.categoryStats;
  }

  get isLoading() {
    return this.groceryService.isLoading;
  }

  get userName() {
    return this.authService.userName;
  }

  get selectedCategory() {
    return this.groceryService.selectedCategory;
  }

  get searchQuery() {
    return this.groceryService.searchQuery;
  }

  get sortBy() {
    return this.groceryService.sortBy;
  }
}
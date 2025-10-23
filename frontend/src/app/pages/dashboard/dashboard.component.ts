// Dashboard Component - Complete Phase 3 with All Methods
import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GroceryService, Grocery } from '../../core/services/grocery.service';
import { AuthService } from '../../core/services/auth.service';
import { SocketService } from '../../core/services/socket.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageSwitcherComponent } from '../../core/components/language-switcher/language-switcher.component';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule, LanguageSwitcherComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  // ===== INJECTED SERVICES =====
  groceryService: GroceryService;
  authService: AuthService;
  

  // ===== FORM =====
  groceryForm!: FormGroup;
  
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
    private translate: TranslateService
  ) {
    this.groceryService = groceryService;
    this.authService = authService;
    this.initializeForm();
  }

  ngOnInit(): void {
    console.log('📊 Dashboard initialized');
    this.groceryService.loadGroceries().subscribe();

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

  // ===== COMPUTED SIGNALS FOR STATISTICS =====
  expiringCount = computed(() =>
    this.groceryService.groceries()
      .filter(g => this.getStatus(g.expirationDate) === 'expiring-soon')
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
        alert('❌ ' + message);
      });
      return;
    }

    const formData = this.groceryForm.value;
    console.log('➕ Submitting new grocery:', formData);
    
    this.groceryService.createGrocery(formData).subscribe({
      next: () => {
        console.log('✅ Grocery added successfully');
        this.translate.get('dashboard.addSuccess').subscribe(message => {
          alert('✅ ' + message);
        });
        this.closeModals();
      },
      error: (error) => {
        console.error('❌ Error adding grocery:', error);
        this.translate.get('dashboard.addError').subscribe(message => {
          alert('❌ ' + message + ': ' + (error.error?.error || 'Unknown error'));
        });
      }
    });
  }

  updateGrocery(): void {
    if (this.groceryForm.invalid || !this.selectedGrocery()?._id) {
      this.translate.get('dashboard.requiredField').subscribe(message => {
        alert('❌ ' + message);
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
          alert('✅ ' + message);
        });
        this.closeModals();
      },
      error: (error) => {
        console.error('❌ Error updating grocery:', error);
        this.translate.get('dashboard.updateError').subscribe(message => {
          alert('❌ ' + message + ': ' + (error.error?.error || 'Unknown error'));
        });
      }
    });
  }

  deleteGrocery(): void {
    const id = this.selectedGrocery()?._id;
    if (!id) {
      alert('❌ Error: No grocery selected');
      return;
    }

    console.log('🗑️ Deleting grocery:', id);
    this.groceryService.deleteGrocery(id).subscribe({
      next: () => {
        console.log('✅ Grocery deleted successfully');
        this.translate.get('dashboard.deleteSuccess').subscribe(message => {
          alert('✅ ' + message);
        });
        this.closeModals();
      },
      error: (error) => {
        console.error('❌ Error deleting grocery:', error);
        this.translate.get('dashboard.deleteError').subscribe(message => {
          alert('❌ ' + message + ': ' + (error.error?.error || 'Unknown error'));
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
  getStatus(expirationDate: string): 'fresh' | 'expiring-soon' | 'expired' {
    return this.groceryService.calculateStatus(expirationDate);
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
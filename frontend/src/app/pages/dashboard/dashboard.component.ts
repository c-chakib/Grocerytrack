// Dashboard Component - Complete Phase 3 with All Methods
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GroceryService, Grocery } from '../../core/services/grocery.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
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
    private fb: FormBuilder
  ) {
    this.groceryService = groceryService;
    this.authService = authService;
    this.initializeForm();
  }

  ngOnInit(): void {
    console.log('📊 Dashboard initialized');
    this.groceryService.loadGroceries().subscribe();
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
  expiringCount = signal(0);
  expiredCount = signal(0);
  freshCount = signal(0);

  updateStatistics(): void {
    this.expiringCount.set(
      this.groceryService.groceries()
        .filter(g => this.getStatus(g.expirationDate) === 'expiring-soon')
        .length
    );
    this.expiredCount.set(
      this.groceryService.groceries()
        .filter(g => this.getStatus(g.expirationDate) === 'expired')
        .length
    );
    this.freshCount.set(
      this.groceryService.groceries()
        .filter(g => this.getStatus(g.expirationDate) === 'fresh')
        .length
    );
  }

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
      alert('❌ Please fill in all required fields');
      return;
    }

    const formData = this.groceryForm.value;
    console.log('➕ Submitting new grocery:', formData);
    
    this.groceryService.createGrocery(formData).subscribe({
      next: () => {
        console.log('✅ Grocery added successfully');
        alert('✅ Grocery added successfully!');
        this.updateStatistics();
        this.closeModals();
      },
      error: (error) => {
        console.error('❌ Error adding grocery:', error);
        alert(`❌ Failed to add grocery: ${error.error?.error || 'Unknown error'}`);
      }
    });
  }

  updateGrocery(): void {
    if (this.groceryForm.invalid || !this.selectedGrocery()?._id) {
      alert('❌ Please fill in all required fields');
      return;
    }

    const groceryId = this.selectedGrocery()!._id!;
    const formData = this.groceryForm.value;
    console.log('✏️ Submitting update for ID:', groceryId, formData);

    this.groceryService.updateGrocery(groceryId, formData).subscribe({
      next: () => {
        console.log('✅ Grocery updated successfully');
        alert('✅ Grocery updated successfully!');
        this.updateStatistics();
        this.closeModals();
      },
      error: (error) => {
        console.error('❌ Error updating grocery:', error);
        alert(`❌ Failed to update grocery: ${error.error?.error || 'Unknown error'}`);
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
        alert('✅ Grocery deleted successfully!');
        this.updateStatistics();
        this.closeModals();
      },
      error: (error) => {
        console.error('❌ Error deleting grocery:', error);
        alert(`❌ Failed to delete grocery: ${error.error?.error || 'Unknown error'}`);
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
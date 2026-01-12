import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Branch } from '../../../core/models/rbac.models';

@Component({
  selector: 'app-branch-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './branch-list.component.html',
  styleUrls: ['./branch-list.component.css']
})
export class BranchListComponent implements OnInit {
  branches = signal<Branch[]>([]);
  loading = signal<boolean>(false);

  ngOnInit() {
    this.loadBranches();
  }

  loadBranches() {
    this.loading.set(true);
    // Mocking for now
    setTimeout(() => {
      const mockBranches: Branch[] = [
        { id: 'B1', name: 'Main Branch', address: '123 Main St', city: 'Metropolis', state: 'NY', zipCode: '10001', phone: '555-0101' },
        { id: 'B2', name: 'West Side Branch', address: '456 West Blvd', city: 'Metropolis', state: 'NY', zipCode: '10002', phone: '555-0202' },
      ];
      this.branches.set(mockBranches);
      this.loading.set(false);
    }, 1000);
  }
}

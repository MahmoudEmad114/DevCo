import { Component, OnInit } from '@angular/core';

import {
  DashboardData
} from '../../core/models/dashboard.model';

import {
  DashboardService
} from '../../core/services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  dashboard: DashboardData | null = null;

  isLoading = true;
  errorMessage = '';

  constructor(
    private dashboardService: DashboardService
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {

    this.isLoading = true;
    this.errorMessage = '';

    this.dashboardService.getDashboard()
      .subscribe({

        next: (response) => {

          this.dashboard = response.data;

          this.isLoading = false;
        },

        error: (error) => {

          console.error('Dashboard error:', error);

          this.errorMessage =
            error?.error?.message ||
            'Failed to load dashboard.';

          this.isLoading = false;
        }

      });
  }
}
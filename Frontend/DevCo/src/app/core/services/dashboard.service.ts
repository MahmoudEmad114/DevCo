import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from './api.service';
import { DashboardResponse } from '../models/dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor(private api: ApiService) {}

  getDashboard(): Observable<DashboardResponse> {
    return this.api.get<DashboardResponse>('/dashboard');
  }
}
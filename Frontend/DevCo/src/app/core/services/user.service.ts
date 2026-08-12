import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from './api.service';

import {
  UserSearchResponse
} from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    private api: ApiService
  ) {}

  searchUsers(
    query: string
  ): Observable<UserSearchResponse> {

    return this.api.get<UserSearchResponse>(
      `/users/search?query=${encodeURIComponent(query)}`
    );
  }

}
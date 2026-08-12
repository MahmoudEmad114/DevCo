import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ProjectMember {
  _id: string;
  project: string;
  user: { _id: string; name: string; email: string };
  role: string;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class MemberService {
  private baseUrl = 'http://localhost:3000/api/v1/members';

  constructor(private http: HttpClient) {}

  getProjectMembers(projectId: string): Observable<ProjectMember[]> {
    return this.http.get<{ data: { members: ProjectMember[] } }>(`${this.baseUrl}/projects/${projectId}/members`)
      .pipe(map(res => res.data.members));
  }
}
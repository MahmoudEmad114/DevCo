import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectService } from '../../../core/services/project.service';
import { MemberService, ProjectMember } from '../../../core/services/member.service';
import { Project } from '../../../core/models/project.model';

@Component({
  selector: 'app-project-details',
  templateUrl: './project-details.component.html',
  styleUrls: ['./project-details.component.css']
})
export class ProjectDetailsComponent implements OnInit {
  projectId!: string;
  project: Project | null = null;
  members: ProjectMember[] = [];

  isLoading = true;
  errorMessage = '';

  showCreateTaskModal = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private memberService: MemberService
  ) {}

  ngOnInit(): void {
    const idFromRoute = this.route.snapshot.paramMap.get('id');
    if (!idFromRoute) {
      this.errorMessage = 'No project id provided';
      this.isLoading = false;
      return;
    }

    this.projectId = idFromRoute;
    this.loadProject();
    this.loadMembers();
  }

  loadProject(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.projectService.getProject(this.projectId).subscribe({
      next: (project) => {
        this.project = project;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load project';
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  loadMembers(): void {
    this.memberService.getProjectMembers(this.projectId).subscribe({
      next: (members) => (this.members = members),
      error: (err) => console.error('Failed to load members', err)
    });
  }

  goToTasks(): void {
    this.router.navigate(['/projects', this.projectId, 'tasks']);
  }

  openCreateTaskModal(): void {
    this.showCreateTaskModal = true;
  }

  closeCreateTaskModal(): void {
    this.showCreateTaskModal = false;
  }

  onTaskCreated(): void {
    // ممكن نعمل هنا حاجة زي إشعار نجاح، أو نسيبها بسيطة كده
    this.closeCreateTaskModal();
  }

  get memberOptions(): { _id: string; name: string }[] {
    return this.members.map(m => ({ _id: m.user._id, name: m.user.name }));
  }
}

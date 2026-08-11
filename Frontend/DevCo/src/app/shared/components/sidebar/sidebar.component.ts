import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface NavItem {
  label: string;
  path: string;
  icon: string; // simple keyword used to pick an inline SVG path in the template
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent {
  @Input() isOpen = true;

  navItems: NavItem[] = [
    { label: 'Dashboard', path: '/dashboard', icon: 'grid' },
    { label: 'Workspaces', path: '/workspaces', icon: 'workspace' },
    { label: 'Projects', path: '/projects', icon: 'folder' },
    { label: 'Tasks', path: '/tasks', icon: 'check' },
    { label: 'Issues', path: '/issues', icon: 'bug' },
    { label: 'Chat', path: '/chat', icon: 'chat' },
    { label: 'Notifications', path: '/notifications', icon: 'bell' },
    { label: 'Profile', path: '/profile', icon: 'user' },
  ];
}

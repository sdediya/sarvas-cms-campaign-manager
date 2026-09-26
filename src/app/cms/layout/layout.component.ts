import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styles: [
    `
      .layout-shell-sidebar {
        top: 4.75rem;
        left: 1.25rem;
        height: calc(100vh - 6.5rem);
      }
      .layout-shell-main {
        padding-left: 1rem;
      }
      @media (min-width: 992px) {
        .layout-shell-main--sidebar {
          padding-left: calc(280px + 2.5rem);
        }
      }
      @media (max-width: 991.98px) {
        .layout-shell-sidebar {
          top: 4.25rem;
          left: 0.75rem;
          height: calc(100vh - 5.5rem);
        }
      }
    `,
  ],
  standalone: false,
})
export class LayoutComponent implements OnInit, OnDestroy {
  sidebarOpen = true;
  isMobile = false;
  private navSub: Subscription;

  constructor(private router: Router) {
    this.navSub = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        if (this.isMobile) {
          this.sidebarOpen = false;
        }
      });
  }

  ngOnInit(): void {
    this.updateViewport();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.updateViewport();
  }

  private updateViewport(): void {
    const mobile = typeof window !== 'undefined' ? window.innerWidth < 992 : false;
    if (mobile !== this.isMobile) {
      this.isMobile = mobile;
      this.sidebarOpen = !mobile;
    }
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  ngOnDestroy(): void {
    this.navSub?.unsubscribe();
  }
}

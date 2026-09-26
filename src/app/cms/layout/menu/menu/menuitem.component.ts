import { Component, HostBinding, Input, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import { lucideChevronDown } from '@ng-icons/lucide';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { MenuService } from '../menu.service';

@Component({
  selector: '[app-menuitem]',
  template: `
    <ng-container>
      @if (root && item.visible !== false && item.label) {
        <div class="mb-1 px-2 pt-3 text-xs font-semibold uppercase tracking-wide text-sidebar-foreground/60">
          {{ item.label }}
        </div>
      }

      @if (!root && ((!item.routerLink && !item.link) || item.items) && item.visible !== false) {
        <button
          type="button"
          class="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          (click)="itemClick($event)"
          [attr.target]="item.target"
        >
          <span class="flex-1 text-start">{{ item.label }}</span>
          @if (item.items) {
            <ng-icon
              name="lucideChevronDown"
              size="1rem"
              class="shrink-0 transition-transform"
              [class.rotate-180]="active"
            />
          }
        </button>
      }

      @if (item.routerLink && !item.link && !item.items && item.visible !== false) {
        <a
          class="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          (click)="itemClick($event)"
          [routerLink]="item.routerLink"
          routerLinkActive="bg-sidebar-accent text-sidebar-primary font-medium"
          [routerLinkActiveOptions]="
            item.routerLinkActiveOptions || {
              paths: 'exact',
              queryParams: 'ignored',
              matrixParams: 'ignored',
              fragment: 'ignored',
            }
          "
          [fragment]="item.fragment"
          [queryParamsHandling]="item.queryParamsHandling"
          [preserveFragment]="item.preserveFragment"
          [skipLocationChange]="item.skipLocationChange"
          [replaceUrl]="item.replaceUrl"
          [state]="item.state"
          [queryParams]="item.queryParams"
          [attr.target]="item.target"
        >
          <span class="flex-1">{{ item.label }}</span>
        </a>
      }

      @if (item.link && !item.items && !item.routerLink && item.visible !== false) {
        <a
          class="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          (click)="itemClick($event)"
          [href]="item.link"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span class="flex-1">{{ item.label }}</span>
        </a>
      }

      @if (item.items && item.visible !== false) {
        <ul
          class="space-y-0.5 overflow-hidden"
          [class.ms-2]="!root"
          [class.border-l]="!root"
          [class.border-sidebar-border]="!root"
          [class.ps-2]="!root"
          [class.hidden]="!root && !active"
        >
          @for (child of item.items; track child; let i = $index) {
            <li app-menuitem [item]="child" [index]="i" [parentKey]="key"></li>
          }
        </ul>
      }
    </ng-container>
  `,
  providers: [provideIcons({ lucideChevronDown })],
  standalone: false,
})
export class MenuitemComponent implements OnInit, OnDestroy {
  @Input() item: any;
  @Input() index!: number;
  @Input() @HostBinding('class.block') root!: boolean;
  @Input() parentKey!: string;
  active = false;
  menuSourceSubscription: Subscription;
  menuResetSubscription: Subscription;
  key = '';

  constructor(
    public router: Router,
    private menuService: MenuService,
  ) {
    this.menuSourceSubscription = this.menuService.menuSource$.subscribe((value) => {
      Promise.resolve(null).then(() => {
        if (value.routeEvent) {
          this.active = value.key === this.key || value.key.startsWith(this.key + '-');
        } else {
          if (value.key !== this.key && !value.key.startsWith(this.key + '-')) {
            this.active = false;
          }
        }
      });
    });

    this.menuResetSubscription = this.menuService.resetSource$.subscribe(() => {
      this.active = false;
    });

    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      if (this.item.routerLink) {
        this.updateActiveStateFromRoute();
      }
    });
  }

  ngOnInit(): void {
    this.key = this.parentKey ? this.parentKey + '-' + this.index : String(this.index);

    if (this.item.routerLink) {
      this.updateActiveStateFromRoute();
    }
  }

  updateActiveStateFromRoute(): void {
    const activeRoute = this.router.isActive(this.item.routerLink[0], {
      paths: 'exact',
      queryParams: 'ignored',
      matrixParams: 'ignored',
      fragment: 'ignored',
    });

    if (activeRoute) {
      this.menuService.onMenuStateChange({ key: this.key, routeEvent: true });
    }
  }

  itemClick(event: Event): void {
    if (this.item.disabled) {
      event.preventDefault();
      return;
    }

    if (this.item.command) {
      this.item.command({ originalEvent: event, item: this.item });
    }

    if (this.item.items) {
      this.active = !this.active;
    }

    this.menuService.onMenuStateChange({ key: this.key });
  }

  @HostBinding('class.active-menuitem')
  get activeClass(): boolean {
    return this.active && !this.root;
  }

  ngOnDestroy(): void {
    this.menuSourceSubscription?.unsubscribe();
    this.menuResetSubscription?.unsubscribe();
  }
}

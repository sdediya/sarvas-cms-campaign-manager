import { Component, Input } from '@angular/core';

@Component({
  selector: 'cms-data-table',
  template: `
    <div class="rounded-md border border-border bg-card">
      <div class="flex flex-wrap items-center justify-between gap-2 border-b border-border px-3 py-2">
        <div class="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <ng-content select="[cmsTableMeta]"></ng-content>
        </div>
        <div class="flex items-center gap-2">
          <ng-content select="[cmsTableActions]"></ng-content>
        </div>
      </div>
      @if (loading) {
        <div class="flex justify-center py-12"><ng-content select="[cmsLoading]"></ng-content></div>
      } @else if (empty) {
        <ng-content select="[cmsEmpty]"></ng-content>
      } @else {
        <div class="overflow-auto">
          <ng-content></ng-content>
        </div>
      }
    </div>
  `,
  standalone: false,
})
export class CmsDataTableComponent {
  @Input() loading = false;
  @Input() empty = false;
}

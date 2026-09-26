import { Component, Input } from '@angular/core';

@Component({
  selector: 'cms-empty-state',
  template: `
    <div class="flex flex-col items-center justify-center gap-2 py-12 text-center">
      <p class="text-base font-medium text-foreground m-0">{{ title }}</p>
      @if (description) {
        <p class="text-sm text-muted-foreground m-0 max-w-md">{{ description }}</p>
      }
      <ng-content></ng-content>
    </div>
  `,
  standalone: false,
})
export class CmsEmptyStateComponent {
  @Input({ required: true }) title!: string;
  @Input() description?: string;
}

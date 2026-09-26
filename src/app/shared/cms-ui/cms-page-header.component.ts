import { Component, Input } from '@angular/core';

@Component({
  selector: 'cms-page-header',
  template: `
    <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
      <h1 class="text-xl font-semibold tracking-tight text-foreground m-0">{{ title }}</h1>
      <div class="flex flex-wrap items-center gap-2">
        <ng-content select="[cmsActions]"></ng-content>
      </div>
    </div>
  `,
  standalone: false,
})
export class CmsPageHeaderComponent {
  @Input({ required: true }) title!: string;
}

import { Component, Input } from '@angular/core';

@Component({
  selector: 'cms-page-header',
  template: `
    <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
      <h1 class="m-0 text-lg font-semibold tracking-tight text-[var(--text-color,#495057)]">{{ title }}</h1>
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

import { Component, Input } from '@angular/core';

@Component({
  selector: 'cms-form-section',
  template: `
    <section class="mb-6 rounded-md border border-border bg-card p-4">
      <h2 class="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground m-0">{{ title }}</h2>
      <div class="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        <ng-content></ng-content>
      </div>
    </section>
  `,
  standalone: false,
})
export class CmsFormSectionComponent {
  @Input({ required: true }) title!: string;
}

import { Component, Input } from '@angular/core';

@Component({
  selector: 'cms-form-section',
  template: `
    <section class="mb-4 rounded-md border border-border bg-card p-3">
      <h2 class="mb-3 m-0 text-sm font-semibold uppercase tracking-wide text-muted-foreground">{{ title }}</h2>
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

import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'cms-filter-bar',
  template: `
    <div class="mb-3">
      <div class="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        <ng-content></ng-content>
      </div>
      <div class="mt-3 flex flex-wrap gap-2">
        <button hlmBtn type="button" (click)="apply.emit()">Submit</button>
        <button hlmBtn type="button" variant="outline" (click)="clear.emit()">Clear</button>
        <ng-content select="[cmsFilterExtra]"></ng-content>
      </div>
    </div>
  `,
  standalone: false,
})
export class CmsFilterBarComponent {
  @Output() apply = new EventEmitter<void>();
  @Output() clear = new EventEmitter<void>();
}

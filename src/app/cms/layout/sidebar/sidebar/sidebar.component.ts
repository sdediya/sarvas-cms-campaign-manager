import { Component, ElementRef, ChangeDetectionStrategy } from '@angular/core';
import { LayoutService } from '../../layout.service';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class SidebarComponent {
  constructor(public layoutService: LayoutService, public el: ElementRef){}
}

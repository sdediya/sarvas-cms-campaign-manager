import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgIcon } from '@ng-icons/core';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';

import { MenuitemComponent } from './menu/menu/menuitem.component';
import { LayoutComponent } from './layout.component';
import { TopbarComponent } from './topbar/topbar/topbar.component';
import { FooterComponent } from './footer/footer/footer.component';
import { MenuComponent } from './menu/menu/menu.component';
import { SidebarComponent } from './sidebar/sidebar/sidebar.component';
import { SharedSpartanModule } from 'src/app/shared/shared-spartan.module';

@NgModule({
  declarations: [
    MenuitemComponent,
    TopbarComponent,
    FooterComponent,
    MenuComponent,
    SidebarComponent,
    LayoutComponent,
  ],
  exports: [LayoutComponent],
  imports: [
    SharedSpartanModule,
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    NgIcon,
    ...HlmDropdownMenuImports,
  ],
  providers: [provideHttpClient(withInterceptorsFromDi())],
})
export class LayoutModule {}

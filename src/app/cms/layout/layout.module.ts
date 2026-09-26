import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { MenuitemComponent } from './menu/menu/menuitem.component';
import { LayoutComponent } from './layout.component';
import { TopbarComponent } from './topbar/topbar/topbar.component';
import { FooterComponent } from './footer/footer/footer.component';
import { MenuComponent } from './menu/menu/menu.component';
import { SidebarComponent } from './sidebar/sidebar/sidebar.component';
import { ConfigComponent } from './config/config/config.component';
import { SharedUiModule } from 'src/app/shared/shared-ui.module';

@NgModule({ declarations: [
        MenuitemComponent,
        TopbarComponent,
        FooterComponent,
        MenuComponent,
        SidebarComponent,
        LayoutComponent,
        ConfigComponent],
    exports: [
        LayoutComponent
    ], imports: [
    SharedUiModule,
        BrowserModule,
        BrowserAnimationsModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule], providers: [provideHttpClient(withInterceptorsFromDi())] })
export class LayoutModule { }

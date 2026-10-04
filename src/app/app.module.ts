import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import { ConfirmationService, MessageService } from 'primeng/api';
import { providePrimeNG } from 'primeng/config';
import { VasAura } from './theme/vas-aura.preset';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoaderComponent } from './components/loader/loader.component';
import { LayoutModule } from './cms/layout/layout.module';
import { CampaignModule } from './cms/campaign/campaign.module';
import { CopyToClipboardDirective } from './directive/copy-to-clipboard.directive';
import { ErrorCatchingInterceptor } from './services/http/error-catching.interceptor';
import { MaintenanceInterceptor } from './services/http/maintenance.interceptor';
import { LoadingInterceptor } from './services/http/loading.interceptor';
import { SharedUiModule } from 'src/app/shared/shared-ui.module';

@NgModule({
  declarations: [
    AppComponent,
    LoaderComponent,
    CopyToClipboardDirective],
  bootstrap: [AppComponent],
  imports: [
    SharedUiModule,
    AppRoutingModule,
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    LayoutModule,
    CampaignModule],
  providers: [
    DatePipe,
    MessageService,
    ConfirmationService,
    providePrimeNG({
      theme: {
        preset: VasAura,
        options: {
          // Keep CMS on light UI regardless of OS dark-mode preference
          darkModeSelector: 'none',
        },
      },
    }),
    { provide: HTTP_INTERCEPTORS, useClass: ErrorCatchingInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: MaintenanceInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: LoadingInterceptor, multi: true },
    provideHttpClient(withInterceptorsFromDi())],
})
export class AppModule {}

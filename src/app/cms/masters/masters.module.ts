import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { FormsModule } from '@angular/forms'; 
import { ReactiveFormsModule } from '@angular/forms';

import { MastersRoutingModule } from './masters-routing.module';
import { AddRegionComponent } from './region/add-region/add-region.component';
import { ListRegionComponent } from './region/list-region/list-region.component';
import { ListMasterAggregatorComponent } from './master-aggregator/list-master-aggregator/list-master-aggregator.component';
import { AddMasterAggregatorComponent } from './master-aggregator/add-master-aggregator/add-master-aggregator.component';
import { AddServiceComponent } from './service/add-service/add-service.component';
import { ListServiceComponent } from './service/list-service/list-service.component';
import { ListPlatformComponent } from './platform/list-platform/list-platform.component';
import { AddPlatformComponent } from './platform/add-platform/add-platform.component';
import { AddErrorsComponent } from './errors/add-errors/add-errors.component';
import { ListErrorsComponent } from './errors/list-errors/list-errors.component';
import { ListSmsTemplatesComponent } from './sms-templates/list-sms-templates/list-sms-templates.component';
import { AddSmsTemplatesComponent } from './sms-templates/add-sms-templates/add-sms-templates.component';
import { ListCurrencyLogsComponent } from './currency-logs/list-currency-logs/list-currency-logs.component';
import { GoogleCampaignCostComponent } from './google-campaign-cost/google-campaign-cost.component';
import { AddShortLinkComponent } from './short-link/add-short-link/add-short-link.component';
import { ListShortLinkComponent } from './short-link/list-short-link/list-short-link.component';
import { GoogleSheetComponent } from './google-sheet/google-sheet.component';
import { GoogleCostComponent } from './google-cost/google-cost.component';
import { CronMasterComponent } from './master-cron/add-cron/add-cron.component';
import { ListCronComponent } from './master-cron/list-cron/list-cron.component';
import { SharedUiModule } from 'src/app/shared/shared-ui.module';
@NgModule({
  declarations: [
    AddRegionComponent,
    ListRegionComponent,
    ListMasterAggregatorComponent,
    AddMasterAggregatorComponent,
    AddServiceComponent,
    ListServiceComponent,
    ListPlatformComponent,
    AddPlatformComponent,
    AddErrorsComponent,
    ListErrorsComponent,
    ListSmsTemplatesComponent,
    AddSmsTemplatesComponent,
    ListCurrencyLogsComponent,
    GoogleCampaignCostComponent,
    GoogleSheetComponent,
    GoogleCostComponent,
    AddShortLinkComponent,
    ListShortLinkComponent,
    GoogleSheetComponent,
    GoogleCampaignCostComponent,
    ListCronComponent,
    CronMasterComponent
  ],
  imports: [
    SharedUiModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MastersRoutingModule,
  ],
  providers: [
    DatePipe,
  ],
})
export class MastersModule { }

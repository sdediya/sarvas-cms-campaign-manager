import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListPlatformComponent } from './platform/list-platform/list-platform.component';
import { ListServiceComponent } from './service/list-service/list-service.component';
import { ListRegionComponent } from './region/list-region/list-region.component';
import { ListMasterAggregatorComponent } from './master-aggregator/list-master-aggregator/list-master-aggregator.component';
import { AddServiceComponent } from './service/add-service/add-service.component';
import { AddPlatformComponent } from './platform/add-platform/add-platform.component';
import { AddRegionComponent } from './region/add-region/add-region.component';
import { AddMasterAggregatorComponent } from './master-aggregator/add-master-aggregator/add-master-aggregator.component';
import { ListErrorsComponent } from './errors/list-errors/list-errors.component';
import { AddErrorsComponent } from './errors/add-errors/add-errors.component';
import { ListSmsTemplatesComponent } from './sms-templates/list-sms-templates/list-sms-templates.component';
import { AddSmsTemplatesComponent } from './sms-templates/add-sms-templates/add-sms-templates.component';
import { ListCurrencyLogsComponent } from './currency-logs/list-currency-logs/list-currency-logs.component';
import { GoogleCampaignCostComponent } from './google-campaign-cost/google-campaign-cost.component';
import { GoogleSheetComponent } from './google-sheet/google-sheet.component';
import { GoogleCostComponent } from './google-cost/google-cost.component';
import { CronMasterComponent } from './master-cron/add-cron/add-cron.component';
import { ListCronComponent } from './master-cron/list-cron/list-cron.component';

import { AddShortLinkComponent } from './short-link/add-short-link/add-short-link.component';
import { ListShortLinkComponent } from './short-link/list-short-link/list-short-link.component';
const routes: Routes = [
  { path: 'ad-partners', component:ListPlatformComponent},
  { path: 'add-ad-partner', component:AddPlatformComponent},
  { path: 'edit-ad-partner', component:AddPlatformComponent},

  { path: 'services', component:ListServiceComponent},
  { path: 'add-service', component:AddServiceComponent},
  { path: 'edit-service', component:AddServiceComponent},

  { path: 'region', component:ListRegionComponent},
  { path: 'add-region', component:AddRegionComponent},
  { path: 'edit-region', component:AddRegionComponent},
  
  { path: 'master-aggregators', component:ListMasterAggregatorComponent},
  { path: 'add-master-aggregator', component:AddMasterAggregatorComponent},
  { path: 'edit-master-aggregator', component:AddMasterAggregatorComponent},

  { path: 'custom-responses', component:ListErrorsComponent},
  { path: 'add-custom-response', component:AddErrorsComponent},
  { path: 'edit-custom-response', component:AddErrorsComponent},

  { path: 'sms-templates', component:ListSmsTemplatesComponent},
  { path: 'add-sms-template', component:AddSmsTemplatesComponent},
  { path: 'edit-sms-template', component:AddSmsTemplatesComponent},

  { path: 'currency-logs', component: ListCurrencyLogsComponent},
  
  { path: 'google-campaign-cost', component:GoogleCampaignCostComponent },
  
  { path: 'google-sheet', component:GoogleSheetComponent }, //! Add GoogleSheet data 
  
  { path: 'google-cost', component:GoogleCostComponent }, //! Add Google Cost
  { path: 'google-campaign-cost', component:GoogleCampaignCostComponent },

  { path: 'short-link', component:ListShortLinkComponent},
  { path: 'add-short-link', component:AddShortLinkComponent},
  { path: 'edit-short-link', component:AddShortLinkComponent},
  
  { path: 'master-cron', component:CronMasterComponent },
  { path: 'edit-cron', component:CronMasterComponent },
  { path: 'list-cron', component:ListCronComponent }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MastersRoutingModule { }

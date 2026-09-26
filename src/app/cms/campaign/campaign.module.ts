import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { CampaignRoutingModule } from './campaign-routing.module';
import { CampaignThemeComponent } from './campaign-theme/campaign-theme.component';
import { AddCampaignComponent } from './add-campaign/add-campaign.component';
import { ListCampaignComponent } from './list-campaign/list-campaign.component';
import { CampaignConfigurationComponent } from './campaign-configuration/campaign-configuration.component';
import { AddCampaignConfigurationComponent } from './add-campaign-configuration/add-campaign-configuration.component';
import { AddBlacklistComponent } from './blacklist/add-blacklist/add-blacklist.component';
import { ListBlacklistComponent } from './blacklist/list-blacklist/list-blacklist.component';
import { ListWhitelistComponent } from './whitelist/list-whitelist/list-whitelist.component';
import { AddWhitelistComponent } from './whitelist/add-whitelist/add-whitelist.component';
import { TwoDigitDecimalDirectiveDirective } from 'src/app/directive/two-digit-decimal-directive.directive';
import { I18nPipe } from 'src/app/shared/i18n.pipe';
import { I18nServiceService } from 'src/app/services/i18n-service.service';
import { ServiceApiDocComponent } from './service-api-doc/service-api-doc.component';
import { ListSmartUrlComponent } from './list-smart-url/list-smart-url.component';
import { AddSmartUrlComponent } from './add-smart-url/add-smart-url.component';
import { AddLandingPageConfigurationComponent } from './add-landing-page-configuration/add-landing-page-configuration.component';
import { ListLandingPageConfigurationComponent } from './list-landing-page-configuration/list-landing-page-configuration.component';
import { SharedUiModule } from 'src/app/shared/shared-ui.module';

@NgModule({
  declarations: [
    AddCampaignComponent,
    ListCampaignComponent,
    CampaignThemeComponent,
    CampaignConfigurationComponent,
    AddCampaignConfigurationComponent,
    AddBlacklistComponent,
    ListBlacklistComponent,
    ListWhitelistComponent,
    AddWhitelistComponent,
    TwoDigitDecimalDirectiveDirective,
    I18nPipe,
    ServiceApiDocComponent,
    ListSmartUrlComponent,
    AddSmartUrlComponent,
    AddLandingPageConfigurationComponent,
    ListLandingPageConfigurationComponent
  ],
  imports: [
    SharedUiModule,
    CommonModule,
    CampaignRoutingModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [I18nServiceService],
})
export class CampaignModule { }

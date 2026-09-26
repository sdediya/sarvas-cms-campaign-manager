import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListCampaignComponent } from './list-campaign/list-campaign.component';
import { AddCampaignComponent } from './add-campaign/add-campaign.component';
import { CampaignThemeComponent } from './campaign-theme/campaign-theme.component';
import { CampaignConfigurationComponent } from './campaign-configuration/campaign-configuration.component';
import { AddCampaignConfigurationComponent } from './add-campaign-configuration/add-campaign-configuration.component';
import { AddBlacklistComponent } from './blacklist/add-blacklist/add-blacklist.component';
import { ListBlacklistComponent } from './blacklist/list-blacklist/list-blacklist.component';
import { AddWhitelistComponent } from './whitelist/add-whitelist/add-whitelist.component';
import { ListWhitelistComponent } from './whitelist/list-whitelist/list-whitelist.component';
import { ServiceApiDocComponent } from './service-api-doc/service-api-doc.component';
import { ListSmartUrlComponent } from './list-smart-url/list-smart-url.component';
import { AddSmartUrlComponent } from './add-smart-url/add-smart-url.component';
import { AddLandingPageConfigurationComponent } from './add-landing-page-configuration/add-landing-page-configuration.component';
import { ListLandingPageConfigurationComponent } from './list-landing-page-configuration/list-landing-page-configuration.component';
const routes: Routes = [
  // { path: 'cms/campaign', redirectTo:'/cms/campaign/list', pathMatch:'full'},
  { path: 'add', component:AddCampaignComponent},
  { path: 'list', component:ListCampaignComponent},
  { path: 'edit', component:AddCampaignComponent},
  { path: 'theme', component:CampaignThemeComponent},
  { path: 'configuration-list', component:CampaignConfigurationComponent},
  { path: 'add-configuration', component:AddCampaignConfigurationComponent},
  { path: 'edit-configuration', component:AddCampaignConfigurationComponent},
  { path: 'add-blacklist', component:AddBlacklistComponent},
  { path: 'blacklist', component:ListBlacklistComponent},
  { path: 'add-whitelist', component:AddWhitelistComponent},
  { path: 'whitelist', component:ListWhitelistComponent},
  { path: 'service-api-doc', component:ServiceApiDocComponent},
  { path: 'smart-url/list', component:ListSmartUrlComponent},
  { path: 'smart-url/add', component:AddSmartUrlComponent},
  { path: 'smart-url/edit', component:AddSmartUrlComponent},
  { path: 'landing-page-configuration/add', component:AddLandingPageConfigurationComponent},
  { path: 'landing-page-configuration/edit', component:AddLandingPageConfigurationComponent},
  { path: 'landing-page-configuration/list', component:ListLandingPageConfigurationComponent}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CampaignRoutingModule { }

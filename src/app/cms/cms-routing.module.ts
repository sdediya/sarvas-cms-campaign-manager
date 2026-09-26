import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthGuard } from '../shared/guard/auth.guard';
import { NoAccessComponent } from './no-access/no-access.component';
import { CustomerCareInterfaceComponent } from './customer/customer-care-interface/customer-care-interface.component';

const routes: Routes = [
  
  {
    path:"", component: LayoutComponent,
    children:[
      { path: 'dashboard', component:DashboardComponent},
      { path: 'campaign', loadChildren:()=> import('../../app/cms/campaign/campaign.module').then(m=>m.CampaignModule)},
      { path: 'operator', loadChildren:()=> import('../../app/cms/telcom/telcom.module').then(m=>m.TelcomModule)},
      { path: 'plan', loadChildren:()=> import('../../app/cms/plan/plan.module').then(m=>m.PlanModule)},
      { path: 'masters', loadChildren:()=> import('../../app/cms/masters/masters.module').then(m=>m.MastersModule)},
      { path: 'reports', loadChildren:()=> import('../../app/cms/reports/reports.module').then(m=>m.ReportsModule)},
      { path: 'users', loadChildren:()=> import('../../app/cms/cms-users/cms-users.module').then(m=>m.CmsUsersModule)},
      { path: 'customer', loadChildren:()=> import('../../app/cms/customer/customer.module').then(m=>m.CustomerModule)},
      { path: 'blacklist', loadChildren:()=> import('../../app/cms/blacklist/blacklist.module').then(m=>m.BlacklistModule)},
      { path: 'logs', loadChildren:()=> import('../../app/cms/logs/logs.module').then(m=>m.LogsModule)},
      { path: 'no-access', component: NoAccessComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full'}],
    canActivate: [AuthGuard]
  },
  { path: 'auth', loadChildren:()=> import('../../app/cms/auth/auth.module').then(m=>m.AuthModule)}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CmsRoutingModule { }

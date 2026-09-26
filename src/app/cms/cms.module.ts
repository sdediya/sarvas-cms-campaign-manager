import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CmsRoutingModule } from './cms-routing.module';

import { DashboardComponent } from './dashboard/dashboard.component';
import { MastersModule } from './masters/masters.module';
import { NoAccessComponent } from './no-access/no-access.component';
// import { CustomerCareInterfaceComponent } from './customer-care-interface/customer-care-interface.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedUiModule } from 'src/app/shared/shared-ui.module';
@NgModule({
  declarations: [
    DashboardComponent, 
    NoAccessComponent,
    // CustomerCareInterfaceComponent
  ],
  imports: [
    SharedUiModule,
    CommonModule,
    MastersModule,
    CmsRoutingModule,
    FormsModule,
    ReactiveFormsModule]
})
export class CmsModule { }

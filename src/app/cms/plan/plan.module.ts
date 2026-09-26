import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { PlanRoutingModule } from './plan-routing.module';
import { AddPlanComponent } from './add-plan/add-plan.component';
import { ListPlanComponent } from './list-plan/list-plan.component';
import { SharedUiModule } from 'src/app/shared/shared-ui.module';

@NgModule({
  declarations: [
    AddPlanComponent,
    ListPlanComponent
  ],
  imports: [
    SharedUiModule,
    CommonModule,
    PlanRoutingModule,
    FormsModule, 
    ReactiveFormsModule]
})
export class PlanModule { }

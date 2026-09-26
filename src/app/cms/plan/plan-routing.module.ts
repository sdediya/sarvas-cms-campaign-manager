import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddPlanComponent } from './add-plan/add-plan.component';
import { ListPlanComponent } from './list-plan/list-plan.component';

const routes: Routes = [
  { path: '', redirectTo:'list', pathMatch:'full'},
  { path: 'add', component:AddPlanComponent},
  { path: 'list', component:ListPlanComponent},
  { path: 'edit', component:AddPlanComponent}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PlanRoutingModule { }

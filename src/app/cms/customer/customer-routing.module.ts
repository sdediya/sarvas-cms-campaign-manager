import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CustomerRefundComponent } from './customer-refund/customer-refund.component';
import { CustomerCareInterfaceComponent } from './customer-care-interface/customer-care-interface.component';

const routes: Routes = [
  { path: 'refund', component:CustomerRefundComponent},
  { path: 'customer-care-interface', component:CustomerCareInterfaceComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomerRoutingModule { }

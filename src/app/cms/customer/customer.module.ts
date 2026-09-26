import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CustomerRoutingModule } from './customer-routing.module';
import { CustomerRefundComponent } from './customer-refund/customer-refund.component';
import { CustomerCareInterfaceComponent } from './customer-care-interface/customer-care-interface.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaskMsisdnPipe } from '../../shared/mask-msisdn.pipe';
import { SharedUiModule } from 'src/app/shared/shared-ui.module';

@NgModule({
  declarations: [
    CustomerRefundComponent,
    CustomerCareInterfaceComponent
  ],
  imports: [
    SharedUiModule,
    CommonModule,
    CustomerRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MaskMsisdnPipe
  ]
})
export class CustomerModule { }

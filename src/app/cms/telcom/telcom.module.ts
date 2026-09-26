import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { TelcomRoutingModule } from './telcom-routing.module';
import { ListTelcomComponent } from './list-telcom/list-telcom.component';
import { AddTelcomComponent } from './add-telcom/add-telcom.component';
import { SharedUiModule } from 'src/app/shared/shared-ui.module';
@NgModule({
  declarations: [
    ListTelcomComponent,
    AddTelcomComponent
  ],
  imports: [
    SharedUiModule,
    CommonModule,
    TelcomRoutingModule,
    FormsModule, 
    ReactiveFormsModule]
})
export class TelcomModule { }

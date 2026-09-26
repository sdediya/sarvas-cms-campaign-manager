import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { BlacklistRoutingModule } from './blacklist-routing.module';
import { ListBlacklistComponent } from './list-blacklist/list-blacklist.component';
import { AddBlacklistComponent } from './add-blacklist/add-blacklist.component';
import { SharedUiModule } from 'src/app/shared/shared-ui.module';

@NgModule({
  declarations: [
    ListBlacklistComponent,
    AddBlacklistComponent
  ],
  imports: [
    SharedUiModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BlacklistRoutingModule]
})
export class BlacklistModule { }

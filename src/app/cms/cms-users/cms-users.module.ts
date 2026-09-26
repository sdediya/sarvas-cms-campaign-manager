import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CmsUsersRoutingModule } from './cms-users-routing.module';
import { AddUserComponent } from './add-user/add-user.component';
import { ListUserComponent } from './list-user/list-user.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { UserActivityLogComponent } from './user-activity-log/user-activity-log.component';
import { SharedUiModule } from 'src/app/shared/shared-ui.module';
@NgModule({
  declarations: [
    AddUserComponent,
    ListUserComponent,
    UserActivityLogComponent
  ],
  imports: [
    SharedUiModule,
    CommonModule,
    CmsUsersRoutingModule,
    FormsModule,
    ReactiveFormsModule]
})
export class CmsUsersModule { }

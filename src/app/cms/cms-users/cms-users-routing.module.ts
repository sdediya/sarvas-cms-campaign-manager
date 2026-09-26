import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddUserComponent } from './add-user/add-user.component';
import { ListUserComponent } from './list-user/list-user.component';
import { UserActivityLogComponent } from './user-activity-log/user-activity-log.component';

const routes: Routes = [
  { path: 'user-list', component:ListUserComponent},
  { path: 'add-user', component:AddUserComponent},
  { path: 'edit-user', component:AddUserComponent},
  { path: 'user-activity-log', component:UserActivityLogComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CmsUsersRoutingModule { }

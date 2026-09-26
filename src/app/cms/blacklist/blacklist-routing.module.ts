import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListBlacklistComponent } from './list-blacklist/list-blacklist.component';
import { AddBlacklistComponent } from './add-blacklist/add-blacklist.component';

const routes: Routes = [
  { path: '', redirectTo: 'list', pathMatch: 'full' },
  { path: 'list', component: ListBlacklistComponent },
  { path: 'add', component: AddBlacklistComponent },
  { path: 'edit', component: AddBlacklistComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BlacklistRoutingModule { }

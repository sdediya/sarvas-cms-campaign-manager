import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddTelcomComponent } from './add-telcom/add-telcom.component';
import { ListTelcomComponent } from './list-telcom/list-telcom.component';

const routes: Routes = [
  { path: '', redirectTo:'list', pathMatch:'full'},
  { path: 'add', component:AddTelcomComponent},
  { path: 'list', component:ListTelcomComponent},
  { path: 'edit', component:AddTelcomComponent}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TelcomRoutingModule { }

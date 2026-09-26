import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MaintenanceComponent } from './components/maintenance/maintenance.component';

const routes: Routes = [
  { path: '',   loadChildren: ()=> import('./cms/cms.module').then(m=> m.CmsModule)},
  // {
  //   path: "cms", loadChildren: ()=> import('./cms/cms.module').then(m=> m.CmsModule)
  // },


  { path: 'maintenance', component: MaintenanceComponent},
  //this should be always in last
  // { path: '**', component: NotFoundComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

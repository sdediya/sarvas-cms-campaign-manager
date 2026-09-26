import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CronLogComponent } from './cron-log/cron-log.component';
import { CallbackLogsComponent } from './callback-logs/callback-logs.component';
import { OperatorLogsComponent } from './operator-logs/operator-logs.component';
import { ServiceApiLogsComponent } from './service-api-logs/service-api-logs.component';
import { ShortlinkLogsComponent } from './shortlink-logs/shortlink-logs.component';
import { ThirdPartyLogsComponent } from './third-party-logs/third-party-logs.component';
import { FailedCallbackLogsComponent } from './failed-callback-logs/failed-callback-logs.component';
import { DbcRequestLogsComponent } from './dbc-request-logs/dbc-request-logs.component';
import { DbcNotificationLogsComponent } from './dbc-notification-logs/dbc-notification-logs.component';

const routes: Routes = [
  { path: 'cron_log', component:CronLogComponent},
  { path: 'callback-log', component:CallbackLogsComponent},
  { path: 'operator-logs', component:OperatorLogsComponent},
  { path: 'service-api-logs', component:ServiceApiLogsComponent},
  { path: 'shortlink-logs', component:ShortlinkLogsComponent},
  { path: 'third-party-logs', component:ThirdPartyLogsComponent},
  { path: 'failed-callback-logs', component:FailedCallbackLogsComponent},
  { path: 'dbc-request-logs', component: DbcRequestLogsComponent },
  { path: 'dbc-notification-logs', component: DbcNotificationLogsComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LogsRoutingModule { }

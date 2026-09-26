import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LogsRoutingModule } from './logs-routing.module';
import { CronLogComponent } from './cron-log/cron-log.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CallbackLogsComponent } from './callback-logs/callback-logs.component';
import { FailedCallbackLogsComponent } from './failed-callback-logs/failed-callback-logs.component';
import { OperatorLogsComponent } from './operator-logs/operator-logs.component';
import { ServiceApiLogsComponent } from './service-api-logs/service-api-logs.component';
import { MaskMsisdnPipe } from '../../shared/mask-msisdn.pipe';
import { ShortlinkLogsComponent } from './shortlink-logs/shortlink-logs.component';
import { ThirdPartyLogsComponent } from './third-party-logs/third-party-logs.component';
import { DbcRequestLogsComponent } from './dbc-request-logs/dbc-request-logs.component';
import { DbcNotificationLogsComponent } from './dbc-notification-logs/dbc-notification-logs.component';
import { SharedUiModule } from 'src/app/shared/shared-ui.module';

@NgModule({
  declarations: [CronLogComponent, CallbackLogsComponent, OperatorLogsComponent, ServiceApiLogsComponent, ThirdPartyLogsComponent, ShortlinkLogsComponent, FailedCallbackLogsComponent, DbcRequestLogsComponent, DbcNotificationLogsComponent],
  imports: [
    SharedUiModule,
    CommonModule,
    LogsRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MaskMsisdnPipe
  ]
})
export class LogsModule { }

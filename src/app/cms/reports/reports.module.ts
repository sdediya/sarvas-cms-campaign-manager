import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms'; 
import { ReactiveFormsModule } from '@angular/forms';

import { ReportsRoutingModule } from './reports-routing.module';
import { RevenueReportComponent } from './revenue-report/revenue-report.component';

import { WapComponent } from './realTimeMis/wap/wap.component';
import { ServiceApiComponent } from './realTimeMis/service-api/service-api.component';
import { AgeingSummaryComponent } from './ageing-report/ageing-summary/ageing-summary.component';
import { IpReportComponent } from './ip-report/ip-report.component';
import { PublisherReportComponent } from './publisher-report/publisher-report.component';
import { DrrReportComponent } from './drr-report/drr-report.component';
import { S2sSummaryComponent } from './s2s-summary/s2s-summary.component';
import { PayoutReportComponent } from './payout-report/payout-report.component';
import { MsisdnwiseReportComponent } from './msisdnwise-report/msisdnwise-report.component';
import { LiveDashboardComponent } from './live-dashboard/live-dashboard.component';
import { ServiceApiSummaryComponent } from './service-api-summary/service-api-summary.component';
import { ApiErrorDashboardComponent } from './api-error-dashboard/api-error-dashboard.component';
import { AgeingDumpComponent } from './ageing-report/ageing-dump/ageing-dump.component';
import { PartnerWiseSummaryComponent } from './ageing-report/partner-wise-summary/partner-wise-summary.component';
import { OneshotViewReportComponent } from './oneshot-view-report/oneshot-view-report.component';
import { OperatorRevenueCalculatorComponent } from './operator-revenue-calculator/operator-revenue-calculator.component';
import { ChargingReportComponent } from './charging-report/charging-report.component';
import { RevenueReportV2Component } from './revenue-report-v2/revenue-report-v2.component';

import { MaskMsisdnPipe } from '../../shared/mask-msisdn.pipe';
import { AgeingDumpV2Component } from './ageing-report-v2/ageing-dump/ageing-dump-v2.component';
import { AgeingSummaryV2Component } from './ageing-report-v2/ageing-summary/ageing-summary-v2.component';
import { PartnerWiseSummaryV2Component } from './ageing-report-v2/partner-wise-summary/partner-wise-summary-v2.component';
import { OneshotViewDashboardComponent } from './oneshot-view-dashboard/oneshot-view-dashboard.component';
import { InvestorReportComponent } from './investor-report/investor-report.component';
import { ServiceOperatorResponseReportComponent } from './service-operator-response-report/service-operator-response-report.component';
import { TargetVsAchievementRevenueComponent } from './target-vs-achievement-revenue/target-vs-achievement-revenue.component';
import { TargetVsAchievementActivationComponent } from './target-vs-achievement-activation/target-vs-achievement-activation.component';
import { TargetVsAchievementDrrComponent } from './target-vs-achievement-drr/target-vs-achievement-drr.component';
import { SharedUiModule } from 'src/app/shared/shared-ui.module';

@NgModule({
  declarations: [
    RevenueReportComponent,
    RevenueReportV2Component,
    WapComponent,
    ServiceApiComponent,
    AgeingSummaryComponent,
    IpReportComponent,
    PublisherReportComponent,
    DrrReportComponent,
    S2sSummaryComponent,
    PayoutReportComponent,
    MsisdnwiseReportComponent,
    LiveDashboardComponent,
    ServiceApiSummaryComponent,
    ApiErrorDashboardComponent,
    AgeingDumpComponent,
    PartnerWiseSummaryComponent,
    OneshotViewReportComponent,
    OperatorRevenueCalculatorComponent,
    ChargingReportComponent,
    AgeingDumpV2Component,
    AgeingSummaryV2Component,
    PartnerWiseSummaryV2Component,
    OneshotViewDashboardComponent,
    InvestorReportComponent,
    ServiceOperatorResponseReportComponent,
    TargetVsAchievementRevenueComponent,
    TargetVsAchievementActivationComponent,
    TargetVsAchievementDrrComponent
  ],
  imports: [
    SharedUiModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ReportsRoutingModule,
    MaskMsisdnPipe
  ]
})
export class ReportsModule { }

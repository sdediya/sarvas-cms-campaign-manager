import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RevenueReportComponent } from './revenue-report/revenue-report.component';
import { PublisherReportComponent } from './publisher-report/publisher-report.component';
import { DrrReportComponent } from './drr-report/drr-report.component';
import { WapComponent } from './realTimeMis/wap/wap.component';
import { ServiceApiComponent } from './realTimeMis/service-api/service-api.component';
import { AgeingSummaryComponent } from './ageing-report/ageing-summary/ageing-summary.component';
import { IpReportComponent } from './ip-report/ip-report.component';
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

import { PartnerWiseSummaryV2Component } from './ageing-report-v2/partner-wise-summary/partner-wise-summary-v2.component';
import { AgeingDumpV2Component } from './ageing-report-v2/ageing-dump/ageing-dump-v2.component';
import { AgeingSummaryV2Component } from './ageing-report-v2/ageing-summary/ageing-summary-v2.component';
import { OneshotViewDashboardComponent } from './oneshot-view-dashboard/oneshot-view-dashboard.component';
import { InvestorReportComponent } from './investor-report/investor-report.component';
import { ServiceOperatorResponseReportComponent } from './service-operator-response-report/service-operator-response-report.component';
import { TargetVsAchievementRevenueComponent } from './target-vs-achievement-revenue/target-vs-achievement-revenue.component';
import { TargetVsAchievementActivationComponent } from './target-vs-achievement-activation/target-vs-achievement-activation.component';
import { TargetVsAchievementDrrComponent } from './target-vs-achievement-drr/target-vs-achievement-drr.component';

const routes: Routes = [
  { path: 'revenue-report', component:RevenueReportComponent},
  { path: 'revenue-report-v2', component:RevenueReportV2Component},

  { path: 'realtime-mis/wap', component:WapComponent},
  { path: 'realtime-mis/service-api', component:ServiceApiComponent},

  { path: 'publisher-report', component:PublisherReportComponent},
  { path: 'investor-report', component:InvestorReportComponent},

  { path: 'drr-report', component:DrrReportComponent},

  { path: 'ageing/summary', component:AgeingSummaryComponent},
  { path: 'ageing/dump', component:AgeingDumpComponent},
  { path: 'ageing/partner-wise-summary', component:PartnerWiseSummaryComponent},
  
  { path: 'v2/ageing/summary', component:AgeingSummaryV2Component},
  { path: 'v2/ageing/dump', component:AgeingDumpV2Component},
  { path: 'v2/ageing/partner-wise-summary', component:PartnerWiseSummaryV2Component},
  

  { path: 'ip-report', component:IpReportComponent},

  { path: 'payout-report', component:PayoutReportComponent},

  { path: 'msisdnwise', component:MsisdnwiseReportComponent},

  { path: 'livedashboard-report', component:LiveDashboardComponent},

  { path: 'summary/s2s', component:S2sSummaryComponent},
  { path: 'summary/service-api', component:ServiceApiSummaryComponent},

  { path: 'apierrordashboard', component:ApiErrorDashboardComponent},

  {path: 'oneshotview', component:OneshotViewReportComponent}, //! discontinued
  
  {path: 'oneshot-view-dashboard', component:OneshotViewDashboardComponent},

  {path: 'operatorCalculator', component:OperatorRevenueCalculatorComponent},
  { path: 'charging-report', component:ChargingReportComponent},

  { path: 'service-operator-response-report', component:ServiceOperatorResponseReportComponent},
  { path: 'target-vs-achievement/revenue', component: TargetVsAchievementRevenueComponent },
  { path: 'target-vs-achievement/activation', component: TargetVsAchievementActivationComponent },
  { path: 'target-vs-achievement/drr', component: TargetVsAchievementDrrComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportsRoutingModule { }

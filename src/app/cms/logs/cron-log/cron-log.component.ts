import { DatePipe, formatDate } from '@angular/common';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { error } from '@rxweb/reactive-form-validators';
import { Table } from 'primeng/table';
import { ExcelExportService } from 'src/app/services/excelExport/excel-export.service';
import { HttpService } from 'src/app/services/http/http.service';
import { environment } from 'src/environments/environment';

interface cronData {
  operator: string;
  region: string;
  start_time: string;
  cron_date: string;
  is_processed: boolean;
  cron_report?: {
    totalRecords: number;
    grace:number;
    renewed:number;
    churn:number
  };
  end_time?: string;
  cron_status?: string;
}

@Component({
    selector: 'app-cron-log',
    templateUrl: './cron-log.component.html',
    styleUrls: ['./cron-log.component.css'],
    providers: [DatePipe],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})

export class CronLogComponent {
  cron_logs:cronData[] = [];
  totalTableRecords: number = 0;
  loading: boolean = false;
  lazyLoadEvent:any;
  CMS_API = environment.CMS_API
  filter: any = {'type':null,'operator': null, 'region': null, 'cron_start_date': null, 'cron_end_date': null, 'status':null,'masterAggregator':null}

  regions: any[] = [];
  telecom_operators: any[] = [];
  telecom_master_aggregator: any[] = [];
  regionOperatorMA: any = {};
  showMasterAggregator: boolean = false;

  maxDate: any;
  cron_date: any;
  campaignData: any;
  selected_type:any = 'RENEWAL'
  cronlogs_type:any
  cron_type:any=[{
    name:'RENEWAL'
  },
  {
    name:'PARKING'
  }
]
cron_status:any=[{
  status:'Success'
},{
  status:'Failed'
},{
  status:'Invalid details'
}]

cronLogsForm: any = FormGroup;


  constructor(private httpService:HttpService,private datePipe:DatePipe,
    private excelExportService: ExcelExportService,private frmbuilder:FormBuilder,){
      this.cronLogsForm = frmbuilder.group({
        cron_date_range: [''],
        cron_region: [''],
        cron_operator: [''],
        cron_master_aggregator: [''],
        cron_status: ['']
      });

      
    }

    
  // convenience getter for easy access to form fields
  get f() { return this.cronLogsForm.controls; }

  ngOnInit(){
    this.maxDate = new Date()
    this.cron_filters()
  }


  convertDateFormat(rawDate:any) {
    let curr_dt = new Date(rawDate)
    let convertedDate = curr_dt.getFullYear() + "-" + String(curr_dt.getMonth() + 1).padStart(2, '0') + "-" + String(curr_dt.getDate()).padStart(2, '0');
    return convertedDate;
  }

  onSubmit(){
    let region = this.f['cron_region'].value
    this.filter.region = region?region:null;
    let operator = this.f['cron_operator'].value
    this.filter.operator = operator?operator.operator:null;
    let status = this.f['cron_status'].value
    this.filter.status = status?status:null;
    let masterAggregator = this.f['cron_master_aggregator'].value
    this.filter.ma = masterAggregator?masterAggregator:null;

    if(this.f['cron_date_range'].value){
      this.filter.cron_start_date = this.convertDateFormat(this.f['cron_date_range'].value[0])
      this.filter.cron_end_date = this.convertDateFormat(this.f['cron_date_range'].value[1])
    }
    this.filter.type = this.selected_type

    this.nextPage(this.lazyLoadEvent);
  }

    getTelcoms(){
    this.httpService.get(`${this.CMS_API}reports/revenue-data`).subscribe({
      next:res=>{
        if(!res.error){
          this.telecom_operators = res.data.telecoms
        }
      }
    })
  }

  cron_filters() {
    this.httpService.get(`${this.CMS_API}logs/cronLog/cron_filters`).subscribe({
      next: (res: any) => {
        if (!res.error && res.data) {
          this.prepareFilters(res.data);
        }
      },
      error: err => console.log(err)
    });
  }

  prepareFilters(data: any[]) {
    this.regionOperatorMA = {};
    this.regions = [];

    data.forEach(regionItem => {
      const region = regionItem.region;
      const operators = regionItem.operators || [];

      // Save region → operators mapping
      this.regionOperatorMA[region] = operators;

      // Prepare regions dropdown
      this.regions.push({ label: region, value: region });
    });

  }

  onRegionChange(event: any) {
    const region = event.value;
    this.telecom_operators = [];
    this.telecom_master_aggregator = [];

    const operators = this.regionOperatorMA[region] || [];

    if (operators.length > 0) {
      this.telecom_operators = operators.map((op: { operator: string, ma: string[] }) => ({
        tel_name: `${op.operator}`, // combined label
        value: { operator: op.operator, region, ma: op.ma || [] }
      }));

    }
  }
  onOperatorChange(event: any) {
    const { operator, region, ma } = event.value;

    // Populate Master Aggregator dropdown correctly
    this.telecom_master_aggregator = (ma || []).map((m: string) => ({
      label: m,
      value: m
    }));

    this.showMasterAggregator = ma && ma.length > 0;

    
  }
  ontypeSelect(event: any,){
    this.filter.type = this.selected_type
    this.cronLogsForm.reset()
    Object.keys(this.filter).forEach((i) => {
      if(i!='type')this.filter[i] = null
    });
    this.nextPage(this.lazyLoadEvent);
  }

  
  nextPage(event: any){
    this.lazyLoadEvent = event
    let limit = event.rows || 10;
    let page = event.first? (event.first / limit) + 1 : 1;

    let queryParmas = Object.entries(this.filter).reduce((a:any,[k,v]) => (v == null ? a : (a[k]=v, a)), {});
    queryParmas = {...queryParmas, limit, page};
    let params = new URLSearchParams(queryParmas);
    
    this.httpService.get(`${this.CMS_API}logs/cronLog/list?${params}`).subscribe({
      next:res=>{
        if(!res.error){
          this.cron_logs = res.data.cronLogs
          this.totalTableRecords = res.data.pagination.total_records;
          this.cronlogs_type = res.data.cron_type
        }

      },
      error:error=>{
        console.log(error)
      }
    })
  }
  

  exportToExcel(): void {
    let queryParmas = Object.entries(this.filter).reduce((a:any,[k,v]) => (v == null ? a : (a[k]=v, a)), {});
    queryParmas = {...queryParmas};
    let params = new URLSearchParams(queryParmas);
    this.excelExportService.exportToExcel(`${this.CMS_API}logs/cronLog/export_cron_logs?${params}`).subscribe((excelData) => {
      const blob = new Blob([excelData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      let date = this.datePipe.transform(new Date(), "yyyy-MM-dd")
      a.download = `cron-logs-report-${this.selected_type}-${date}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    });

  }
  getStatusText(cronLogs:any): string {
    if(!cronLogs.end_time && cronLogs.is_processed === false){
      return "In Progress"
    }
    if((cronLogs.end_time) && (cronLogs.cron_status === 'Failed' || cronLogs.is_processed === false)){
      return "Failed"
    }
    if((cronLogs.end_time) && (cronLogs.cron_status === 'Success' && cronLogs.is_processed === true)){
      return "Success"
    }
    return "Invalid Details";
  }
}

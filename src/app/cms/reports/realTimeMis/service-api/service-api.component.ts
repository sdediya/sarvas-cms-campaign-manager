import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { CrudService } from 'src/app/services/common/crud.service';
import { ExcelExportService } from 'src/app/services/excelExport/excel-export.service';
import { HttpService } from 'src/app/services/http/http.service';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-service-api',
    templateUrl: './service-api.component.html',
    styleUrls: ['./service-api.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class ServiceApiComponent {
  read:boolean = false
	write:boolean = false
	delete:boolean = false

  CMS_API = environment.CMS_API;

  revenueReportForm: any = FormGroup;
  submitted : boolean = false;
  isValidForm : boolean = false;

  maxDate:any;

  telcoms = []
  
  plans: any = []
  masterAggregator = []
  services = []
  masterService = [];
  masterPlan = [];

  reports: any = [];
  footerData: any = {};
  cols: any =[];
  data: any;
  campaignData: any;
  telecom_operators: any;
  advertising_platforms: any;
  revenue_date_range:any
  emptyDataFlag: any = false;
  campaignDataAll:any = []

  constructor(
    private frmbuilder:FormBuilder, 
    private httpService:HttpService,
    private messageService: MessageService,
    private excelExportService: ExcelExportService,
    private crudService:CrudService,
    private router:Router
  ){

    let permissions = this.crudService.hasPermission('reports')
    this.read = permissions.read
    this.write = permissions.write
    this.delete = permissions.delete
    if(!this.read){
      this.router.navigate(['no-access'])
    }

    this.revenueReportForm = frmbuilder.group({
      revenue_date_range: ['', [Validators.required]],
      tel_id: ['', [Validators.required]],
      campaign_id: [''],
      platform_id:[''],
      master_aggregator: [''],
      service_id: [''],
      plan_id: ['']
      // revenue_telcom_region: ['',[Validators.required]]
    });
  }

  ngOnInit(): void {
    this.maxDate = new Date();
    const sevenDaysAgo: Date = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) 
    let data = {
      start_date: new Date().toJSON().slice(0,10),
      end_date: new Date().toJSON().slice(0,10)
    }
    this.f['revenue_date_range'].value = [new Date(), new Date()]
    // this.getData(data);
    this.getMisData();
    this.f['tel_id'].valueChanges.subscribe((value:any)=> {
      if(value) {
        this.campaignData = this.campaignDataAll.filter((e:any) => e.telecom_id  ==  this.f['tel_id'].value.tel_id);
        let telData:any = this.telecom_operators.find((e:any)=> e.tel_id == this.f['tel_id'].value.tel_id);
        
        this.masterService = telData.services;
        this.masterAggregator = telData.master_aggregator
        this.masterPlan = telData.plans;
      }
      this.f['master_aggregator'].reset();
      this.f['service_id'].reset();
      this.f['plan_id'].reset();
    });
    this.f['master_aggregator'].valueChanges.subscribe((value:any)=>{
      if(value) {
        this.services = this.masterService.filter((e:any)=> e.maggregator_id == value)
      }
      this.f['service_id'].reset();
      this.f['plan_id'].reset();    
    });
    this.f['service_id'].valueChanges.subscribe((value:any)=>{
      if(value) {
        this.getPlan();
      }
      this.f['plan_id'].reset();
    });

  }

  // convenience getter for easy access to form fields
  get f() { return this.revenueReportForm.controls; }

  // Convert date to format YYYY-MM-DD
  convertDateFormat(rawDate:any) {
    let curr_dt = new Date(rawDate)
    let convertedDate = curr_dt.getFullYear() + "-" + String(curr_dt.getMonth() + 1).padStart(2, '0') + "-" + String(curr_dt.getDate()).padStart(2, '0');
    return convertedDate;
  }

 
  onSubmit(){
    this.submitted = true;
    if(this.revenueReportForm.status!=='INVALID'){
      this.isValidForm = true;
      let start_date = this.convertDateFormat(this.f['revenue_date_range'].value[0])
      let end_date = this.convertDateFormat(this.f['revenue_date_range'].value[1])
      let telcom = this.f['tel_id'].value
      let campaign_id = this.f['campaign_id'].value
      let platform_id = this.f['platform_id'].value
      this.data = {
        tel_id : telcom.tel_id,
        campaign_id :campaign_id?campaign_id:null,
        platform_id:platform_id?platform_id:null,
        start_date:start_date,
        end_date:end_date,
        master_aggregator:this.f['master_aggregator'].value?this.f['master_aggregator'].value:null,
        service_id:this.f['service_id'].value?this.f['service_id'].value:null,
        plan_id:this.f['plan_id'].value?this.f['plan_id'].value:null,
      }
      delete this.data.revenue_date_range
      this.getData(this.data);
    }
    return false;
  }

  getData(data:any) {
    this.httpService.post(`${this.CMS_API}reports/mis/service_api`, data).subscribe({
      next:res=>{
        if(!res.error){
          this.cols = res.data.headers;
          this.reports = res.data.rows
          this.footerData = res.data.footer;
          this.emptyDataFlag = res.data.rows.length === 0
        }
        else{
          this.messageService.add({ severity: 'error', summary: 'Failed', detail: res.message });
        }
      },
      error:err=>{
        console.log(err)
      }
    });
  }

  downloadExcel() {
    if(this.revenueReportForm.status!=='INVALID'){
      this.isValidForm = true;
      let start_date = this.convertDateFormat(this.f['revenue_date_range'].value[0])
      let end_date = this.convertDateFormat(this.f['revenue_date_range'].value[1])

      let telcom = this.f['tel_id'].value
      
      let campaign_id = this.f['campaign_id'].value
      let platform_id = this.f['platform_id'].value
      this.data = {
        tel_id : telcom.tel_id,
        campaign_id :campaign_id?campaign_id:null,
        platform_id:platform_id?platform_id:null,
        start_date:start_date,
        end_date:end_date,
        master_aggregator:this.f['master_aggregator'].value?this.f['master_aggregator'].value:null,
        service_id:this.f['service_id'].value?this.f['service_id'].value:null,
        plan_id:this.f['plan_id'].value?this.f['plan_id'].value:null,
        download_excel:true
      }
      
      this.excelExportService.exportToExcelPost(`${this.CMS_API}reports/mis/service_api`, this.data).subscribe((excelData) =>{
        const blob = new Blob([excelData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mis-service-reports-${telcom.shortcode}-${start_date}-${end_date}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      });
    }
  }

  getMisData(){
    this.httpService.get(`${this.CMS_API}reports/mis/mis-data`).subscribe({
      next:res=>{
        if(!res.error){
          this.campaignDataAll = res.data.campaigns
          res.data.telecoms.map((tel:any)=>{
            tel.name = `${tel.tel_name}`
            tel.tel_id = `${tel.tel_id}`
            return tel
          })
          this.telecom_operators = res.data.telecoms
          this.advertising_platforms = res.data.ad_platforms
        }
      },
      error:err=>{
        console.log(err)
      }
    })
  }
  
  clearFilters(){
    this.getMisData()
    this.revenueReportForm.reset()
    this.data={}
    this.submitted =false
    this.reports = []
    this.campaignData = []
    this.emptyDataFlag = false
  }
  getPlan(){
    this.plans = [
      {name: 'Daily', code: '1'},
      {name: 'Weekly', code: '7'},
      {name: 'Monthly', code: '30'} 
    ]
  }
}

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { MessageService } from '@openng/optimus-ui/api';
import { HttpService } from 'src/app/services/http/http.service';
import { ExcelExportService } from 'src/app/services/excelExport/excel-export.service';
import { CrudService } from 'src/app/services/common/crud.service';
import { Router } from '@angular/router';
import { debounceTime, finalize } from 'rxjs';

@Component({
    selector: 'app-ageing-summary-v2',
    templateUrl: './ageing-summary-v2.component.html',
    styleUrls: ['./ageing-summary-v2.component.css'],
    standalone: false
})

export class AgeingSummaryV2Component implements OnInit{

  read:boolean = false
	write:boolean = false
	delete:boolean = false

  CMS_API = environment.CMS_API;

  ageingSummaryReportForm: any = FormGroup;
  submitted : boolean = false;
  isValidForm : boolean = false;

  maxDate:any;

  reports: any = [];
  footerData: any = [];
  cols: any =[];
  loadingbody: boolean  = false;
  // filter: any = {'telcom_id': null, 'platform_id':null}
  telcoms:any
  data: any;
  advertising_platforms:any
  service: any = [
    {name: 'SME', code: 'sme'},
    {name: 'Legacy', code: 'legacy'}
  ]

  masterService:any = []
  services:any = []
  masterAggregator:any = []
  products:any = []

  processing:any = false

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

    this.ageingSummaryReportForm = frmbuilder.group({
      date: ['', [Validators.required]],
      tel_id: ['',[Validators.required]],
      partner_id: ['',[Validators.required]],
      service: ['',[Validators.required]],
      service_id: [''],
      platform_id: ['']
    });
  }

  ngOnInit(): void {
    this.maxDate = new Date()
    this.getTelcoms()
    
    this.f['tel_id'].valueChanges.pipe(debounceTime(500)).subscribe((value:any)=>{
      let telData:any = this.telcoms.find((e:any)=> e.tel_id == value);
      this.services = this.masterService = telData.services;
      this.masterAggregator = telData.master_aggregator
      this.products = this.service.filter((e:any)=> telData.product.includes(e.name));
      
      this.f['partner_id'].reset();
      this.f['service'].reset();
      this.f['service_id'].reset();
      
      this.submitted =false
      this.cols = []
      this.reports = []
      this.footerData = []
    });
    
    this.f['partner_id'].valueChanges.pipe(debounceTime(500)).subscribe((value:any)=>{
      let masterAggregator:any = this.masterAggregator.find((e:any)=> e.maggregator_id == value);
      this.services = this.masterService.filter((e:any)=> e.maggregator_id == value)
      this.products = this.service.filter((e:any)=> masterAggregator.service_type.includes(e.name));
      
      this.f['service'].reset();
      this.f['service_id'].reset();
      
      this.submitted =false
      this.cols = []
      this.reports = []
      this.footerData = []
    });
    
    this.f['service'].valueChanges.pipe(debounceTime(500)).subscribe((value:any)=>{
      let masterAggregatorID = this.f['partner_id'].value
      this.services = this.masterService.filter((e:any)=> e.service_type.toLowerCase() == value && e.maggregator_id == masterAggregatorID)
      
      this.f['service_id'].reset();
      this.submitted =false
      this.cols = []
      this.reports = []
      this.footerData = []
    });
  }

  getTelcoms(){
    this.processing = true
    this.httpService.get(`${this.CMS_API}reports/revenue-data`).subscribe({
      next:res=>{
        this.processing = false;
        if(!res.error){
          this.telcoms = res.data.telecoms
        }
      }
    })
  }

  // convenience getter for easy access to form fields
  get f() { return this.ageingSummaryReportForm.controls; }

  // Convert date to format YYYY-MM-DD
  convertDateFormat(rawDate:any) {
    let curr_dt = new Date(rawDate)
    let convertedDate = curr_dt.getFullYear() + "-" + String(curr_dt.getMonth() + 1).padStart(2, '0') + "-" + String(curr_dt.getDate()).padStart(2, '0');
    return convertedDate;
  }


  onSubmit(){
    this.submitted = true;
    if(this.ageingSummaryReportForm.status!=='INVALID'){
      this.getSummary()

    }else {
      console.log(this.ageingSummaryReportForm);
      // this.messageService.add({ severity: 'error', summary: 'Failed', detail: this.ageingSummaryReportForm.error });
    }
    return false;
  }

  getSummary(){
    
    this.data = {
      start_date: this.convertDateFormat(this.f['date'].value[0]),
      end_date: this.convertDateFormat(this.f['date'].value[1]),
      service: this.f['service'].value,
      tel_id:this.f['tel_id'].value,
      partner_id:this.f['partner_id'].value,
      platform_id:this.f['platform_id'].value,
      service_id:this.f['service_id'].value,
      export: false
    }
    
    this.httpService.post(`${this.CMS_API}reports/ageing/summary-v2`, this.data)
    .subscribe({
      next:res=>{
        if(!res.error){
          this.isValidForm = true;
          this.cols = res.data.headers;
          this.footerData = res.data.footer;
          this.reports = res.data.rows;
        }
        else{
          this.isValidForm = false;
          this.messageService.add({ severity: 'error', summary: 'Failed', detail: res.message });
        }
      },
      error:err=>{
        console.log(err)
        this.footerData = [];
        this.reports = [];
        this.messageService.add({ severity: 'error', summary: 'Failed', detail: 'Something went wrong! Please try again' });
      }
    });
  }

  downloadExcel() {
    if(this.ageingSummaryReportForm.status!=='INVALID'){
      this.isValidForm = true;
      this.data = {
        start_date: this.convertDateFormat(this.f['date'].value[0]),
        end_date: this.convertDateFormat(this.f['date'].value[1]),
        service: this.f['service'].value,
        tel_id:this.f['tel_id'].value,
        partner_id:this.f['partner_id'].value,
        platform_id:this.f['platform_id'].value,
        service_id:this.f['service_id'].value,
        export: true
      }
      

      let operator_name: any = this.telcoms.filter((v: any) => v.tel_id == this.f['tel_id'].value)[0];
      let partner :any = this.masterAggregator.filter((v:any) => v.maggregator_id == this.f['partner_id'].value)[0];
      
      this.excelExportService.exportToExcelPost(`${this.CMS_API}reports/ageing/summary`, this.data)
      .subscribe((excelData) =>{
        const blob = new Blob([excelData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${operator_name.tel_name}-${partner.maggregator_name}-${this.data.service}-ageing-summary-reports-${this.data.start_date}_${this.data.end_date}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      });
    }
  }
}

import { DatePipe } from '@angular/common';
import { Component, OnInit,ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { CrudService } from 'src/app/services/common/crud.service';
import { ExcelExportService } from 'src/app/services/excelExport/excel-export.service';
import { HttpService } from 'src/app/services/http/http.service';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-google-cost',
    templateUrl: './google-cost.component.html',
    styleUrls: ['./google-cost.component.css'],
    standalone: false
})
export class GoogleCostComponent implements OnInit{
  
  read:boolean = false
	write:boolean = false
	delete:boolean = false
  CMS_API = environment.CMS_API;
  googleCampaignCostForm: any = FormGroup;
  manualProcessForm: any = FormGroup;
  submitted : boolean = false;
  adaEditsubmitted : boolean = false;
  isValidForm : boolean = false;
  isEdit: boolean = false;
  maxDate:any;
  minDate:any;
  manualProcessDate:any;
  manualProcessData: any
  telcoms = []
  partners = []
  campaigns = []
  services = []
  plans = []
  filteredPlans = []
  googleCampaignCost = []
  loading: boolean = false;
  visible: boolean = false;
  visibleUpload: boolean = false;
  gCampaignCostBufferForm: any = FormGroup;
  exist: string = '';
  manualProcess:boolean = false
  gCampaignCostUploadForm: any = FormGroup;
  Costsubmitted : boolean = false;
  selectedCostFile: any = null;
  BACKEND_DOMAIN = environment.BACKEND_DOMAIN;
  @ViewChild('themeFileInput', { static: false }) themeFileInput!: ElementRef;
  isLoading: boolean = false;
  isCronScheduled: boolean = false
  
  lazyLoadEvent:any 
  filter:any

  visibleProcessManually:boolean = false
  
  constructor(
    private frmbuilder:FormBuilder, 
    private httpService:HttpService,
    private crudService:CrudService,
    private excelExportService: ExcelExportService,
    private messageService: MessageService,
    private datePipe: DatePipe
  ){
    let permissions = this.crudService.hasPermission('masters')
    this.read = permissions.read
    this.write = permissions.write
    this.delete = permissions.delete
    this.googleCampaignCostForm = frmbuilder.group({
      google_camapign_cost_date_range: ['', [Validators.required]],
      tel_id: ['',[Validators.required]],
      partner_id: [''],
      service_id: [[]],
      plan_id: [[]],
      campaign_id: ['']
    });
    this.gCampaignCostBufferForm = frmbuilder.group({
      id: ['', [Validators.required]],
      cost: ['', [Validators.required]]
    });
    this.manualProcessForm = frmbuilder.group({
      date: ['', [Validators.required]],
    });
  }
  
  
  ngOnInit(): void {
    this.maxDate = new Date(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString())
    this.minDate = new Date(new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString())
    this.manualProcessDate = new Date(new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()) //only 15 days back day processing
    

    
    this.getTelcoms()
    this.f['tel_id'].valueChanges.subscribe((value:any)=> {
      this.filteredPlans= this.plans.filter((e:any)=> e.plan_telcom_id == value);
    })
  }
  
  // convenience getter for easy access to form fields
  get f() { return this.googleCampaignCostForm.controls; }
  
  // convenience getter for easy access to form fields
  get cbf() { return this.gCampaignCostBufferForm.controls; }

  // convenience getter for easy access to form fields
  get mpf() { return this.manualProcessForm.controls; }
  
  getTelcoms(){
    this.httpService.get(`${this.CMS_API}google-campaing-cost-data/v2/data`).subscribe({
      next:(res: any)=>{      
        if(!res.error){
          this.telcoms = res.data.telecoms.map((e:any)=> {
            e.tel_name = `${e.tel_name} (${e.region_name})`
            return e;
          })
          this.partners = res.data.partners
          this.campaigns = res.data.campaigns
          this.services = res.data.services
          this.plans = res.data.plans
          this.isCronScheduled = res.data.isCronScheduled
        }
      }
    })
  }
  
  convertDateFormat(rawDate:any) {
    let curr_dt = new Date(rawDate)
    let convertedDate = curr_dt.getFullYear() + "-" + String(curr_dt.getMonth() + 1).padStart(2, '0') + "-" + String(curr_dt.getDate()).padStart(2, '0');
    return convertedDate;
  }
  
  onSubmit(){
    this.submitted = true;
    this.loading = true;
    if(this.googleCampaignCostForm.status!=='INVALID'){
      this.isValidForm = true;
      let start_date = this.convertDateFormat(this.f['google_camapign_cost_date_range'].value[0])
      let end_date = this.convertDateFormat(this.f['google_camapign_cost_date_range'].value[1])
      let data = {
        ...this.googleCampaignCostForm.value,
        start_date,
        end_date
      }
      delete data.google_camapign_cost_date_range

      this.filter = data;
      this.nextPage(this.lazyLoadEvent);
    }
    this.loading = false;
    return false;
  }
  
  exportToExcel(){
    if(this.googleCampaignCostForm.status!=='INVALID'){
      this.isValidForm = true;
      let start_date = this.convertDateFormat(this.f['google_camapign_cost_date_range'].value[0])
      let end_date = this.convertDateFormat(this.f['google_camapign_cost_date_range'].value[1])
      let data = {
        ...this.googleCampaignCostForm.value,
        isExport:1,
        start_date,
        end_date
      }
      console.log(data)
      delete data.google_camapign_cost_date_range

      this.excelExportService.exportToExcelPost(`${this.CMS_API}google-campaing-cost-data/v2/list`, {...this.filter, isExport:1}).subscribe(
        (excelData)=>
        {
          const blob = new Blob([excelData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          let date = this.datePipe.transform(new Date(), "yyyy-MM-dd")
          let telcom:any = this.telcoms.find((e:any)=> e.tel_id == this.f['tel_id'].value);
      
          a.download = `google-camapign-cost-${telcom.tel_name}-${date}.xlsx`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
        }
      )
    }

  }
  
  onGCampaignCostBufferSubmit(){
    this.adaEditsubmitted = true    
    this.exist = '';
    if(this.gCampaignCostBufferForm.status!=='INVALID'){
      let data = {
        ...this.gCampaignCostBufferForm.value,
      };
      this.httpService.post(`${this.CMS_API}google-campaing-cost-data/v2/edit`, data).subscribe({
        next:res=>{
          this.visible = false;
          this.isEdit = false;
          this.onSubmit()
          this.gCampaignCostBufferForm.reset()
        },
        error: e=> {
          this.exist = e.error.message;
          this.messageService.add({ severity: 'error', summary: 'Failed', detail: e.error.message });
          console.log(e);
        }
      })
    }
    this.adaEditsubmitted = false
    return false;
  }
  
  showDialog(currlog_data:any = '') {
    this.visible = true
    if(currlog_data!==''){
      this.isEdit = true
      this.gCampaignCostBufferForm.patchValue({
        id: currlog_data.id,
        cost: currlog_data.amount,
      })
    }
  }

  showuploadDialog(currlog_data:any = '') {
    this.visibleProcessManually = true
  }
  
  checkEntryExist(){   
    this.exist = '';
  }

  nextPage(event: any){

    this.lazyLoadEvent = event
    let limit = event?.rows || 10;
    let page = event?.first? (event.first / limit) + 1 : 1;

    let s = event?.globalFilter || null
    
    this.filter.s = s
    this.filter.limit = limit
    this.filter.page = page


    this.httpService.post(`${this.CMS_API}google-campaing-cost-data/v2/list`, this.filter).subscribe({
        next:res=>{
          this.loading = false;
          if(!res.error){
            this.googleCampaignCost = res.data
          }else{
           this.googleCampaignCost = [];
           this.messageService.add({ severity: 'error', summary: 'Failed', detail: res.message });
          }
        },
        error:err=>{
          this.googleCampaignCost = [];
          this.messageService.add({ severity: 'error', summary: 'Failed', detail: err.error.message });
           //console.log(err)
         }
      })

    console.log(event);
  }
  
  onGlobalFilter(table: any, event: any) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }
  
  reset(){
    this.isEdit = false; 
    this.exist = '';
    this.gCampaignCostBufferForm.reset()
    this.manualProcessForm.reset();
    this.manualProcessData = undefined;
    // Reset form
    this.gCampaignCostUploadForm.reset();

    // Manually reset file input
    if (this.themeFileInput) {
      this.themeFileInput.nativeElement.value = '';
      this.selectedCostFile=false;
    }

  }


  processSheetManually () {

    if(this.manualProcessForm.status!=='INVALID'){
      this.manualProcess = true;
      this.manualProcessData = undefined;
      let date = this.convertDateFormat(this.mpf['date'].value);
      this.httpService.post(`${this.CMS_API}google-campaing-cost-data/v2/processSheetManually`, {date}).subscribe({
        next:res=>{
          this.messageService.add({ severity: 'success', summary: 'Success', detail: res.message });
          this.manualProcess = false
          this.manualProcessData = res.data.report
        },
        error: e=> {
          this.exist = e.error.message;
          this.messageService.add({ severity: 'error', summary: 'Failed', detail: e.error.message });
          console.log(e);
          this.manualProcessData = e.error.data
          this.manualProcess = false
        }
      })  
    }
    
  }
  

}

import { DatePipe } from '@angular/common';
import { Component, OnInit,ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from '@openng/optimus-ui/api';
import { Table } from '@openng/optimus-ui/table';
import { CrudService } from 'src/app/services/common/crud.service';
import { ExcelExportService } from 'src/app/services/excelExport/excel-export.service';
import { HttpService } from 'src/app/services/http/http.service';
import { environment } from 'src/environments/environment';
import moment from 'moment';
@Component({
    selector: 'app-google-campaign-cost',
    templateUrl: './google-campaign-cost.component.html',
    styleUrls: ['./google-campaign-cost.component.css'],
    standalone: false
})
export class GoogleCampaignCostComponent implements OnInit{
  
  read:boolean = false
	write:boolean = false
	delete:boolean = false
  CMS_API = environment.CMS_API;
  googleCampaignCostForm: any = FormGroup;
  submitted : boolean = false;
  adaEditsubmitted : boolean = false;
  isValidForm : boolean = false;
  isEdit: boolean = false;
  maxDate:any;
  minDate:any;
  telcoms = []
  googleCampaignCost = []
  loading: boolean = false;
  visible: boolean = false;
  visibleUpload: boolean = false;
  gCampaignCostBufferForm: any = FormGroup;
  exist: string = '';
  gCampaignCostUploadForm: any = FormGroup;
  Costsubmitted : boolean = false;
  selectedCostFile: any = null;
  BACKEND_DOMAIN = environment.BACKEND_DOMAIN;
  @ViewChild('themeFileInput', { static: false }) themeFileInput!: ElementRef;
  isLoading: boolean = false;
  
  
  constructor(
    private frmbuilder:FormBuilder, 
    private httpService:HttpService,
    private crudService:CrudService,
    private excelExportService: ExcelExportService,
    private messageService: MessageService,
    private datePipe: DatePipe
  ){
    let permissions = this.crudService.hasPermission('operators')
    this.read = permissions.read
    this.write = permissions.write
    this.delete = permissions.delete
    this.googleCampaignCostForm = frmbuilder.group({
      google_camapign_cost_date_range: ['', [Validators.required]],
      google_camapign_cost_telcom: ['',[Validators.required]]
    });
    this.gCampaignCostBufferForm = frmbuilder.group({
      g_cost_id: ['', [Validators.required]],
      telcom: ['', [Validators.required]],
      date: ['', [Validators.required]],
      cost: ['', [Validators.required]]
    });
    this.gCampaignCostUploadForm = frmbuilder.group({
      telcom: ['', [Validators.required]],
    });
  }
  
  
  ngOnInit(): void {
    this.maxDate = new Date()
    this.minDate = new Date(2022, 12, 1)
    this.getTelcoms()
  }
  
  // convenience getter for easy access to form fields
  get f() { return this.googleCampaignCostForm.controls; }
  
  // convenience getter for easy access to form fields
  get cbf() { return this.gCampaignCostBufferForm.controls; }

  // convenience getter for easy access to form fields
  get cgcu() { return this.gCampaignCostUploadForm.controls; }
  
  getTelcoms(){
    this.httpService.get(`${this.CMS_API}telcom/list?limit=ALL&s=null&status=1`).subscribe({
      next:(res: any)=>{      
        if(!res.error){
          res.data.list.map((tel:any)=>{
            tel.name = `${tel.name} (${tel.region_name})`
            return tel
          })
          this.telcoms = res.data.list
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
      console.log(data)
      delete data.google_camapign_cost_date_range
      this.httpService.post(`${this.CMS_API}google-campaing-cost-data/getList`, data).subscribe({
        next:res=>{
          this.loading = false;
          if(!res.error){
            this.googleCampaignCost = res.data.rows
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
    }
    this.loading = false;
    return false;
  }
  
  exportToExcel(){
    let start_date = this.convertDateFormat(this.f['google_camapign_cost_date_range'].value[0])
    let end_date = this.convertDateFormat(this.f['google_camapign_cost_date_range'].value[1])
    let data = {
      ...this.googleCampaignCostForm.value,
      start_date,
      end_date
    }
    delete data.google_camapign_cost_date_range
    let queryParmas = Object.entries(data).reduce((a:any,[k,v]) => (v == null ? a : (a[k]=v, a)), {});   
    queryParmas = {...queryParmas};
    let params = new URLSearchParams(queryParmas);
    this.excelExportService.exportToExcel(`${this.CMS_API}google-campaing-cost-data/export_googlecampaigncost?${params}`).subscribe((excelData) => {
      const blob = new Blob([excelData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      let date = this.datePipe.transform(new Date(), "yyyy-MM-dd")
      console.log()
      let telcom:any = this.telcoms.find((e:any)=> e.id == this.f['google_camapign_cost_telcom'].value);

      a.download = `google-camapign-cost-records-${telcom.name}-${date}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    });

  }
  
  onGCampaignCostBufferSubmit(){
    this.adaEditsubmitted = true    
    this.exist = '';
    if(this.gCampaignCostBufferForm.status!=='INVALID'){
      let data = {
        ...this.gCampaignCostBufferForm.value,
        date: this.convertDateFormat(this.gCampaignCostBufferForm.value.date) 
      };
      if(!this.isEdit){
        this.httpService.post(`${this.CMS_API}google-campaing-cost-data/add`, data).subscribe({
          next:res=>{
            this.visible = false;
            this.isEdit = false;
            if(this.googleCampaignCostForm.valid){
              this.onSubmit()
            }
            this.gCampaignCostBufferForm.reset()
          },
          error: e=> {
            this.exist = e.error.message;
            this.messageService.add({ severity: 'error', summary: 'Failed', detail: e.error.message });
            console.log(e);
          }
        })
      }else{
        this.httpService.post(`${this.CMS_API}google-campaing-cost-data/edit`, data).subscribe({
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
    }
    this.adaEditsubmitted = false
    return false;
  }
  
  showDialog(currlog_data:any = '') {
    this.visible = true
    if(currlog_data!==''){
      this.isEdit = true
      this.gCampaignCostBufferForm.patchValue({
        g_cost_id: currlog_data.g_cost_id,
        telcom: currlog_data.tel_id,
        date: currlog_data.date,
        cost: currlog_data.cost,
      })
    }else{
      this.gCampaignCostBufferForm.patchValue({
        g_cost_id: 'add entry',
        telcom: '',
        date: '',
        cost: '',
      })
    }
  }

  showuploadDialog(currlog_data:any = '') {
    this.visibleUpload = true
  }
  
  checkEntryExist(){   
    this.exist = '';
  }
  
  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }
  
  reset(){
    this.isEdit = false; 
    this.exist = '';
    this.gCampaignCostBufferForm.reset()
    // Reset form
    this.gCampaignCostUploadForm.reset();

    // Manually reset file input
    if (this.themeFileInput) {
      this.themeFileInput.nativeElement.value = '';
      this.selectedCostFile=false;
    }

  }

  onGCampaignCostUploadFormSubmit(){
    this.Costsubmitted = true
    if(this.gCampaignCostUploadForm.status!=='INVALID' && this.selectedCostFile){
      this.isLoading= true
    // sif(this.selectedCostFile){
      const formData = new FormData();
      formData.append('file', this.selectedCostFile);
      // Get telcom field value from form
      const telcom = this.gCampaignCostUploadForm.get('telcom')?.value;
      formData.append('telcom', telcom);
      this.httpService.post(`${this.CMS_API}google-campaing-cost-data/upload`, formData).subscribe({
        next:res=>{
          this.isLoading= false
          this.visibleUpload = false;
          this.reset()
          this.messageService.add({ severity: 'success', summary: 'Success', detail: res.message });
        },
        error: e=> {
          this.reset()
          this.isLoading= false
          this.messageService.add({ severity: 'error', summary: 'Failed', detail: e.error.message });
        }
      })
    }
    return false;
  }

  onFileChange(event: any) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.selectedCostFile = file;
    }
  }
  

}

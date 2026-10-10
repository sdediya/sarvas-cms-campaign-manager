import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Table } from 'primeng/table';
import { ConfirmationService, MessageService } from 'primeng/api';
import { environment } from 'src/environments/environment';
import { HttpService } from 'src/app/services/http/http.service';
import { CrudService } from 'src/app/services/common/crud.service';
import { DatePipe } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ClipboardService } from 'ngx-clipboard';
import { Router } from '@angular/router';
import { ExcelExportService } from 'src/app/services/excelExport/excel-export.service';
import Utils from 'src/app/utils/utils';

@Component({
    selector: 'app-list-plan',
    templateUrl: './list-plan.component.html',
    styleUrls: ['./list-plan.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class ListPlanComponent implements OnInit{

  read:boolean = false
	write:boolean = false
	delete:boolean = false

  fallbackSidebarVisible: boolean = false

  loading: boolean = false;
  plans:any=[]
  fallbackList:any=[]
  CMS_API = environment.CMS_API
  BASE_URL = environment.LANDING_PAGE_URL
  checked2: boolean = true;
  totalRecords: number = 0;

  fallbackForm: any = FormGroup;
  submitted: boolean = false

  selectedPlan : any = {}
  // selectedPlan = {
  //   region_name:'',
  //   tel_name:'',
  //   plan_name:'',
  //   plan_code:'',
  //   plan_validity:'',
  //   plan_amount:''
  // }

  // For Filters
  planData : any = {};
  telcoms = [];
  regions = [];
  services = [];
  filter: any = {'region_id': null, 'telcom_id': null, 'service_id':null, 'validity':null, 'status':null}
  lazyLoadEvent:any;
  filterString: any;
  plan_validity: any = [{
    name:'Daily', value:1
  },{
    name:'Weekly', value:7
  },{
    name:'Monthly', value:30
  }
]

plan_status: any = [{
  name:'Active', value:1
},{
  name:'Inactive', value:0
}]
  telcom_id: any;

  constructor(
    private httpService:HttpService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private crudService:CrudService,
    private datePipe: DatePipe,
    private frmbuilder:FormBuilder,
    private clipboardService: ClipboardService,
    private router:Router,
    private excelExportService: ExcelExportService
  ){

    let permissions = this.crudService.hasPermission('operator_plans')
    this.read = permissions.read
    this.write = permissions.write
    this.delete = permissions.delete
    if(!this.read){
      this.router.navigate(['no-access'])
    }


    this.fallbackForm = frmbuilder.group({
      fallback_plans : this.frmbuilder.array([])
    })
    // this.getPlanbyId('a5ab4fdd-ded2-429c-a64f-5c5d0ec607d7');
  }

  ngOnInit(){
    this.getPlanData()
  }

  // convenience getter for easy access to form fields
  get fadd() { return this.fallbackForm.controls; }

  get fallback_plans() : FormArray {
    return this.fallbackForm.get("fallback_plans") as FormArray
  }

  newFallback(): FormGroup {
    return this.frmbuilder.group({
      fbplan_amount: ['', [Validators.required]],
      fbplan_validity: ['', [Validators.required, Validators.pattern("^[0-9]*$")]]
    })  
  }

  addFallback() {
    this.fallback_plans.push(this.newFallback());
  }
  removeFallback(i:number) {
    this.fallback_plans.removeAt(i);
  }

  getPlanData(){
    this.httpService.get(`${this.CMS_API}plan/plan-data`).subscribe({
      next:res=>{
        if(!res.error){
          this.planData = res.data
          res.data.telcoms.map((tel:any)=>{
            tel.tel_name = `${tel.tel_name} (${tel.tel_region_name})`
            tel.tel_id = `${tel.tel_id}|$|${tel.tel_region_id}`
            return tel
          })
          this.telcoms = res.data.telcoms
          this.regions = res.data.regions
          this.services = res.data.services     
        }
      },
      error:err=>{
        console.log(err)
      }
    })
  }
  

  getPlanbyId(id:string){
    this.fallbackSidebarVisible = true
    this.fallbackList = [];
    this.httpService.get(`${this.CMS_API}plan/getPlanById?plan_id=${id}`).subscribe({
      next:res=>{
        if(!res.error){
          this.selectedPlan = res.data 
          this.getFallbackList(id)
        }
      },
      error:err=>{
        console.log(err)
      }
    })
  }

  getFallbackList(id:any){
    this.httpService.get(`${this.CMS_API}fallback/getFallbackByPlan?plan_id=${id}`).subscribe({
      next:res=>{
        if(!res.error){
          this.fallbackList = res.data    
        }
      },
      error:err=>{
        console.log(err)
      }
    })
  }

  deleteFallback(id:any, fallbackIndex:any){
    this.confirmationService.confirm({
        key: 'confirmDeleteFallback',
        target: new EventTarget,
        message: 'Are you sure that you want to Delete Fallback?',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.httpService.post(`${this.CMS_API}fallback/delete`, {fallback_id:id}).subscribe({
            next:res=>{
              if(!res.error){
                this.messageService.add({ severity: 'success', summary: 'Success', detail: res.message });
                this.fallbackList.splice(fallbackIndex, 1)
              }
              else{
                this.messageService.add({ severity: 'error', summary: 'Failed', detail: res.message });
              }
            },
            error:err=>{
              this.messageService.add({ severity: 'error', summary: 'Failed', detail: err.error.message });
              console.log(err)
            }
          })
        },
        reject: () => {
            return false;
        }
    });
  }

  filterOnChange(ev:any, fieldName:string){
    if(fieldName == 'telcom_id' && this.telcom_id){
      var splitted = this.telcom_id.split("|$|");     
      this.filter.telcom_id = splitted[0],
      this.filter.region_id = splitted[1]
    } else if(this.telcom_id == null){
      this.filter.telcom_id = null
      this.filter.region_id = null
    }
    this.nextPage(this.lazyLoadEvent);
  }

  nextPage(event: any){
    this.lazyLoadEvent = event
    let limit = event.rows || 10;
    let page = event.first? (event.first / limit) + 1 : 1;
    let params = new URLSearchParams(this.filter);
    let s = event.globalFilter
    this.filterString = { s, ...this.filter}
    this.httpService.get(`${this.CMS_API}plan/list?page=${page}&limit=${limit}&s=${event.globalFilter}&${params}`).subscribe({
      next:res=>{
        if(!res.error){
          this.plans = res.data.list;
          this.totalRecords = res.data.pagination.total_records;
          this.plans.map((ele:any)=> {
            ele.checked = ele.status? true: false;
            return ele;
          })
        }
      },
      error:err=>{
        console.log(err);
      }
    })
  }

  clearFilters(){
    this.telcom_id = null
    Object.keys(this.filter).forEach((i) => this.filter[i] = null);
    this.nextPage(this.lazyLoadEvent);
  }

  togglePlan(planId:any, planSts:any, planIndex:any){
    let data = {
      plan_status:planSts==1?0:1,
      plan_id:planId
    }
    this.confirmationService.confirm({
      key: 'confirmActiveInactive',
      target: new EventTarget,
      message: 'Are you sure that you want to Change Plan Status?',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.httpService.post(`${this.CMS_API}plan/delete`, data).subscribe({
          next:res=>{
            if(!res.error){
              this.messageService.add({ severity: 'success', summary: 'Success', detail: res.message });
            }
            else{
              this.messageService.add({ severity: 'error', summary: 'Failed', detail: 'Something went wrong! Try again later...' });
            }
            this.plans.map((ele:any)=> {
              ele.status = data.plan_status;
              return ele;
            })
          },
          error:err=>console.log(err)
        })
      },
      reject: () => {
          this.plans[planIndex].checked = this.plans[planIndex].checked ? false:true
          return false;
      }
  });
    
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  async onSubmit(){
    this.submitted = true;
    const data = {
      fbplan_telcom_id:this.selectedPlan.plan_telcom_id,
      fbplan_plan_id:this.selectedPlan.plan_id,
      ...this.fallbackForm.value,
    };
    this.httpService.post(`${this.CMS_API}fallback/add`, data).subscribe({
      next:res=>{
        if(!res.error){
          this.messageService.add({ severity: 'success', summary: 'Success', detail: res.message });
          this.getFallbackList(this.selectedPlan.plan_id)
          // Reset Form Here
          if (this.fallback_plans.length > 0) {
            let fallback_plansFormArray = new FormArray([]);
            this.fallbackForm.removeControl('fallback_plans');
            this.fallbackForm.addControl('fallback_plans', fallback_plansFormArray);
          }
        }
        else{
          this.messageService.add({ severity: 'error', summary: 'Failed', detail: res.message });
        }
      },
      error:err=> {
        this.messageService.add({ severity: 'error', summary: 'Failed', detail: err.error.message });
      }
    })
  }

  copyToClipboard(plan:any) {
    const url = Utils.landingRefUrl(this.BASE_URL, plan, 'p', plan.id);
    if(!url){
      this.messageService.add({ severity: 'error', summary: 'Failed', detail: 'Region, operator or service shortcode is missing, or the plan id is invalid' });
      return;
    }

    let isCopied = this.clipboardService.copyFromContent(url)

    if(isCopied){
      this.messageService.add({ severity: 'success', summary: 'Success', detail: "Copied: Product Link!" });
    }

  }

  exportToExcel(): void {
    let limit = 'ALL'
    let queryParmas:any = {...this.filterString, limit};
    let params = new URLSearchParams(queryParmas);
    this.excelExportService.exportToExcel(`${this.CMS_API}plan/export-plan-records?${params}`).subscribe((excelData) => {
      const blob = new Blob([excelData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      let date = this.datePipe.transform(new Date(), "yyyy-MM-dd")
      a.download = `plan-records-${date}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    });

  }

}

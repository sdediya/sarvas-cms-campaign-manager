import { Component, OnInit } from '@angular/core';
import { Table } from 'primeng/table';
import { HttpService } from 'src/app/services/http/http.service';
import { environment } from 'src/environments/environment';
import { ConfirmationService, MessageService, SortEvent } from 'primeng/api';
import { CrudService } from 'src/app/services/common/crud.service';
import { ClipboardService } from 'ngx-clipboard';
import { Router,ActivatedRoute  } from '@angular/router';
import { ExcelExportService } from 'src/app/services/excelExport/excel-export.service';
import { DatePipe } from '@angular/common';
import { debounce, debounceTime } from 'rxjs';

@Component({
    selector: 'app-list-campaign',
    templateUrl: './list-campaign.component.html',
    styleUrls: ['./list-campaign.component.css'],
    standalone: false
})
export class ListCampaignComponent implements OnInit{

  read:boolean = false
  write:boolean = false
  delete:boolean = false

  loading: boolean = false;
  campaigns:any=[]
  CMS_API = environment.CMS_API
  BASE_URL = environment.LANDING_PAGE_URL
  // checked2: boolean = true;
  totalRecords: number = 0;
  
  // For Filters
  campaignData : any = {};
  telecom_operators = [];
  services = [];
  regions = [];
  advertising_platforms = [];
  campaign_types = [
    { name: 'Service', code:'service'},
    { name: 'WAP', code:'wap'}
  ];

  campaign_status = [
    { name: 'Active', code:'1'},
    { name: 'Inactive', code:'0'}
  ]
  
  filter: any = {'tel_id': null, 'region_id': null, 'service_id': null, 'ad_platform_id': null,  'campaign_type': null, 'status':null}
  lazyLoadEvent:any;
  
  copySuccess: boolean = false;
  telcom_id :any

  

  constructor(
    private httpService:HttpService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    public crudService:CrudService,
    private clipboardService: ClipboardService,
    private router:Router,
    private route: ActivatedRoute,
    private datePipe: DatePipe,
    private excelExportService: ExcelExportService

  ){
    let permissions = this.crudService.hasPermission('campaigns')
    this.read = permissions.read
    this.write = permissions.write
    this.delete = permissions.delete
    if(!this.read){
      this.router.navigate(['no-access'])
    }

    this.route.queryParams.forEach(e=> {
      this.filter = {...e};
      if(this.filter.tel_id && this.filter.region_id) {
        this.telcom_id = `${this.filter.tel_id}|$|${this.filter.region_id}`
      }
    })
  }

  ngOnInit(){
    this.getCampaignData();
  }
  

  onCopyClicked() {
    this.copySuccess = true;
    setTimeout(() => {
      this.copySuccess = false;
    }, 1500);
  }

  copyToClipboard(campaignId: string, campaigntype: string, is_silent:number): void {
    let isCopied:boolean  = this.clipboardService.copyFromContent(campaignId);
    if(campaigntype=='wap' ){
      isCopied =  is_silent == 1 ? this.clipboardService.copyFromContent(`${this.BASE_URL}s_redirect?cid=${campaignId}&click_id=`) :this.clipboardService.copyFromContent(`${this.BASE_URL}landingpage?cid=${campaignId}&click_id=`)
    }
    if(isCopied){
      let msg = campaigntype=='wap' ? 'Copied: Camapign Link!' : 'Copied: Camapign ID'
      this.messageService.add({ severity: 'success', summary: 'Success', detail: msg });
    }
  }

  getCampaignData(){
    this.httpService.get(`${this.CMS_API}campaign/campaign-data`).subscribe({
      next:res=>{
        if(!res.error){
          this.campaignData = res.data
          res.data.telecoms.map((tel:any)=>{
            tel.name = `${tel.name} (${tel.region_name})`
            tel.id = `${tel.id}|$|${tel.region_id}`
            return tel
          })
          this.telecom_operators = res.data.telecoms
          this.services = res.data.services
          // this.regions = res.data.regions
          this.advertising_platforms = res.data.ad_platforms
        }
      },
      error:err=>{
        console.log(err)
      }
    })
  }

  filterOnChange(ev:any, fieldName:string){
    if(fieldName == 'tel_id' && this.telcom_id){
      var splitted = this.telcom_id.split("|$|");
      this.filter.tel_id = splitted[0],
      this.filter.region_id = splitted[1]      
    } else if(this.telcom_id == null){
      this.filter.tel_id = null,
      this.filter.region_id = null      
    }
    setTimeout(() => {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: this.filter,
        queryParamsHandling: 'merge', // keeps existing params
      }) 
      this.nextPage(this.lazyLoadEvent);
    }, 200);
  }

  nextPage(event: any){
    this.lazyLoadEvent = event
    let limit = event.rows || 10;
    let page = event.first? (event.first / limit) + 1 : 1;
    let params = new URLSearchParams(this.filter);
    let sortField;
    sortField = event.sortField?event.sortField:null
    let sortOrder = event.sortOrder?event.sortOrder:null
    
    this.httpService.get(`${this.CMS_API}campaign/list?page=${page}&limit=${limit}&sortField=${sortField}&sortOrder=${sortOrder}&s=${event.globalFilter}&${params}`).subscribe({
      next:res=>{
        if(!res.error){
          this.campaigns = res.data.list;
          this.totalRecords = res.data.pagination.total_records;
          this.campaigns.map((ele:any)=> {
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
    this.router.navigate([], { relativeTo: this.route, queryParams: this.filter,queryParamsHandling: 'merge'}) 
    this.nextPage(this.lazyLoadEvent);
  }

  toggleCampaign(campaignId:any, campaignSts:any, campaignIndex:any){
    let data = {
      campaign_status:campaignSts==1?0:1,
      campaign_id:campaignId
    }
    this.confirmationService.confirm({
      key: 'confirmActiveInactive',
      target: new EventTarget,
      message: 'Are you sure that you want to Change Campaign Status?',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.httpService.post(`${this.CMS_API}campaign/delete`, data).subscribe({
          next:res=>{
            if(!res.error){
              this.messageService.add({ severity: 'success', summary: 'Success', detail: res.message });
              this.nextPage(this.lazyLoadEvent);
            }
            else{
              this.messageService.add({ severity: 'error', summary: 'Failed', detail: 'Something went wrong! Try again later...' });
            }
            this.campaigns.map((ele:any)=> {
              ele.status = data.campaign_status;
              return ele;
            })
          },
          error:err=>console.log(err)
        })
      },
      reject: () => {
          this.campaigns[campaignIndex].checked = this.campaigns[campaignIndex].checked ? false:true
          return false;
      }
    });
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  getPlanName(plan_name: string) {
    let name = plan_name.split('-');
    return name[2];
  }

  exportToExcel(): void {
    let limit = 'ALL'
    let queryParmas = Object.entries(this.filter).reduce((a:any,[k,v]) => (v == null ? a : (a[k]=v, a)), {});
    queryParmas = {...queryParmas, limit};
    let params = new URLSearchParams(queryParmas);
    this.excelExportService.exportToExcel(`${this.CMS_API}campaign/export_campaigns?${params}`).subscribe((excelData) => {
      const blob = new Blob([excelData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      let date = this.datePipe.transform(new Date(), "yyyy-MM-dd")
      a.download = `campaign-records-${date}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    });

  }
}

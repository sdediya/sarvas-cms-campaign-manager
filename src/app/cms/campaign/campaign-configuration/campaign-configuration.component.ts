import { Component, OnInit } from '@angular/core';
import { Table } from 'primeng/table';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpService } from 'src/app/services/http/http.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { environment } from 'src/environments/environment';
import { CrudService } from 'src/app/services/common/crud.service';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ExcelExportService } from 'src/app/services/excelExport/excel-export.service';

@Component({
    selector: 'app-campaign-configuration',
    templateUrl: './campaign-configuration.component.html',
    styleUrls: ['./campaign-configuration.component.css'],
    standalone: false
})
export class CampaignConfigurationComponent implements OnInit{
  read:boolean = false
	write:boolean = false
	delete:boolean = false

  loading: boolean = false;
  campaign_confs:any=[]
  totalRecords: number = 0;
  CMS_API = environment.CMS_API;

  conf_types = [
    { name: 'Drop', code:'drop' },
    { name: 'Capping', code:'capping' },
    { name: 'Blocking', code:'blocking' },
  ]
  conf_level_types = [
    { name: 'Service', code:'service' },
    { name: 'Telcom', code:'telcom' },
    { name: 'Plan', code:'plan' },
    { name: 'Campaign', code:'campaign' },
    { name: 'Ad-Partner', code:'platform' },
  ]

  filter: any = {'conf_type': null, 'conf_level_type': null}
  lazyLoadEvent:any;

  constructor(
    private frmbuilder:FormBuilder,
    private httpService:HttpService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private crudService:CrudService,
    private router:Router,
    private datePipe: DatePipe,
    private excelExportService: ExcelExportService
  ){
    let permissions = this.crudService.hasPermission('campaign_configurations')
    this.read = permissions.read
    this.write = permissions.write
    this.delete = permissions.delete
    if(!this.read){
      this.router.navigate(['no-access'])
    }
  }

  ngOnInit(){}

  

  

  toggleConf(confId:any, confIndex:any){
    let data = {
      conf_status: 0,
      conf_id: confId
    }
    this.confirmationService.confirm({
      key: 'confirmActiveInactive',
      target: new EventTarget,
      message: 'Are you sure that you want to Delete Configuration?',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.httpService.post(`${this.CMS_API}campaign/conf/delete`, data).subscribe({
          next:res=>{
            if(!res.error){
              this.messageService.add({ severity: 'success', summary: 'Success', detail: res.message });
              this.nextPage(this.lazyLoadEvent);
            }
            else{
              this.messageService.add({ severity: 'error', summary: 'Failed', detail: 'Something went wrong! Try again later...' });
            }
          },
          error:err=>console.log(err)
        })
      },
      reject: () => {
          this.campaign_confs[confIndex].checked = this.campaign_confs[confIndex].checked ? false:true
          return false;
      }
  });
    
  }

  filterOnChange(ev:any, fieldName:string){
    this.nextPage(this.lazyLoadEvent);
  }

  nextPage(event: any){
    this.lazyLoadEvent = event
    let limit = event.rows || 10;
    let page = event.first? (event.first / limit) + 1 : 1;
    let params = new URLSearchParams(this.filter);
    this.httpService.get(`${this.CMS_API}campaign/conf/list?page=${page}&limit=${limit}&s=${event.globalFilter}&${params}`).subscribe({
      next:res=>{
        console.log(res)
        if(!res.error){
          this.campaign_confs = res.data.list;
          this.totalRecords = res.data.pagination.total_records;
          this.campaign_confs.map((ele:any)=> {
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
    Object.keys(this.filter).forEach((i) => this.filter[i] = null);
    // console.log("this.filter ###", this.filter)
    this.nextPage(this.lazyLoadEvent);
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  exportToExcel(): void {
    let limit = 'ALL'
    let queryParmas = Object.entries(this.filter).reduce((a:any,[k,v]) => (v == null ? a : (a[k]=v, a)), {});
    queryParmas = {...queryParmas, limit};
    let params = new URLSearchParams(queryParmas);
    this.excelExportService.exportToExcel(`${this.CMS_API}campaign/conf/export-campaignConf?${params}`).subscribe((excelData) => {
      const blob = new Blob([excelData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      let date = this.datePipe.transform(new Date(), "yyyy-MM-dd")
      a.download = `campaign-configuration-records-${date}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    });

  }

}

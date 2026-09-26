import { Component, OnInit } from '@angular/core';
import { Table } from '@openng/optimus-ui/table';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpService } from 'src/app/services/http/http.service';
import { ConfirmationService, MessageService } from '@openng/optimus-ui/api';
import { environment } from 'src/environments/environment';
import { CrudService } from 'src/app/services/common/crud.service';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ExcelExportService } from 'src/app/services/excelExport/excel-export.service';
import { ClipboardService } from 'ngx-clipboard';

@Component({
    selector: 'app-list-platform',
    templateUrl: './list-platform.component.html',
    styleUrls: ['./list-platform.component.css'],
    standalone: false
})
export class ListPlatformComponent implements OnInit {

  read:boolean = false
	write:boolean = false
	delete:boolean = false

  loading: boolean = false;
  platforms_list:any=[]
  totalRecords: number = 0;
  CMS_API = environment.CMS_API;
  BACKEND_DOMAIN = environment.BACKEND_DOMAIN

  lazyLoadEvent:any;
  filterString:any;

  constructor(
    private frmbuilder:FormBuilder,
    private httpService:HttpService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private crudService:CrudService,
    private router:Router,
    private datePipe: DatePipe,
    private excelExportService: ExcelExportService,
    private clipboardService: ClipboardService,
  ){
    let permissions = this.crudService.hasPermission('masters')
    this.read = permissions.read
    this.write = permissions.write
    this.delete = permissions.delete
    if(!this.read){
      this.router.navigate(['no-access'])
    }
  }
  
  ngOnInit(){}

  togglePlatform(platformId:any, platformSts:any, platformIndex:any){
    let data = {
      platform_status:platformSts==1?0:1,
      platform_id:platformId
    }
    this.confirmationService.confirm({
      key: 'confirmActiveInactive',
      target: new EventTarget,
      message: 'Are you sure that you want to Change Platform Status?',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.httpService.post(`${this.CMS_API}platform/delete`, data).subscribe({
          next:res=>{
            if(!res.error){
              this.messageService.add({ severity: 'success', summary: 'Success', detail: res.message });
              this.nextPage(this.lazyLoadEvent);
            }
            else{
              this.messageService.add({ severity: 'error', summary: 'Failed', detail: 'Something went wrong! Try again later...' });
            }
            this.platforms_list.map((ele:any)=> {
              ele.status = data.platform_status;
              return ele;
            })
          },
          error:err=>console.log(err)
        })
      },
      reject: () => {
          this.platforms_list[platformIndex].checked = this.platforms_list[platformIndex].checked ? false:true
          return false;
      }
  });
    
  }

  deleteS2sURL(s2sId:any){
    let data = {
      s2s_id:s2sId
    }
    this.confirmationService.confirm({
      key: 'confirmS2sActiveInactive',
      target: new EventTarget,
      message: 'Are you sure that you want to Delete S2S?',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.httpService.post(`${this.CMS_API}platform/deletes2s`, data).subscribe({
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
    this.filterString = {s:event.globalFilter}
    let sortField = event.sortField?event.sortField:null
    let sortOrder = event.sortOrder?event.sortOrder:null
    this.httpService.get(`${this.CMS_API}platform/list?page=${page}&limit=${limit}&sortField=${sortField}&sortOrder=${sortOrder}&s=${event.globalFilter}`).subscribe({
      next:res=>{
        if(!res.error){
          this.platforms_list = res.data.list;

          this.totalRecords = res.data.pagination.total_records;
          this.platforms_list.map((ele:any)=> {
            ele.checked = ele.status? true: false;
            if(ele.s2s_urls.length > 0){
              ele.s2s_urls.map((s2sUrl:any)=>{
                s2sUrl.checked = s2sUrl.s2s_status? true: false;
              })
            }
            return ele;
          })
          // console.log("this.platforms_list", this.platforms_list)
        }
      },
      error:err=>{
        console.log(err);
      }
    })
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  exportToExcel(): void {
    let limit = 'ALL'
    let queryParmas = {...this.filterString, limit};
    let params = new URLSearchParams(queryParmas);
    this.excelExportService.exportToExcel(`${this.CMS_API}platform/export-platforms?${params}`).subscribe((excelData) => {
      const blob = new Blob([excelData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      let date = this.datePipe.transform(new Date(), "yyyy-MM-dd")
      a.download = `ad-partner-records-${date}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    });

  }
  copyToClipboardCTR(adpartnerId: string): void {
    const url = `${this.BACKEND_DOMAIN}public/dashboard/report/he_ctr?key=${adpartnerId}`;
    const isCopied = this.clipboardService.copyFromContent(url);
    if (isCopied) {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Copied: Ad Partner URL!' });
    }
  }
    copyToClipboardData(adpartnerId: string): void {
  
      const url = `${this.BACKEND_DOMAIN}public/dashboard/report/he_data?key=${adpartnerId}`;
      const isCopied = this.clipboardService.copyFromContent(url);
      if (isCopied) {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Copied: Ad Partner URL!' });
      }
    }

}

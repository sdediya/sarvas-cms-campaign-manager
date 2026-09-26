import { Component, OnInit } from '@angular/core';
import { Table } from '@openng/optimus-ui/table';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpService } from 'src/app/services/http/http.service';
import { ConfirmationService, MessageService } from '@openng/optimus-ui/api';
import { environment } from 'src/environments/environment';
import { CrudService } from 'src/app/services/common/crud.service';
import { Router } from '@angular/router';
import { ExcelExportService } from 'src/app/services/excelExport/excel-export.service';
import { DatePipe } from '@angular/common';
import { ClipboardService } from 'ngx-clipboard';

@Component({
    selector: 'app-list-short-link',
    templateUrl: './list-short-link.component.html',
    styleUrls: ['./list-short-link.component.css'],
    standalone: false
})
export class ListShortLinkComponent implements OnInit {

  read:boolean = false
	write:boolean = false
	delete:boolean = false

  loading: boolean = false;
  shortlink:any=[]
  totalRecords: number = 0;
  CMS_API = environment.CMS_API;

  lazyLoadEvent:any;
  filterString: any;
  
  ngOnInit(){}

  constructor(
    private frmbuilder:FormBuilder,
    private httpService:HttpService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private crudService: CrudService,
    private router:Router,
    private datePipe: DatePipe,
    private excelExportService: ExcelExportService,
    private clipboardService: ClipboardService
  ){
    let permissions = this.crudService.hasPermission('masters')
    this.read = permissions.read
    this.write = permissions.write
    this.delete = permissions.delete
    if(!this.read){
      this.router.navigate(['no-access'])
    }
  }

  toggleshortlink(shortlink_id:any, shortlinkSts:any,shortlinkIndex:any){    
    let data = {
      shortlink_status: shortlinkSts==false?0:1,
      shortlink_id: shortlink_id
    }
    this.confirmationService.confirm({
      key: 'confirmActiveInactive',
      target: new EventTarget,
      message: 'Are you sure that you want to change status of the short link?',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.httpService.post(`${this.CMS_API}shortlink/delete`, data).subscribe({
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
          this.shortlink[shortlinkIndex].checked = this.shortlink[shortlinkIndex].checked ? false:true
          return false;
      }
  });
    
  }

  copyToClipboard(shortlink_url: string): void {
    let isCopied: boolean = this.clipboardService.copyFromContent(shortlink_url);

    isCopied = this.clipboardService.copyFromContent(`https://tinysel.com/q/${shortlink_url}`) 
    
    if (isCopied) {
      let msg ='Copied'
      this.messageService.add({ severity: 'success', summary: 'Success', detail: msg });
    }
  }

  filterOnChange(ev:any, fieldName:string){
    this.nextPage(this.lazyLoadEvent);
  }

  nextPage(event: any){
    this.lazyLoadEvent = event
    let limit = event.rows || 10;
    let page = event.first? (event.first / limit) + 1 : 1;
    this.filterString = {s: event.globalFilter}
    let sortField = event.sortField?event.sortField:null
    let sortOrder = event.sortOrder?event.sortOrder:null
    this.httpService.get(`${this.CMS_API}shortlink/list?page=${page}&limit=${limit}&sortField=${sortField}&sortOrder=${sortOrder}&s=${event.globalFilter}`).subscribe({
      next:res=>{
        if(!res.error){
          this.shortlink = res.data.list;
         // alert(JSON.stringify(res.data.list));
          this.totalRecords = res.data.pagination.total_records;
          this.shortlink.map((ele:any)=> {
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

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  exportToExcel(): void {
    let limit = 'ALL'
    let queryParmas:any = {...this.filterString, limit};
    let params = new URLSearchParams(queryParmas);
    this.excelExportService.exportToExcel(`${this.CMS_API}shortlink/export-shortlinks?${params}`).subscribe((excelData) => {
      const blob = new Blob([excelData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      let date = this.datePipe.transform(new Date(), "yyyy-MM-dd")
      a.download = `shortlink-records-${date}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    });

  }

}

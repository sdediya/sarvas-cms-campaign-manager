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

@Component({
    selector: 'app-list-cron',
    templateUrl: './list-cron.component.html',
    styleUrls: ['./list-cron.component.css'],
    standalone: false
})
export class ListCronComponent implements OnInit {

  read:boolean = false
	write:boolean = false
	delete:boolean = false

  loading: boolean = false;
  crons:any=[]
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
    private excelExportService: ExcelExportService
  ){
    let permissions = this.crudService.hasPermission('masters')
    this.read = permissions.read
    this.write = permissions.write
    this.delete = permissions.delete
    if(!this.read){
      this.router.navigate(['no-access'])
    }
  }

  toggleCrons(cronId:any, cronsSts:any, cronsIndex:any){   
    let data = {
      cron_isActive: cronsSts==true?1:0,
      cron_id: cronId
    }    
    this.confirmationService.confirm({
      key: 'confirmActiveInactive',
      target: new EventTarget,
      message: 'Are you sure that you want to change status of the cron?',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.httpService.post(`${this.CMS_API}crons/delete`, data).subscribe({
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
          this.crons[cronsIndex].checked = this.crons[cronsIndex].checked ? false:true
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
    this.filterString = {s: event.globalFilter}
    let sortField = event.sortField?event.sortField:null
    let sortOrder = event.sortOrder?event.sortOrder:null
    this.httpService.get(`${this.CMS_API}crons/list?page=${page}&limit=${limit}&sortField=${sortField}&sortOrder=${sortOrder}&s=${event.globalFilter}`).subscribe({
      next:res=>{
        if(!res.error){
          this.crons = res.data.list;
          this.totalRecords = res.data.pagination.total_records;
          this.crons.map((ele:any)=> {
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
    this.excelExportService.exportToExcel(`${this.CMS_API}crons/export-crons?${params}`).subscribe((excelData) => {
      const blob = new Blob([excelData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      let date = this.datePipe.transform(new Date(), "yyyy-MM-dd")
      a.download = `crons-records-${date}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    });

  }

}

import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
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
    selector: 'app-list-service',
    templateUrl: './list-service.component.html',
    styleUrls: ['./list-service.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class ListServiceComponent implements OnInit{
  read:boolean = false
	write:boolean = false
	delete:boolean = false
  filterString:any

  loading: boolean = false;
  services:any=[]
  totalRecords: number = 0;
  CMS_API = environment.CMS_API;

  lazyLoadEvent:any;
  

  ngOnInit(){}

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
    let permissions = this.crudService.hasPermission('masters')
    this.read = permissions.read
    this.write = permissions.write
    this.delete = permissions.delete
    if(!this.read){
      this.router.navigate(['no-access'])
    }
  }

  toggleService(serviceId:any, srvcSts:any, serviceIndex:any){
    let data = {
      service_status: srvcSts==1?0:1,
      service_id: serviceId
    }
    this.confirmationService.confirm({
      key: 'confirmActiveInactive',
      target: new EventTarget,
      message: 'Are you sure that you want to change status of the service?',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.httpService.post(`${this.CMS_API}service/delete`, data).subscribe({
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
          this.services[serviceIndex].checked = this.services[serviceIndex].checked ? false:true
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
    this.httpService.get(`${this.CMS_API}service/list?page=${page}&limit=${limit}&sortField=${sortField}&sortOrder=${sortOrder}&s=${event.globalFilter}`).subscribe({
      next:res=>{
        if(!res.error){
          this.services = res.data.list;
          this.totalRecords = res.data.pagination.total_records;
          this.services.map((ele:any)=> {
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
    // let queryParmas = Object.entries(this.filter).reduce((a:any,[k,v]) => (v == null ? a : (a[k]=v, a)), {});
    let queryParmas:any = {...this.filterString, limit};
    let params = new URLSearchParams(queryParmas);
    this.excelExportService.exportToExcel(`${this.CMS_API}service/export-services?${params}`).subscribe((excelData) => {
      const blob = new Blob([excelData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      let date = this.datePipe.transform(new Date(), "yyyy-MM-dd")
      a.download = `service-records-${date}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    });

  }
}

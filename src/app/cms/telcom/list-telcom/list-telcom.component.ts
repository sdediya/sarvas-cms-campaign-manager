import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Table } from 'primeng/table';
import { ConfirmationService, MessageService } from 'primeng/api';
import { environment } from 'src/environments/environment';
import { HttpService } from 'src/app/services/http/http.service';
import { CrudService } from 'src/app/services/common/crud.service';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { ClipboardService } from 'ngx-clipboard';
import { ExcelExportService } from 'src/app/services/excelExport/excel-export.service';


@Component({
    selector: 'app-list-telcom',
    templateUrl: './list-telcom.component.html',
    styleUrls: ['./list-telcom.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class ListTelcomComponent implements OnInit{

  read:boolean = false
	write:boolean = false
	delete:boolean = false

  loading: boolean = false;
  telcoms:any=[]
  CMS_API = environment.CMS_API
  checked2: boolean = true;
  totalRecords: number = 0;

  // For Filters
  telecomData : any = {};
  regions = [];
  master_aggregators = [];
  filter: any = {'region_id': null, 'maggregator_id': null,'status':null}
  operator_status:any=[{status:'Active',value:1},{ status:'Inactive',value:0}]
  lazyLoadEvent:any;

  constructor(
    private httpService:HttpService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private crudService:CrudService,
    private clipboardService: ClipboardService,
    private datePipe: DatePipe,
    private router: Router,
    private excelExportService: ExcelExportService
  ){
    let permissions = this.crudService.hasPermission('operators')
    this.read = permissions.read
    this.write = permissions.write
    this.delete = permissions.delete
    if(!this.read){
      this.router.navigate(['no-access'])
    }
  }


  ngOnInit(){
    this.getTelecomData();
  }

  getTelecomData(){
    this.httpService.get(`${this.CMS_API}telcom/telcom-data`).subscribe({
      next:res=>{
        if(!res.error){
          this.telecomData = res.data
          this.regions = res.data.regions
          this.master_aggregators = res.data.master_aggregators      
        }
      },
      error:err=>{
        console.log(err)
      }
    })
  }

  filterOnChange(ev:any, fieldName:string){
    this.nextPage(this.lazyLoadEvent);
  }

  nextPage(event: any){
    this.lazyLoadEvent = event
    let limit = event.rows || 10;
    let page = event.first? (event.first / limit) + 1 : 1;
    let params = new URLSearchParams(this.filter);
    let sortField = event.sortField?event.sortField:null
    let sortOrder = event.sortOrder?event.sortOrder:null
    this.httpService.get(`${this.CMS_API}telcom/list?page=${page}&limit=${limit}&sortField=${sortField}&sortOrder=${sortOrder}&s=${event.globalFilter}&${params}`).subscribe({
      next:res=>{
        if(!res.error){
          this.telcoms = res.data.list;
          this.totalRecords = res.data.pagination.total_records;
          this.telcoms.map((ele:any)=> {
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
    this.nextPage(this.lazyLoadEvent);
  }

  toggleTelcom(telcomId:any, telcomSts:any, telcomIndex:any){
    let data = {
      tel_status:telcomSts==1?0:1,
      tel_id:telcomId
    }
    this.confirmationService.confirm({
      key: 'confirmActiveInactive',
      target: new EventTarget,
      message: 'Are you sure that you want to Change Telecom Status?',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.httpService.post(`${this.CMS_API}telcom/delete`, data).subscribe({
          next:res=>{
            if(!res.error){
              this.messageService.add({ severity: 'success', summary: 'Success', detail: res.message });
            }
            else{
              this.messageService.add({ severity: 'error', summary: 'Failed', detail: 'Something went wrong! Try again later...' });
            }
            this.telcoms.map((ele:any)=> {
              ele.status = data.tel_status;
              return ele;
            })
          },
          error:err=>console.log(err)
        })
      },
      reject: () => {
          this.telcoms[telcomIndex].checked = this.telcoms[telcomIndex].checked ? false:true
          return false;
      }
  });
    
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  copyToClipboard(telcomId:string) {
    let isCopied = this.clipboardService.copyFromContent(`${telcomId}`)
    if(isCopied){
      this.messageService.add({ severity: 'success', summary: 'Success', detail: "Copied: Operator ID!" });
    }
  }

  exportToExcel(): void {
    let limit = 'ALL'
    let queryParmas = Object.entries(this.filter).reduce((a:any,[k,v]) => (v == null ? a : (a[k]=v, a)), {});
    queryParmas = {...queryParmas, limit};
    let params = new URLSearchParams(queryParmas);
    this.excelExportService.exportToExcel(`${this.CMS_API}telcom/export_telcom?${params}`).subscribe((excelData) => {
      const blob = new Blob([excelData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      let date = this.datePipe.transform(new Date(), "yyyy-MM-dd")
      a.download = `telcom-records-${date}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    });

  }

}

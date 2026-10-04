import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Table } from 'primeng/table';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpService } from 'src/app/services/http/http.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { environment } from 'src/environments/environment';
import { CrudService } from 'src/app/services/common/crud.service';
import { Router } from '@angular/router';
import { ExcelExportService } from 'src/app/services/excelExport/excel-export.service';
import { DatePipe } from '@angular/common';

@Component({
    selector: 'app-list-blacklist',
    templateUrl: './list-blacklist.component.html',
    styleUrls: ['./list-blacklist.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class ListBlacklistComponent implements OnInit{
  read:boolean = false
	write:boolean = false
	delete:boolean = false

  loading: boolean = false;
  blacklist_confs:any=[]
  totalRecords: number = 0;
  CMS_API = environment.CMS_API;

  lazyLoadEvent:any;
  filter: any = {'blacklist_type': null, 'blacklist_duration_type':null}
  
  blacklist_duration_types = [
    { name: 'Temporary', code:'temporary' },
    { name: 'Permanent', code:'permanent' }
  ]

  blacklist_types = [
    { name: 'Series', code:'series' },
    { name: 'Mobile Number', code:'number' }
  ]
  filterString: any;

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
    let permissions = this.crudService.hasPermission('campaign_configurations')
    this.read = permissions.read
    this.write = permissions.write
    this.delete = permissions.delete
    if(!this.read){
      this.router.navigate(['no-access'])
    }
  }

  ngOnInit(){}

  toggleConf(blacklistId:any, blacklistIndex:any){
    let data = {
      blacklist_status: 0,
      blacklist_id: blacklistId
    }
    this.confirmationService.confirm({
      key: 'confirmActiveInactive',
      target: new EventTarget,
      message: 'Are you sure that you want to Delete Blacklist Configuration?',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.httpService.post(`${this.CMS_API}campaign/blacklist/delete`, data).subscribe({
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
          this.blacklist_confs[blacklistIndex].checked = this.blacklist_confs[blacklistIndex].checked ? false:true
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
    let s = event.globalFilter
    this.filterString = {s, ...this.filter}
    this.httpService.get(`${this.CMS_API}campaign/blacklist/list?page=${page}&limit=${limit}&s=${event.globalFilter}&${params}`).subscribe({
      next:res=>{
        if(!res.error){
          this.blacklist_confs = res.data.list;
          this.totalRecords = res.data.pagination.total_records;
          this.blacklist_confs.map((ele:any)=> {
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

  clearFilters(){
    Object.keys(this.filter).forEach((i) => this.filter[i] = null);
    this.nextPage(this.lazyLoadEvent);
  }

  exportToExcel(): void {
    let limit = 'ALL'
    // let queryParmas = Object.entries(this.filter).reduce((a:any,[k,v]) => (v == null ? a : (a[k]=v, a)), {});
    let queryParmas:any = {...this.filterString, limit};
    let params = new URLSearchParams(queryParmas);
    this.excelExportService.exportToExcel(`${this.CMS_API}campaign/blacklist/export-blacklist?${params}`).subscribe((excelData) => {
      const blob = new Blob([excelData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      let date = this.datePipe.transform(new Date(), "yyyy-MM-dd")
      a.download = `blacklist-records-${date}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    });

  }
}

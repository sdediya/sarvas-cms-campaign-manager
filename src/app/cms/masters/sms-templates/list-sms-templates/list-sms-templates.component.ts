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
    selector: 'app-list-sms-templates',
    templateUrl: './list-sms-templates.component.html',
    styleUrls: ['./list-sms-templates.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class ListSmsTemplatesComponent implements OnInit {

  read:boolean = false
	write:boolean = false
	delete:boolean = false

  loading: boolean = false;
  sms_templates:any=[]
  totalRecords: number = 0;
  CMS_API = environment.CMS_API;

  lazyLoadEvent:any;
  filter: any = {'telcom_id': null}
  telecoms:any
  filterString: any;

  ngOnInit(){
    let limit = 'ALL'
    this.httpService.get(`${this.CMS_API}telcom/list?limit=ALL&s=null&status=1`).subscribe({
          next:res=>{
            if(!res.error){
              res.data.list.map((tel:any)=>{
                tel.name = `${tel.name} (${tel.region_name})`
                tel.id = `${tel.id}`
                return tel
              })
              this.telecoms = res.data.list
            }
          }
        })
  }

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

  toggleSmsTemplates(smsTempId:any, smsTempSts:any, smsTempIndex:any){
    let data = {
      sms_temp_status: smsTempSts==1?0:1,
      sms_temp_id: smsTempId
    }
    this.confirmationService.confirm({
      key: 'confirmActiveInactive',
      target: new EventTarget,
      message: 'Are you sure that you want to change status of the SMS Template?',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.httpService.post(`${this.CMS_API}sms-templates/delete`, data).subscribe({
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
          this.sms_templates[smsTempIndex].checked = this.sms_templates[smsTempIndex].checked ? false:true
          return false;
      }
  });
    
  }

  filterOnChange(ev:any, fieldName:string){
    this.nextPage(this.lazyLoadEvent);
  }

  clearFilters(){
    Object.keys(this.filter).forEach((i) => this.filter[i] = null);
    this.nextPage(this.lazyLoadEvent);
  }

  nextPage(event: any){
    this.lazyLoadEvent = event
    let limit = event.rows || 10;
    let page = event.first? (event.first / limit) + 1 : 1;
    let params = new URLSearchParams(this.filter);
    
    this.filterString = {s:event.globalFilter, ...this.filter}
    this.httpService.get(`${this.CMS_API}sms-templates/list?page=${page}&limit=${limit}&s=${event.globalFilter}&${params}`).subscribe({
      next:res=>{
        if(!res.error){
          this.sms_templates = res.data.list;
          this.totalRecords = res.data.pagination.total_records;
          this.sms_templates.map((ele:any)=> {
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
    let queryParmas = {...this.filterString, limit};
    let params = new URLSearchParams(queryParmas);
    this.excelExportService.exportToExcel(`${this.CMS_API}sms-templates/export-smsTemplate?${params}`).subscribe((excelData) => {
      const blob = new Blob([excelData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      let date = this.datePipe.transform(new Date(), "yyyy-MM-dd")
      a.download = `smsTemplate-records-${date}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    });

  }

}

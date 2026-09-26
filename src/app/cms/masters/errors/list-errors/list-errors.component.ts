import { Component, OnInit} from '@angular/core';
import { Table } from 'primeng/table';
import { FormBuilder} from '@angular/forms';
import { HttpService } from 'src/app/services/http/http.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { environment } from 'src/environments/environment';
import { CrudService } from 'src/app/services/common/crud.service';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ExcelExportService } from 'src/app/services/excelExport/excel-export.service';


@Component({
    selector: 'app-list-errors',
    templateUrl: './list-errors.component.html',
    styleUrls: ['./list-errors.component.css'],
    standalone: false
})
export class ListErrorsComponent  implements OnInit {

  read:boolean = false
	write:boolean = false
	delete:boolean = false

  errLoading: boolean = false;
  successLoading: boolean = false;

  errorsArr :any = []
  successArr :any = []

  totalErrorRecords: any;
  totalSuccessRecords: any;

  CMS_API = environment.CMS_API;

  lazyLoadEvent:any;
  filterString: any;
  tabIndex = 0;
  activeTab = 0;
  errSeverity: any ;

  
  constructor(
    private frmbuilder:FormBuilder,
    private httpService:HttpService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private crudService:CrudService,
    private router: Router,
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
    
  ngOnInit(){
    if(this.activeTab == 0)this.errSeverity = 'error'
  }

  toggleCustomResponse(errId:any, errSts:any, errIndex:any, errSeverity:any){
    let data = {
      error_status: errSts==1?0:1,
      error_id: errId
    }
    this.confirmationService.confirm({
      key: 'confirmActiveInactive',
      target: new EventTarget,
      message: 'Are you sure that you want to change status of the custom response?',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.httpService.post(`${this.CMS_API}error_master/delete`, data).subscribe({
          next:res=>{
            if(!res.error){
              this.messageService.add({ severity: 'success', summary: 'Success', detail: res.message });
              this.nextPage(this.lazyLoadEvent, errSeverity);
            }
            else{
              this.messageService.add({ severity: 'error', summary: 'Failed', detail: 'Something went wrong! Try again later...' });
            }
          },
          error:err=>console.log(err)
        })
      },
      reject: () => {
          if(errSeverity=='success'){
            this.successArr[errIndex].checked = this.successArr[errIndex].checked ? false:true
          }
          else{
            this.errorsArr[errIndex].checked = this.errorsArr[errIndex].checked ? false:true
          }
          return false;
      }
  });
    
  }

  // filterOnChange(ev:any, fieldName:string){
  //   this.nextPage(this.lazyLoadEvent);
  // }

  nextPage(event: any, errSeverity: any){
    this.lazyLoadEvent = event
    let limit = event.rows || 10;
    let page = event.first? (event.first / limit) + 1 : 1;
    this.filterString = { errSeverity : this.errSeverity, s : event.globalFilter }
    this.httpService.get(`${this.CMS_API}error_master/list?errSeverity=${this.errSeverity}&page=${page}&limit=${limit}&s=${event.globalFilter}`).subscribe({
      next:res=>{
        if(!res.error){
            if(errSeverity=='success'){
              this.successArr = res.data.list
              this.successArr.map((ele:any)=> {
                ele.checked = ele.status? true: false;
                return ele;
              })
              this.totalSuccessRecords = res.data.pagination.total_records;
            }
            else{
              this.errorsArr = res.data.list
              this.errorsArr.map((ele:any)=> {
                ele.checked = ele.status? true: false;
                return ele;
              })
              this.totalErrorRecords = res.data.pagination.total_records;
            }
            
          
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
    let queryParmas
    queryParmas = {...this.filterString, limit};
    let params = new URLSearchParams(queryParmas);
    this.excelExportService.exportToExcel(`${this.CMS_API}error_master/export_errorMaster?${params}`).subscribe((excelData) => {
      const blob = new Blob([excelData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      let date = this.datePipe.transform(new Date(), "yyyy-MM-dd")
      a.download = `${this.filterString.errSeverity}-records-${date}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    });

  }


  switchHeaders(tabNumber: any) {
    this.activeTab = tabNumber.index;
    this.errSeverity = this.activeTab == 0 ? 'error': 'success' 
  }
}

import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { MessageService} from 'primeng/api';
import { HttpService } from 'src/app/services/http/http.service';
import { ExcelExportService } from 'src/app/services/excelExport/excel-export.service';
import { CrudService } from 'src/app/services/common/crud.service';
import { Router } from '@angular/router';
import { Table } from 'primeng/table';

@Component({
    selector: 'shortlink-logs',
    templateUrl: './shortlink-logs.component.html',
    styleUrls: ['./shortlink-logs.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class ShortlinkLogsComponent implements OnInit{

  read:boolean = false
	write:boolean = false
	delete:boolean = false

  CMS_API = environment.CMS_API;

  shortlinkLogsForm: any = FormGroup;
  submitted : boolean = false;
  isValidForm : boolean = false;

  maxDate:any;

  shortlink_id = []
  shortlink_name = []

  logs: any = [];
  cols: any =[];
  totalRecords: number = 0;
  lazyLoadEvent:any;
  loading: boolean = false;
  log_fields : any = {
    start_date:null,
    end_date:null,
    shortlink_id: null,
    telcom: null
  }

  constructor(
    private frmbuilder:FormBuilder, 
    private httpService:HttpService,
    private messageService: MessageService,
    private excelExportService: ExcelExportService,
    private crudService:CrudService,
    private router:Router
  ){

    let permissions = this.crudService.hasPermission('logs')
    this.read = permissions.read
    this.write = permissions.write
    this.delete = permissions.delete
    if(!this.read){
      this.router.navigate(['no-access'])
    }

    this.shortlinkLogsForm = frmbuilder.group({
      log_date_range: ['', [Validators.required]],
      log_shortlink: ['',[Validators.required]],
      log_partner : ['']
    });
  }

  ngOnInit(): void {
    this.getShortlinks()
    this.maxDate = new Date()
  }

  // convenience getter for easy access to form fields
  get f() { return this.shortlinkLogsForm.controls; }

  // Convert date to format YYYY-MM-DD
  convertDateFormat(rawDate:any) {
    let curr_dt = new Date(rawDate)
    let convertedDate = curr_dt.getFullYear() + "-" + String(curr_dt.getMonth() + 1).padStart(2, '0') + "-" + String(curr_dt.getDate()).padStart(2, '0');
    return convertedDate;
  }

  getShortlinks(){
    this.httpService.get(`${this.CMS_API}shortlink/list`).subscribe({
      next:res=>{
        if(!res.error){
          
          res.data.list.map((shortlink:any)=>{
            
            shortlink.name = `${shortlink.shortlink_name}_${shortlink.shortlink_url}`
            shortlink.id = `${shortlink.shortlink_id}`
            return shortlink
          })
          this.shortlink_id = res.data.list
        }
      },
      error:err=>{
       
        console.log(err)
      }
    })

  }

  nextPage(event: any){
    this.submitted = true;
    if(this.shortlinkLogsForm.status!=='INVALID'){
      this.loading = true;
      this.lazyLoadEvent = event
      let limit = event?.rows || 50;
      let page = event?.first? (event?.first / limit) + 1 : 1;
      this.log_fields['limit'] = limit
      this.log_fields['page'] = page
      this.log_fields['msisdn'] = event?.globalFilter
      this.isValidForm = true;
      this.httpService.post(`${this.CMS_API}shortlink/analyticallogs`, this.log_fields).subscribe({
        next:res=>{
        
          if(!res.error){
            this.logs = res.data;
            this.totalRecords = res.data.length;
            this.loading = false
          }
          else{
            this.loading = false
            this.messageService.add({ severity: 'error', summary: 'Failed', detail: res.message });
          }
        },
        error:err=>{
          this.loading = false
          console.log(err)
        }
      });

    }
    return false;
  }

  downloadExcel() {
    if(this.shortlinkLogsForm.status!=='INVALID'){
      this.isValidForm = true;
      let start_date = this.convertDateFormat(this.f['log_date_range'].value[0])
      let end_date = this.convertDateFormat(this.f['log_date_range'].value[1])
      let telecom = this.shortlink_id.filter((e:any)=>e.id==this.f['log_shortlink'].value)[0]
      let data = {
        ...this.log_fields,
        download_excel:true
      }
      this.excelExportService.exportToExcelPost(`${this.CMS_API}shortlink/export`, data).subscribe((excelData) =>{
        const blob = new Blob([excelData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `shortlinkLogs-${telecom['name']}_${start_date}_${end_date}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      });
    }
  }

  onSubmit() {
    this.submitted = true;
    let start_date = this.convertDateFormat(this.f['log_date_range'].value[0])
    let end_date = this.convertDateFormat(this.f['log_date_range'].value[1])
    let shortlink = this.shortlink_id.filter((e:any)=>e.id==this.f['log_shortlink'].value)[0]
    
    if(start_date && end_date && shortlink){
      this.log_fields = {
        start_date,
        end_date,
        shortlink_id: shortlink['id']
      }
      this.nextPage(this.lazyLoadEvent)
    }
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }
  getMaskedRequestBody(requestBody: string, msisdn: string): string {
    if (!msisdn || msisdn.length <= 6) return requestBody;

    const masked = msisdn.replace(/\d(?=\d{4})/g, 'X');
    const escapedMsisdn = msisdn.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const safeRequest = typeof requestBody === 'string' ? requestBody : JSON.stringify(requestBody);

    // Replace all instances of the MSISDN in the request body
    return safeRequest.replace(new RegExp(escapedMsisdn, 'g'), masked);
  }
  showMsisdn(logs:any){
    logs.showFull = !logs.showFull;
    logs.type = 'SERVICE_API_LOG';
    this.httpService.post(`${this.CMS_API}user/userMsisdnMaskingLogs`,logs).subscribe({
      next:res=>{
        if(!res.error){
          console.log(res)
        }
      },
      error:error=>{
        console.log(error)
      }
    })
  }

}

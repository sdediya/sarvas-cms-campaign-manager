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
    selector: 'app-third-party-logs',
    templateUrl: './third-party-logs.component.html',
    styleUrls: ['./third-party-logs.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class ThirdPartyLogsComponent {
   
  tpRedirectionForm: any = FormGroup;
  submitted : boolean = false;
  isValidForm : boolean = false;

  CMS_API = environment.CMS_API;

  read:boolean = false
	write:boolean = false
	delete:boolean = false

  logs: any = [];
  totalRecords: number = 0;
  lazyLoadEvent:any;
  loading: boolean = false;

  log_fields : any = {
  start_date:null,
  end_date:null,
  
  tel_id:null,
}

  telcoms: any = [];

  get f() { return this.tpRedirectionForm.controls; }

  maxDate:any;

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
    this.tpRedirectionForm = frmbuilder.group({
      log_date: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.maxDate = new Date()
  }
  onSubmit() {
    this.submitted = true;
    let start_date = this.convertDateFormat(this.f['log_date'].value[0])
    let end_date = this.convertDateFormat(this.f['log_date'].value[1])
    
  
    if(this.f['log_date'].value){
      this.log_fields = { start_date,end_date}
      this.nextPage(this.lazyLoadEvent)
    }
  }

    // Convert date to format YYYY-MM-DD
  convertDateFormat(rawDate:any) {
    let curr_dt = new Date(rawDate)
    let convertedDate = curr_dt.getFullYear() + "-" + String(curr_dt.getMonth() + 1).padStart(2, '0') + "-" + String(curr_dt.getDate()).padStart(2, '0');
    return convertedDate;
  }

  onGlobalFilter(table: Table, event: Event) {
  table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
}

  nextPage(event: any){
  this.submitted = true;
  if(this.tpRedirectionForm.status!=='INVALID'){
    this.loading = true;
    this.lazyLoadEvent = event
    let limit = event?.rows || 50;
    let page = event?.first? (event?.first / limit) + 1 : 1;
    this.log_fields['limit'] = limit
    this.log_fields['page'] = page
  
    this.isValidForm = true;
    this.httpService.post(`${this.CMS_API}logs/tp-redirection-logs`, this.log_fields).subscribe({
      next:res=>{
        if(!res.error){
          console.log('Logs',this.logs);
          this.logs = res.data.rows.map((log: any) => ({
            date: log.timestamp,
            operator: log.operatorName,
            request: log.request,
            msisdn: log.msisdn || null, 
            showFull: false
          }));
          this.totalRecords = res.data.pagination.total_records;
          this.loading = false
        }
        else{
          this.loading = false
          // this.messageService.add({ severity: 'error', summary: 'Failed', detail: res.message });
        }
      },
      error:err=>{
        this.loading = false
        console.log(err)
        this.messageService.add({ severity: 'error', summary: 'Failed', detail: err.error.message });
      }
    })
  }
  return false;
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
    const payload = { ...logs, type: 'THIRD_PARTY_REDIRECTION_LOG' };
    this.httpService.post(`${this.CMS_API}user/userMsisdnMaskingLogs`,payload).subscribe({
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

downloadExcel(){
  if(this.tpRedirectionForm.status!=='INVALID'){
      this.isValidForm = true;
      let date = this.convertDateFormat(this.f['log_date'].value)
      let data = {
        ...this.log_fields,
        download_excel:true
      }

      this.excelExportService.exportToExcelPost(`${this.CMS_API}logs/download-tp-redirection-logs`, data).subscribe((excelData) =>{
        const blob = new Blob([excelData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tpRedirectionLogs.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      });
    }
}

}

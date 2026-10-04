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
    selector: 'app-operator-logs',
    templateUrl: './operator-logs.component.html',
    styleUrls: ['./operator-logs.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class OperatorLogsComponent implements OnInit{
  read:boolean = false
	write:boolean = false
	delete:boolean = false

  CMS_API = environment.CMS_API;

  operatorLogsForm: any = FormGroup;
  submitted : boolean = false;
  isValidForm : boolean = false;

  maxDate:any;

  telcoms = []

  logs: any = [];
  totalRecords: number = 0;
  lazyLoadEvent:any;
  loading: boolean = false;
  log_fields : any = {
    date:null,
    operator_code: null,
    region_code: null,
    tel_id:null,
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
    this.operatorLogsForm = frmbuilder.group({
      log_date: ['', [Validators.required]],
      log_operator: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.getTelcoms()
    this.maxDate = new Date()
  }

  // convenience getter for easy access to form fields
  get f() { return this.operatorLogsForm.controls; }

  // Convert date to format YYYY-MM-DD
  convertDateFormat(rawDate:any) {
    let curr_dt = new Date(rawDate)
    let convertedDate = curr_dt.getFullYear() + "-" + String(curr_dt.getMonth() + 1).padStart(2, '0') + "-" + String(curr_dt.getDate()).padStart(2, '0');
    return convertedDate;
  }

  getTelcoms(){
    this.httpService.get(`${this.CMS_API}telcom/list?limit=ALL&s=null&status=1`).subscribe({
      next:res=>{
        if(!res.error){
          res.data.list.map((tel:any)=>{
            tel.name = `${tel.name} (${tel.region_name})`
            tel.id = tel.id
            tel.operator_code = tel.tel_shortcode.toUpperCase()
            tel.region_code = tel.region_shortcode.toUpperCase()
            return tel
          })
          this.telcoms = res.data.list
        }
      }
    })
  }

  nextPage(event: any){
    this.submitted = true;
    if(this.operatorLogsForm.status!=='INVALID'){
      this.loading = true;
      this.lazyLoadEvent = event
      let limit = event?.rows || 50;
      let page = event?.first? (event?.first / limit) + 1 : 1;
      this.log_fields['limit'] = limit
      this.log_fields['page'] = page
      this.log_fields['msisdn'] = event?.globalFilter
      this.isValidForm = true;
      this.httpService.post(`${this.CMS_API}logs/operator-logs`, this.log_fields).subscribe({
        next:res=>{
          if(!res.error){
            this.logs = res.data.rows.map((log: any) => ({
            ...log,
            showFull: false 
            }));
            this.totalRecords = res.data.pagination.total_records;
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
      })
    }
    return false;
  }

  downloadExcel() {
    if(this.operatorLogsForm.status!=='INVALID'){
      this.isValidForm = true;
      let date = this.convertDateFormat(this.f['log_date'].value)
      let data = {
        ...this.log_fields,
        download_excel:true
      }

      this.excelExportService.exportToExcelPost(`${this.CMS_API}logs/download-operator-logs`, data).subscribe((excelData) =>{
        const blob = new Blob([excelData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${data?.region_code}-${data?.operator_code}OperatorLogs${date}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      });
    }
  }

  onSubmit() {
    this.submitted = true;
    let date = this.convertDateFormat(this.f['log_date'].value)
    let telecom = this.telcoms.filter((e:any)=>e.id==this.f['log_operator'].value)[0]
    if(telecom && this.f['log_date'].value){
      this.log_fields = {
        date,
        operator_code: telecom['operator_code'] || null,
        region_code: telecom['region_code'] || null,
        tel_id:this.f['log_operator'].value || null,
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
    logs.type = 'OPERATOR_LOG';
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

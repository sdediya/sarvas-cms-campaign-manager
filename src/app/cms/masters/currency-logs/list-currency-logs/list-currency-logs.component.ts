import { Component, OnInit} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from '@openng/optimus-ui/api';
import { CrudService } from 'src/app/services/common/crud.service';
import { ExcelExportService } from 'src/app/services/excelExport/excel-export.service';
import { HttpService } from 'src/app/services/http/http.service';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-list-currency-logs',
    templateUrl: './list-currency-logs.component.html',
    styleUrls: ['./list-currency-logs.component.css'],
    standalone: false
})
export class ListCurrencyLogsComponent implements OnInit{
  
  read:boolean = false
	write:boolean = false
	delete:boolean = false

  CMS_API = environment.CMS_API;

  
  currencyLogForm: any = FormGroup;
  submitted : boolean = false;
  isValidForm : boolean = false;
  recordsFound : boolean = false

  // Currency Buffer Form
  currencyBufferForm: any = FormGroup;
  currlog_id:any;
  currentCurrlog:any={
    currlog_id:'',
    currlog_inr_buffer:'',
    inr:'',
    date:''
  }
  afterBufferINR : any;

  maxDate:any;

  reports: any = [];
  cols: any =[];

  visible: boolean = false;
  position: string = 'right';

  constructor(
    private frmbuilder:FormBuilder, 
    private httpService:HttpService,
    private messageService: MessageService,
    private excelExportService: ExcelExportService,
    private crudService:CrudService,
    private router:Router
  ){
    let permissions = this.crudService.hasPermission('masters')
    this.read = permissions.read
    this.write = permissions.write
    this.delete = permissions.delete
    if(!this.read){
      this.router.navigate(['no-access'])
    }

    this.currencyLogForm = frmbuilder.group({
      currency_year: [new Date(), [Validators.required]],
    });

    this.currencyBufferForm = frmbuilder.group({
      currlog_inr_buffer: ['', [Validators.required]]
    });

    this.cbf['currlog_inr_buffer'].valueChanges.subscribe((value:any)=>{
      let buffer_amount = Number(value)
      this.afterBufferINR = buffer_amount < 0 ? +this.currentCurrlog.inr - Math.abs(buffer_amount) : +this.currentCurrlog.inr + buffer_amount
    })
  }

  ngOnInit(): void {
    this.maxDate = new Date()
    let data = {
      currency_year:this.f['currency_year'].value.getFullYear()
    }
    this.getCurrencyLogs(data)
  }

  // convenience getter for easy access to form fields
  get f() { return this.currencyLogForm.controls; }

  // convenience getter for easy access to form fields
  get cbf() { return this.currencyBufferForm.controls; }

  // Convert date to format YYYY-MM-DD
  convertDateFormat(rawDate:any) {
    let curr_dt = new Date(rawDate)
    let convertedDate = curr_dt.getFullYear() + "-" + String(curr_dt.getMonth() + 1).padStart(2, '0') + "-" + String(curr_dt.getDate()).padStart(2, '0');
    return convertedDate;
  }

  getCurrencyLogs(data:any){
    this.submitted = true;
    this.isValidForm = true;
      this.httpService.post(`${this.CMS_API}currency-logs/list`, data).subscribe({
        next:res=>{
          if(!res.error){
            if(res.data.rows.length!==0){
              this.recordsFound = true
              this.cols = res.data.headers;
              this.reports = res.data.rows
            }
            else{
              this.recordsFound = false
              this.messageService.add({ severity: 'error', summary: 'Not Found', detail: res.message });
            }
          }
          else{
            this.messageService.add({ severity: 'error', summary: 'Failed', detail: res.message });
          }
        },
        error:err=>{
          console.log(err)
          this.messageService.add({ severity: 'error', summary: 'Failed', detail: err.error.message});
        }
      });
  }

  onSubmit(){
    this.submitted = true;
    if(this.currencyLogForm.status!=='INVALID'){
      this.isValidForm = true;
      let data = {
        currency_year:this.f['currency_year'].value.getFullYear()
      }
      this.getCurrencyLogs(data)
    }
    return false
  }

  onCurrencyBufferSubmit(){
    if(this.currencyBufferForm.status!=='INVALID'){
      let data = {
        ...this.currencyBufferForm.value,
        currlog_id: this.currentCurrlog.id
      };
      this.httpService.post(`${this.CMS_API}currency-logs/edit`, data).subscribe({
        next:res=>{
          if(!res.error){
            this.visible = false
            this.messageService.add({ severity: 'success', summary: 'Success', detail: res.message });
            this.reports.map((log:any)=>{
              if(log.id==this.currentCurrlog.id){
                log.currlog_inr_buffer = data.currlog_inr_buffer
              }
              return log
            })
          }
          else{
            this.messageService.add({ severity: 'error', summary: 'Failed', detail: res.message });
          }
        },
        error:err=>{
          console.log(err)
        }
      });
    }
    return false;
  }

  downloadExcel() {
    if(this.currencyLogForm.status!=='INVALID'){
      this.isValidForm = true;
      let data = {
        currency_year:this.f['currency_year'].value.getFullYear()
      }
      this.excelExportService.exportToExcelPost(`${this.CMS_API}currency-logs/export`, data).subscribe((excelData) =>{
        const blob = new Blob([excelData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `currency-logs-${new Date().toJSON().slice(0, 10)}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      });
    }
  }

  showDialog(currlog_id:any) {
    let current_log = this.reports.filter((log:any)=>log.id==currlog_id)
    if(current_log){
      console.log(current_log)
      this.visible = true
      this.currentCurrlog = current_log[0]
      this.currencyBufferForm.patchValue(current_log[0])
    }
  }

}

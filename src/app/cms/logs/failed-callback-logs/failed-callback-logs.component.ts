import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Table } from '@openng/optimus-ui/table';
import { ExcelExportService } from 'src/app/services/excelExport/excel-export.service';
import { HttpService } from 'src/app/services/http/http.service';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-failed-callback-logs',
    templateUrl: './failed-callback-logs.component.html',
    styleUrls: ['./failed-callback-logs.component.css'],
    standalone: false
})
export class FailedCallbackLogsComponent {

  CMS_API = environment.CMS_API
  filter:any = { operator:null, region:null, start_date:null, end_date:null}
  callbacklogs: any;
  totalTableRecords: number = 0;
  loading: boolean = false;
  lazyLoadEvent: any;
  callbackLogsForm: any = FormGroup;
  submitted : boolean = false;
  isValidForm : boolean = false;
  telcoms: any;
  masterAggregator: any;
  maxDate: any;
  showLogResponse: boolean = false;
  selectedCallbackLog: any;
  telcomFlag: boolean = false;
  freezTableValue: boolean = false;
  showFull: boolean = false;
  rawTelcomData: any[] = [];

  constructor(private httpService:HttpService,private datePipe:DatePipe,
    private excelExportService: ExcelExportService,
    private frmbuilder:FormBuilder){

      this.callbackLogsForm = frmbuilder.group({
        log_date: ['', [Validators.required]],
        callback_telcom_region: ['',[Validators.required]],
        callback_partner: ['']
      });
    }

  ngOnInit(){
    this.maxDate = new Date()
    let params = new URLSearchParams(this.filter);
  }

  // convenience getter for easy access to form fields
  get f() { return this.callbackLogsForm.controls; }

  // Convert date to format YYYY-MM-DD
  convertDateFormat(rawDate:any) {
    let curr_dt = new Date(rawDate)
    let convertedDate = curr_dt.getFullYear() + "-" + String(curr_dt.getMonth() + 1).padStart(2, '0') + "-" + String(curr_dt.getDate()).padStart(2, '0');
    return convertedDate;
  }

  onSubmit(){
    this.submitted = true;
    if(this.callbackLogsForm.status!=='INVALID'){
      this.isValidForm = true;

      let start_date = this.convertDateFormat(this.f['log_date'].value[0])
      let end_date = this.convertDateFormat(this.f['log_date'].value[1])
      let data = {
        operator:this.f['callback_telcom_region'].value.tel_shortcode,
        region : this.f['callback_telcom_region'].value.region_shortcode,
        masterAggregator : this.f['callback_partner'].value?.name || "",
        start_date,
        end_date
      }
      this.filter = data
      this.nextPage(this.lazyLoadEvent);
    }
  }
  
  // try catch finish
  filterOnChange(ev: any, fieldName: string) {
    this.telcomFlag = true;
    if (ev.value && fieldName === 'telcom') {
      const selected = ev.value;
      // Filter raw data for selected operator/region and extract non-null masterAggregators
      const partners = this.rawTelcomData
        .filter(item =>
          item.operator === selected.tel_shortcode &&
          item.region === selected.region_shortcode &&
          item.masterAggregator
        )
        .map(item => ({
          id: item.masterAggregator,
          name: item.masterAggregator
        }));

      // Remove duplicates
      this.masterAggregator = [...new Map(partners.map(p => [p.id, p])).values()];
    } else {
      this.masterAggregator = [];
    }

    // Always reset the selected partner in the form when telcom changes or clears
    this.callbackLogsForm.patchValue({ callback_partner: null });
  }

  nextPage(event: any){
    this.lazyLoadEvent = event || null
    let limit = event?.rows||10;
    let page = event?.first? (event?.first / limit) + 1 : 1;
    if(this.telcomFlag == true && this.submitted == true){
      this.freezTableValue = true
    }
    let queryParmas = Object.entries(this.filter).reduce((a:any,[k,v]) => (v == null ? a : (a[k]=v, a)), {});
    let s = event?.globalFilter || null
    queryParmas = {...queryParmas, s, limit, page};
    let params = new URLSearchParams(queryParmas);
    this.httpService.get(`${this.CMS_API}logs/failedCallbackLog/list?${params}`).subscribe({
      next:res=>{
        if(!res.error){
          this.callbacklogs = res.data.response.map((log: any) => ({
            ...log,
            showFull: false 
          }));

          this.totalTableRecords = res.data.count;
        }

      },
      error:error=>{
        console.log(error)
      }
    })
  }
  
  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  exportToExcel(): void {
    let queryParmas = Object.entries(this.filter).reduce((a:any,[k,v]) => (v == null ? a : (a[k]=v, a)), {});
    
    if (this.lazyLoadEvent?.globalFilter) {
      queryParmas['s'] = this.lazyLoadEvent.globalFilter;
    }

    let params = new URLSearchParams(queryParmas);
    this.excelExportService.exportToExcel(`${this.CMS_API}logs/failedCallbackLog/export?${params}`).subscribe((excelData) => {
      const blob = new Blob([excelData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
     let startDate = this.filter.start_date;
     let endDate = this.filter.end_date;
     a.download = `failed-callback-logs-report-${this.filter.operator}-${this.filter.region}-${startDate}-to-${endDate}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    });

  }

  showDialog(logRequestBody:any){
    this.showLogResponse = true
    this.selectedCallbackLog = JSON.parse(logRequestBody)
  }

  getMaskedRequestBody(requestBody: string, msisdn: string): string {
    if (!msisdn || msisdn.length <= 6) return requestBody;

    const masked = msisdn.replace(/\d(?=\d{4})/g, 'X');
    const escapedMsisdn = msisdn.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const safeRequest = typeof requestBody === 'string' ? requestBody : JSON.stringify(requestBody);

    // Replace all instances of the MSISDN in the request body
    return safeRequest.replace(new RegExp(escapedMsisdn, 'g'), masked);
  }

  showMsisdn(callbackLogs:any){
    callbackLogs.showFull = !callbackLogs.showFull;
    callbackLogs.type = 'CALLBACK_LOG'; // Assuming same type for logging view unless backend treats them differently
    this.httpService.post(`${this.CMS_API}user/userMsisdnMaskingLogs`,callbackLogs).subscribe({
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

  // Proposed Method: onDateSelect
onDateSelect() {
  const dates = this.f['log_date'].value;
  if (dates && dates[0] && dates[1]) {
    const start_date = this.convertDateFormat(dates[0]);
    const end_date = this.convertDateFormat(dates[1]);
    this.getTelcoms(start_date, end_date);
  }
}

onDateClear() {
  this.telcoms = [];
  this.masterAggregator = [];
  this.callbackLogsForm.patchValue({
    callback_telcom_region: null,
    callback_partner: null
  });
}
// Updated Method: getTelcoms
getTelcoms(start_date?: string, end_date?: string) {
  this.telcoms = [];
  this.masterAggregator = [];
  let url = `${this.CMS_API}logs/failedCallbackLog/operators`;
  if (start_date && end_date) {
    url += `?start_date=${start_date}&end_date=${end_date}`;
  }
  this.httpService.get(url).subscribe({
    next: res => {
      if (!res.error) {
        this.rawTelcomData = res.data;
        // Extract unique Telcom + Region combinations
        const uniqueTelcoms = new Map();
        res.data.forEach((item: any) => {
          const key = `${item.operator}-${item.region}`;
          if (!uniqueTelcoms.has(key)) {
            uniqueTelcoms.set(key, {
              name: `${item.operator} (${item.region})`,
              tel_shortcode: item.operator,
              region_shortcode: item.region
            });
          }
        });
        this.telcoms = Array.from(uniqueTelcoms.values());
      }
    }
  });
}
}    

import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Table } from 'primeng/table';
import { ExcelExportService } from 'src/app/services/excelExport/excel-export.service';
import { HttpService } from 'src/app/services/http/http.service';
import { environment } from 'src/environments/environment';
@Component({
    selector: 'app-callback-logs',
    templateUrl: './callback-logs.component.html',
    styleUrls: ['./callback-logs.component.css'],
    standalone: false
})
export class CallbackLogsComponent {

  
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
  showFull: boolean = false

  constructor(private httpService:HttpService,private datePipe:DatePipe,
    private excelExportService: ExcelExportService,
    private frmbuilder:FormBuilder){

      this.callbackLogsForm = frmbuilder.group({
        callback_date_range: ['', [Validators.required]],
        callback_telcom_region: ['',[Validators.required]],
        callback_partner: ['']
      });
      this.getTelcoms()
    }

  ngOnInit(){
    
    this.maxDate = new Date()
    let params = new URLSearchParams(this.filter);
  }

  
  // convenience getter for easy access to form fields
  get f() { return this.callbackLogsForm.controls; }

  getTelcoms(){
    this.httpService.get(`${this.CMS_API}telcom/list?limit=ALL&s=null&status=1`).subscribe({
      next:res=>{
        if(!res.error){
          res.data.list.map((tel:any)=>{
            tel.tel_id = `${tel.id}`
            tel.id = `${tel.name}`
            tel.name = `${tel.name} (${tel.region_name})`
            return tel
          })
          this.telcoms = res.data.list       
        }
      }
    })
  }

  // Convert date to format YYYY-MM-DD
  convertDateFormat(rawDate:any) {
    let curr_dt = new Date(rawDate)
    let convertedDate = curr_dt.getFullYear() + "-" + String(curr_dt.getMonth() + 1).padStart(2, '0') + "-" + String(curr_dt.getDate()).padStart(2, '0');
    return convertedDate;
  }

  onSubmit(){
    console.log(this.f['callback_partner'])
    this.submitted = true;
    if(this.callbackLogsForm.status!=='INVALID'){
      this.isValidForm = true;

      let start_date = this.convertDateFormat(this.f['callback_date_range'].value[0])
      let end_date = this.convertDateFormat(this.f['callback_date_range'].value[1])
      let data = {
        operator:this.f['callback_telcom_region'].value.tel_shortcode,
        region : this.f['callback_telcom_region'].value.region_shortcode,
        masterAggregator : this.f['callback_partner'].value?.name || "",
        start_date,
        end_date
      }
      console.log(data);
      this.filter = data
      this.nextPage(this.lazyLoadEvent);
    }
  }
  
  // try catch finish
  filterOnChange(ev:any, fieldName:string){     
    this.telcomFlag = true
    if(ev.value?.name){
      this.masterAggregator = this.telcoms.filter((ele: any) => ele.name == ev.value.name).flatMap((item:any) => {
        let partnerData = this.telcoms.filter((ele2: any) => ele2.name == ev.value.name).flatMap((item:any) => {
          let patchData = this.patchPartner(item);
          return patchData
        })
        return partnerData
      })         
      this.masterAggregator = [...new Map(this.masterAggregator.map((item:any) => [item.id, item])).values()]
    }else{
      this.masterAggregator = []
    }
  }
  
  patchPartner (data:any){    
    if(data.partner_ids.includes(',')&&data.partner_name.includes(',')){
      let ids = data.partner_ids.split(',');
      let names = data.partner_name.split(',');
      ids = ids.filter((item:any, index:any, array:any) => array.indexOf(item) === index);
      names = names.filter((item:any, index:any, array:any) => array.indexOf(item) === index);
      return ids.map((id:any, index:any) => ({
        id: id.trim(),
        name: names[index].trim()
      }))
    }else{
      let ids = data.partner_ids;
      let names = data.partner_name;
      return { id : ids, name : names}
    }
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
    this.httpService.get(`${this.CMS_API}logs/callbackLog/list?${params}`).subscribe({
      next:res=>{
        console.log(res,"params");
        
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
    queryParmas = {...queryParmas};
    let params = new URLSearchParams(queryParmas);
    this.excelExportService.exportToExcel(`${this.CMS_API}logs/callbackLog/export_callback_logs?${params}`).subscribe((excelData) => {
      const blob = new Blob([excelData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      let date = this.datePipe.transform(new Date(), "yyyy-MM-dd")
      a.download = `callback-logs-report-${this.filter.operator}-${this.filter.region}-${date}.xlsx`;
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
    callbackLogs.type = 'CALLBACK_LOG';
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
}

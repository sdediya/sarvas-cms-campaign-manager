import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { MessageService} from 'primeng/api';
import { HttpService } from 'src/app/services/http/http.service';
import { ExcelExportService } from 'src/app/services/excelExport/excel-export.service';
import { CrudService } from 'src/app/services/common/crud.service';
import { Router } from '@angular/router';
import { Table } from 'primeng/table';

@Component({
    selector: 'app-service-api-logs',
    templateUrl: './service-api-logs.component.html',
    styleUrls: ['./service-api-logs.component.css'],
    standalone: false
})
export class ServiceApiLogsComponent implements OnInit{

  read:boolean = false
	write:boolean = false
	delete:boolean = false

  CMS_API = environment.CMS_API;

  serviceAPILogsForm: any = FormGroup;
  submitted : boolean = false;
  isValidForm : boolean = false;

  maxDate:any;

  telcoms = []
  partners = []

  logs: any = [];
  cols: any =[];
  totalRecords: number = 0;
  lazyLoadEvent:any;
  loading: boolean = false;
  log_fields : any = {
    start_date:null,
    end_date:null,
    log_operator: null,
    telcom: null
  }

  masterAggregator:any = [];
  services:any = []

  selectedTelcom:any = {}

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

    this.serviceAPILogsForm = frmbuilder.group({
      log_date_range: ['', [Validators.required]],
      log_telcom: ['',[Validators.required]],
      master_aggregator: ['',[]],
      log_partner : ['']
    });
  }

  ngOnInit(): void {
    this.getTelcomData()
    this.maxDate = new Date()
    
    this.f['log_telcom'].valueChanges.subscribe((value:any) => {
      if (value) {
        let telData:any = this.telcoms.find((e:any) => e.tel_id == value);
        this.selectedTelcom = telData;
        this.masterAggregator = telData.master_aggregator
        this.services = telData.services
      }
      
      this.f['master_aggregator'].reset();
    });

    this.f['master_aggregator'].valueChanges.subscribe((value:any) => {
      if (value) {
        this.services = this.selectedTelcom.services.filter((e:any) => e.maggregator_id == value);
      }
    });

  }

  // convenience getter for easy access to form fields
  get f() { return this.serviceAPILogsForm.controls; }

  // Convert date to format YYYY-MM-DD
  convertDateFormat(rawDate:any) {
    let curr_dt = new Date(rawDate)
    let convertedDate = curr_dt.getFullYear() + "-" + String(curr_dt.getMonth() + 1).padStart(2, '0') + "-" + String(curr_dt.getDate()).padStart(2, '0');
    return convertedDate;
  }

  getTelcomData(){
    this.httpService.get(`${this.CMS_API}reports/mis/mis-data`).subscribe({
      next:res=>{
        if(!res.error){


          this.telcoms = res.data.telecoms.map((tel:any)=>{
            tel.name = `${tel.tel_name}`
            tel.tel_id = `${tel.tel_id}`
            tel.campaigns = res.data.campaigns.filter((e:any)=>e.telecom_id==tel.id)
            return tel
          })
          this.partners = res.data.ad_platforms
        }
      },
      error:err=>{
        console.log(err)
      }
    })

  }

  nextPage(event: any){
    this.submitted = true;
    if(this.serviceAPILogsForm.status!=='INVALID'){
      this.loading = true;
      this.lazyLoadEvent = event
      let limit = event?.rows || 50;
      let page = event?.first? (event?.first / limit) + 1 : 1;
      this.log_fields['limit'] = limit
      this.log_fields['page'] = page
      this.log_fields['msisdn'] = event?.globalFilter
      this.isValidForm = true;
      this.httpService.post(`${this.CMS_API}logs/service-api-logs`, this.log_fields).subscribe({
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
      });

    }
    return false;
  }

  downloadExcel() {
    if(this.serviceAPILogsForm.status!=='INVALID'){
      this.isValidForm = true;
      let start_date = this.convertDateFormat(this.f['log_date_range'].value[0])
      let end_date = this.convertDateFormat(this.f['log_date_range'].value[1])
      let telecom = this.telcoms.filter((e:any)=>e.id==this.f['log_telcom'].value)[0]
      let data = {
        ...this.log_fields,
        download_excel:true
      }
      this.excelExportService.exportToExcelPost(`${this.CMS_API}logs/download-service-api-logs`, data).subscribe((excelData) =>{
        const blob = new Blob([excelData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `serviceApiLogs-${telecom['name']}${start_date}_${end_date}.xlsx`;
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
    let telecom:any = this.telcoms.filter((e:any)=>e.id==this.f['log_telcom'].value)[0]
    let partnerId = this.f['log_partner'].value;
    let telcomServices = telecom.services;
    if(start_date && end_date && telecom){

      if(this.f['master_aggregator'].value) {
        telcomServices = telecom.services.filter((e:any)=> e.maggregator_id == this.f['master_aggregator'].value)
        telecom.selectedMasterAggregator = telecom.master_aggregator.find((e:any)=> e.maggregator_id == this.f['master_aggregator'].value);
        telecom.selectedServices = telcomServices
      }

      let serviceIds = telcomServices.map((e:any)=> e.service_id);
      let campaigns = telecom.campaigns.filter((e:any)=> serviceIds.includes(e.service_id)).map((e:any)=> e.id)

      this.log_fields = {
        start_date,
        end_date,
        log_operator: telecom['id'],
        telecom: {...telecom,campaigns},
        partner_id: partnerId
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
    const payload = { ...logs, type: 'SERVICE_API_LOG' };
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

}

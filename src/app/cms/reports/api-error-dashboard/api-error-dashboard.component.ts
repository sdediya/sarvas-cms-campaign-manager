import { DatePipe, formatDate } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ExcelExportService } from 'src/app/services/excelExport/excel-export.service';
import { HttpService } from 'src/app/services/http/http.service';
import { environment } from 'src/environments/environment';
import { MessageService } from '@openng/optimus-ui/api';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';

@Component({
    selector: 'app-api-error-dashboard',
    templateUrl: './api-error-dashboard.component.html',
    styleUrls: ['./api-error-dashboard.component.css'],
    standalone: false
})
export class ApiErrorDashboardComponent {

  advertising_platforms: any = [];
  telecoms = []
  submitted: boolean = false;
  isValidForm: boolean = false;
  totalTableRecords: number = 0;
  loading: boolean = false;
  lazyLoadEvent: any;
  CMS_API = environment.CMS_API
  filter: any = { 'invalidpin':null,'uniqueMsisdn':null,'service': null, 'type': null, 'operator': null, 'region': null, 'cron_start_date': null, 'cron_end_date': null, 'status': null }
  total_records: any;
  total_pages: any;
  campaignData: any;
  misData: any = {};
  maxDate: Date = new Date();

  apierrorForm: any = FormGroup;
  reports: any = [];
  cols: any = [];
  services = [];
  footerData: any = {};
  success_average: any = {};
  generate_otp_errors: any = [];
  validate_otp_errors: any = [];
  uniqueMsisdn = [
    { name: 'Yes', code: '1' },
    { name: 'No', code: '0' }
  ]
  invalidpin = [
    { name: 'Yes', code: 'Invalid OTP' },
    { name: 'No', code: '' }
  ]


  constructor(private httpService: HttpService, private http: HttpClient, private datePipe: DatePipe,
    private excelExportService: ExcelExportService, private frmbuilder: FormBuilder, private messageService: MessageService,) {
    this.apierrorForm = frmbuilder.group({
      ip_date_range: ['', [Validators.required]],
      operator: ['', [Validators.required]],
      ad_partner: [''],
      campaign: [''],
      service: [''],
      uniqueMsisdn: [''],
      invalidpin: [''],
    });
  }


  // convenience getter for easy access to form fields
  get f() { return this.apierrorForm.controls; }

  ngOnInit() {
    this.getMisData();
  }

  getMisData() {
    this.httpService.get(`${this.CMS_API}reports/mis/mis-data`).subscribe({
      next: res => {
        if (!res.error) {
          this.misData = res.data;
          //this.campaignData = res.data.campaigns;
          res.data.telecoms.map((tel: any) => {
            tel.name = `${tel.name} (${tel.region_name})`
            return tel
          })
          this.telecoms = res.data.telecoms
          this.services= res.data.services.filter((item:any, index:any, self:any) => index === self.findIndex((t:any) => (t.id === item.id)));
          this.advertising_platforms = res.data.ad_platforms
        }
      },
      error: err => {
        this.messageService.add({ severity: 'error', summary: 'Failed', detail: err });
      }
    })
  }

  convertDateFormat(rawDate: any) {
    let curr_dt = new Date(rawDate)
    let convertedDate = curr_dt.getFullYear() + "-" + String(curr_dt.getMonth() + 1).padStart(2, '0') + "-" + String(curr_dt.getDate()).padStart(2, '0');
    return convertedDate;
  }


  onSubmit() {
    this.submitted = true;
    let start_date = this.convertDateFormat(this.f['ip_date_range'].value[0])
    let end_date = this.convertDateFormat(this.f['ip_date_range'].value[1])
    let campaigns=this.campaignData;
    delete (this.apierrorForm.value['ip_date_range']);
    let data = {
      ...this.apierrorForm.value,
      start_date,
      end_date,
      campaigns:campaigns.map((cam: any) => cam.id)
    }
    
    if(this.apierrorForm.status!=='INVALID'){
      this.httpService.post(`${this.CMS_API}reports/api-error-dashboard/report`, data).subscribe({
       next:res=>{
         if(!res.error){
           let loaded=true
           this.cols = res.data.headers;
           this.reports = res.data.rows;
           this.footerData = res.data.footer;
           this.success_average=res.data.success_average;
           this.submitted = true;
         }
         else{
          this.reports = '';
          this.messageService.add({ severity: 'error', summary: 'Failed', detail: res.message });
         }
       },
       error:err=>{
        this.reports = '';
        this.messageService.add({ severity: 'error', summary: 'Failed', detail: err.error.message });
         //console.log(err)
       }
     });
    }
    return false;
 }

  async parseErrorBlob(err: HttpErrorResponse): Promise<string> {
    return err.error.text();
  }

  downloadExcel(): void {
    let start_date = this.convertDateFormat(this.f['ip_date_range'].value[0])
    let end_date = this.convertDateFormat(this.f['ip_date_range'].value[1])
    let campaigns=this.campaignData;
    delete (this.apierrorForm.value['ip_date_range']);
    let data = {
      ...this.apierrorForm.value,
      start_date,
      end_date,
      campaigns:campaigns.map((cam: any) => cam.id)
    }
    let operator_name: any = this.telecoms.filter((v: any) => v.id == this.f['operator'].value)[0];
    this.excelExportService.exportToExcelPost(`${this.CMS_API}reports/api-error-dashboard/export`, data).pipe(catchError(this.parseErrorBlob)).subscribe((excelData) => {

      if (excelData instanceof Blob) {
        const blob = new Blob([excelData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        let date = this.datePipe.transform(new Date(), "yyyy-MM-dd")
        a.download = `${operator_name.name}-api-error-reports-${data.start_date}_${data.end_date}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        let error = JSON.parse(excelData);

        this.messageService.add({ severity: 'error', summary: 'Failed', detail: error.message });
      }
    });

  }

  dropdownOnChange() {
    let finalValues: any = [];
    let ad_partner = this.apierrorForm.get('ad_partner')?.value;
    let service = this.apierrorForm.get('service')?.value;
    let operator = this.apierrorForm.get('operator')?.value;
    
    this.misData.campaigns.forEach((cam: any) => {
      let meetsCondition = true;
    
      if (operator !== null && operator !== '') {
        meetsCondition = meetsCondition && (operator == cam.telecom_id);
      }
    
      if (ad_partner !== null && ad_partner !== '') {
        meetsCondition = meetsCondition && (ad_partner == cam.platform_id);
      }
    
      if (service !== null && service !== '') {
        meetsCondition = meetsCondition && (service == cam.service_id);
      }
    
      if (meetsCondition && operator !== null && operator !== '' && cam.type == 'service') {
        finalValues.push(cam);
      }
    });
    
    this.campaignData = finalValues;
  }
}

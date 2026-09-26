import { DatePipe, formatDate } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { error, json } from '@rxweb/reactive-form-validators';
import { Table } from '@openng/optimus-ui/table';
import { ExcelExportService } from 'src/app/services/excelExport/excel-export.service';
import { HttpService } from 'src/app/services/http/http.service';
import { environment } from 'src/environments/environment';
import { MessageService } from '@openng/optimus-ui/api';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';

@Component({
    selector: 'app-ip-report',
    templateUrl: './ip-report.component.html',
    styleUrls: ['./ip-report.component.css'],
    standalone: false
})
export class IpReportComponent {

  advertising_platforms: any = [];
  telecoms = []
  submitted: boolean = false;
  isValidForm: boolean = false;
  totalTableRecords: number = 0;
  loading: boolean = false;
  lazyLoadEvent: any;
  CMS_API = environment.CMS_API
  filter: any = { 'is_msisdn': null, 'type': null, 'operator': null, 'region': null, 'cron_start_date': null, 'cron_end_date': null, 'status': null }
  total_records: any;
  total_pages: any;
  campaignData: any;
  misData: any = {};

  ipForm: any = FormGroup;
  reports: any = [];
  cols: any = [];

  msisdns = [
    { name: 'wifi', code: '1' },
    { name: 'no wifi', code: '0' }
  ]


  constructor(private httpService: HttpService, private http: HttpClient, private datePipe: DatePipe,
    private excelExportService: ExcelExportService, private frmbuilder: FormBuilder, private messageService: MessageService,) {
    this.ipForm = frmbuilder.group({
      ip_date_range: ['', [Validators.required]],
      operator: ['', [Validators.required]],
      ad_partner: [''],
      campaign: [''],
      is_msisdn: [''],
    });
  }


  // convenience getter for easy access to form fields
  get f() { return this.ipForm.controls; }

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
    //let operator = this.f['operator'].valuea
    //this.filter.operator = operator?operator:null;
    this.submitted = true;
    if (this.f['ip_date_range'].value) {
      this.filter.cron_start_date = this.convertDateFormat(this.f['ip_date_range'].value[0])
      this.filter.cron_end_date = this.convertDateFormat(this.f['ip_date_range'].value[1])
    }
    if (this.ipForm.status !== 'INVALID') {
      this.isValidForm = true;
      this.exportToExcel();
    }
  }


  nextPage(event: any) {
    this.lazyLoadEvent = event;
    let limit: any;
    let page: any;
    this.cols = [];
    this.reports = [];
    this.total_records = [];
    this.total_pages = [];
    if (typeof event !== 'undefined') {
      limit = event.rows;
      page = event.first ? (event.first / limit) + 1 : 1;
    } else {
      limit = 10;
      page = 1;
    }
    let start_date = this.convertDateFormat(this.f['ip_date_range'].value[0])
    let end_date = this.convertDateFormat(this.f['ip_date_range'].value[1])
    delete (this.ipForm.value['ip_date_range']);
    let data = {
      ...this.ipForm.value,
      start_date,
      end_date,
      limit,
      page
    }

    this.httpService.post(`${this.CMS_API}reports/ip/export`, data).subscribe({
      next: res => {

        if (!res.error) {
          this.cols = res.data.headers;
          this.reports = res.data.list;
          this.total_records = res.data.pagination.total_records;
          this.total_pages = res.data.pagination.total_pages;
        }
        else {
          this.messageService.add({ severity: 'error', summary: 'Failed', detail: res.message });
        }

      },
      error: error => {
        this.messageService.add({ severity: 'error', summary: 'Failed', detail: error.error.message });
      }
    })
  }

  async parseErrorBlob(err: HttpErrorResponse): Promise<string> {

    return err.error.text();
  }




  exportToExcel(): void {
    let start_date = this.convertDateFormat(this.f['ip_date_range'].value[0])
    let end_date = this.convertDateFormat(this.f['ip_date_range'].value[1])
    delete (this.ipForm.value['ip_date_range']);
    let operator_name: any = this.telecoms.filter((v: any) => v.id == this.ipForm.get('operator').value)[0];
    let campaign_name: any = this.campaignData.filter((v: any) => v.id == this.ipForm.get('campaign').value)[0];
    let ad_partner_name: any = this.advertising_platforms.filter((v: any) => v.id == this.ipForm.get('ad_partner').value)[0];
    let data = {
      ...this.ipForm.value,
      start_date,
      end_date,
    }


    this.excelExportService.exportToExcelPost(`${this.CMS_API}reports/ip/export`, data).pipe(catchError(this.parseErrorBlob)).subscribe((excelData) => {

      if (excelData instanceof Blob) {
        const blob = new Blob([excelData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        let date = this.datePipe.transform(new Date(), "yyyy-MM-dd")
        a.download = `${operator_name.name}-ip-reports-${start_date}_${end_date}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        let error = JSON.parse(excelData);

        this.messageService.add({ severity: 'error', summary: 'Failed', detail: error.message });
      }
    });

  }

  dropdownOnChange(ev: any, fieldName: string) {
    let selectedId = ev.value;
    let finalValues: any = [];
    if (fieldName == 'operator') {
      this.campaignData = [];
      this.ipForm.get('campaign').reset();
      this.misData.campaigns.map((cam: any) => selectedId == cam.telecom_id ? finalValues.push(cam) : '')
      this.campaignData = finalValues;

    }
  }

}

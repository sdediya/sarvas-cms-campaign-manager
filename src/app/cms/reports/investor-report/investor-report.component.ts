import { DatePipe, formatDate } from '@angular/common';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { error, json } from '@rxweb/reactive-form-validators';
import { SortEvent } from 'primeng/api';
import { Table } from 'primeng/table';
import { ExcelExportService } from 'src/app/services/excelExport/excel-export.service';
import { HttpService } from 'src/app/services/http/http.service';
import { environment } from 'src/environments/environment';
import { MessageService } from 'primeng/api';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';

@Component({
    selector: 'app-investor-report',
    templateUrl: './investor-report.component.html',
    styleUrls: ['./investor-report.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class InvestorReportComponent {

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
  footerRow: any = null;

  years = [
    { label: '2026', value: 2026 }
  ];

  reportTypes = [
    { label: 'Summary', value: 'summary' },
    { label: 'Details', value: 'details' }
  ]


  constructor(private httpService: HttpService, private http: HttpClient, private datePipe: DatePipe,
    private excelExportService: ExcelExportService, private frmbuilder: FormBuilder, private messageService: MessageService,) {
    this.ipForm = frmbuilder.group({
      year: [2026, [Validators.required]],
      service: ['Legacy'],
      reportType: ['summary', [Validators.required]],
    });
  }


  // convenience getter for easy access to form fields
  get f() { return this.ipForm.controls; }

  ngOnInit() {
    // Load data only after year & service are selected and form is submitted
  }

  getMisData(year?: number, service?: string, reportType?: string) {
    const body: any = {};
    if (typeof year !== 'undefined' && year !== null) body.year = year;
    if (typeof service !== 'undefined' && service !== null) body.service = service;
    if (typeof reportType !== 'undefined' && reportType !== null) body.report_type = reportType;

    this.httpService.post(`${this.CMS_API}reports/investordata/report`, body).subscribe({
      next: res => {
        if (!res.error) {
          this.misData = res.data;
          this.reports = [];
          this.cols = [];
          this.footerRow = null;

          const data: any = res.data ?? {};
          const headers = data.headers ?? data.table_headers ?? data.columns ?? null;
          const list = data.list ?? data.rows ?? data.data ?? data.items ?? null;
          this.footerRow = data.footer ?? data.totals ?? data.summary ?? null;

          const normalizeCols = (rawHeaders: any, rows: any[]): any[] => {
            if (!Array.isArray(rawHeaders)) {
              const firstRow = rows?.[0] ?? {};
              return Object.keys(firstRow).map((k) => ({ header: k, key: k }));
            }

            // If headers are strings: ["Date","Service",...]
            if (rawHeaders.every((h: any) => typeof h === 'string')) {
              const firstRow = rows?.[0] ?? {};
              const keys = Object.keys(firstRow);
              return (rawHeaders as string[]).map((h, idx) => ({
                header: h,
                key: keys[idx] ?? h
              }));
            }

            // If headers are objects: pick common property names
            return rawHeaders.map((h: any) => ({
              header: h?.header ?? h?.label ?? h?.title ?? h?.name ?? h?.key ?? h?.field ?? '',
              key: h?.key ?? h?.field ?? h?.colKey ?? h?.name ?? h?.header ?? ''
            }));
          };

          if (Array.isArray(list)) {
            this.reports = list;
            this.cols = normalizeCols(headers, list);
          }

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
    this.submitted = true;
    if (this.ipForm.invalid) {
      return;
    }
    const year = this.ipForm.get('year')?.value;
    const service = this.ipForm.get('service')?.value;
    const reportType = this.ipForm.get('reportType')?.value;

    if (reportType === 'details') {
      this.reports = [];
      this.cols = [];
      this.isValidForm = false;
      this.exportToExcel(true);
      return;
    }

    this.isValidForm = true;
    this.getMisData(year, service, reportType);
    
  }

  onExport(isDetailReport: boolean = false) {
    this.submitted = true;
    if (this.ipForm.invalid) {
      return;
    }
    this.isValidForm = true;
    this.exportToExcel(isDetailReport);
  }

  customSort(event: SortEvent) {
    const field = event.field as string;
    const order = event.order ?? 1;
    if (!field || !Array.isArray(this.reports) || this.reports.length <= 1) return;

    const pinnedLastRow = this.reports[this.reports.length - 1];
    const rowsToSort = [...this.reports.slice(0, -1)];

    rowsToSort.sort((a: any, b: any) => {
      const value1 = a?.[field];
      const value2 = b?.[field];

      if (value1 == null && value2 != null) return -1 * order;
      if (value1 != null && value2 == null) return 1 * order;
      if (value1 == null && value2 == null) return 0;

      if (typeof value1 === 'string' && typeof value2 === 'string') {
        return value1.localeCompare(value2) * order;
      }

      if (value1 < value2) return -1 * order;
      if (value1 > value2) return 1 * order;
      return 0;
    });

    this.reports = [...rowsToSort, pinnedLastRow];
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
    const data = {
      ...this.ipForm.value,
      limit,
      page
    };
  
  }

  async parseErrorBlob(err: HttpErrorResponse): Promise<string> {

    return err.error.text();
  }




  exportToExcel(isDetailReport: boolean = false): void {
    const reportType = isDetailReport ? 'details' : this.ipForm.get('reportType')?.value;
    const data = { ...this.ipForm.value, reportType, report_type: reportType, download_excel: true };
    const year = this.ipForm.get('year')?.value;
    const service = this.ipForm.get('service')?.value;


    this.excelExportService.exportToExcelPost(`${this.CMS_API}reports/investordata/report`, data).pipe(catchError(this.parseErrorBlob)).subscribe((excelData) => {

      if (excelData instanceof Blob) {
        const blob = new Blob([excelData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = reportType === 'details'
          ? `investor-report-detail-${service}-${year}.xlsx`
          : `investor-report-${service}-${year}.xlsx`;
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

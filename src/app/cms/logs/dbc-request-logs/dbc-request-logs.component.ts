import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { MessageService } from '@openng/optimus-ui/api';
import { HttpService } from 'src/app/services/http/http.service';
import { ExcelExportService } from 'src/app/services/excelExport/excel-export.service';
import { CrudService } from 'src/app/services/common/crud.service';
import { Router } from '@angular/router';
import { Table } from '@openng/optimus-ui/table';

@Component({
    selector: 'app-dbc-request-logs',
    templateUrl: './dbc-request-logs.component.html',
    styleUrls: ['./dbc-request-logs.component.css'],
    standalone: false
})
export class DbcRequestLogsComponent implements OnInit {

  read: boolean = false;
  write: boolean = false;
  delete: boolean = false;

  CMS_API = environment.CMS_API;

  dbcRequestLogsForm: FormGroup;
  submitted = false;
  isValidForm = false;

  maxDate: any;

  logs: any[] = [];
  totalRecords: number = 0;
  lazyLoadEvent: any;
  loading = false;

  log_fields: any = {
    start_date: null,
    end_date: null,
  };

  clients: any[] = [];
  services: any[] = [];
  plans: any[] = [];
  typeOptions: any[] = [];
  statusOptions: any[] = [];

  constructor(
    private frmbuilder: FormBuilder,
    private httpService: HttpService,
    private messageService: MessageService,
    private excelExportService: ExcelExportService,
    private crudService: CrudService,
    private router: Router
  ) {
    const permissions = this.crudService.hasPermission('logs');
    this.read = permissions.read;
    this.write = permissions.write;
    this.delete = permissions.delete;
    if (!this.read) {
      this.router.navigate(['no-access']);
    }

    this.dbcRequestLogsForm = this.frmbuilder.group({
      log_date_range: ['', [Validators.required]],
      client_id: [null,[Validators.required]],
      service_id: [null],
      plan_id: [null],
      transaction_id: [''],
      type: [null],
      status: [null],
      response_code: [''],
    });
  }

  ngOnInit(): void {
    this.maxDate = new Date();
    this.loadDbcFilters();

    this.f['client_id'].valueChanges.subscribe((clientId: string) => {
      this.f['service_id'].reset();
      this.f['plan_id'].reset();
      this.services = [];
      this.plans = [];
      if (clientId) {
        const client = this.clients.find((c: any) => c.id === clientId);
        this.services = client?.services || [];
      }
    });

    this.f['service_id'].valueChanges.subscribe((serviceId: string) => {
      this.f['plan_id'].reset();
      this.plans = [];
      if (serviceId) {
        const service = this.services.find((s: any) => s.id === serviceId);
        this.plans = service?.plans || [];
      }
    });
  }

  loadDbcFilters(): void {
    this.httpService.get(`${this.CMS_API}logs/dbc-request-logs-filters`).subscribe({
      next: res => {
        if (!res.error) {
          this.clients = res.data.clients || [];
          this.services = res.data.services || [];
          this.plans = res.data.plans || [];
          this.typeOptions = res.data.types || [];
          this.statusOptions = res.data.status || [];
        }
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Failed', detail: 'Could not load filter options' });
      }
    });
  }

  getServiceNameById(serviceId: string): string {
    console.log(this.services,serviceId);
    const service = this.services.find((s: any) => s.id === serviceId);
    return service?.service_name || '';
  }

  getPlanNameById(serviceId: string, planId: string): string {
    console.log(this.plans,planId);
    let service = this.services.find((s: any) => s.id === serviceId);
    const plan = service.plans.find((p: any) => p.id === planId);
    return plan?.plan_name || '';
  }

  get f() { return this.dbcRequestLogsForm.controls; }

  convertDateFormat(rawDate: Date): string {
    const curr_dt = new Date(rawDate);
    return curr_dt.getFullYear() + '-' + String(curr_dt.getMonth() + 1).padStart(2, '0') + '-' + String(curr_dt.getDate()).padStart(2, '0');
  }

  onSubmit(): void {
    this.submitted = true;
    const dateRange = this.f['log_date_range'].value;
    if (!dateRange || !dateRange[0] || !dateRange[1]) {
      return;
    }

    const start_date = this.convertDateFormat(dateRange[0]);
    const end_date = this.convertDateFormat(dateRange[1]);

    this.log_fields = {
      start_date,
      end_date,
      client_id: this.f['client_id'].value || undefined,
      plan_id: this.f['plan_id'].value || undefined,
      service_id: this.f['service_id'].value || undefined,
      transaction_id: this.f['transaction_id'].value || undefined,
      type: this.f['type'].value || undefined,
      status: this.f['status'].value || undefined,
      response_code: this.f['response_code'].value || undefined,
    };

    this.nextPage(this.lazyLoadEvent);
  }

  nextPage(event: any): boolean {
    this.submitted = true;
    if (this.dbcRequestLogsForm.status !== 'INVALID') {
      this.loading = true;
      this.lazyLoadEvent = event;
      const limit = event?.rows || 50;
      const page = event?.first ? (event.first / limit) + 1 : 1;
      this.log_fields['limit'] = limit;
      this.log_fields['page'] = page;
      this.log_fields['msisdn'] = event?.globalFilter || undefined;

      this.isValidForm = true;
      this.httpService.post(`${this.CMS_API}logs/dbc-request-logs`, this.log_fields).subscribe({
        next: res => {
          if (!res.error) {
            this.logs = res.data.rows.map((log: any) => ({
              ...log,
              showFull: false,
            }));
            this.totalRecords = res.data.pagination.total_records;
          } else {
            this.messageService.add({ severity: 'error', summary: 'Failed', detail: res.message });
          }
          this.loading = false;
        },
        error: err => {
          this.loading = false;
          this.messageService.add({ severity: 'error', summary: 'Failed', detail: err.error?.message || 'Request failed' });
        }
      });
    }
    return false;
  }

  downloadExcel(): void {
    if (this.dbcRequestLogsForm.status !== 'INVALID') {
      const dateRange = this.f['log_date_range'].value;
      const start_date = this.convertDateFormat(dateRange[0]);
      const end_date = this.convertDateFormat(dateRange[1]);
      const data = {
        ...this.log_fields,
        download_excel: true,
      };

      this.excelExportService.exportToExcelPost(`${this.CMS_API}logs/download-dbc-request-logs`, data).subscribe(excelData => {
        const blob = new Blob([excelData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `DbcRequestLogs-${start_date}_${end_date}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      });
    }
  }

  onGlobalFilter(table: Table, event: Event): void {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  getMaskedRequestBody(requestBody: string, msisdn: string): string {
    if (!requestBody) return '';
    if (!msisdn || msisdn.length <= 6) return requestBody;

    const masked = msisdn.replace(/\d(?=\d{4})/g, 'X');
    const escapedMsisdn = msisdn.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const safeRequest = typeof requestBody === 'string' ? requestBody : JSON.stringify(requestBody);

    return safeRequest.replace(new RegExp(escapedMsisdn, 'g'), masked);
  }

  showMsisdn(log: any): void {
    log.showFull = !log.showFull;
    const payload = { ...log, type: 'DBC_REQUEST_LOG' };
    this.httpService.post(`${this.CMS_API}user/userMsisdnMaskingLogs`, payload).subscribe({
      error: () => {},
    });
  }
}

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { CrudService } from 'src/app/services/common/crud.service';
import { ExcelExportService } from 'src/app/services/excelExport/excel-export.service';
import { HttpService } from 'src/app/services/http/http.service';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-target-vs-achievement-drr',
    templateUrl: './target-vs-achievement-drr.component.html',
    styleUrls: ['./target-vs-achievement-drr.component.css'],
    standalone: false
})
export class TargetVsAchievementDrrComponent implements OnInit {
  read = false;
  write = false;
  delete = false;

  CMS_API = environment.CMS_API;

  reportForm: FormGroup;
  submitted = false;
  isValidForm = false;

  maxDate: Date = new Date();

  services: any[] = [];
  managers: any[] = [];

  reports: any[] = [];
  footerData: any = {};
  cols: any[] = [];

  constructor(
    private frmbuilder: FormBuilder,
    private httpService: HttpService,
    private messageService: MessageService,
    private excelExportService: ExcelExportService,
    private crudService: CrudService,
    private router: Router
  ) {
    const permissions = this.crudService.hasPermission('reports');
    this.read = permissions.read;
    this.write = permissions.write;
    this.delete = permissions.delete;
    if (!this.read) {
      this.router.navigate(['no-access']);
    }

    this.reportForm = this.frmbuilder.group({
      report_date: [new Date(), [Validators.required]],
      service_id: [null],
      manager_id: [null]
    });
  }

  ngOnInit(): void {
    this.maxDate = new Date();
    this.loadFilterData();
  }

  get f() {
    return this.reportForm.controls;
  }

  getCellStyle(col: any, rowIndex: number): Record<string, string> {
    const style = { ...(col?.style || {}) };
    if (rowIndex === 0) {
      style['font-weight'] = 'bold';
      style['background-color'] = '#e9ecef';
    }
    return style;
  }

  convertMonthFormat(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }

  buildReportPayload(type: number, downloadExcel = false): Record<string, any> {
    const payload: Record<string, any> = {
      report_date: this.convertMonthFormat(this.f['report_date'].value),
      service_id: this.f['service_id'].value ?? null,
      manager_id: this.f['manager_id'].value ?? null,
      type
    };
    if (downloadExcel) {
      payload['download_excel'] = true;
    }
    return payload;
  }

  loadFilterData(): void {
    this.httpService.get(`${this.CMS_API}reports/target-vs-achievement/filters`).subscribe({
      next: (res) => {
        if (!res.error) {
          const serviceList = res.data?.services ?? [];
          const managerList = res.data?.managers ?? [];
          this.services = [
            { service_name: 'All', service_id: null },
            ...serviceList
          ];
          this.managers = managerList;
        } else {
          this.messageService.add({ severity: 'error', summary: 'Failed', detail: res.message });
        }
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Failed', detail: 'Unable to load filter data' });
      }
    });
  }

  onSearch(): void {
    this.submitted = true;
    if (this.reportForm.invalid) {
      return;
    }

    this.isValidForm = true;
    const data = this.buildReportPayload(0);
    let queryParams = new URLSearchParams(data);

    this.httpService.get(`${this.CMS_API}reports/target-vs-achievement/drr?${queryParams.toString()}`).subscribe({
      next: (res) => {
        if (!res.error) {
          this.cols = res.data?.headers ?? [];
          this.reports = res.data?.rows ?? [];
          this.footerData = res.data?.footer ?? {};

          if (this.reports.length === 0) {
            this.messageService.add({ severity: 'warn', summary: 'No data', detail: 'No data found for the selected filters' });
          }
        } else {
          this.cols = [];
          this.reports = [];
          this.footerData = {};
          this.messageService.add({ severity: 'error', summary: 'Failed', detail: res.message });
        }
      },
      error: () => {
        this.cols = [];
        this.reports = [];
        this.footerData = {};
        this.messageService.add({ severity: 'error', summary: 'Failed', detail: 'Unable to load report data' });
      }
    });
  }

  onReset(): void {
    this.reportForm.reset({
      report_date: new Date(),
      service_id: null,
      manager_id: null
    });
    this.submitted = false;
    this.isValidForm = false;
    this.cols = [];
    this.reports = [];
    this.footerData = {};
  }

  downloadExcel(): void {
    this.submitted = true;
    if (this.reportForm.invalid) {
      return;
    }

    const data = this.buildReportPayload(1, true);
    const fileName = this.buildExportFileName(data);

    const queryParams = new URLSearchParams(data);

    this.excelExportService.exportToExcel(`${this.CMS_API}reports/target-vs-achievement/drr?${queryParams.toString()}`).subscribe({
      next: (excelData) => {
        const blob = new Blob([excelData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fileName}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Failed', detail: 'Unable to export report' });
      }
    });
  }

  private buildExportFileName(data: Record<string, any>): string {
    let fileName = `target-vs-achievement-drr-${data['report_date']}`;

    if (data['service_id'] != null) {
      const service = this.services.find((s) => s.service_id === data['service_id']);
      if (service?.service_name) {
        fileName += `-${service.service_name.toLowerCase().replace(/\s+/g, '-')}`;
      }
    }

    if (data['manager_id'] != null) {
      const manager = this.managers.find((m) => m.manager_id === data['manager_id']);
      if (manager?.manager_name) {
        fileName += `-${manager.manager_name.toLowerCase().replace(/\s+/g, '-')}`;
      }
    }

    return fileName;
  }
}

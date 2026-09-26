import { DatePipe, formatDate } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ExcelExportService } from 'src/app/services/excelExport/excel-export.service';
import { HttpService } from 'src/app/services/http/http.service';
import { environment } from 'src/environments/environment';
import { MessageService } from 'primeng/api';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, debounceTime } from 'rxjs';

@Component({
    selector: 'app-msisdnwise-report',
    templateUrl: './msisdnwise-report.component.html',
    styleUrls: ['./msisdnwise-report.component.css'],
    standalone: false
})
export class MsisdnwiseReportComponent {
  telecoms = []
  submitted: boolean = false;
  isValidForm: boolean = false;
  CMS_API = environment.CMS_API
  misData: any = {};
  maxDate:any;

  filter: any = { 'msisdn_date_range': null, 'types': null, 'operator': null}
  msisdnForm: any = FormGroup;
  reports: any = [];
  cols: any = [];

  telcoms = []
  masterAggregator = []
  products = []
  services = []

  types = [
    { name: 'Transaction', code: 'transaction' },
    { name: 'S2S', code: 's2s' },
    { name: 'Churn', code: 'churn' },
    { name: 'Hits', code: 'hits' },
  ]


  constructor(private httpService: HttpService, private http: HttpClient, private datePipe: DatePipe,
    private excelExportService: ExcelExportService, private frmbuilder: FormBuilder, private messageService: MessageService,) {
    this.msisdnForm = frmbuilder.group({
      msisdn_date_range: ['', [Validators.required]],
      operator: ['',[Validators.required]],
      partner_id: ['',[Validators.required]],
      types: ['', [Validators.required]],
    });
    
  }


  // convenience getter for easy access to form fields
  get f() { return this.msisdnForm.controls; }

  ngOnInit() {
    this.maxDate = new Date()
    this.getMisData();

     this.f['operator'].valueChanges.pipe(debounceTime(500)).subscribe((value:any)=>{
      let telData:any = this.telcoms.find((e:any)=> e.tel_id == value);
      this.masterAggregator = telData.master_aggregator
      
      this.f['partner_id'].reset();
      
    });

  }

  getMisData() {
    this.httpService.get(`${this.CMS_API}reports/revenue-data`).subscribe({
      next:res=>{
        if(!res.error){
          this.telcoms = res.data.telecoms
        }
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
    if (this.f['msisdn_date_range'].value) {
      this.filter.cron_start_date = this.convertDateFormat(this.f['msisdn_date_range'].value[0])
      this.filter.cron_end_date = this.convertDateFormat(this.f['msisdn_date_range'].value[1])
    }
    if (this.msisdnForm.status !== 'INVALID') {
      this.isValidForm = true;
      this.exportToExcel();
    }
  }


  async parseErrorBlob(err: HttpErrorResponse): Promise<string> {
    return err.error.text();
  }




  exportToExcel(): void {
    let operator_name: any = this.telcoms.filter((v: any) => v.tel_id == this.msisdnForm.get('operator').value)[0];
    let data = {
      tel_id: this.msisdnForm.value['operator'],
      partner_id: this.msisdnForm.value['partner_id'],
      fromdate: this.convertDateFormat(this.f['msisdn_date_range'].value[0]),
      todate: this.convertDateFormat(this.f['msisdn_date_range'].value[1]),
    }

    this.excelExportService.exportToExcelPost(`${this.CMS_API}reports/msisdnwise/${this.msisdnForm.value['types']}-export`, data).pipe(catchError(this.parseErrorBlob)).subscribe((excelData) => {

      if (excelData instanceof Blob) {
        const blob = new Blob([excelData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        let date = this.datePipe.transform(new Date(), "yyyy-MM-dd")
        a.download = `${operator_name.tel_name}-${this.msisdnForm.value['types']}-reports-${data.fromdate}-${data.todate}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        let error = JSON.parse(excelData);

        this.messageService.add({ severity: 'error', summary: 'Failed', detail: error.message });
      }
    });

  }

}

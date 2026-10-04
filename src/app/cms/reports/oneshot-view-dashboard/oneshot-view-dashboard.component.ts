import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ExcelExportService } from 'src/app/services/excelExport/excel-export.service';
import { HttpService } from 'src/app/services/http/http.service';
import { environment } from 'src/environments/environment';
import { MessageService } from 'primeng/api';
import { HttpErrorResponse } from '@angular/common/http';
import moment from 'moment';

@Component({
    selector: 'oneshot-view-dashboard',
    templateUrl: './oneshot-view-dashboard.component.html',
    styleUrls: ['./oneshot-view-dashboard.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class OneshotViewDashboardComponent {

  telecoms = []
  submitted: boolean = false;
  isValidForm: boolean = false;
  CMS_API = environment.CMS_API
  maxDate: Date = moment().add(-1,'d').toDate();

  oneshotViewDashboardForm: any = FormGroup;
  reports: any = [];
  footerData: any = {};
  cols: any = [];

  constructor(
    private httpService: HttpService,
    private excelExportService: ExcelExportService,
    private frmbuilder: FormBuilder, 
  ) {
    this.oneshotViewDashboardForm = frmbuilder.group({
      date: [this.maxDate, [Validators.required]]
    });
  }


  // convenience getter for easy access to form fields
  get f() { return this.oneshotViewDashboardForm.controls; }

   // Convert date to format YYYY-MM-DD
   convertDateFormat(rawDate:any) {
    let curr_dt = new Date(rawDate)
    let convertedDate = curr_dt.getFullYear() + "-" + String(curr_dt.getMonth() + 1).padStart(2, '0') + "-" + String(curr_dt.getDate()).padStart(2, '0');
    return convertedDate;
  }

  ngOnInit() {
    // this.onClickSubmit();
  }


  onClickSubmit() {
    
    this.submitted = true;
    if(this.oneshotViewDashboardForm.status!=='INVALID'){

      let data = {
        date: this.convertDateFormat(this.f['date'].value)
      }
      
      this.httpService.post(`${this.CMS_API}reports/revenue/oneshot_view`, data).subscribe({
        next:res=>{
          if(!res.error){
            this.cols = res.data.headers;
            this.reports = res.data.rows
            this.footerData = res.data.footer;
            this.submitted = true;
          }
        },
        error:err=>{console.log(err)}
     });
    }
    return false;
 }


  async parseErrorBlob(err: HttpErrorResponse): Promise<string> {
    return err.error.text();
  }

  downloadExcel() {
    let data = {
      date: this.convertDateFormat(this.f['date'].value),
      isExport: true
    }
    this.excelExportService.exportToExcelPost(`${this.CMS_API}reports/revenue/oneshot_view`, data).subscribe((excelData) =>{
      const blob = new Blob([excelData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `revenue-report-oneshot-view-${data.date}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    });
  
}
}

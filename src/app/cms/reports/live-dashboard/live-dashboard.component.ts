import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ExcelExportService } from 'src/app/services/excelExport/excel-export.service';
import { HttpService } from 'src/app/services/http/http.service';
import { environment } from 'src/environments/environment';
import { MessageService } from '@openng/optimus-ui/api';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
    selector: 'app-live-dashboard',
    templateUrl: './live-dashboard.component.html',
    styleUrls: ['./live-dashboard.component.css'],
    standalone: false
})
export class LiveDashboardComponent {

  telecoms = []
  submitted: boolean = false;
  isValidForm: boolean = false;
  CMS_API = environment.CMS_API
  maxDate: Date = new Date();

  liveDashboardReportForm: any = FormGroup;
  reports: any = [];
  footerData: any = {};
  cols: any = [];

  constructor(
    private httpService: HttpService, 
    private excelExportService: ExcelExportService, 
    private frmbuilder: FormBuilder, 
    ) {
    this.liveDashboardReportForm = frmbuilder.group({
      date: [new Date(), [Validators.required]]
    });
  }


  // convenience getter for easy access to form fields
  get f() { return this.liveDashboardReportForm.controls; }

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
    if(this.liveDashboardReportForm.status!=='INVALID'){

      this.httpService.post(`${this.CMS_API}reports/live-dashboard/report`, this.liveDashboardReportForm.value).subscribe({
       next:res=>{
         if(!res.error){
           let loaded=true
           this.cols = res.data.headers;
           this.reports = res.data.rows
           this.footerData = res.data.footer;
           this.submitted = true;
         }
         else{
         }
       },
       error:err=>{
         console.log(err)
       }
     });
    }
    return false;
 }


  async parseErrorBlob(err: HttpErrorResponse): Promise<string> {
    return err.error.text();
  }

  downloadExcel() {
    let date=this.convertDateFormat(this.f['date'].value)
    this.excelExportService.exportToExcelPost(`${this.CMS_API}reports/live-dashboard/export`, this.liveDashboardReportForm.value).subscribe((excelData) =>{
      const blob = new Blob([excelData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `live-dashboard-${date}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    });
  
}
}

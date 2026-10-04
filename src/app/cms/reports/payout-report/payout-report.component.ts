import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';

import { ExcelExportService } from 'src/app/services/excelExport/excel-export.service';
import { HttpService } from 'src/app/services/http/http.service';

@Component({
    selector: 'app-payout-report',
    templateUrl: './payout-report.component.html',
    styleUrls: ['./payout-report.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class PayoutReportComponent {

  CMS_API = environment.CMS_API;
  reports: any = [];  
  footerData: any = {};
  cols: any =[];
  submitted:boolean=false;
  payoutData : any = [];
  
  maxDate:any;
  payouts = []
  selectedTelecom: string="" ;

  
  payoutReportForm: any = FormGroup;


  constructor(
    private frmbuilder:FormBuilder,
    private httpService:HttpService,
    private excelExportService: ExcelExportService,
  ){

    this.payoutReportForm = frmbuilder.group({
      payout_date_range: ['', [Validators.required]]
    });
  }
  ngOnInit() {
    this.maxDate = new Date()
   
  }
  get f() { return this.payoutReportForm.controls; }

  convertDateFormat(rawDate:any) {
    let curr_dt = new Date(rawDate)
    let convertedDate = curr_dt.getFullYear() + "-" + String(curr_dt.getMonth() + 1).padStart(2, '0') + "-" + String(curr_dt.getDate()).padStart(2, '0');
    return convertedDate;
  }

  onClickSubmit() {
    
    this.submitted = true;
    if(this.payoutReportForm.status!=='INVALID'){

      let fromdate = this.convertDateFormat(this.f['payout_date_range'].value[0])
      let todate = this.convertDateFormat(this.f['payout_date_range'].value[1])
     
      let data = { fromdate,todate} 
     
      this.httpService.post(`${this.CMS_API}reports/payout`, data).subscribe({
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

 downloadExcel() {
    //this.isValidForm = true;
    let fromdate = this.convertDateFormat(this.f['payout_date_range'].value[0])
    let todate = this.convertDateFormat(this.f['payout_date_range'].value[1])
    let data = { fromdate,todate, download_excel:true}
    
    this.excelExportService.exportToExcelPost(`${this.CMS_API}reports/payout/export`, data).subscribe((excelData) =>{
      const blob = new Blob([excelData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = "payout-Adpartner-report-"+fromdate+"-"+todate+".xlsx";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    });
  
}

}

import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';

import { ExcelExportService } from 'src/app/services/excelExport/excel-export.service';
import { HttpService } from 'src/app/services/http/http.service';
//import * as FileSaver from 'file-saver';

@Component({
    selector: 'app-drr-report',
    templateUrl: './drr-report.component.html',
    styleUrls: ['./drr-report.component.css'],
    standalone: false
})
export class DrrReportComponent {
  CMS_API = environment.CMS_API;
  reports: any = [];
  footerData: any = {};
  cols: any =[];
  submitted:boolean=false;
  telecomData : any = [];
  
  maxDate:any;
  telcoms = []
  selectedTelecom: string="" ;

  
  drrReportForm: any = FormGroup;


  constructor(
    private frmbuilder:FormBuilder,
    private httpService:HttpService,
    private excelExportService: ExcelExportService,
  ){

    this.drrReportForm = frmbuilder.group({
      drr_date_range: ['', [Validators.required]]
    });
  }
  ngOnInit() {
    this.maxDate = new Date()
  }
  get f() { return this.drrReportForm.controls; }

  convertDateFormat(rawDate:any) {
    let curr_dt = new Date(rawDate)
    let convertedDate = curr_dt.getFullYear() + "-" + String(curr_dt.getMonth() + 1).padStart(2, '0') + "-" + String(curr_dt.getDate()).padStart(2, '0');
    return convertedDate;
  }


  onClickSubmit() {
    
    this.submitted = true;
    if(this.drrReportForm.status!=='INVALID'){

      let fromdate = this.convertDateFormat(this.f['drr_date_range'].value[0])
      let todate = this.convertDateFormat(this.f['drr_date_range'].value[1])
     
      let data = { fromdate,todate} 
     
      this.httpService.post(`${this.CMS_API}reports/drr`, data).subscribe({
       next:res=>{
         if(!res.error){
           this.cols = res.data.headers;
           this.reports = res.data.rows;
           this.footerData = res.data.footer;
           this.submitted = true;
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
    let fromdate = this.convertDateFormat(this.f['drr_date_range'].value[0])
    let todate = this.convertDateFormat(this.f['drr_date_range'].value[1])
    let data = { fromdate,todate}
    
    this.excelExportService.exportToExcelPost(`${this.CMS_API}reports/drr/export-drr`, data).subscribe((excelData) =>{
      const blob = new Blob([excelData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = "drr-report-"+fromdate+"-"+todate+".xlsx";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    });
  
}

}

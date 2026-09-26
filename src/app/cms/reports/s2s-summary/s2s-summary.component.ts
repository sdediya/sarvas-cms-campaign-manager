import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { MessageService } from 'primeng/api';
import { HttpService } from 'src/app/services/http/http.service';
import { ExcelExportService } from 'src/app/services/excelExport/excel-export.service';
import { CrudService } from 'src/app/services/common/crud.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-s2s-summary',
    templateUrl: './s2s-summary.component.html',
    styleUrls: ['./s2s-summary.component.css'],
    standalone: false
})
export class S2sSummaryComponent implements OnInit{
  read:boolean = false
	write:boolean = false
	delete:boolean = false

  CMS_API = environment.CMS_API;

  s2sSummaryReportForm: any = FormGroup;
  submitted : boolean = false;
  isValidForm : boolean = false;

  maxDate:any;

  telcoms = []

  reports: any = [];
  footerData: any = {};
  cols: any =[];

  constructor(
    private frmbuilder:FormBuilder, 
    private httpService:HttpService,
    private messageService: MessageService,
    private excelExportService: ExcelExportService,
    private crudService:CrudService,
    private router:Router
  ){

    let permissions = this.crudService.hasPermission('reports')
    this.read = permissions.read
    this.write = permissions.write
    this.delete = permissions.delete
    if(!this.read){
      this.router.navigate(['no-access'])
    }

    this.s2sSummaryReportForm = frmbuilder.group({
      s2s_date_range: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.maxDate = new Date()
  }

  // convenience getter for easy access to form fields
  get f() { return this.s2sSummaryReportForm.controls; }

  // Convert date to format YYYY-MM-DD
  convertDateFormat(rawDate:any) {
    let curr_dt = new Date(rawDate)
    let convertedDate = curr_dt.getFullYear() + "-" + String(curr_dt.getMonth() + 1).padStart(2, '0') + "-" + String(curr_dt.getDate()).padStart(2, '0');
    return convertedDate;
  }


  onSubmit(){
    this.submitted = true;
    if(this.s2sSummaryReportForm.status!=='INVALID'){
      this.isValidForm = true;
      let Date = this.convertDateFormat(this.f['s2s_date_range'].value)
      let Flag = '1'
      let data = {
        Date,
        Flag
      }
      //delete data.s2s_date_range
      this.httpService.post(`${this.CMS_API}reports/s2sSummary`, data).subscribe({
        next:res=>{
          if(!res.error){
            this.cols = res.data.headers;
            this.reports = res.data.rows
            this.footerData = res.data.footer;
            // this.messageService.add({ severity: 'success', summary: 'Success', detail: res.message });
          }
          else{
            this.messageService.add({ severity: 'error', summary: 'Failed', detail: res.message });
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
    if(this.s2sSummaryReportForm.status!=='INVALID'){
      this.isValidForm = true;
      let date = this.convertDateFormat(this.f['s2s_date_range'].value)
      let flag = '1'
      let data = {
        date,
        flag
      }
      this.excelExportService.exportToExcelPost(`${this.CMS_API}reports/s2sSummary/export`, data).subscribe((excelData) =>{
        const blob = new Blob([excelData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `s2s-summary-report-${date}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      });
    }
  }

}

import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { MessageService } from 'primeng/api';
import { HttpService } from 'src/app/services/http/http.service';
import { ExcelExportService } from 'src/app/services/excelExport/excel-export.service';
import { CrudService } from 'src/app/services/common/crud.service';
import { Router } from '@angular/router';
@Component({
    selector: 'app-revenue-report',
    templateUrl: './revenue-report.component.html',
    styleUrls: ['./revenue-report.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class RevenueReportComponent implements OnInit{

  read:boolean = false
	write:boolean = false
	delete:boolean = false

  CMS_API = environment.CMS_API;

  revenueReportForm: any = FormGroup;
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

    this.revenueReportForm = frmbuilder.group({
      revenue_date_range: ['', [Validators.required]],
      revenue_telcom_region: ['',[Validators.required]],
      revenue_service_type: ['legacy']
    });
  }

  ngOnInit(): void {
    this.getTelcoms()
    this.maxDate = new Date()
  }

  // convenience getter for easy access to form fields
  get f() { return this.revenueReportForm.controls; }

  // Convert date to format YYYY-MM-DD
  convertDateFormat(rawDate:any) {
    let curr_dt = new Date(rawDate)
    let convertedDate = curr_dt.getFullYear() + "-" + String(curr_dt.getMonth() + 1).padStart(2, '0') + "-" + String(curr_dt.getDate()).padStart(2, '0');
    return convertedDate;
  }

  getTelcoms(){
    this.httpService.get(`${this.CMS_API}telcom/list?limit=ALL&s=null&status=1`).subscribe({
      next:res=>{
        if(!res.error){
          res.data.list.map((tel:any)=>{
            tel.name = `${tel.name} (${tel.region_name})`
            tel.id = `${tel.id}|$|${tel.region_id}`
            return tel
          })
          this.telcoms = res.data.list
        }
      }
    })
  }

  onSubmit(){
    this.submitted = true;
    console.log(this.revenueReportForm.value)
    if(this.revenueReportForm.status!=='INVALID'){
      this.isValidForm = true;
      let start_date = this.convertDateFormat(this.f['revenue_date_range'].value[0])
      let end_date = this.convertDateFormat(this.f['revenue_date_range'].value[1])
      let data = {
        ...this.revenueReportForm.value,
        start_date,
        end_date
      }
      data.tel_id = this.f['revenue_telcom_region'].value.split("|$|")[0] || ''
      data.region_id = this.f['revenue_telcom_region'].value.split("|$|")[1] || ''
      delete data.revenue_date_range
      delete data.revenue_telcom_region
      this.httpService.post(`${this.CMS_API}reports/revenue`, data).subscribe({
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
    if(this.revenueReportForm.status!=='INVALID'){
      this.isValidForm = true;
      let start_date = this.convertDateFormat(this.f['revenue_date_range'].value[0])
      let end_date = this.convertDateFormat(this.f['revenue_date_range'].value[1])
      let data = {
        ...this.revenueReportForm.value,
        start_date,
        end_date,
        download_excel:true
      }
      data.tel_id = this.f['revenue_telcom_region'].value.split("|$|")[0] || ''
      data.region_id = this.f['revenue_telcom_region'].value.split("|$|")[1] || ''
      delete data.revenue_date_range
      delete data.revenue_telcom_region
     
      let operator_name: any = this.telcoms.filter((v: any) => v.id.split("|$|")[0] == data.tel_id)[0];
      this.excelExportService.exportToExcelPost(`${this.CMS_API}reports/revenue/export`, data).subscribe((excelData) =>{
        const blob = new Blob([excelData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${operator_name.name}-revenue-reports-${data.start_date}_${data.end_date}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      });
    }
  }

}

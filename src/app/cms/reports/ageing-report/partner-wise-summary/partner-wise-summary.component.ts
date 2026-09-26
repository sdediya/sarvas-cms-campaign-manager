import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from '@openng/optimus-ui/api';
import { CrudService } from 'src/app/services/common/crud.service';
import { ExcelExportService } from 'src/app/services/excelExport/excel-export.service';
import { HttpService } from 'src/app/services/http/http.service';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-partner-wise-summary',
    templateUrl: './partner-wise-summary.component.html',
    styleUrls: ['./partner-wise-summary.component.css'],
    standalone: false
})
export class PartnerWiseSummaryComponent {
  read:boolean = false
	write:boolean = false
	delete:boolean = false

  CMS_API = environment.CMS_API;

  ageingSummaryReportForm: any = FormGroup;
  submitted : boolean = false;
  isValidForm : boolean = false;

  maxDate:any;

  reports: any = [];
  footerData: any = [];
  cols: any =[];
  loadingbody: boolean  = false;
  // filter: any = {'telcom_id': null, 'platform_id':null}
  telcoms:any
  data: any;
  advertising_platforms:any
  service: any = [
    {name: 'SME', code: 'sme'},
    {name: 'Legacy', code: 'legacy'}
  ]

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

    this.ageingSummaryReportForm = frmbuilder.group({
      date: ['', [Validators.required]],
      telcom_id: ['', [Validators.required]],
      service: ['', [Validators.required]],
      platform_id: ['', []]
    });
  }

  ngOnInit(): void {
    this.maxDate = new Date()
    this.httpService.get(`${this.CMS_API}reports/mis/mis-data`).subscribe({
      next:res=>{
        if(!res.error){
          res.data.telecoms.map((tel:any)=>{
            tel.name = `${tel.name} (${tel.region_name})`
            return tel
          })
          this.telcoms = res.data.telecoms
          this.advertising_platforms = res.data.ad_platforms
        }
      },
      error:err=>{
        console.log(err)
      }
    })
  }

  // convenience getter for easy access to form fields
  get f() { return this.ageingSummaryReportForm.controls; }

  // Convert date to format YYYY-MM-DD
  convertDateFormat(rawDate:any) {
    let curr_dt = new Date(rawDate)
    let convertedDate = curr_dt.getFullYear() + "-" + String(curr_dt.getMonth() + 1).padStart(2, '0') + "-" + String(curr_dt.getDate()).padStart(2, '0');
    return convertedDate;
  }


  onSubmit(){
    this.submitted = true;
    if(this.ageingSummaryReportForm.status!=='INVALID'){
      this.getSummary()

    }else {
      console.log(this.ageingSummaryReportForm);
      // this.messageService.add({ severity: 'error', summary: 'Failed', detail: this.ageingSummaryReportForm.error });
    }
    return false;
  }

  getSummary(){
    
    this.data = {
      start_date: this.convertDateFormat(this.f['date'].value[0]),
      end_date: this.convertDateFormat(this.f['date'].value[1]),
      service: this.f['service'].value,
      tel_id:this.f['telcom_id'].value,
      isExport: 0
    }
    this.httpService.post(`${this.CMS_API}reports/ageing/partner-wise-summary`, this.data).subscribe({
      next:res=>{
        if(!res.error){
          this.loadingbody = false;
          this.isValidForm = true;
          this.cols = res.data.headers;
          this.footerData = res.data.footer;
          this.reports = res.data.rows;
        }
        else{
          this.isValidForm = false;
          this.loadingbody = false
          this.messageService.add({ severity: 'error', summary: 'Failed', detail: res.message });
        }
      },
      error:err=>{
        console.log(err)
        this.loadingbody = false;
          this.footerData = [];
          this.reports = [];
        this.messageService.add({ severity: 'error', summary: 'Failed', detail: 'Something went wrong! Please try again' });
      }
    });
  }

  downloadExcel() {
    if(this.ageingSummaryReportForm.status!=='INVALID'){
      this.isValidForm = true;
      this.data = {
        start_date: this.convertDateFormat(this.f['date'].value[0]),
        end_date: this.convertDateFormat(this.f['date'].value[1]),
        service: this.f['service'].value,
        tel_id:this.f['telcom_id'].value,
        isExport: 1
      }
      // let queryParams  = new URLSearchParams(this.data);
      // window.open(`${this.CMS_API}reports/ageing/partner-wise-summary/export?${queryParams}`, '_blank');
      
      let operator_name: any = this.telcoms.filter((v: any) => v.id == this.f['telcom_id'].value)[0];
      this.excelExportService.exportToExcelPost(`${this.CMS_API}reports/ageing/partner-wise-summary/`, this.data).subscribe((excelData) =>{
        const blob = new Blob([excelData], { type: 'application/vnd.ms-excel' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${operator_name.name}-${this.data.service}-ageing-summary-reports-${this.data.start_date}_${this.data.end_date}.xls`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      });

    }
  }
}

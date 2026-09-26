import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from '@openng/optimus-ui/api';
import { debounceTime } from 'rxjs';
import { CrudService } from 'src/app/services/common/crud.service';
import { ExcelExportService } from 'src/app/services/excelExport/excel-export.service';
import { HttpService } from 'src/app/services/http/http.service';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-partner-wise-summary',
    templateUrl: './charging-report.component.html',
    styleUrls: ['./charging-report.component.css'],
    standalone: false
})
export class ChargingReportComponent {
  read:boolean = false
	write:boolean = false
	delete:boolean = false

  CMS_API = environment.CMS_API;

  chargingReportForm: any = FormGroup;
  submitted : boolean = false;
  isValidForm : boolean = false;

  maxDate:any;

  reports: any = [];
  footerData: any = [];
  cols: any =[];
  reportTables: any[] = [];
  loadingbody: boolean  = false;
  // filter: any = {'telcom_id': null, 'platform_id':null}
  telcoms:any
  services:any
  data: any;
  advertising_platforms:any
  service: any = [
    {name: 'SME', code: 'sme'},
    {name: 'Legacy', code: 'legacy'}
  ]
  report_type : any = [
    {name: 'Free Trail Activation', code: 'free'},
    {name: 'Optin', code: 'optin'},
  ]

  plan_validities = [
    { name: 'Daily',        code: '1'},
    { name: '3 Days',       code: '3'},
    { name: 'Weekly',       code: '7'},
    { name: 'Monthly',      code: '30'},
    { name: 'Quarterly',    code: '90'},
    { name: 'Half-Yearly',  code: '180'},
    { name: 'Yearly',       code: '365'}
  ];

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

    this.chargingReportForm = frmbuilder.group({
      date: ['', [Validators.required]],
      tel_id: ['', [Validators.required]],
      service_id: ['', [Validators.required]],
      plan_validity: [[], [Validators.required]],
      report_type: ['', [Validators.required]],
      platform_id: ['', []]
    });
  }

  ngOnInit(): void {
    
    this.maxDate = new Date(new Date().setDate(new Date().getDate() - 1))
    console.log(this.maxDate);
    this.httpService.get(`${this.CMS_API}reports/charging-report-data`).subscribe({
      next:res=>{
        if(!res.error){
          this.telcoms = res.data.telecoms
          this.advertising_platforms = res.data.ad_platforms
        }
      },
      error:err=>{
        console.log(err)
      }
    })

    this.f['tel_id'].valueChanges.pipe(debounceTime(500)).subscribe((value:any)=>{
      let telData = this.telcoms.find((e:any)=> e.tel_id == value);
      this.services= telData.services;
     
    });
  }

  // convenience getter for easy access to form fields
  get f() { return this.chargingReportForm.controls; }

  // Convert date to format YYYY-MM-DD
  convertDateFormat(rawDate:any) {
    let curr_dt = new Date(rawDate)
    let convertedDate = curr_dt.getFullYear() + "-" + String(curr_dt.getMonth() + 1).padStart(2, '0') + "-" + String(curr_dt.getDate()).padStart(2, '0');
    return convertedDate;
  }


  onSubmit(){
    this.submitted = true;
    if(this.chargingReportForm.status!=='INVALID'){
      this.getSummary()

    }else {
      console.log(this.chargingReportForm);
      // this.messageService.add({ severity: 'error', summary: 'Failed', detail: this.chargingReportForm.error });
    }
    return false;
  }

  getSummary(){
    this.reportTables = [];
    this.isValidForm = true;
    this.loadingbody = true;
    let start_date = this.convertDateFormat(this.f['date'].value[0])
    let end_date = this.convertDateFormat(this.f['date'].value[1])
    
    let formValue = { ...this.chargingReportForm.value };
    delete formValue.date; //remove data from form

    let planValidities = Array.isArray(formValue.plan_validity) ? formValue.plan_validity : [formValue.plan_validity];
    let requestsCompleted = 0;

    planValidities.forEach((plan: any) => {
      let requestData = {
        ...formValue,
        plan_validity: plan,
        start_date,
        end_date
      };

      this.httpService.post(`${this.CMS_API}reports/charging-report`, requestData).subscribe({
        next: res => {
          requestsCompleted++;
          if(!res.error){
            let planObj = this.plan_validities.find(p => p.code == plan);
            let planName = planObj ? planObj.name : plan;
            
            this.reportTables.push({
              plan_validity: plan,
              planName: planName,
              cols: res.data.headers,
              reports: res.data.rows,
              footerData: res.data.footer,
              index: planValidities.indexOf(plan)
            });
            this.reportTables.sort((a, b) => a.index - b.index); // Maintain selected order
          } else {
            this.messageService.add({ severity: 'error', summary: 'Failed', detail: res.message });
          }
          
          if (requestsCompleted === planValidities.length) {
            this.loadingbody = false;
          }
        },
        error: err => {
          requestsCompleted++;
          console.log(err);
          this.messageService.add({ severity: 'error', summary: 'Failed', detail: 'Something went wrong! Please try again' });
          
          if (requestsCompleted === planValidities.length) {
            this.loadingbody = false;
          }
        }
      });
    });
  }

  downloadExcel(plan_validity?: any) {
    if(this.chargingReportForm.status!=='INVALID'){
      this.isValidForm = true;
      let start_date = this.convertDateFormat(this.f['date'].value[0])
      let end_date = this.convertDateFormat(this.f['date'].value[1])
      
      let formValue = { ...this.chargingReportForm.value };
      delete formValue.date; //remove data from form
      if (plan_validity) {
        formValue.plan_validity = plan_validity;
      } else if (Array.isArray(formValue.plan_validity)) {
        formValue.plan_validity = formValue.plan_validity.join(',');
      }
      this.data = {
        ...formValue,
        start_date,
        end_date,
        isExport: 1
      }
      
      let operator_name: any = this.telcoms.find((v: any) => v.tel_id == this.f['tel_id'].value);
      let service = operator_name.services.find((v:any) => v.service_id == this.f['service_id'].value);
      this.excelExportService.exportToExcelPost(`${this.CMS_API}reports/charging-report/`, this.data).subscribe((excelData) =>{
        const blob = new Blob([excelData], { type: 'application/vnd.ms-excel' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const validityStr = plan_validity ? `-${plan_validity}` : '';
        a.download = `${operator_name.tel_name}-${service.service_name}-charging-reports${validityStr}-${this.data.start_date}_${this.data.end_date}.xls`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      });

    }
  }
}

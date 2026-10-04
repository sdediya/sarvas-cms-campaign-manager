import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { MessageService } from 'primeng/api';
import { HttpService } from 'src/app/services/http/http.service';
import { ExcelExportService } from 'src/app/services/excelExport/excel-export.service';
import { CrudService } from 'src/app/services/common/crud.service';
import { Router } from '@angular/router';
import { debounceTime } from 'rxjs';

@Component({
    selector: 'app-service-operator-response-report',
    templateUrl: './service-operator-response-report.component.html',
    styleUrls: ['./service-operator-response-report.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class ServiceOperatorResponseReportComponent implements OnInit{
  read:boolean = false
	write:boolean = false
	delete:boolean = false

  CMS_API = environment.CMS_API;

  reportForm: any = FormGroup;
  submitted : boolean = false;
  isValidForm : boolean = false;

  maxDate:any;

  masterService = [];

  telcoms = []
  masterAggregator = []
  

  reports: any = [];
  
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

    this.reportForm = frmbuilder.group({
      date: ['', [Validators.required]],
      telcom_id: ['',[Validators.required]],
      master_aggregator: ['',[Validators.required]]
    });

    this.f['telcom_id'].valueChanges.pipe(debounceTime(500)).subscribe((value:any)=>{
      let telData:any = this.telcoms.find((e:any)=> e.tel_id == value);
      
      this.masterAggregator = telData.master_aggregator
      

      this.f['master_aggregator'].reset();
      
      this.submitted =false
      this.cols = []
      this.reports = []
      
    });

  }

  ngOnInit(): void {
    this.getTelcoms()
    this.maxDate = new Date()
  }

  // convenience getter for easy access to form fields
  get f() { return this.reportForm.controls; }

  // Convert date to format YYYY-MM-DD
  convertDateFormat(rawDate:any) {
    let curr_dt = new Date(rawDate)
    let convertedDate = curr_dt.getFullYear() + "-" + String(curr_dt.getMonth() + 1).padStart(2, '0') + "-" + String(curr_dt.getDate()).padStart(2, '0');
    return convertedDate;
  }

  getTelcoms(){
    this.httpService.get(`${this.CMS_API}reports/revenue-data`).subscribe({
      next:res=>{
        if(!res.error){
          this.telcoms = res.data.telecoms
        }
      }
    })
  }

  onSubmit(){
    this.submitted = true;
    console.log(this.reportForm.value)
    if(this.reportForm.status!=='INVALID'){
      this.isValidForm = true;
      let date = this.convertDateFormat(this.f['date'].value)
      let data = {
        date,
        tel_id: this.f['telcom_id'].value,
        master_aggregator: this.f['master_aggregator'].value
      }
      
     
      this.httpService.post(`${this.CMS_API}reports/service-api-vs-operator-api-report`, data).subscribe({
        next:res=>{
          if(!res.error){
            this.cols = res.data.headers;
            this.reports = res.data.rows

            if(this.reports.length === 0){
              this.messageService.add({ severity: 'error', summary: 'No data found', detail: 'No data found for the selected date range, telcom and master aggregator' });
              this.submitted = false;
              this.isValidForm = false;
              this.cols = [];
              this.reports = [];
              return;
            }
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
    if(this.reportForm.status!=='INVALID'){
      this.isValidForm = true;
      let start_date = this.convertDateFormat(this.f['date_range'].value[0])
      let end_date = this.convertDateFormat(this.f['date_range'].value[1])
      let data = {
        start_date,
        end_date,
        tel_id: this.f['telcom_id'].value,
        master_aggregator: this.f['master_aggregator'].value,
        download_excel:true
      }
      
      
      let tel_data: any = this.telcoms.find((v:any)=> v.tel_id == data.tel_id);

      let masterAggregator = tel_data.master_aggregator.find((v:any)=> v.maggregator_id == data.master_aggregator )

      

      let fileName = `${tel_data.tel_name.toLowerCase()}_${masterAggregator.maggregator_name.toLowerCase()}`

    

      this.excelExportService.exportToExcelPost(`${this.CMS_API}reports/service-api-vs-operator-api-report/export`, data).subscribe((excelData) =>{
        const blob = new Blob([excelData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download =  `${fileName}-service-api-vs-operator-api-report-${data.start_date}_${data.end_date}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      });
    }
  }
}

import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { HttpService } from 'src/app/services/http/http.service';
import { ExcelExportService } from 'src/app/services/excelExport/excel-export.service';

@Component({
    selector: 'app-publisher-report',
    templateUrl: './publisher-report.component.html',
    styleUrls: ['./publisher-report.component.css'],
    standalone: false
})
export class PublisherReportComponent {

  CMS_API = environment.CMS_API;
  reports: any = [];
  cols: any =[];
  campaignData : any = [];
  telecom_operators = [];
 
  services = [];
  regions = [];
  advertising_platforms = [];
  loaded:boolean=false
  publisherReportForm: any = FormGroup;
  submitted : boolean = false;
  maxDate:any;

  countries: any=[] ;

  selectedCampaign: string="" ;
  

  constructor(
    private frmbuilder:FormBuilder,
    private httpService:HttpService,
    private excelExportService: ExcelExportService,
  ){

    this.publisherReportForm = frmbuilder.group({
      publisher_date_range: ['', [Validators.required]],
      selectedCampaign:['', [Validators.required]]
    });
  }

  

  ngOnInit() {
    this.maxDate = new Date(),
    this.getCampaignData()
   
  }
  get f() { return this.publisherReportForm.controls; }

  convertDateFormat(rawDate:any) {
    let curr_dt = new Date(rawDate)
    let convertedDate = curr_dt.getFullYear() + "-" + String(curr_dt.getMonth() + 1).padStart(2, '0') + "-" + String(curr_dt.getDate()).padStart(2, '0');
    return convertedDate;
  }

  getCampaignData(){
      this.httpService.get(`${this.CMS_API}campaign/list?limit=ALL&s=null&campaign_type=wap`).subscribe({
        next:res=>{
          if(!res.error){
            this.campaignData = res.data.list;
            // console.log(this.campaignData)
            //console.log(this.campaignData)
            // this.messageService.add({ severity: 'success', summary: 'Success', detail: res.message });
          }
          else{
            //this.messageService.add({ severity: 'error', summary: 'Failed', detail: res.message });
          }
        },
        error:err=>{
          console.log(err)
        }
      });
  }


  onClickSubmit() {
    this.submitted = true;
    if(this.publisherReportForm.status!=='INVALID'){
    
     let data = { fromdate:this.convertDateFormat(this.f['publisher_date_range'].value[0]), todate: this.convertDateFormat(this.f['publisher_date_range'].value[1]), campaignid:this.f['selectedCampaign'].value } 
     
     this.httpService.post(`${this.CMS_API}reports/publisher`, data).subscribe({
      next:res=>{
        if(!res.error){
          let loaded=true
          this.cols = res.data.headers;
          this.reports = res.data.rows
          
           //this.messageService.add({ severity: 'success', summary: 'Success', detail: res.message });
        }
        else{
          // this.messageService.add({ severity: 'error', summary: 'Failed', detail: res.message });
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
    let fromdate = this.convertDateFormat(this.f['publisher_date_range'].value[0]),
    todate = this.convertDateFormat(this.f['publisher_date_range'].value[1])
    let data = { fromdate, todate, campaignid:this.f['selectedCampaign'].value } 
    
    this.excelExportService.exportToExcelPost(`${this.CMS_API}reports/publisher/export`, data).subscribe((excelData) =>{
      const blob = new Blob([excelData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = "top-publisher-"+fromdate+"-"+todate+".xlsx";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }
}

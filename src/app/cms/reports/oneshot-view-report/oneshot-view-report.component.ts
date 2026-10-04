import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ExcelExportService } from 'src/app/services/excelExport/excel-export.service';
import { HttpService } from 'src/app/services/http/http.service';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-oneshot-view-report',
    templateUrl: './oneshot-view-report.component.html',
    styleUrls: ['./oneshot-view-report.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class OneshotViewReportComponent {

read:boolean = false
write:boolean = false
delete:boolean = false

CMS_API = environment.CMS_API;

oneshotForm: FormGroup;
maxDate: Date = new Date();
submitted: boolean = false;
campaignData : any = {};
telcoms: any = [];
telcomData: any = [];
regionData: any = [];
products:any = [];
TelecomData: any = [];
defaultTabIndex = 0;
fetchedData: any = [];
plan: any = [];
drrReportData: any[] = [];
loading = false;
revenue_report: any = [];
drr_report: any = [];
adpartner_report: any = [];
revenue_footer: any = {};
drr_footer: any = {};
adpartner_footer: any = {};
drr_cols: any =[];
revenue_cols: any =[];
adpartner_cols: any =[];
lastRevenueCriteria: any = {};
lastDrrCriteria: any = {};
lastAdPartnerCriteria: any = {};

constructor(
  private httpService: HttpService, 
  private frmbuilder: FormBuilder,
  private excelExportService: ExcelExportService,
  ) {
  this.oneshotForm = this.frmbuilder.group({
    date: [new Date(new Date().setDate(new Date().getDate() - 1)), [Validators.required]],
    tel_ids: [[]],
    service_id: [''], 
    plan_id: [''],
  
  });
  
}

get f() { return this.oneshotForm.controls; }

ngOnInit(): void {
  this.getTelcoms();
  // this.fetchData(0);

    this.f['tel_ids']?.valueChanges.subscribe((selectedTelcoms: [] | null) => {
    if (Array.isArray(selectedTelcoms) && selectedTelcoms.length > 0) {
      this.getServices(selectedTelcoms);
    } else {
      this.products = [];
      this.plan = [];
      this.oneshotForm.patchValue({ service_id: null });
    }
  });
  this.f['service_id']?.valueChanges.subscribe((selectedProduct: string | null) => {
    if (selectedProduct) {
      this.getPlan();
    } else {
      this.plan = [];
    }
  });

}

getTelcoms(){
  this.httpService.get(`${this.CMS_API}campaign/campaign-data`).subscribe({
    next:res=>{
      if(!res.error){ 
        this.campaignData = res.data;
        this.telcomData = res.data.telecoms
        
        this.telcoms = this.telcomData.map((item: { id: string; name: string; region_name: string }) => ({
          id: item.id,  
          name: `${item.name} (${item.region_name})` 
        }));
      }
    },
    error: (err) => {
      console.error("API Error:", err);
    }
  })
}

getServices(selectedTelecomIds: string[]) {
  this.fetchedData = this.campaignData.tel_services;

  const uniqueProducts = new Map();

  this.fetchedData
    .filter((item: { telpartner_telcom_id: string }) => selectedTelecomIds.includes(item.telpartner_telcom_id))
    .forEach((item: { id: string; name: string }) => {
      if (!uniqueProducts.has(item.id)) {
        uniqueProducts.set(item.id, { id: item.id, name: item.name });
      }
    });

  this.products = Array.from(uniqueProducts.values());

}

getPlan(){
  this.plan = [
  {name: 'Daily', code: '1'},
  {name: 'Weekly', code: '7'},
  {name: 'Monthly', code: '30'} ]
}

onSubmit(){
  this.submitted = true;
  
  this.fetchData(this.defaultTabIndex);

}
fetchData(tabIndex: number){
  this.loading = true;
  const currentCriteria = this.oneshotForm.value;

  switch (tabIndex) {
    case 0:
      if (!this.revenue_report || this.revenue_report.length === 0 ||!this.revenue_cols || !this.revenue_footer ||
        JSON.stringify(this.lastRevenueCriteria) !== JSON.stringify(currentCriteria)
      ) {
        this.getrevenueReportData();
        this.lastRevenueCriteria = { ...currentCriteria };
      } else {
        this.loading = false; 
      }
      break;
    case 1:
      if (!this.drr_report || this.drr_report.length === 0 || !this.drr_cols || !this.drr_footer ||
        JSON.stringify(this.lastDrrCriteria) !== JSON.stringify(currentCriteria)
      ) {
        this.getDrrReportData();
        this.lastDrrCriteria = { ...currentCriteria };
      } else {
        this.loading = false;
      }
      break;
    case 2:
      if (!this.adpartner_report || this.adpartner_report.length === 0 || !this.adpartner_cols || !this.adpartner_footer ||
        JSON.stringify(this.lastAdPartnerCriteria) !== JSON.stringify(currentCriteria)
      ) {
        this.getadPartnerReportData();
        this.lastAdPartnerCriteria = { ...currentCriteria };
      } else {
        this.loading = false;
      }
      break;
    default:
      this.loading = false;
      break;

  }

}

getDrrReportData(){
  
  this.httpService.post(`${this.CMS_API}reports/oneshotview/drr`,this.oneshotForm.value).subscribe({
    next:res=>{
      if(!res.error){
        this.drr_cols = res.data.headers;
        this.drr_report = res.data.rows;
        this.drr_footer = res.data.footer;
      }
      else{
        console.error(res.message);
      }
      this.loading = false;
    },
    error: (err) => {
      console.error("API Error:", err);
      this.loading = false;
    }
  });
}

getadPartnerReportData(){
  this.httpService.post(`${this.CMS_API}reports/oneshotview/adPartner`,this.oneshotForm.value).subscribe({
    next:res=>{
      if(!res.error){
        this.adpartner_cols = res.data.headers;
        this.adpartner_report = res.data.rows;
        this.adpartner_footer = res.data.footer;
      }
      else{
        console.error(res.message);
      }
      this.loading = false;
    },
    error: (err) => {
      console.error("API Error:", err);
      this.loading = false;
    }
  });
}
getrevenueReportData(){
  this.httpService.post(`${this.CMS_API}reports/oneshotview/revenue`,this.oneshotForm.value).subscribe({
    next:res=>{
      if(!res.error){
        this.revenue_cols = res.data.headers;
        this.revenue_report = res.data.rows;
        this.revenue_footer = res.data.footer;
      }
      else{
        console.error(res.message);
      }
      this.loading = false;
    },
    error: (err) => {
      console.error("API Error:", err);
      this.loading = false;
    }
  });
}

downloadDRRExcel(){
  this.excelExportService.exportToExcelPost(`${this.CMS_API}reports/oneshotview/drrExport`, this.oneshotForm.value).subscribe((excelData) =>{
    const blob = new Blob([excelData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const formattedDate = this.f['date'].value.toISOString().split('T')[0];
    a.download = `one-shot-drr-report-${formattedDate}.xlsx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  });
}
downloadadPartnerExcel(){
  this.excelExportService.exportToExcelPost(`${this.CMS_API}reports/oneshotview/adPartnerExport`, this.oneshotForm.value).subscribe((excelData) =>{
    const blob = new Blob([excelData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const formattedDate = this.f['date'].value.toISOString().split('T')[0];
    a.download = `one-shot-adPartner-report-${formattedDate}.xlsx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  });
}
downloadrevenueExcel(){
  this.excelExportService.exportToExcelPost(`${this.CMS_API}reports/oneshotview/revenueExport`, this.oneshotForm.value).subscribe((excelData) =>{
    const blob = new Blob([excelData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const formattedDate = this.f['date'].value.toISOString().split('T')[0];
    a.download = `one-shot-revenue-report-${formattedDate}.xlsx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  });
}

}



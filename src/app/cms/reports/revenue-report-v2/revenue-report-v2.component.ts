import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { MessageService } from '@openng/optimus-ui/api';
import { HttpService } from 'src/app/services/http/http.service';
import { ExcelExportService } from 'src/app/services/excelExport/excel-export.service';
import { CrudService } from 'src/app/services/common/crud.service';
import { Router } from '@angular/router';
import { debounceTime } from 'rxjs';
@Component({
    selector: 'app-revenue-report',
    templateUrl: './revenue-report-v2.component.html',
    styleUrls: ['./revenue-report-v2.component.css'],
    standalone: false
})
export class RevenueReportV2Component implements OnInit{

  read:boolean = false
	write:boolean = false
	delete:boolean = false

  CMS_API = environment.CMS_API;

  revenueReportForm: any = FormGroup;
  submitted : boolean = false;
  isValidForm : boolean = false;

  maxDate:any;

  masterService: any[] = [];

  telcoms: any[] = []
  masterAggregator: any[] = []
  products: any[] = []
  services: any[] = []
  serviceWiseShare:any = [];

  reports: any = [];
  footerData: any = {};
  cols: any =[];
  dateRangeStartIso = '';
  dateRangeEndIso = '';
  service: any = [
    {name: 'SME', code: 'sme'},
    {name: 'Legacy', code: 'legacy'}
  ]

  telcomToString = (id: unknown) => {
    const tel: any = this.telcoms.find((e: any) => e.tel_id == id);
    return tel?.tel_name ?? '';
  };

  masterAggregatorToString = (id: unknown) => {
    const mag: any = this.masterAggregator.find((e: any) => e.maggregator_id == id);
    return mag?.maggregator_name ?? '';
  };

  productToString = (code: unknown) => {
    const product: any = this.products.find((e: any) => e.code == code);
    return product?.name ?? '';
  };

  serviceToString = (id: unknown) => {
    if (id === '' || id === null || id === undefined) {
      return 'All';
    }
    const svc: any = this.services.find((e: any) => e.service_id == id);
    return svc?.service_name ?? '';
  };

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
      revenue_telcom_id: ['',[Validators.required]],
      revenue_master_aggregator: ['',[Validators.required]],
      revenue_product_type: ['',[Validators.required]],
      revenue_service_id: ['']
    });

    this.f['revenue_telcom_id'].valueChanges.pipe(debounceTime(500)).subscribe((value:any)=>{
      let telData:any = this.telcoms.find((e:any)=> e.tel_id == value);
      this.services = this.masterService = telData.services;
      this.masterAggregator = telData.master_aggregator
      this.products = this.service.filter((e:any)=> telData.product.includes(e.name));

      this.f['revenue_master_aggregator'].reset();
      this.f['revenue_product_type'].reset();
      this.f['revenue_service_id'].reset();
      this.submitted =false
      this.cols = []
      this.reports = []
      this.footerData = []
      this.serviceWiseShare = []
    });

    this.f['revenue_master_aggregator'].valueChanges.pipe(debounceTime(500)).subscribe((value:any)=>{
      let masterAggregator:any = this.masterAggregator.find((e:any)=> e.maggregator_id == value);
      this.services = this.masterService.filter((e:any)=> e.maggregator_id == value)
      this.products = this.service.filter((e:any)=> masterAggregator.service_type.includes(e.name));

      this.f['revenue_product_type'].reset();
      this.f['revenue_service_id'].reset();
      this.submitted =false
      this.cols = []
      this.reports = []
      this.footerData = []
      this.serviceWiseShare = []
    });

    this.f['revenue_product_type'].valueChanges.pipe(debounceTime(500)).subscribe((value:any)=>{
      let masterAggregatorID = this.f['revenue_master_aggregator'].value
      this.services = this.masterService.filter((e:any)=> e.service_type.toLowerCase() == value && e.maggregator_id == masterAggregatorID)
      this.f['revenue_service_id'].reset();
      this.submitted =false
      this.cols = []
      this.reports = []
      this.footerData = []
      this.serviceWiseShare = []
    });
  }

  ngOnInit(): void {
    this.getTelcoms()
    this.maxDate = new Date()
  }

  // convenience getter for easy access to form fields
  get f() { return this.revenueReportForm.controls; }

  get maxDateIso(): string {
    return this.convertDateFormat(this.maxDate || new Date());
  }

  // Convert date to format YYYY-MM-DD
  convertDateFormat(rawDate:any) {
    let curr_dt = new Date(rawDate)
    let convertedDate = curr_dt.getFullYear() + "-" + String(curr_dt.getMonth() + 1).padStart(2, '0') + "-" + String(curr_dt.getDate()).padStart(2, '0');
    return convertedDate;
  }

  private parseIsoDate(iso: string): Date {
    const [year, month, day] = iso.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  onDateRangePartChange(part: 'start' | 'end', event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    if (part === 'start') {
      this.dateRangeStartIso = value;
      if (this.dateRangeEndIso && this.dateRangeEndIso < value) {
        this.dateRangeEndIso = '';
      }
    } else {
      this.dateRangeEndIso = value;
    }
    this.syncDateRangeControl();
  }

  private syncDateRangeControl(): void {
    if (this.dateRangeStartIso && this.dateRangeEndIso) {
      this.f['revenue_date_range'].setValue([
        this.parseIsoDate(this.dateRangeStartIso),
        this.parseIsoDate(this.dateRangeEndIso),
      ]);
      this.f['revenue_date_range'].markAsDirty();
    } else {
      this.f['revenue_date_range'].setValue('');
    }
  }

  clearFilters(): void {
    this.revenueReportForm.reset();
    this.dateRangeStartIso = '';
    this.dateRangeEndIso = '';
    this.submitted = false;
    this.isValidForm = false;
    this.cols = [];
    this.reports = [];
    this.footerData = {};
    this.serviceWiseShare = [];
    this.services = [];
    this.masterAggregator = [];
    this.products = [];
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
      delete data.revenue_date_range
     
      this.httpService.post(`${this.CMS_API}reports/revenue-v2`, data).subscribe({
        next:res=>{
          if(!res.error){
            this.cols = res.data.headers;
            this.reports = res.data.rows
            this.footerData = res.data.footer;

            this.serviceWiseShare = res.data.service_wise_share
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
      
      delete data.revenue_date_range

     
      let tel_data: any = this.telcoms.find((v:any)=> v.tel_id == data.revenue_telcom_id);

      let masterAggregator = tel_data.master_aggregator.find((v:any)=> v.maggregator_id == data.revenue_master_aggregator )

      let service_type = data.revenue_product_type;

      let fileName = `${tel_data.tel_name.toLowerCase()}_${masterAggregator.maggregator_name.toLowerCase()}_${service_type.toLowerCase()}`

      if(data.revenue_service_id) {
        let service = tel_data.services.find((v:any) => v.service_id == data.revenue_service_id)
        fileName = `${fileName}_${service.service_name.toLowerCase()}`;
      }




      


      this.excelExportService.exportToExcelPost(`${this.CMS_API}reports/revenue-v2`, data).subscribe((excelData) =>{
        const blob = new Blob([excelData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download =  `${fileName}-revenue-reports-${data.start_date}_${data.end_date}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      });
    }
  }

}

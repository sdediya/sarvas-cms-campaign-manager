import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { CrudService } from 'src/app/services/common/crud.service';
import { ExcelExportService } from 'src/app/services/excelExport/excel-export.service';
import { HttpService } from 'src/app/services/http/http.service';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-ageing-dump',
    templateUrl: './ageing-dump.component.html',
    styleUrls: ['./ageing-dump.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class AgeingDumpComponent {
  read:boolean = false
	write:boolean = false
	delete:boolean = false

  CMS_API = environment.CMS_API;

  ageingMsisdnDumpForm: any = FormGroup;
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

    this.ageingMsisdnDumpForm = frmbuilder.group({
      date: ['', [Validators.required]],
      telcom_id: ['', [Validators.required]],
      service: ['legacy'],
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
  get f() { return this.ageingMsisdnDumpForm.controls; }

  // Convert date to format YYYY-MM-DD
  convertDateFormat(rawDate:any) {
    let curr_dt = new Date(rawDate)
    let convertedDate = curr_dt.getFullYear() + "-" + String(curr_dt.getMonth() + 1).padStart(2, '0') + "-" + String(curr_dt.getDate()).padStart(2, '0');
    return convertedDate;
  }


  onSubmit(){
    this.submitted = true;
    if(this.ageingMsisdnDumpForm.status!=='INVALID'){
      this.downloadExcel()

    }else {
      console.log(this.ageingMsisdnDumpForm);
      // this.messageService.add({ severity: 'error', summary: 'Failed', detail: this.ageingMsisdnDumpForm.error });
    }
    return false;
  }
  downloadExcel() {
    this.data = {
      start_date: this.convertDateFormat(this.f['date'].value[0]),
      end_date: this.convertDateFormat(this.f['date'].value[1]),
      service: this.f['service'].value,
      tel_id:this.f['telcom_id'].value,
      platform_id:this.f['platform_id'].value,
    }
    
    let operator_name: any = this.telcoms.filter((v: any) => v.id == this.f['telcom_id'].value)[0];
    let platform_name: any = this.advertising_platforms.filter((v: any) => v.id == this.f['platform_id'].value)[0];
    this.excelExportService.exportToExcelPost(`${this.CMS_API}reports/ageing/msisdn-dump`, this.data)
      .subscribe((excelData) =>{
        let blob = new Blob([excelData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        let url = window.URL.createObjectURL(blob);
        let a = document.createElement('a');
        a.href = url;
        a.download = `${operator_name.name}-${this.data.service}-ageing-msisdn-dump-${this.data.start_date}_${this.data.end_date}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      });
  }
}

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpService } from 'src/app/services/http/http.service';
import { environment } from 'src/environments/environment';
import { ConfirmationService, MessageService } from '@openng/optimus-ui/api';
import { CrudService } from 'src/app/services/common/crud.service';
import { Router } from '@angular/router';
import { ExcelExportService } from 'src/app/services/excelExport/excel-export.service';

@Component({
    selector: 'app-customer-care-interface',
    templateUrl: './customer-care-interface.component.html',
    styleUrls: ['./customer-care-interface.component.css'],
    standalone: false
})
export class CustomerCareInterfaceComponent implements OnInit{

  read:boolean = false
  write:boolean = false
  delete:boolean = false
  showCustomerLogs:boolean = true

  getUserCCDetailsForm: any = FormGroup;
  submitted: boolean = false
  isValidForm:boolean = false;
  userfound : boolean = false;
  customerSubscriptionDetails: any = {};
  userTransactionDetails: any = [];
  userLifecycle: any = [];
  userLogs: any = [];
  services: any[] = [];
  telecom_operators: any[] = [];
  masterAggregator: any[] = [];
  filteredServices: any[] = [];

  CMS_API = environment.CMS_API
  API = environment.API
  userParkingDetails: any = [];

  showUserLogDetail: boolean = false;
  selectedUserLogDetail : any = {}

  constructor(
    private frmbuilder:FormBuilder,
    private httpService:HttpService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private crudService:CrudService,
    private router:Router,
    private excelExportService: ExcelExportService,
  ){
    let permissions = this.crudService.hasPermission('customer_management')
    this.read = permissions.read
    this.write = permissions.write
    this.delete = permissions.delete
    this.showCustomerLogs = this.crudService.hasCustomerLogsPermission()
    if(!this.read){
      this.router.navigate(['no-access'])
    }

    this.getUserCCDetailsForm = frmbuilder.group({
      msisdn: ['', [Validators.required, Validators.pattern("^[0-9]*$")]],
      operator: ['', [Validators.required]],
      master_aggregator: [''],
      service_id: ['', [Validators.required]]
    });
  }

  // convenience getter for easy access to form fields
  get f() { return this.getUserCCDetailsForm.controls; }

  ngOnInit(){
    this.getTelcomData();
    this.setupFormCascading();
  }

  setupFormCascading() {
    this.f['operator'].valueChanges.subscribe((value: any) => {
      if (value) {
        const telData: any = this.telecom_operators.find((e: any) => e.tel_id == value);
        if (telData) {
          this.masterAggregator = telData.master_aggregator || [];
          this.services = telData.services || [];
          this.filteredServices = this.services;
        }
      } else {
        this.masterAggregator = [];
        this.services = [];
        this.filteredServices = [];
      }
      this.f['master_aggregator'].reset();
      this.f['service_id'].reset();
    });
    this.f['master_aggregator'].valueChanges.subscribe((value: any) => {
      if (value && this.services.length) {
        this.filteredServices = this.services.filter((e: any) => e.maggregator_id == value);
      } else {
        this.filteredServices = this.services;
      }
      this.f['service_id'].reset();
    });
  }

  async onSubmit(){
    this.submitted = true;
    if(this.getUserCCDetailsForm.status!=='INVALID'){
      this.isValidForm = true;
      if(this.f['msisdn'].value && this.f['service_id'].value){
        const msisdn = this.f['msisdn'].value;
        const service_id = this.f['service_id'].value;
        const operator = this.f['operator'].value;
        const master_aggregator = this.f['master_aggregator'].value;
        await this.getCustomerDetails(msisdn, service_id, operator, master_aggregator);
        await this.getCustomerLogsAndLifecycle(msisdn, service_id, operator, master_aggregator);
      }
    }
  }

  getCustomerDetails(msisdn: any, service_id: any, operator?: string, master_aggregator?: string){
    let url = `${this.CMS_API}customer_care/getCustomerDetails?msisdn=${msisdn}&service_id=${service_id}`;
    if (operator) url += `&operator=${operator}`;
    if (master_aggregator) url += `&master_aggregator=${master_aggregator}`;
    this.httpService.get(url).subscribe({
      next:res=>{
        if(!res.error){
          this.userfound = !res.data.user_details ? false:true;
          this.customerSubscriptionDetails = res.data.user_details
          this.userTransactionDetails = res.data.customer_transactions
          this.userParkingDetails = res.data.customer_parking
        }
        else{
          this.userfound = false;
          this.messageService.add({ severity: 'error', summary: 'Failed', detail: res.message });
        }
      },
      error:err=>{
        this.userfound = false;
        this.messageService.add({ severity: 'error', summary: 'Failed', detail: err.error.message });
      }
    })
  }

  getCustomerLogsAndLifecycle(msisdn: any, service_id: any, operator?: string, master_aggregator?: string){
    let url = `${this.CMS_API}user/journey?msisdn=${msisdn}&service_id=${service_id}`;
    if (operator) url += `&operator=${operator}`;
    if (master_aggregator) url += `&master_aggregator=${master_aggregator}`;
    this.httpService.get(url).subscribe({
      next:res=>{
        if(!res.error){
          this.userLifecycle = res.data.lifecycle
          try {
              const msisdnStr = typeof msisdn === 'string' ? msisdn : String(msisdn || '');
              const userLogs = res.data.userLogs || [];

              // Do not mask if msisdn is less than 4 characters
              if (msisdnStr.length < 6) {
                this.userLogs = userLogs;
                return;
              }

              const maskedData = JSON.stringify(userLogs);
              const maskedMsisdn = 'X'.repeat(msisdnStr.length - 4) + msisdnStr.slice(-4);
              const replaced = maskedData.replace(new RegExp(msisdnStr, 'g'), maskedMsisdn);

              this.userLogs = JSON.parse(replaced);
            } catch (e) {
              this.userLogs = res.data.userLogs || []; // fallback
            }
          }
      },
      error:err=>{
        console.log(err);
      }
    })
  }

  showDialog(logIndex:any) {
    this.selectedUserLogDetail = {}
    if(this.userLogs[logIndex]){
      this.selectedUserLogDetail = this.userLogs[logIndex]
    }
    this.showUserLogDetail = true;
  }

  exportData(){
    let mssidn = this.f['msisdn'].value;
    let apiUrl = `${this.CMS_API}user/export_user_logs?msisdn=${mssidn}`;
    const operator = this.f['operator'].value;
    const master_aggregator = this.f['master_aggregator'].value;
    if (operator) apiUrl += `&operator=${operator}`;
    if (master_aggregator) apiUrl += `&master_aggregator=${master_aggregator}`;
    this.excelExportService.exportToExcel(apiUrl).subscribe((excelData) => {
      const blob = new Blob([excelData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `user-logs-${mssidn}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

  exportDataCustomer(){
    let mssidn = this.f['msisdn'].value;
    let service_id = this.f['service_id'].value;
    let apiUrl = `${this.CMS_API}user/export_customer_lifecycle?msisdn=${mssidn}&service_id=${service_id}`;
    const operator = this.f['operator'].value;
    const master_aggregator = this.f['master_aggregator'].value;
    if (operator) apiUrl += `&operator=${operator}`;
    if (master_aggregator) apiUrl += `&master_aggregator=${master_aggregator}`;
    this.excelExportService.exportToExcel(apiUrl).subscribe((excelData) => {
      const blob = new Blob([excelData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `customer-lifecycle-${mssidn}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

  unSubCustomer(msisdn:any, service_id:any){
    let data = {
      msisdn,
      service_id,
      involuntary_churn:true
    }
    this.confirmationService.confirm({
      key: 'confirmBox',
      target: new EventTarget,
      message: 'Are you sure that you want to Unsubscribe Customer?',
      icon: 'pi pi-exclamation-triangle',
      accept:()=>{
        this.httpService.post(`${this.API}cancel_subscription`, data).subscribe({
          next:res=>{
            if(!res.error){
              if(res?.data?.redirect_to_unsub && res?.data?.redirection_url){
                window.location.href=res.data.redirection_url
              }
              else{
                const operator = this.f['operator'].value;
                const master_aggregator = this.f['master_aggregator'].value;
                this.getCustomerDetails(msisdn, service_id, operator, master_aggregator);
                this.messageService.add({ severity: 'success', summary: 'Success', detail: res.message });
              }
            }
            else{
              this.messageService.add({ severity: 'error', summary: 'Failed', detail: res.message });
              console.log(res);
            }
          },
          error:err=>{
            this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error.message });
            console.log(err);
          }
        })
      },
      reject: () => {
        return false
      }
    });
  }

  getTelcomData(){
    this.httpService.get(`${this.CMS_API}reports/mis/mis-data`).subscribe({
      next: res => {
        if (!res.error && res.data?.telecoms) {
          this.telecom_operators = res.data.telecoms.map((tel: any) => ({
            ...tel,
            name: tel.tel_name,
            tel_id: String(tel.tel_id)
          }));
        }
      },
      error: err => {
        console.log(err);
      }
    });
  }

}

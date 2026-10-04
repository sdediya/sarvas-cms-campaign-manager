import { Component, AfterViewInit, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CrudService } from 'src/app/services/common/crud.service';
import { HttpService } from 'src/app/services/http/http.service';
import { environment } from 'src/environments/environment';
import { ExcelExportService } from 'src/app/services/excelExport/excel-export.service';
import { Table, TableHeaderCheckbox } from "primeng/table";


@Component({
    selector: 'app-customer-refund',
    templateUrl: './customer-refund.component.html',
    styleUrls: ['./customer-refund.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class CustomerRefundComponent implements AfterViewInit, OnInit{
  @ViewChild("table")
  private _table!: Table;

  @ViewChild("headerCheckBox")
  private _headerCheckBox!: TableHeaderCheckbox;

  read:boolean = false
  write:boolean = false
  delete:boolean = false

  getUserCCDetailsForm: any = FormGroup;
  submitted: boolean = false
  isValidForm:boolean = false;
  userfound : boolean = false;
  customerSubscriptionDetails: any = {};
  userTransactionDetails: any = [];
  selectedTransactions: any = [];

  telecom_operators: any[] = [];
  masterAggregator: any[] = [];
  services: any[] = [];
  filteredServices: any[] = [];

  CMS_API = environment.CMS_API

  telecoms: string = '';

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
    let hasRefundAccess = this.crudService.hasCustomerRefundPermission()
    this.read = permissions.read && hasRefundAccess
    this.write = permissions.write
    this.delete = permissions.delete
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

  ngOnInit(){
    this.getRefundableOperators();
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

  getRefundableOperators() {
    const refundableList$ = this.httpService.get(`${this.CMS_API}telcom/list?limit=ALL&s=null&status=1&tel_is_refundable=1`);
    const misData$ = this.httpService.get(`${this.CMS_API}reports/mis/mis-data`);

    forkJoin({ refundableList: refundableList$, misData: misData$ }).subscribe({
      next: ({ refundableList, misData }) => {
        if (refundableList.error || misData.error) {
          console.log('Error fetching telecom data');
          return;
        }
        const refundableIds = new Set(
          (refundableList.data?.list || []).map((t: any) => String(t.id))
        );
        const misTelecoms = misData.data?.telecoms || [];
        this.telecom_operators = misTelecoms
          .filter((tel: any) => refundableIds.has(String(tel.id)) || refundableIds.has(String(tel.tel_id)))
          .map((tel: any) => ({
            ...tel,
            name: tel.tel_name,
            tel_id: String(tel.tel_id || tel.id)
          }));
        this.telecoms = (refundableList.data?.list || [])
          .map((tel: any) => `${tel.region_shortcode || ''}-${tel.name || tel.tel_name || ''}`.replace(/^-/, ''))
          .filter(Boolean)
          .join(', ');
      },
      error: err => {
        console.log(err);
      }
    });
  }

  // convenience getter for easy access to form fields
  get f() { return this.getUserCCDetailsForm.controls; }

  async onSubmit(){
    this.submitted = true;
    if(this.getUserCCDetailsForm.status!=='INVALID'){
      this.isValidForm = true;
      if(this.f['msisdn'].value && this.f['service_id'].value){
        const msisdn = this.f['msisdn'].value;
        const service_id = this.f['service_id'].value;
        const operator = this.f['operator'].value;
        const master_aggregator = this.f['master_aggregator'].value;
        await this.getCustomerAllTransactions(msisdn, service_id, operator, master_aggregator);
      }
    }
  }

  getCustomerAllTransactions(msisdn: any, service_id: any, operator?: string, master_aggregator?: string){
    let url = `${this.CMS_API}customer_care/getCustomerAllTransactions?msisdn=${msisdn}&service_id=${service_id}`;
    if (operator) url += `&operator=${operator}`;
    if (master_aggregator) url += `&master_aggregator=${master_aggregator}`;
    this.httpService.get(url).subscribe({
      next:res=>{
        if(!res.error){
          this.userfound = !res.data.transactions ? false:true;
          this.customerSubscriptionDetails = res.data.user_details
          this.userTransactionDetails = res.data.transactions
          if(this.userTransactionDetails.length==0){
            this.messageService.add({ severity: 'error', summary: 'No Found', detail: 'Refundable transactions not found' });
          }
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

  updateCheckedState () {
    const table: any = this._table;
    const transactions: any[] = table.filteredValue || table.value;
    const selection: any[] = table.selection;
    for (const transaction of transactions) {
      if (this.isRowDisabled(transaction)) {
        const selected = selection && selection.indexOf(transaction) >= 0;
        if (!selected) return false;
      }
    }
    return true;
  };

  refundTransactions(){
    if(this.selectedTransactions.length==0){
      this.messageService.add({ severity: 'error', summary: 'Not selected transactions', detail: 'Please select transactions to be refund' });
      return
    }
    const operator = this.f['operator'].value;
    const master_aggregator = this.f['master_aggregator'].value;
    const service_id = this.f['service_id'].value;
    const payload: any = { transactions: this.selectedTransactions };
    if (operator) payload.operator = operator;
    if (master_aggregator) payload.master_aggregator = master_aggregator;
    if (service_id) payload.service_id = service_id;
    this.httpService.post(`${this.CMS_API}customer_care/refundTransactions`, payload).subscribe({
      next: res=>{
        if(!res.error){
          this.messageService.add({ severity: 'success', summary: 'Success', detail: res.message });
        }
        else{
          this.messageService.add({ severity: 'error', summary: 'Failed', detail: res.message });
        }
        const msisdn = this.f['msisdn'].value;
        const service_id = this.f['service_id'].value;
        const operator = this.f['operator'].value;
        const master_aggregator = this.f['master_aggregator'].value;
        this.getCustomerAllTransactions(msisdn, service_id, operator, master_aggregator);
      },
      error:err=>{
        this.messageService.add({ severity: 'error', summary: 'Failed', detail: err.error.message });
      }
    });
  }

  exportData(){
    let mssidn = this.f['msisdn'].value;
    let service_id = this.f['service_id'].value;
    let apiUrl = `${this.CMS_API}customer_care/export_customer_refunds?msisdn=${mssidn}&service_id=${service_id}`;
    const operator = this.f['operator'].value;
    const master_aggregator = this.f['master_aggregator'].value;
    if (operator) apiUrl += `&operator=${operator}`;
    if (master_aggregator) apiUrl += `&master_aggregator=${master_aggregator}`;
    this.excelExportService.exportToExcel(apiUrl).subscribe((excelData) => {
      const blob = new Blob([excelData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `customer-refunds-${mssidn}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

  isRowDisabled(data: any): boolean {
    return data.is_refund
  }

  onSelectionChange(selection: any[]) {
    this.selectedTransactions = []
    for (let i = selection.length - 1; i >= 0; i--) {
      let data = selection[i];
      if (this.isRowDisabled(data)) {
        selection.splice(i, 1);
      }
    }
    this.selectedTransactions = selection;
  }

  ngAfterViewInit(): void {
    
  }

}

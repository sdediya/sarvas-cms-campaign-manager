import { DatePipe } from '@angular/common';
import { Component, OnInit, ElementRef, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { CrudService } from 'src/app/services/common/crud.service';
import { ExcelExportService } from 'src/app/services/excelExport/excel-export.service';
import { HttpService } from 'src/app/services/http/http.service';
import { environment } from 'src/environments/environment';
import moment from 'moment';
@Component({
    selector: 'app-google-sheet',
    templateUrl: './google-sheet.component.html',
    styleUrls: ['./google-sheet.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class GoogleSheetComponent implements OnInit{
  
  read:boolean = false
	write:boolean = false
	delete:boolean = false
  CMS_API = environment.CMS_API;
  submitted : boolean = false;
  adaEditsubmitted : boolean = false;
  isValidForm : boolean = false;
  isEdit: boolean = false;
  maxDate:any;
  minDate:any;
  adPartners = []
  googleSheet = []
  loading: boolean = false;
  visible: boolean = false;
  visibleUpload: boolean = false;
  
  exist: string = '';
  
  Costsubmitted : boolean = false;
  selectedCostFile: any = null;
  BACKEND_DOMAIN = environment.BACKEND_DOMAIN;
  @ViewChild('themeFileInput', { static: false }) themeFileInput!: ElementRef;
  isLoading: boolean = false;
  
  googleSheetForm: FormGroup
  
  constructor(
    private frmbuilder:FormBuilder, 
    private httpService:HttpService,
    private crudService:CrudService,
    private excelExportService: ExcelExportService,
    private messageService: MessageService,
    private datePipe: DatePipe
  ){
    let permissions = this.crudService.hasPermission('operators')
    this.read = permissions.read
    this.write = permissions.write
    this.delete = permissions.delete

    this.googleSheetForm = frmbuilder.group({
      sheet_id: [''], // !required while edit
      sheet_partner_id: ['', [Validators.required]],
      sheet_googlesheet_id: ['', [Validators.required]],
      sheet_name: ['', [Validators.required]],
    });
  }
  
  
  ngOnInit(): void {
    this.googleSheetList()
  }
  
  get csf() { return this.googleSheetForm.controls; }

  googleSheetList () 
  {
     this.httpService.get(`${this.CMS_API}google-sheet/list`).subscribe({
        next:res=>{
          this.loading = false;
          if(!res.error){
            this.googleSheet = res.data.rows
          }else{
           this.googleSheet = [];
           this.messageService.add({ severity: 'error', summary: 'Failed', detail: res.message });
          }
        },
        error:err=>{
          this.googleSheet = [];
          this.messageService.add({ severity: 'error', summary: 'Failed', detail: err.error.message });
           //console.log(err)
         }
      })
  }

  addOrUpdateSheet() {
    if(this.googleSheetForm.status!=='INVALID'){
       let data = {
        ...this.googleSheetForm.value,
      };
      let api = this.isEdit ? 'google-sheet/edit':  'google-sheet/add'
      this.httpService.post(`${this.CMS_API}${api}`, data).subscribe({
        next:res => {
          this.visible = false;
          this.isEdit = false;
          this.googleSheetForm.reset();
          this.googleSheetList();
        },
        error:e=> {
          this.exist = e.error.message;
          this.messageService.add({ severity: 'error', summary: 'Failed', detail: e.error.message });
          console.log(e);
        }
      })

    }
  }

  statusToggle(sheet_id:any, status:any, index:any) {
    console.log(...arguments);

    let data = {
      sheet_id,
      sheet_status: status,
    }

    this.httpService.post(`${this.CMS_API}google-sheet/delete`, data).subscribe({
        next:res => {
          let statusMsg = status ? "Successfully Activated" : "Successfully Deactivated"
          this.messageService.add({ severity: 'success', summary: 'Success', detail: statusMsg });
        },
        error:e=> {
          this.exist = e.error.message;
          this.messageService.add({ severity: 'error', summary: 'Failed', detail: e.error.message });
          console.log(e);
        }
      })
  }

  getAdPartners(){
    // http://localhost:3000/api/cms/platform/list?page=1&limit=10&sortField=null&sortOrder=1&s=null
    this.httpService.get(`${this.CMS_API}platform/list?limit=ALL&s=null&status=1`).subscribe({
      next:(res: any)=>{      
        if(!res.error){
          this.adPartners = res.data.list
        }
      }
    })
  }
  
  
  
  
  
  showDialog(currlog_data:any = '') {
    this.visible = true
    this.getAdPartners();
    if(currlog_data!==''){
      this.isEdit = true
      console.log(currlog_data);
      let formPatchValue = {
        sheet_id: currlog_data.gSheet_id,
        sheet_partner_id: currlog_data.gSheet_partner_id,
        sheet_googlesheet_id: currlog_data.gSheet_googlesheet_id,
        sheet_name: currlog_data.gSheet_name,
      }
      this.googleSheetForm.patchValue(formPatchValue);
    }
  }

  
  
  reset(){
    this.isEdit = false; 
  }
  
}

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RxwebValidators } from '@rxweb/reactive-form-validators'
import { HttpService } from 'src/app/services/http/http.service';
import * as customValidator from 'src/app/utils/validators'
import { environment } from 'src/environments/environment';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CrudService } from 'src/app/services/common/crud.service';

@Component({
    selector: 'app-add-cron',
    templateUrl: './add-cron.component.html',
    styleUrls: ['./add-cron.component.css'],
    standalone: false
})
export class CronMasterComponent  implements OnInit{
  read:boolean = false
	write:boolean = false
	delete:boolean = false

  CMS_API = environment.CMS_API;

  [key:string]:any
  cronForm: any = FormGroup;

  submitted : boolean = false;
  isValidForm: boolean = false;
  telecom_operators: any;
  regions: any;
  campaignData: any;
  httpModes = [
    { label: 'GET', value: 'GET' },
    { label: 'POST', value: 'POST' },
    { label: 'BATCH', value: 'BATCH' }
  ];
  // Edit
  editable : boolean = false;
  cron_id:any;
  currentcron:any={
    cron_id:'',
    cron_name:'',
    cron_countryCode:'',
    cron_operator:'',
    cron_aggregator:'',
    cron_httpMode:'',
    cron_url:'',
    cron_isActive:'',
    cron_startTime:'',
    intervalMinutes:'',
    cron_isRetryOnFailure:'',
    cron_retryMinute:'',
    cron_maxRetryCount:'',
    
  }

  constructor(
    private frmbuilder:FormBuilder, 
    private httpService:HttpService,
    private route: ActivatedRoute,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private router: Router,
    private crudService:CrudService
){

  let permissions = this.crudService.hasPermission('masters')
  this.read = permissions.read
  this.write = permissions.write
  this.delete = permissions.delete
  if(!this.write){
    this.router.navigate(['no-access'])
  }

  this.route.queryParams
      .subscribe(params => {        
        if(params['id']){
          this.editable = true
          this.cron_id = params['id'];
        }
      }
      );
      this.cronForm = frmbuilder.group({    

        cron_name: ['', [Validators.required]],
        cron_countryCode: ['', [Validators.required]],
        cron_operator: ['', [Validators.required]],
       // cron_masterAggregator: ['', [Validators.required]],
        cron_httpMode: ['', [Validators.required]],
        cron_url: ['', [Validators.required]],
        cron_startTime: ['', [Validators.required]],
        intervalMinutes: ['', [Validators.required]],
        cron_isRetryOnFailure: [''],
        cron_retryMinute: ['', [Validators.required]],
        cron_maxRetryCount: ['', [Validators.required]],
        //cron_currentRetryCount: ['', [Validators.required]],
        cron_code: ['', [Validators.required]],
        

      });
  }

  ngOnInit(){
     this.getCampaignData()
   
  }

  getCampaignData(){
    this.httpService.get(`${this.CMS_API}campaign/campaign-data`).subscribe({
      next:res=>{
        if(!res.error){
          this.campaignData = res.data
          // this.telecom_operators = res.data.telecoms
          this.regions = res.data.regions               
        }
      },
      error:err=>{
        console.log(err)
      }
    })

     if(this.editable){
      this.getcronById();
    }
  }
    filterOnChange(ev:any, fieldName:string){
    let finalValues:any  = [];
    if(fieldName == 'region' && this.f['cron_countryCode'].value){
      let region_id :any
      this.regions.map((el:any)=>{
        if(el.name==ev.value)region_id = el.id
      })

      this.telecom_operators = [];
      this.campaignData.telecoms.map( (tel: any) => region_id==tel.region_id?finalValues.push(tel):'')
      this.telecom_operators = finalValues;

    } else if(this.f['cron_countryCode'].value == null){
      this.telecom_operators = [];
      this.f['cron_operator'].reset()
    }

  }
  // convenience getter for easy access to form fields
  get f() { return this.cronForm.controls; }

  getcronById(){
    this.httpService.get(`${this.CMS_API}crons/getcronById?cron_id=${this.cron_id}`).subscribe({
      next:res=>{
        if(!res.error){
          this.currentcron = res.data
          this.cronForm.addControl('cron_id', new FormControl('', []));
          this.cronForm.patchValue(res.data)
          const countryCode = this.cronForm.get('cron_countryCode')?.value;
          if (countryCode) {
            this.filterOnChange({ value: countryCode }, 'region');
          }
        }
      },
      error:err=>console.log(err)
    })
  }


  onSubmit(){
    this.submitted = true;
    console.log("this.cronForm", this.cronForm)
    if(this.cronForm.status!=='INVALID'){
      
      this.isValidForm = true;
      const data = {
        ...this.cronForm.value
      };
      let cronAction = this.editable ? "edit" : "add"
      this.httpService.post(`${this.CMS_API}crons/${cronAction}`, data).subscribe({
        next:res=>{
          if(!res.error){
            this.messageService.add({ severity: 'success', summary: 'Success', detail: res.message });
            setTimeout(()=>{
              this.router.navigate(['masters/list-cron'])
            },1e3)
          }
          else{
            this.messageService.add({ severity: 'error', summary: 'Failed', detail: res.message });
          }
        },
        error:err=>{
          console.log(err)
          this.messageService.add({ severity: 'error', summary: 'Failed', detail: err.error.message });
        }
      });
    }
    return false;
  }


}

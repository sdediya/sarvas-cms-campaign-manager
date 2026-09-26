import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, AbstractControl, ValidationErrors, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RxwebValidators, required } from '@rxweb/reactive-form-validators'
import { HttpService } from 'src/app/services/http/http.service';
import * as customValidator from 'src/app/utils/validators'
import { environment } from 'src/environments/environment';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CrudService } from 'src/app/services/common/crud.service';

@Component({
    selector: 'app-add-telcom',
    templateUrl: './add-telcom.component.html',
    styleUrls: ['./add-telcom.component.css'],
    standalone: false
})
export class AddTelcomComponent implements OnInit{

  read:boolean = false
	write:boolean = false
	delete:boolean = false
  
  CMS_API = environment.CMS_API;

  [key:string]:any
  telcomForm: any = FormGroup;

  submitted : boolean = false;
  isValidForm : boolean = false;

  telcomData : any = {};
  master_aggregators = [];
  regions = [];
  languages = [];
  services = [];
  telcom_flows_list = [
    { name: 'CG Flow', code: 'cg' },
    { name: 'PIN Flow', code: 'pin' },
    { name: 'PIN + Fraud Flow', code: 'pin_fraud' },
    { name: 'Hosted Button', code: 'hosted_button' },
    { name: 'SMS Pop Flow', code: 'cg_sms' },
  ];
  telcom_default_flows_readonly : boolean = false
  telcom_default_language_readonly : boolean = false

  ageingCalculationType = [
    {name: 'Activation', code: 'activation'},
    {name: 'Optin', code: 'optin'}
  ]

  lifecycle_managed_by_list = [
    { name: 'Telcom / Partner', code: 'telcom' },
    { name: 'Shemaroo', code: 'shemaroo' }
  ]
  telcom_default_flows_list : any = []
  telcom_default_language_list : any = []
  // Edit
  editable : boolean = false;
  tel_id:any;
  tel_service_delete:any = []
  currentTelcom:any={
    tel_id:'',
    tel_name: '',
    tel_lifecycle_managed_by: '',
    // tel_shemaroo_revenue: '',
    // tel_telcom_revenue: '',
    tel_max_otp_req: '',
    tel_otp_length:'',
    tel_repeat_usr_blacklist_days: '',
    tel_services: [],
    tel_region_id: '',
    tel_parking_status: '',
    tel_parking_days: '',
    tel_parking_retry_perday: '',
    tel_grace_status: '',
    tel_grace_days: '',
    tel_grace_retry_perday: '',
    tel_is_he: '',
    tel_is_refundable:'',
    tel_is_partner: '',
    tel_is_fallback: '',
    tel_is_shortcode: '',
    tel_default_flow:'',
    tel_flows: [],
    tel_ageing_sme_calculation:'',
    tel_default_language: '',
  }

  constructor(
    private frmbuilder:FormBuilder, 
    private httpService:HttpService,
    private route: ActivatedRoute,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private router: Router,
    private crudService:CrudService
  )
  {

    let permissions = this.crudService.hasPermission('operators')
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
          this.tel_id = params['id'];
        }
      }
    );

    this.telcomForm = frmbuilder.group({
      tel_name: ['', [Validators.required]],
      tel_lifecycle_managed_by: ['', [Validators.required]],
      tel_max_otp_req: ['', []],
      tel_otp_length:['', []],
      tel_repeat_usr_blacklist_days: [''],
      tel_is_partner: [false,[]],
      tel_services: this.frmbuilder.array([]),
      tel_service_deteled: [],
      tel_region_id: ['', [Validators.required]],
      tel_parking_status: [false,[]],
      tel_parking_days: ['', []],
      tel_parking_retry_perday: ['', []],
      tel_grace_status: [false, []],
      tel_grace_days: ['', []],
      tel_grace_retry_perday: ['', []],
      tel_is_he: [false, [Validators.required]],
      tel_is_fallback: [false, [Validators.required]],
      tel_is_shortcode: [false, [Validators.required]],
      tel_shortcode: [''],
      tel_service_shortcode: [''],
      tel_default_flow:['', [Validators.required]],
      tel_flows:[[], [Validators.required]],
      tel_languages:[[], [Validators.required]],
      tel_parking_times: this.frmbuilder.array([]),
      tel_grace_times: this.frmbuilder.array([]),
      tel_is_refundable: [false, [Validators.required]],
      tel_ageing_sme_calculation: ['activation', [Validators.required]],
      tel_ageing_legacy_calculation: ['activation', [Validators.required]],
      tel_default_language: ['', [Validators.required]],
    });

    // If free trial is active, then validation required for dependant fields
    // customValidator.default.conditionalRequired(this.telcomForm.get('tel_is_partner'), this.telcomForm.get('tel_services')) 

    // If shortcode is available, then validation required for dependant fields
    customValidator.default.conditionalRequired(this.telcomForm.get('tel_is_shortcode'), this.telcomForm.get('tel_service_shortcode')) 

    
    // If grace is active, then validation required for dependant fields
    this.telcomForm.get('tel_grace_status').valueChanges.subscribe((value:boolean)=> {
      let managed_by = this.f['tel_lifecycle_managed_by'].value;

      customValidator.default.updateValidations(managed_by == 'shemaroo' && value,this.telcomForm.get('tel_grace_retry_perday'),[Validators.required]);
      
      customValidator.default.updateValidations(value,this.telcomForm.get('tel_grace_days'),[Validators.required]);

    })

    // If parking is active, then validation required for dependant fields
    this.telcomForm.get('tel_parking_status').valueChanges.subscribe((value:boolean)=> {
      let managed_by = this.f['tel_lifecycle_managed_by'].value;
      customValidator.default.updateValidations(managed_by == 'shemaroo' && value, this.telcomForm.get('tel_parking_retry_perday'), [Validators.required]);

      customValidator.default.updateValidations(value,this.telcomForm.get('tel_parking_days'),[Validators.required]);
    })
    
    // If parking/grace is active, then validation required for dependant fields
    this.telcomForm.get('tel_lifecycle_managed_by').valueChanges.subscribe((value:string)=> {
      let parkingStatus = this.f['tel_parking_status'].value;
      let graceStatus = this.f['tel_grace_status'].value;

      customValidator.default.updateValidations(value == 'shemaroo' && parkingStatus,this.telcomForm.get('tel_parking_retry_perday'),[Validators.required]);

      customValidator.default.updateValidations(value == 'shemaroo' && graceStatus,this.telcomForm.get('tel_grace_retry_perday'),[Validators.required]);

    })

    this.telcomForm.get('tel_grace_retry_perday').valueChanges.subscribe((value:any)=> {
      if(this.telcomForm.get('tel_lifecycle_managed_by').value == 'shemaroo') {
        this.f['tel_grace_times'].clear();
        for (let index = 0; index < value; index++) {
          this.addGraceTime();
        }
      }
      
    });

    this.telcomForm.get('tel_parking_retry_perday').valueChanges.subscribe((value:any)=> {
      if(this.telcomForm.get('tel_lifecycle_managed_by').value == 'shemaroo') {
        this.f['tel_parking_times'].clear();
        for (let index = 0; index < value; index++) {
          this.addParkingTime(this.currentTelcom.tel_parking_times);
        }
      }
    });

    // TO avoid same parking schedule time
    this.f['tel_parking_times'].valueChanges.subscribe((x:any) => {
      var timesArr = x.map(function(item:any){ return item.time });
      var isDuplicate = timesArr.some(function(item:any, idx:any){ 
          return timesArr.indexOf(item) != idx  && item!==''
      });
      if(isDuplicate){
        this.f['tel_parking_times'].setErrors({'duplicate': true});
      }
      else{
        this.f['tel_parking_times'].setErrors(null);
      }
    });

    // TO avoid same grace schedule time
    this.f['tel_grace_times'].valueChanges.subscribe((x:any) => {
      var timesArr = x.map(function(item:any){ return item.time });
      var isDuplicate = timesArr.some(function(item:any, idx:any){ 
          return timesArr.indexOf(item) != idx  && item!==''
      });
      if(isDuplicate){
        this.f['tel_grace_times'].setErrors({'duplicate': true});
      }
      else{
        this.f['tel_grace_times'].setErrors(null);
      }
    });

    // To avoid duplicate service for the operator
    this.telcomForm.get('tel_services').valueChanges.subscribe((value:any)=> {
      const uniqueServices = this.removeDuplicates(value, 'telcom_service_id');
      console.log(value);
      if (uniqueServices.length < value.length) {
          this.messageService.add({ severity: 'error', summary: 'Duplicate Service', detail: 'Unable to add duplicate services' });
          while (this.tel_services.length !== 0) {
                this.tel_services.removeAt(0);
          }
          uniqueServices.forEach(value => {
            this.addService(value)
        });
      }

      value.forEach((element:any,index:any) => {
        if(element.shemaroo_revenue != '' && element.telcom_revenue != '' && (Number(element.shemaroo_revenue)+Number(element.telcom_revenue) > 100)){
          this.f['tel_services'].controls[index].controls['shemaroo_revenue'].setErrors({highRevenueShare: true})
          this.f['tel_services'].controls[index].controls['telcom_revenue'].setErrors({highRevenueShare: true})
        }else {
          this.f['tel_services'].controls[index].controls['shemaroo_revenue'].setErrors(null)
          this.f['tel_services'].controls[index].controls['telcom_revenue'].setErrors(null)
        }
        console.log(this.f['tel_services'])
      });
      // (const element of value) {
      //   console.log(element);
      //   console.log(this.f['tel_services'].controls[index]['shemaroo_revenue'])
      //   if(element.shemaroo_revenue != '' && element.telcom_revenue != '' && (Number(element.shemaroo_revenue)+Number(element.telcom_revenue) > 100)){
          
      //     // this.f['tel_services'][index]['shemaroo_revenue'].setErrors({highRevenueShare: true})
      //   }else {
      //     // this.f['tel_services'][index]['shemaroo_revenue'].setErrors(null);
      //   }
      // }
      
    })

  }
  
  ngOnInit(){
    this.getTelcomData();
    this.getLanguages();
  }

  // convenience getter for easy access to form fields
  get f() { return this.telcomForm.controls; }

  get tel_services() : FormArray {
    return this.telcomForm.get("tel_services") as FormArray
  }
  
  get tel_parking_time() : FormArray {
    return this.telcomForm.get("tel_parking_times") as FormArray
  }
  get tel_grace_time() : FormArray {
    return this.telcomForm.get("tel_grace_times") as FormArray
  }
  newService(value:any): FormGroup {
    return this.frmbuilder.group({
      telcom_id: [value.telcom_id || ''],
      telcom_partner_id: [value.telcom_partner_id || ''],
      telcom_service_id: [value.telcom_service_id || '', [Validators.required]],
      shemaroo_revenue: [value.shemaroo_revenue || '', [Validators.required]],
      telcom_revenue: [value.telcom_revenue || '', [Validators.required]],
    })  
  }

  newParkingTime(value:any): FormGroup {
    return this.frmbuilder.group({
      time: [value.time || '', [Validators.required]]
    })
  }

  newGraceTime(value:any): FormGroup {
    return this.frmbuilder.group({
      time: [value.time || '',[Validators.required]]
    })
  }

  addService(value:any= {}) {
    if(value.length){
      value.forEach((element:any) => {
        this.tel_services.push(this.newService(element));
      });
    }else {
      this.tel_services.push(this.newService(value));
    }
    
  }
  addParkingTime(value = {}) {
    this.tel_parking_time.push(this.newParkingTime(value));
  }
  addGraceTime(value = {}) {
    this.tel_grace_time.push(this.newGraceTime(value));
  }

  removePartner(i:number) {
    if(this.tel_services.length > 0) {
      this.tel_service_delete.push(this.tel_services.value[i].telcom_id)
      this.tel_services.removeAt(i);
    }
    
  }

  getTelcomData(){
    this.httpService.get(`${this.CMS_API}telcom/telcom-data`).subscribe({
      next:res=>{
        if(!res.error){
          this.telcomData = res.data
          this.master_aggregators = res.data.master_aggregators
          this.regions = res.data.regions
          this.services = res.data.services
          this.telcom_flows_list = res.data.flows
          if(this.editable){
            this.httpService.get(`${this.CMS_API}telcom/getTelecomById?telcom_id=${this.tel_id}`).subscribe({
              next:response=>{
                if(!response.error){
                  response.data.tel_languages = response.data.tel_languages ? response.data.tel_languages.split(",") : null
                  this.currentTelcom = response.data
                  this.addService(this.currentTelcom?.tel_services);
                  this.telcomForm.addControl('tel_id', new FormControl('', []));
                  if(response.data.tel_lifecycle_managed_by=='shemaroo'){
                    if(response.data.tel_grace_times) {
                      response.data.tel_grace_times = JSON.parse(response.data.tel_grace_times)
                      response.data.tel_grace_times.forEach((ele:any)=> {
                        this.addGraceTime(ele);
                      })
                    }
                    if(response.data.tel_parking_times) {
                      response.data.tel_parking_times = JSON.parse(response.data.tel_parking_times)
                      response.data.tel_parking_times.forEach((ele:any)=> {
                        this.addParkingTime(ele);
                      })
                    }
                  }
                  else{
                    response.data.tel_grace_times = []
                    response.data.tel_parking_times = []
                  }
                  let ageing_calculation = JSON.parse(response.data.tel_ageing_calculation);
                  response.data.tel_ageing_sme_calculation = ageing_calculation?.sme ?? 'activation'
                  response.data.tel_ageing_legacy_calculation =ageing_calculation?.legacy ?? 'activation'

                  this.telcomForm.patchValue(response.data)
                  this.onTelFlowChange(this.telcomForm.get('tel_flows'))
                  this.onTellanguageChange(this.telcomForm.get('tel_languages'))
                  this.telcomForm.get("tel_default_flow").setValue(response.data.tel_default_flow)
                  this.telcomForm.get("tel_default_language").setValue(response.data.tel_default_language)
                }
              },
              error:err=>{
                this.messageService.add({ severity: 'error', summary: 'Failed', detail: err.error.message });
              }
            })
          }
          else{
            this.addService()
          }
        }
      }
    })
  }

  getLanguages(){
    this.httpService.get(`${this.CMS_API}language/list`).subscribe({
      next:res=>{
        if(!res.error){
          this.languages = res.data
        }
      },
      error:err=>{
        console.log(err)
      }
    })
  }
  

  onTelFlowChange(e:any){
    let selectedFlows = e.value;
    this.telcom_default_flows_list = this.telcom_flows_list.filter((flow:any)=>{
      if(selectedFlows.includes(flow.code)){
        return flow;
      }
    });

    if(selectedFlows.includes('pin') || selectedFlows.includes('pin_fraud')) {
      this.telcomForm.get('tel_max_otp_req').addValidators(Validators.required)
      this.telcomForm.get('tel_otp_length').addValidators(Validators.required)
      this.telcomForm.get('tel_max_otp_req').setErrors([Validators.required])
      this.telcomForm.get('tel_otp_length').setErrors([Validators.required])
    }else {
      this.telcomForm.get('tel_max_otp_req').clearValidators()
      this.telcomForm.get('tel_otp_length').clearValidators()
      this.telcomForm.get('tel_max_otp_req').setErrors(null)
      this.telcomForm.get('tel_otp_length').setErrors(null)

      this.telcomForm.get('tel_max_otp_req').setValue("")
      this.telcomForm.get('tel_otp_length').setValue("")
    }

    if(this.telcom_default_flows_list.length == 1) {
      // TO DO - IF ONLY ONE FLOW SELECTED THEN SET IT AUTOMATICALLY AS DEFAULT FLOW
      this.telcomForm.get('tel_default_flow').setValue(this.telcom_default_flows_list[0].code);
      this.telcom_default_flows_readonly = true
    }else {
      this.telcomForm.get('tel_default_flow').setValue("");
      
      this.telcom_default_flows_readonly = false
    }
  }

  onSubmit(){
    this.submitted = true;
    console.log(this.telcomForm);
    if(this.telcomForm.status!=='INVALID'){
      this.isValidForm = true;
      
      let data = {
        ...this.telcomForm.value
      };
      data.tel_service_delete = this.tel_service_delete;
      data.tel_shortcode = this.f['tel_is_shortcode'].value ? this.f['tel_shortcode'].value : (this.f['tel_name'].value).replaceAll(' ','')
      // data.tel_languages = data.tel_languages.join(",")
      data.tel_languages = data.tel_languages.sort((a: string, b: string) => {
        if (a.toLowerCase() === "english") return -1;
        if (b.toLowerCase() === "english") return 1;
        return 0;
      }).join(",");
      data.tel_parking_times = JSON.stringify(data.tel_parking_times)
      data.tel_grace_times = JSON.stringify(data.tel_grace_times)

      data.tel_ageing_calculation = JSON.stringify({sme: data.tel_ageing_sme_calculation, legacy: data.tel_ageing_legacy_calculation});
      let telecomAction = this.editable ? "edit" : "add"      
      this.httpService.post(`${this.CMS_API}telcom/${telecomAction}`, data).subscribe({
        next:res=>{
          if(!res.error){
            this.messageService.add({ severity: 'success', summary: 'Success', detail: res.message });
            setTimeout(()=>{
              this.router.navigate(['operator/list'])
            },1e3)
          }
          else{
            this.messageService.add({ severity: 'error', summary: 'Failed', detail: res.message });
          }
        },
        error:err=> {
          this.messageService.add({ severity: 'error', summary: 'Failed', detail: err.error.message });
        }
      })
    }
    return false;
  }

  // removes duplicates from array of objects [based on key]
  removeDuplicates(array: any[], key: string): any[] {
      let lookup :any = {};
      return array.filter(obj => !lookup[obj[key]] && (lookup[obj[key]] = true));
  }

  hasService(type: string): boolean {
    let service = false;
    let legacyServices = ["Stylush","Gamesland","Gamiplex","ALL IN ONE FUN","Club Bolly","Humour & Viral","Life & Style","Mens World","Celeb Fitness","Bolly Shorties","Miniplex","Sports World","VDO Box","Viral And Humor","Mobiplex","Entertainment Store","South Plex","Fun Club"]
    for (const e of this.tel_services.value) {
      let service_name:any = this.services.find((service:any)=> service.id == e.telcom_service_id)
      service  = (service_name?.name == 'ShemarooMe' && type == 'sme') || (type == 'legacy' && legacyServices.includes(service_name?.name));
      if(service) {
        break;
      }
    }
    return service;
  }

  onTellanguageChange(e:any){
    let selectedLanguages = e.value;
    console.log("selectedLanguages",selectedLanguages)
    this.telcom_default_language_list = this.languages.filter((language:any)=>{
      if(selectedLanguages.includes(language.name)){
        return language;
      }
    });

    if(this.telcom_default_language_list.length == 1) {
      // TO DO - IF ONLY ONE FLOW SELECTED THEN SET IT AUTOMATICALLY AS DEFAULT FLOW
      this.telcomForm.get('tel_default_language').setValue(this.telcom_default_language_list[0].name);
      this.telcom_default_language_readonly = true
    }else {
      this.telcomForm.get('tel_default_language').setValue("");
      
      this.telcom_default_language_readonly = false
    }
  }

}

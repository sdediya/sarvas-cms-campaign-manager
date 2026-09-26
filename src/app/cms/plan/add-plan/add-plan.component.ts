import { Component, OnInit} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, AbstractControl, ValidationErrors, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RxwebValidators } from '@rxweb/reactive-form-validators'
import { HttpService } from 'src/app/services/http/http.service';
import * as customValidator from 'src/app/utils/validators'
import { environment } from 'src/environments/environment';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CrudService } from 'src/app/services/common/crud.service';

@Component({
    selector: 'app-add-plan',
    templateUrl: './add-plan.component.html',
    styleUrls: ['./add-plan.component.css'],
    standalone: false
})
export class AddPlanComponent implements OnInit{

  read:boolean = false
	write:boolean = false
	delete:boolean = false

  CMS_API = environment.CMS_API;

  [key:string]:any
  planForm: any = FormGroup;
  cValidator: any = customValidator

  submitted : boolean = false;
  isValidForm : boolean = false;

  planData : any = {};
  telcoms = [];
  regions = [];
  services: { id: number; name: string }[] = [];
  plan_validities = [
    { name: 'Daily', code: 'daily', sme_plan_id:'5ea2f586741cbb1b99000000' },
    { name: '3 Days', code: '3_days', sme_plan_id:'5ea2f586741cbb1b99000000' },
    { name: '14 Days', code: '14_days', sme_plan_id:'5ea2f586741cbb1b99000000' },
    { name: 'Weekly', code: 'weekly', sme_plan_id:'5e44e6b2741cbb358e000000' },
    { name: 'Monthly', code: 'monthly', sme_plan_id:'5b44845fc1df412ee6000000' },
    { name: 'Quarterly', code: 'quarterly', sme_plan_id:'5b44845fc1df412ee6000000' },
    { name: 'Half-Yearly', code: 'half_yearly', sme_plan_id:'5b44845fc1df412ee6000000' },
    { name: 'Yearly', code: 'yearly', sme_plan_id:'5b44845fc1df412ee6000000' }
  ];
  plan_validity_days :any = {
    daily:1,
    '3_days':3,
    '14_days':14,
    weekly:7,
    monthly:30,
    quarterly:90,
    half_yearly:180,
    yearly: 365
  }
  plan_name:any=''

  // Edit
  editable : boolean = false;
  plan_id:any;
  tel_languages: any;

  termsConditionForm:any = FormGroup ;
  campaign_confs:any=[];
  
  currentPlan:any={
    plan_id:'',
    plan_telcom_id: '',
    plan_name: this.plan_name,
    // plan_code: '',
    plan_amount: '',
    plan_validity: '',
    plan_terms_conditions: '',
    plan_smeplan_id: '',
    plan_region_id: '',
    plan_service_id: '',
    plan_is_free_trial: '',
    plan_free_trial_days: '',
    SmsConfigues: [],
  }
  temp_variable: any = [];
  sms_temp_types:any = [];
  languages :any = [];
  selected_telcom_name : any  = '';
  telecom_operators = []

  constructor(
    private frmbuilder:FormBuilder, 
    private httpService:HttpService,
    private route: ActivatedRoute,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private router : Router,
    private crudService: CrudService,
  ){

    let permissions = this.crudService.hasPermission('operator_plans')
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
          this.plan_id = params['id'];
        }
      }
    );

    this.planForm = frmbuilder.group({
      plan_telcom_id: ['', [Validators.required]],
      plan_amount: ['', [Validators.required]],
      plan_validity: ['', [Validators.required]],
      // plan_terms_conditions: ['', [Validators.required]],
      plan_smeplan_id: ['', [Validators.required]],
      plan_region_id: ['', [Validators.required]],
      plan_service_id: ['', [Validators.required]],
      plan_is_free_trial: [false,[]],
      plan_free_trial_days: ['',[]],
      plan_activation_keyword: ['',],
      plan_deactivation_keyword: ['',],
      plan_terms_conditions: this.frmbuilder.array([]),
      SmsConfigues: this.frmbuilder.array([]),
    });
    customValidator.default.conditionalRequired(this.planForm.get('plan_is_free_trial'), this.planForm.get('plan_free_trial_days')) 

    
  }

  get plan_terms_conditions() : FormArray {
    return this.planForm.get("plan_terms_conditions") as FormArray
  }
  get SmsConfigues() : FormArray {
    return this.planForm.get("SmsConfigues") as FormArray
  }
   addCampaignConfigue() {
    // validate existing controls before adding
    this.SmsConfigues.controls.forEach(control => {
      control.updateValueAndValidity();
      control.markAllAsTouched();
    });

    this.SmsConfigues.push(
      this.frmbuilder.group(
        {
          sms_temp_type: [''],
          sms_temp_lang: [''],
          sms_temp_msg: ['']
        },
        { validators: this.allOrNoneValidator() }
      )
    );
  }
   // 🔹 Set existing rows (edit mode)
  setSmsConfigues(data: any[]) {
    const formArray = this.SmsConfigues;
    formArray.clear();
    data.forEach(cfg => {
      formArray.push(
        this.frmbuilder.group(
          {
            sms_temp_type: [cfg.sms_temp_type || ''],
            sms_temp_lang: [cfg.sms_temp_lang || ''],
            sms_temp_msg: [cfg.sms_temp_msg || '']
          },
          { validators: this.allOrNoneValidator() }
        )
      );
    });
  }
  allOrNoneValidator() {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!(control instanceof FormGroup)) {
      return null;
    }

    const sms_temp_type = control.get('sms_temp_type')?.value;
    const sms_temp_lang = control.get('sms_temp_lang')?.value;
    const sms_temp_msg = control.get('sms_temp_msg')?.value;

    const isAnyFieldFilled = !!(sms_temp_type || sms_temp_lang || sms_temp_msg);
    const isAllFieldsFilled = !!(sms_temp_type && sms_temp_lang && sms_temp_msg);

    // Case 1: partially filled
    if (isAnyFieldFilled && !isAllFieldsFilled) {
      return { required: true };
    }

    // Case 2: duplicate check (same type + lang)
    const parent = control.parent as FormArray;
    if (isAllFieldsFilled && parent && parent.controls.length > 1) {
      const index = parent.controls.indexOf(control);
      const values = parent.value;
      const duplicates = values.filter(
        (item: any, i: number) =>
          i !== index &&
          item.sms_temp_type === sms_temp_type &&
          item.sms_temp_lang === sms_temp_lang
      );
      if (duplicates.length > 0) {
        return { exist: true };
      }
    }

      return null;
    };
  }

  CampaignConfiguesObjects(CampaignConfigues: any[], key1: string, value1: any, key2: string, value2: any,index : any): any[] {
    return CampaignConfigues.filter( (item, idx)=>idx != index && item[key1] === value1 && item[key2] === value2);
  }
  removeCampaignConfigue(i:number) {
    if(this.SmsConfigues.length > 0) {
      this.SmsConfigues.removeAt(i);
    }
  }
  addRemoveValidationsOnChange(condition:any,FormControl:FormControl|null, validations:any) {
    if(FormControl) {
      if(condition) {
        FormControl.setValidators(validations);
      }else {
        FormControl.clearValidators();
        FormControl.reset();
      }
      FormControl.updateValueAndValidity();
    }
  }
  ngOnInit(){
    this.getPlanData();
    this.addCampaignConfigue();
    this.getConstList();
    this.getTelcomList();

    this.planForm.get('plan_telcom_id').valueChanges.subscribe((tel_id:any)=> {
      let currentTel = this.telcoms.find((e:any)=> {return e.tel_id === tel_id});
      if(currentTel) {
        this.clearFormArray(this.plan_terms_conditions)
          let tel_languages:any = currentTel['tel_languages'];
          this.tel_languages = tel_languages.split(",");
          this.tel_languages.forEach((element:any) => {
            console.log(element)
              this.plan_terms_conditions.push(
                this.frmbuilder.group({
                  "terms_conditions": ['', Validators.required],
                  "terms_language": [element,Validators.required] 
                }
              ))
          });
        }
    })
  }

  clearFormArray = (formArray: FormArray) => {
    while (formArray.length !== 0) {
      formArray.removeAt(0)
    }
  }

  dropdownOnChange(ev: any, fieldName: string) {
    const selectedId = ev.value;
    const serviceName = this.getServiceNameById(this.f['plan_service_id'].value);
    // Handle changes based on the fieldName
    switch (fieldName) {
      case 'plan_service_id':
        if (serviceName === 'ShemarooMe') {
          const currentPlan = this.plan_validities.find(item => item.code === this.f['plan_validity'].value);
          if (currentPlan) {
            this.planForm.get('plan_smeplan_id').patchValue(currentPlan.sme_plan_id);
          }
        }
        break;
      case 'plan_region_id':
        this.telcoms = this.planData.telcoms.filter((tel: any)  => tel.tel_region_id === selectedId);
        this.planForm.get('plan_telcom_id').reset();
        break;
      case 'plan_validity':
        if (serviceName === 'ShemarooMe') {
          const selectedPlan = this.plan_validities.find(item => item.code === selectedId);
          if (selectedPlan) {
            this.planForm.get('plan_smeplan_id').patchValue(selectedPlan.sme_plan_id);
          }
        }
        break;
    }
    // Clear 'plan_smeplan_id' if the service is not 'ShemarooMe'
    if (serviceName !== 'ShemarooMe') {
      this.planForm.get('plan_smeplan_id').patchValue('');
    }
  }
  


  get f() { return this.planForm.controls; }

  async getPlanName(region_id:any, telcom_id:any, selectedPlan:any){
    let plan_name='';
    await this.regions.map((reg:any)=>{
      if(region_id==reg.id){
        plan_name+=`${reg.code}`
      }
    })
  
    await this.telcoms.map(async (tel:any)=>{
      if(telcom_id==tel.tel_id){
        plan_name+=`-${tel.code}`
      }
    })
    plan_name+=`-${selectedPlan}`

    return plan_name.toUpperCase();
  }

  setTelecom(regionId:any){
    let telcoms :any = []
    this.planData.telcoms.map((tel: any)=>{
      if(tel.tel_region_id==regionId){
        telcoms.push(tel)
      }
    })
    this.telcoms = telcoms
  }

  getPlanData(){
    this.httpService.get(`${this.CMS_API}plan/plan-data`).subscribe({
      next:res=>{
        if(!res.error){
          this.planData = res.data
          // this.telcoms = res.data.telcoms
          this.regions = res.data.regions
          this.services = res.data.services

          console.log(res.data)
          if(this.editable){
            this.httpService.get(`${this.CMS_API}plan/getPlanById?plan_id=${this.plan_id}`).subscribe({
              next:res=>{
                if(!res.error){
                  
                  res.data.plan_validity = Object.keys(this.plan_validity_days).find(key => this.plan_validity_days[key] === Number(res.data.plan_validity));
                  if (res.data.plan_sms_templates) {
                    res.data.plan_sms_templates = JSON.parse(res.data.plan_sms_templates);
                    this.setSmsConfigues(res.data.plan_sms_templates);
                  }
                  this.currentPlan = res.data
                  this.setTelecom(res.data.plan_region_id)
                  this.planForm.addControl('plan_id', new FormControl('', []));
                  res.data.plan_terms_conditions = res.data.terms_conditions
                  this.planForm.patchValue(res.data)
                  this.telcomOnChange(res.data.plan_telcom_id);
                  
                }
              },
              error:err=>{
                this.messageService.add({ severity: 'error', summary: 'Failed', detail: err.error.message });
              }
            })
          }
        }
      }
    })
  }

  async onSubmit(){
    this.submitted = true;
    // Mark everything touched
    this.planForm.markAllAsTouched();
    this.planForm.updateValueAndValidity();

    // Run SmsConfigues validation first (so errors show even if other fields invalid)
    let hasSmsError = false;
    this.SmsConfigues.controls.forEach(ctrl => {
      ctrl.updateValueAndValidity();
      ctrl.markAllAsTouched();
      if (ctrl.invalid) {
        hasSmsError = true;
      }
    });

    if (this.planForm.invalid || hasSmsError) {
      return false;
    }
    this.plan_name = await this.getPlanName(this.planForm.get('plan_region_id').value, this.planForm.get('plan_telcom_id').value, this.planForm.get('plan_validity').value)

    let curPlanArr = this.currentPlan.plan_name.split("-")
    curPlanArr.pop()
    curPlanArr = curPlanArr.join('-')

    if(this.planForm.status!=='INVALID'){
      this.isValidForm = true;
      const data = {
        ...this.planForm.value
      };
      data.plan_amount = +this.planForm.value.plan_amount
      data.plan_validity = this.plan_validity_days[`${this.planForm.value.plan_validity}`]
      data.plan_free_trial_days = this.planForm.value.plan_is_free_trial ? Number(this.planForm.value.plan_free_trial_days) : 0
      if(this.editable){
        if((this.currentPlan.plan_name !== this.plan_name)){
          data.plan_name = this.plan_name
        }
      }
      else{
        data.plan_name = this.plan_name
      }
      let planAction = this.editable ? "edit" : "add"      
      this.httpService.post(`${this.CMS_API}plan/${planAction}`, this.prepareRequestData(data)).subscribe({
        next:res=>{
          if(!res.error){
            this.messageService.add({ severity: 'success', summary: 'Success', detail: res.message });
            setTimeout(()=>{
              this.router.navigate(['plan/list'])
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

  getServiceNameById(id: number): string | undefined {
    const service = this.services.find(service => service.id === id);
    return service ? service.name : undefined;
  }
  addConstants(value: any, index: number) {
  const formArray = this.f['SmsConfigues'] as FormArray;
  const group = formArray.at(index) as FormGroup;

    const control = group.get('sms_temp_msg');
    control?.setValue(`${control.value || ''} ${value}`);
  }

  getConstList() {
    this.httpService.get(`${this.CMS_API}sms-templates/sms-const`).subscribe({
      next:res=>{
        if(!res.error){
          let types = res.data.template_types
          this.temp_variable =  res.data.template_variables

          Object.keys(types).forEach(e=> {
            this.sms_temp_types.push({name: e.replaceAll('_', ' ').replace("SMS",''), code: types[e]})
          })
        }
      },
      error:err=>console.log(err)
    })
    
  }
  // Get Languages of specific telcom operator
  telcomOnChange(ev:any){
    this.languages = []
    const telcom_id = ev?.value ?? ev;
    let telcom : any = this.telecom_operators.find((ele:any)=>  ele.id==telcom_id);
    this.selected_telcom_name = telcom.name ? telcom.name : ''
    if(telcom.languages){
      telcom.languages.split(",").forEach((ele:any) => {
        this.languages.push({name:ele})
      });
    }
  }

  getTelcomList(){
    this.httpService.get(`${this.CMS_API}telcom/list?limit=ALL&s=null&status=1`).subscribe({
      next:res=>{
        if(!res.error){
          this.telecom_operators = res.data.list.map((ele:any)=>{
            ele.name = `${ele.name} (${ele.region_name})`
            return ele
          })
        }
      },
      error:err=>console.log(err)
    })
  }

  private prepareRequestData(Formdata: any) {
  let data = { ...Formdata }; // shallow copy

  if (this.SmsConfigues && this.SmsConfigues.length > 0) {
    if (this.SmsConfigues.length === 1) {
      // Case 1: Only one entry
      const group = this.SmsConfigues.at(0).value;
      const allEmpty = !group.sms_temp_type && !group.sms_temp_lang && !group.sms_temp_msg;

      if (allEmpty) {
        delete data.SmsConfigues; // remove whole array
      }
    } else {
      // Case 2: More than one entry
      data.SmsConfigues = this.SmsConfigues.value.filter((group: any) => {
        const allEmpty = !group.sms_temp_type && !group.sms_temp_lang && !group.sms_temp_msg;
        return !allEmpty; // keep only non-empty groups
      });

      // If everything got filtered out, remove array completely
      if (data.SmsConfigues.length === 0) {
        delete data.SmsConfigues;
      }
    }
  }

  return data;
}
onSmsConfigChange() {
  this.SmsConfigues.controls.forEach(ctrl => {
    ctrl.updateValueAndValidity({ onlySelf: true, emitEvent: false });
  });
}

}

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RxwebValidators } from '@rxweb/reactive-form-validators'
import { HttpService } from 'src/app/services/http/http.service';
import * as customValidator from 'src/app/utils/validators'
import { environment } from 'src/environments/environment';
import { ConfirmationService, MessageService } from '@openng/optimus-ui/api';
import { CrudService } from 'src/app/services/common/crud.service';

@Component({
    selector: 'app-add-sms-templates',
    templateUrl: './add-sms-templates.component.html',
    styleUrls: ['./add-sms-templates.component.css'],
    standalone: false
})
export class AddSmsTemplatesComponent  implements OnInit{
  read:boolean = false
	write:boolean = false
	delete:boolean = false

  CMS_API = environment.CMS_API;

  [key:string]:any
  smsTempForm: any = FormGroup;

  submitted : boolean = false;
  isValidForm : boolean = false;
  temp_variable: any = [];

  sms_temp_types:any = [
    // {name:'OTP', code:'otp'},
    // {name:'Activation', code:'activation'},
    // {name:'Pre-renewal SMS', code:'pre_renewal'},
    // {name:'Renewal', code:'renewal'},
    // {name:'Unsub', code:'unsub'},
    // {name:'Content/Welcome SMS', code:'content'},
    // {name:'Promotional SMS', code:'promotional'}
  ];
  telecom_operators = []
  languages :any = []
  selected_telcom_name : any  = ''

  // Edit
  editable : boolean = false;
  sms_temp_id:any;
  currentSmsTemplate:any={
    sms_temp_id:'',
    sms_temp_type:'',
    sms_temp_name:'',
    sms_temp_telcom_id:'',
    sms_temp_lang:'',
    sms_temp_msg:''
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
          this.sms_temp_id = params['id'];
        }
      }
      );
      this.smsTempForm = frmbuilder.group({
        sms_temp_type: ['', [Validators.required]],
        sms_temp_telcom_id: ['', [Validators.required]],
        sms_temp_lang: ['', [Validators.required]],
        // sms_temp_name: ['', [Validators.required]],
        sms_temp_msg: ['', [Validators.required]],
      });
  }

  ngOnInit(){
    this.getTelcomList();
    this.getConstList();
    if(this.editable){
      this.getSmsTempById();
    }
  }

  // convenience getter for easy access to form fields
  get f() { return this.smsTempForm.controls; }

  getConstList() {
    this.httpService.get(`${this.CMS_API}sms-templates/sms-const`).subscribe({
      next:res=>{
        if(!res.error){
          let types = res.data.template_types
          this.temp_variable =  res.data.template_variables

          Object.keys(types).forEach(e=> {
            this.sms_temp_types.push({name: e.replaceAll('_', ' ').replace("SMS",''), code: types[e]})
          })
          

          // this.telecom_operators = res.data.list.map((ele:any)=>{
          //   ele.name = `${ele.region_name}-${ele.name}`
          //   return ele
          // })
        }
      },
      error:err=>console.log(err)
    })
    
  }

  getSmsTempById(){
    this.httpService.get(`${this.CMS_API}sms-templates/getSmsTemplateById?sms_temp_id=${this.sms_temp_id}`).subscribe({
      next:res=>{
        if(!res.error){
          this.currentSmsTemplate = res.data
          this.smsTempForm.addControl('sms_temp_id', new FormControl('', []));
          this.smsTempForm.patchValue(res.data)
          if(this.telecom_operators.length!==0){
            this.telcomOnChange({value:res.data.sms_temp_telcom_id})
          }
          else{
            this.getSmsTempById()
          }
        }
      },
      error:err=>console.log(err)
    })
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

  // Get Languages of specific telcom operator
  telcomOnChange(ev:any){
    this.languages = []
    let telcom_id = ev.value
    let telcom : any = this.telecom_operators.find((ele:any)=>  ele.id==telcom_id);
    this.selected_telcom_name = telcom.name ? telcom.name : ''
    if(telcom.languages){
      telcom.languages.split(",").forEach((ele:any) => {
        this.languages.push({name:ele})
      });
    }
  }

  onSubmit(){
    this.submitted = true;
    if(this.smsTempForm.status!=='INVALID'){
      this.isValidForm = true;
      let data = {
        ...this.smsTempForm.value
      };
      data.sms_temp_name = `${data.sms_temp_type}-${this.selected_telcom_name}`
      let smsTemplateAction = this.editable ? "edit" : "add"
      this.httpService.post(`${this.CMS_API}sms-templates/${smsTemplateAction}`, data).subscribe({
        next:res=>{
          if(!res.error){
            this.messageService.add({ severity: 'success', summary: 'Success', detail: res.message });
            setTimeout(()=>{
              this.router.navigate(['masters/sms-templates'])
            },1e3)
          }
          else{
            this.messageService.add({ severity: 'error', summary: 'Failed', detail: res.message });
          }
        },
        error:err=>{
          this.messageService.add({ severity: 'error', summary: 'Failed', detail: err.error.message });
        }
      });
    }
    return false;
  }

  addConstants(value: any) {
    this.f['sms_temp_msg'].setValue( `${this.f['sms_temp_msg'].value || ''} ${value}`);
  }

}

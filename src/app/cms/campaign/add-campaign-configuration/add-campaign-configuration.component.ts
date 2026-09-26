import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { RxwebValidators } from '@rxweb/reactive-form-validators'
import { HttpService } from 'src/app/services/http/http.service';
import { ConfirmationService, MessageService } from '@openng/optimus-ui/api';
import { ActivatedRoute, Router } from '@angular/router';
import { CrudService } from 'src/app/services/common/crud.service';

@Component({
    selector: 'app-add-campaign-configuration',
    templateUrl: './add-campaign-configuration.component.html',
    styleUrls: ['./add-campaign-configuration.component.css'],
    standalone: false
})
export class AddCampaignConfigurationComponent implements OnInit{
  read:boolean = false
  write:boolean = false
  delete:boolean = false

  disableTelco: boolean=false;
  campaignConfForm: any = FormGroup;
  submitted : boolean = false;
  isValidForm : boolean = false;
  entityLoading: boolean = false;

  CMS_API = environment.CMS_API;

  confType : string = '';
  conf_types = [
    { name: 'Drop', code:'drop' },
    { name: 'Capping', code:'capping' },
    { name: 'Blocking', code:'blocking' },
  ]
  conf_is_optin_capping= [
    { name: 'Billing', code:0 },
    { name: 'Optin', code:1 },
  ]
  conf_level_types = [
    { name: 'Telcom', code:'telcom' },
    { name: 'Service', code:'service' },
    { name: 'Plan', code:'plan' },
    { name: 'Ad-Partner', code:'platform' },
    { name: 'Campaign', code:'campaign' },
  ]
  conf_entities = []
  telcoms=[]
  // Edit
  editable : boolean = false;
  conf_id:any;
  currentConfiguration : any = {
    conf_id:'',
    conf_type:'',
    conf_level_type:'',
    conf_entity_id:'',
    conf_entity_value:'',
    conf_is_optin_capping:'',
    conf_telcom_id:'',
    conf_level_priority:''
  }
  


  constructor(
    private frmbuilder:FormBuilder,
    private httpService:HttpService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private route: ActivatedRoute,
    private router: Router,
    private crudService:CrudService
  ){

    let permissions = this.crudService.hasPermission('campaign_configurations')
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
          this.conf_id = params['id'];
          this.getConfigurationById(this.conf_id)
        }
      }
    );

    this.campaignConfForm = frmbuilder.group({
      conf_type:['', [Validators.required]],
      conf_level_type:['', [Validators.required]],
      conf_is_optin_capping:[''],
      conf_entity_id:['', [Validators.required]],
      conf_telcom_id:[''],
      conf_entity_value:['', [Validators.required, RxwebValidators.numeric({isFormat:true,allowDecimal:false,digitsInfo:"1"})]],
    })
  }


  ngOnInit(){this.getOperatorData()}

  // convenience getter for easy access to form fields
  get f() { return this.campaignConfForm.controls; }

  onSubmit(){
    this.submitted = true;
    console.log(this.campaignConfForm)
    if(this.campaignConfForm.status!=='INVALID'){
      this.isValidForm = true;
      const data = {
        ...this.campaignConfForm.value
      };
      let campaignConfAction = this.editable ? "edit" : "add"
      this.httpService.post(`${this.CMS_API}campaign/conf/${campaignConfAction}`, data).subscribe({
        next:res=>{
          if(!res.error){
            this.messageService.add({ severity: 'success', summary: 'Success', detail: res.message });
            setTimeout(()=>{
              this.router.navigate(['campaign/configuration-list'])
            },1e3)
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
  }

  onConfTypeChange(ev:any){
    this.confType = ev.value;
    if(this.confType=='blocking'){
      this.campaignConfForm.get('conf_entity_value').clearValidators(); 
      this.campaignConfForm.get('conf_entity_value').reset(''); 
    }
    else{
      this.campaignConfForm.get('conf_entity_value').addValidators([Validators.required, RxwebValidators.numeric({isFormat:true,allowDecimal:false,digitsInfo:"1"})]);
    }
  }
  async onConfLevelChange(ev:any){
    this.entityLoading = true
    this.conf_entities = []
    let confLevel = ev.value
    this.disableTelco= false;
    this.httpService.get(`${this.CMS_API}${confLevel}/list?limit=ALL&s=null&status=1`).subscribe({
      next:res=>{
        if(!res.error){
          this.entityLoading = false
          if(confLevel == 'telcom') {
            res.data.list.map((e:any)=> {
              e.name  = `${e.name} (${e.region_name})`
            })
          }
          else  if(confLevel == 'service') {
            this.disableTelco= true;
          }
          this.conf_entities = res.data.list
        }
      },
      error:err=>{
        console.log(err)
      }
    })
  }

  async getConfigurationById(conf_id:any){
    this.httpService.get(`${this.CMS_API}campaign/conf/getConfById?conf_id=${conf_id}`).subscribe({
      next: async res=>{
        if(!res.error){
          this.currentConfiguration = res.data
          console.log(res.data)
          await this.onConfLevelChange({value:res.data.conf_level_type})
          setTimeout(() => {
            this.campaignConfForm.addControl('conf_id', new FormControl('', []));
            this.campaignConfForm.patchValue(res.data);
          }, 1e3);
        }
      },
      error:err=>console.log(err)
    })
  }

  getOperatorData(){
    this.httpService.get(`${this.CMS_API}plan/plan-data`).subscribe({
      next:res=>{
        if(!res.error){
         
          res.data.telcoms.map((tel:any)=>{
            tel.tel_name = `${tel.tel_name} (${tel.tel_region_name})`
            tel.tel_id = `${tel.tel_id}`
            return tel
          })
          this.telcoms = res.data.telcoms
        }
      },
      error:err=>{
        console.log(err)
      }
    })
  }
}


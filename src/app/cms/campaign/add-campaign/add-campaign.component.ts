import { Component, OnInit} from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators,AbstractControl} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RxwebValidators } from '@rxweb/reactive-form-validators'
import { HttpService } from 'src/app/services/http/http.service';
import { environment } from 'src/environments/environment';
import { ConfirmationService , MessageService } from '@openng/optimus-ui/api';
import { ClipboardService } from 'ngx-clipboard';
import { CrudService } from 'src/app/services/common/crud.service';
import { Location } from '@angular/common';
import { provideIcons } from '@ng-icons/core';
import { lucideCopy, lucidePencil, lucidePlus, lucideTrash2, lucideX } from '@ng-icons/lucide';

@Component({
    selector: 'app-add-campaign',
    templateUrl: './add-campaign.component.html',
    styleUrls: ['./add-campaign.component.css'],
    standalone: false,
    viewProviders: [provideIcons({ lucideCopy, lucidePencil, lucidePlus, lucideTrash2, lucideX })],
})
export class AddCampaignComponent implements OnInit{
  read:boolean = false
  write:boolean = false
  delete:boolean = false
  entityLoading: boolean = false;
  loading: boolean = false;
  configurationSidebarVisible: boolean = false;
  CMS_API = environment.CMS_API;

  [key:string]:any
  campaignForm: any = FormGroup;
  campaignConfForm: any = FormGroup;

  submitted : boolean = false;
  isValidForm : boolean = false;
  Sidebarsubmitted : boolean = false;
  selected_report_tosend = false;
  
  campaignData : any = {};
  telecom_operators: any[] = [];
  telecom_plans: any[] = [];
  advertising_platforms: any[] = [];
  services: any[] = [];
  campaign_flows :any = [];
  isFlowReadonly : boolean = false;
  campaign_owners: any[] = [];

  // redirections 
  campaign_redirections:{ name: string; code: string }[] = [];
  post_capping_redirections: any[] = []
  blocking_redirections: any[] = []
  not_found_redirection: any[] = []

  campaign_tpid_redirects = [
    { name: 'Auto Login to Shemaroome', code: '27' },
    { name: 'Redirect to Playstore', code: '14' },
    { name: 'Other', code: '30' }
  ];

  campaign_redirection = [
    {name: "No Access Page", code: environment.NO_ACCESS_PAGE},
    {name: "https://www.shemaroome.com/", code: "https://www.shemaroome.com/"}
  ]

  confType : string = '';
  confTypeSidebar : string = '';
  conf_types = [
    { name: 'Drop', code:'drop' },
    { name: 'Capping', code:'capping' },
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
  lazyLoadEvent:any;
  conf_entities = []

  platform_callback_urls: any[] = [];
  campaign_regions: any[] = [];
  campaign_name:any='';
  existing_campaign_name:any='';
  campaign_confs:any=[]
  totalRecords: number = 0;
  visibility: { [key: string]: boolean } = {};
  
  // Edit
  editable : boolean = false;
  campaign_id:any;
  currentCampaign:any={
    campaign_id:'',
    campaign_name:this.campaign_name,
    campaign_service_id:'',
    campaign_region:'',
    campaign_telecom_id:'',
    campaign_plan_id:'',
    campaign_flow:'',
    campaign_c1:'',
    campaign_c2:'',
    campaign_skip_msisdn:'',
    campaign_type:'',
    campaign_service_options:'',
    campaign_platform_id:'',
    campaign_callback_url:'',
    campaign_cost_per_aquisition:'',
    campaign_cost_per_click:'',
    campaign_dt:'',
    campaign_wf:'',
    campaign_tpid:'',
    campaign_skip_type:'',
    campaign_skip_times: '',
    campaign_ga_tag: '',
    campaign_report_send_to: '',
    campaign_report_send_CC: '',
    campaign_report_alerts: '',
    campaign_is_google_campaign: '',
    campaign_is_silent_redirect: '',
    campaign_report_type: '',
    campaign_ga_events: [],
    CampaignConfigues: [],
    campaign_owner_id: '',
    campaign_exclude_cost: 0
  }

  currentConfiguration : any = {
    conf_id:'',
    conf_type:'',
    conf_level_type:'',
    conf_entity_id:'',
    conf_entity_value:'',
    conf_level_priority:'',
    conf_is_optin_capping:'',
    conf_entity_name:''
  }

  ga_events:any = [
    {name: "Landing Page Subscribe Button", value: 'lp_subscribe'},
    {name: "OTP Page Subscribe Button", value: 'opt_subscribe'},
    {name: "Success Page", value: 'success_page'}
  ] 
 campaign_report_type:any = [
    {name: "Activation Report", value: 'activation_report'},
    {name: "FTD Parking Report", value: 'ftp_parking_report'},
    {name: "Renewal Report", value: 'renewal_report'}
  ] 
  skip_type:any = [
    {value: 'entire_day', name: "Entire Day"},
    {value: 'multiple_times', name: "Times In a Day"}
  ]

  regionToString = (id: unknown) => (this.campaign_regions as any[]).find((r: any) => r.id == id)?.name ?? '';
  telecomToString = (id: unknown) => (this.telecom_operators as any[]).find((t: any) => t.id == id)?.name ?? '';
  serviceToString = (id: unknown) => (this.services as any[]).find((s: any) => s.id == id)?.name ?? '';
  planToString = (id: unknown) => (this.telecom_plans as any[]).find((p: any) => p.id == id)?.name ?? '';
  flowToString = (code: unknown) => (this.campaign_flows as any[]).find((f: any) => f.code == code)?.name ?? '';
  ownerToString = (id: unknown) => (this.campaign_owners as any[]).find((o: any) => o.id == id)?.name ?? '';
  skipTypeToString = (value: unknown) => (this.skip_type as any[]).find((s: any) => s.value == value)?.name ?? '';
  redirectionToString = (code: unknown) => this.campaign_redirections.find((r) => r.code == code)?.name ?? '';
  postCappingToString = (code: unknown) => (this.post_capping_redirections as any[]).find((r: any) => r.code == code)?.name ?? '';
  blockingToString = (code: unknown) => (this.blocking_redirections as any[]).find((r: any) => r.code == code)?.name ?? '';
  notFoundToString = (code: unknown) => (this.not_found_redirection as any[]).find((r: any) => r.code == code)?.name ?? '';
  platformToString = (id: unknown) => (this.advertising_platforms as any[]).find((p: any) => p.id == id)?.name ?? '';
  callbackUrlToString = (url: unknown) => String(url ?? '');
  confTypeToString = (code: unknown) => this.conf_types.find((t) => t.code == code)?.name ?? '';
  confLevelToString = (code: unknown) => this.conf_level_types.find((t) => t.code == code)?.name ?? '';
  confCappingToString = (code: unknown) => this.conf_is_optin_capping.find((t) => t.code == code)?.name ?? '';

  constructor(
      private frmbuilder:FormBuilder, 
      private httpService:HttpService,
      private route: ActivatedRoute,
      private messageService: MessageService,
      private router: Router,
      private clipboardService: ClipboardService,
      private crudService: CrudService,
      private location: Location
  ){
    let permissions = this.crudService.hasPermission( 'campaigns')
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
          this.campaign_id = params['id'];
        }
      }
    );
    
    this.campaignForm = frmbuilder.group({
      // campaign_name: ['', [Validators.required]],
      campaign_service_id: ['', [Validators.required]],
      campaign_region: ['', [Validators.required]],
      campaign_telecom_id: ['', [Validators.required]],
      campaign_plan_id: ['', [Validators.required]],
      campaign_platform_id: ['', [Validators.required]],
      campaign_cost_per_aquisition: [null,  [ Validators.required,  Validators.min(0),  Validators.max(100), RxwebValidators.numeric({isFormat:true,allowDecimal:true,digitsInfo:"1.2"})]],
      campaign_cost_per_click: [null,  [ Validators.required,  Validators.min(0),  Validators.max(100), RxwebValidators.numeric({isFormat:true,allowDecimal:true,digitsInfo:"1.2"})] ],
      campaign_c1: [''],
      campaign_c2: [''],
      campaign_skip_msisdn: [''],
      campaign_type: ['', [Validators.required]],
      campaign_service_options:['', [Validators.required]],
      campaign_flow: ['', [Validators.required]],
      campaign_callback_url: ['', [Validators.required]],
      campaign_callback_method: ['post'],
      campaign_dt: [''],
      campaign_wf: [''],
      campaign_tpid: [null],
      campaign_skip_type: [''],
      campaign_redirection_capping: [''],
      campaign_redirection_blocking: [''],
      campaign_redirection_404: [''],
      campaign_skip_times: this.frmbuilder.array([]),
      campaign_ga_tag: [''],
      campaign_report_send_to: [''],
      campaign_report_send_CC: [''],
      campaign_ga_events: [[]],
      campaign_report_type: [[]],
      campaign_report_alerts: [false],
      campaign_is_google_campaign: [false],
       campaign_is_silent_redirect: [false],
      CampaignConfigues: this.frmbuilder.array([]),
      campaign_owner_id: [''],
      campaign_google_campaign_id: [''],
      campaign_gtm: [''],
      campaign_exclude_cost: [0]
    });

    this.campaignConfForm = frmbuilder.group({
      conf_entity_name:['', [Validators.required]],
      conf_type:['', [Validators.required]],
      conf_is_optin_capping:[''],
      conf_level_type:['', [Validators.required]],
      conf_entity_id:['', [Validators.required]],
      conf_entity_value:['', [Validators.required, RxwebValidators.numeric({isFormat:true,allowDecimal:false,digitsInfo:"1"})]],
    })

    this.f['campaign_report_alerts'].valueChanges.subscribe((value:any)=> {
      this.addRemoveValidationsOnChange(value, this.f['campaign_report_type'], [Validators.required])
      this.addRemoveValidationsOnChange(value, this.f['campaign_report_send_to'], [Validators.required])
      this.addRemoveValidationsOnChange(value, this.f['campaign_report_send_CC'], [Validators.required])
    })

    // On Campaign type change
    this.f['campaign_type'].valueChanges.subscribe((value:any)=>{
      let optionVal = value=='service' ? 'optin' : 'billing'
      this.campaignForm.get('campaign_service_options').setValue(optionVal)

      this.campaignForm.get('campaign_flow').setValue('')
      // this.addRemoveValidationsOnChange(value == 'service', this.f['campaign_service_options'], [Validators.required])
      this.addRemoveValidationsOnChange(value == 'wap', this.f['campaign_redirection_capping'], [Validators.required])
      this.addRemoveValidationsOnChange(value == 'wap', this.f['campaign_redirection_blocking'], [Validators.required])
      this.addRemoveValidationsOnChange(value == 'wap', this.f['campaign_redirection_404'], [Validators.required])
      this.addRemoveValidationsOnChange(value == 'wap', this.f['campaign_tpid'], [Validators.required])
    })
    
    // On Skip C1 change
    this.f['campaign_c1'].valueChanges.subscribe((value:any)=>{
      let c2 = this.f['campaign_c2'].value;
      this.f['campaign_skip_type'].reset();
      this.addRemoveValidationsOnChange(value || c2, this.f['campaign_skip_type'], [Validators.required])
      this.dtWfRequired()
    });

    // On Skip C2 change
    this.f['campaign_c2'].valueChanges.subscribe((value:any)=>{
      let c1 = this.f['campaign_c1'].value;
      this.f['campaign_skip_type'].reset();
      this.addRemoveValidationsOnChange(c1 || value, this.f['campaign_skip_type'], [Validators.required])
      this.dtWfRequired()
    });

    //Reset all skip time array
    this.f['campaign_skip_type'].valueChanges.subscribe((value:any)=> {
        this.campaignSkipTimes.clear();
        
        this.addTimes(this.currentCampaign.campaign_skip_times);
        if(value == 'entire_day') {
          this.campaignSkipTimes.controls.forEach(e=> {
            e.get('start_time')?.clearValidators()
            e.get('end_time')?.clearValidators()
            
            e.get('start_time')?.updateValueAndValidity()
            e.get('end_time')?.updateValueAndValidity()
            
          })
      }
      
    })

    // On Data flow time change (Checks for DT or WF value and toggle validations  - any one is required)
    this.f['campaign_dt'].valueChanges.subscribe((value:any)=>{
      this.isDtWfHasValue()
    })
    // On Wifi flow time change (Checks for DT or WF value and toggle validations  - any one is required)
    this.f['campaign_wf'].valueChanges.subscribe((value:any)=>{
      this.isDtWfHasValue()
    })

  }

  ngOnInit(){
     this.getCampaignData();
     this.addCampaignConfigue();
  }

  // convenience getter for easy access to form fields
  get fc() { return this.campaignConfForm.controls; }
  //ngAfterViewInit() {
    
  //}

  // (Checks for C1 or C2 value and toggle validations for DT, WF  - any one is required)
  dtWfRequired(){
    // If Skip C1 or C2 value exists then add validations (DT or WF is required)
    if(this.f['campaign_c1'].value || this.f['campaign_c2'].value){
      this.f['campaign_dt'].setValidators([Validators.required, RxwebValidators.numeric({isFormat:true,allowDecimal:false,digitsInfo:"1"})])
      this.f['campaign_wf'].setValidators([Validators.required, RxwebValidators.numeric({isFormat:true,allowDecimal:false,digitsInfo:"1"})])
      this.f['campaign_skip_times'].setValidators([Validators.required])
    }
    // If Skip C1 or C2 value not exists then remove validations (DT or WF not required)
    else{
      this.f['campaign_dt'].setValidators(null)
      this.f['campaign_wf'].setValidators(null)
      this.f['campaign_skip_times'].setValidators(null)
      this.f['campaign_dt'].reset();
      this.f['campaign_wf'].reset();
      this.f['campaign_skip_times'].reset();
      this.campaignSkipTimes.clear()

    }
  }

  // (Checks for DT or WF value and toggle validations  - any one is required)
  isDtWfHasValue(){
    // If DT or WF, have value - remove validators and errors
    if((this.f['campaign_dt'].value || this.f['campaign_wf'].value) && (this.f['campaign_c1'].value || this.f['campaign_c2'].value)){
      this.campaignForm.get('campaign_dt').setValidators(null)
      this.campaignForm.get('campaign_wf').setValidators(null)
      this.campaignForm.get('campaign_dt').setErrors(null)
      this.campaignForm.get('campaign_wf').setErrors(null)
    }

    // If DT or WF, not have value - add validators and errors
    if((!this.f['campaign_dt'].value && !this.f['campaign_wf'].value) && (this.f['campaign_c1'].value || this.f['campaign_c2'].value)){
      this.campaignForm.get('campaign_dt').setValidators([Validators.required, RxwebValidators.numeric({isFormat:true,allowDecimal:false,digitsInfo:"1"})])
      this.campaignForm.get('campaign_wf').setValidators([Validators.required, RxwebValidators.numeric({isFormat:true,allowDecimal:false,digitsInfo:"1"})])
      this.campaignForm.get('campaign_dt').setErrors({required:true})
      this.campaignForm.get('campaign_wf').setErrors({required:true})
    }
  }

  getCampaignData(){
    this.httpService.get(`${this.CMS_API}campaign/campaign-data`).subscribe({
      next:res=>{
        if(!res.error){
          this.campaignData = res.data
          this.campaign_regions = res.data.regions
          this.advertising_platforms = res.data.ad_platforms
          this.campaign_owners= res.data.campaignOwners
          if(this.editable){
            this.httpService.get(`${this.CMS_API}campaign/getCampaignById?campaign_id=${this.campaign_id}`).subscribe({
              next:res=>{
                if(!res.error){
                  this.currentCampaign = res.data
                  if(res.data.campaign_region){
                    this.setTelecomAndPlan(res.data.campaign_region, res.data.campaign_telecom_id, res.data.campaign_service_id)
                    this.setFlowsByTelcom(res.data.campaign_telecom_id);
                  }
                  if(res.data.campaign_platform_id){
                    this.setPlatformURL(res.data.campaign_platform_id)
                  }
                  
                  res.data.campaign_c1 = res.data.campaign_c1==1?true:false
                  res.data.campaign_c2 = res.data.campaign_c2==1?true:false
                  res.data.campaign_skip_msisdn = res.data.campaign_skip_msisdn==1?true:false
                  res.data.campaign_report_alerts = res.data.campaign_report_alerts==1?true:false
                  res.data.campaign_is_google_campaign = res.data.campaign_is_google_campaign==1?true:false
                  res.data.campaign_is_silent_redirect = res.data.campaign_is_silent_redirect==1?true:false
                  res.data.campaign_ga_events = res.data.campaign_ga_events?.split(",");
                  res.data.campaign_report_type = res.data.campaign_report_type?.split(",");
                  res.data.campaign_callback_method = res.data.campaign_callback_method? res.data.campaign_callback_method : 'post' 
                  this.campaignForm.addControl('campaign_id', new FormControl('', []));
                  res.data.campaign_skip_times = JSON.parse(res.data.campaign_skip_times);

                  this.existing_campaign_name = res.data.campaign_name;

                  this.campaignForm.patchValue(res.data);
                  this.dtWfRequired();
                  this.nextPage(this.lazyLoadEvent,'');
                  // Get campaign redirections by service
                  this.getCampaignRedirectionData(this.currentCampaign.campaign_service_id)
                }
              },
              error:err=>console.log(err)
            })
          }
        }
      },
      error:err=>{
        console.log(err)
      }
    })
  }

  dropdownOnChange(ev:any, fieldName:string){
    let selectedId = ev.value
    let finalValues:any  = [];
    
    /*
      Event - onchange region
      set   - operator
      blank - service, plan
    */
    if(fieldName=='campaign_region'){
      this.telecom_operators = [];
      this.services = [];
      this.telecom_plans = [];
      this.campaignForm.get('campaign_telecom_id').reset()
      this.campaignForm.get('campaign_service_id').reset()
      this.campaignForm.get('campaign_plan_id').reset()

      this.campaignData.telecoms.map( (tel: any) =>selectedId==tel.region_id?finalValues.push(tel):'')
      this.telecom_operators = finalValues;
    }

    /*
      Event - onchange operator
      set   - service, flow
      blank - plan
    */
    if(fieldName=='campaign_telecom_id'){
      let services : any = []
      let flows :any = []
      let plans :any = []

      this.campaignData.telecoms.map((tel: any) =>{

        selectedId==tel.id?tel.tel_services.map((service: any)=>{
          services.push(service)
        }):''

        selectedId==tel.id?tel.flows.map((flow: any)=>{
          flows.push(flow)
        }):''
      })
      this.services = services;
      this.campaign_flows = flows;
      this.telecom_plans = plans;
    }

    /*
      Event - onchange service
      set   - plan
    */
    if(fieldName=='campaign_service_id'){
      this.campaignForm.get('campaign_plan_id').reset()
      let regionId = this.campaignForm.get('campaign_region')?.value;
      let telecomId = this.campaignForm.get('campaign_telecom_id')?.value;
      let plans : any = []

      if(regionId && telecomId){
        this.campaignData.telecoms.map((tel: any) =>{
          // Telecom Check
          telecomId==tel.id ? tel.plans.map((plan: any)=>{
            // Service Check
            // plan.name = ;
            let plan_id = plan.name.substring(plan.name.length - 4)
            let new_plan = {...plan, name: `${this.getPlanName(plan.name)} (${plan_id}) (${plan.currency }${plan.amount})`} 
            console.log(JSON.stringify(new_plan))
            selectedId==plan.service_id?plans.push(new_plan):''
          }):''
        })
        this.telecom_plans = plans;
      }
      // If OTT selected show campaign_tpid
      this.addRemoveValidationsOnChange(selectedId==environment.SHEMAROOME_SERVICE_ID,this.campaignForm.get('campaign_tpid'),[Validators.required])

      // Get campaign redirections by service
      this.getCampaignRedirectionData(selectedId)
    }
    
    
    if(fieldName=='campaign_platform_id'){
      this.campaignData.ad_platforms.map((platform: any) =>{
        if(selectedId==platform.id){
          platform.s2s_url.map((s2s: any)=>{ selectedId == s2s.platform_id ? finalValues.push(s2s):''})
          
          if(platform.s2s_url.length==1){
            this.campaignForm.patchValue({ campaign_callback_url: platform.s2s_url[0].url, campaign_callback_method: platform.s2s_url[0].request_method });
          }
        }
      })
      this.platform_callback_urls = finalValues
    }

    if(fieldName == 'campaign_callback_url') {
      this.platform_callback_urls.map((urlObject: any) =>{
        if(urlObject.url == selectedId) {
          this.f["campaign_callback_method"].patchValue(urlObject.request_method)
        }
      })
    }
    this.nextPage(this.lazyLoadEvent,fieldName);
   }

  setFlowsByTelcom(telcom_id:any){
    let flows :any = []
        this.campaignData.telecoms.map((tel:any)=>{
            telcom_id==tel.id?tel.flows.map((flow:any)=>{
                flows.push(flow)
            }):''
        })
        this.campaign_flows = flows
    }

  copyS2Surl(): void {
    let S2s_link = this.campaignForm.get('campaign_callback_url').value || '-'
    let isCopied = this.clipboardService.copyFromContent(S2s_link);
    if(isCopied){
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Copied: S2S Link!' });
    }
  }

  setTelecomAndPlan(regionId:any, telecomId:any, serviceId:any){
    let telecoms :any = []
    let plans:any = []
    let services:any = []
    this.campaignData.telecoms.map((tel: any)=>{
      if(tel.region_id==regionId){
        telecoms.push(tel)

        telecomId==tel.id?tel.tel_services.map((service: any)=>{
          services.push(service)
        }):''

        tel.plans.map((plan: any)=>{
          if(plan.telcom_id==telecomId && plan.service_id==serviceId){
            let plan_id = plan.name.substring(plan.name.length - 4)
            let new_plan = {...plan, name: `${this.getPlanName(plan.name)} (${plan_id}) (${plan.currency }${plan.amount})`}
            plans.push(new_plan) 
          }
        })
      }
    })
    this.telecom_operators = telecoms
    this.services = services
    this.telecom_plans = plans
  }

  setPlatformURL(platformId:any){
    let platformURLs:any = []
    this.campaignData.ad_platforms.map((platform:any)=>{
      if(platform.id==platformId){
        platformURLs = platform.s2s_url
      }
    })
    this.platform_callback_urls = platformURLs
  }

  // convenience getter for easy access to form fields
  get f() { return this.campaignForm.controls; }

  async getCampaignName(region_id:any, telcom_id:any, plan_id:any, campaign_type:any){
    let campaign_name='';
    let selectedPlans :any = [];
    await this.campaignData.regions.map((reg:any)=>{
      if(region_id==reg.id){
        campaign_name+=`${reg.isocode}`
      }
    })
  
    await this.campaignData.telecoms.map(async (tel:any)=>{
      if(telcom_id==tel.id){
        campaign_name+=`-${tel.shortcode}`
        selectedPlans = tel.plans
      }
    })
    
    await selectedPlans.map((plan:any)=>{
      if(plan_id==plan.id){
        campaign_name+=`-${this.getPlanName(plan.name)}`
      }
    })
    campaign_name+=`-${campaign_type}`
    return campaign_name.toUpperCase();
  }

  valueCheck(){
    if(this.f['campaign_report_type'].value.length == 0){
      this.f['campaign_report_send_to'].reset();
      this.f['campaign_report_send_CC'].reset();
      this.f['campaign_report_type'].reset();
      this.selected_report_tosend = false;
    }else{    
      this.selected_report_tosend = true;
    }
  }
  
  cancel(): void {
    this.router.navigate(['/campaign/list']);
  }

  isArrayValueChecked(controlName: string, value: string): boolean {
    const current = this.f[controlName]?.value;
    return Array.isArray(current) && current.includes(value);
  }

  toggleArrayValue(controlName: string, value: string, checked: boolean): void {
    const ctrl = this.f[controlName];
    const current: string[] = Array.isArray(ctrl?.value) ? [...ctrl.value] : [];
    const idx = current.indexOf(value);
    if (checked && idx === -1) {
      current.push(value);
    }
    if (!checked && idx > -1) {
      current.splice(idx, 1);
    }
    ctrl.setValue(current);
    if (controlName === 'campaign_report_type') {
      this.valueCheck();
    }
  }

  async onSubmit(){    
    this.submitted = true;
    console.log(this.campaignForm);
    if(this.campaignForm.status!=='INVALID'){
      this.isValidForm = true;
      this.campaign_name = await this.getCampaignName(this.campaignForm.get('campaign_region').value, this.campaignForm.get('campaign_telecom_id').value, this.campaignForm.get('campaign_plan_id').value, this.campaignForm.get('campaign_type').value)
      const raw = this.campaignForm.getRawValue();
      let data = {
        ...raw,
        campaign_ga_events: raw.campaign_ga_events?.join(','),
        campaign_report_type: raw.campaign_report_type?.join(',')
      };
      
      data.campaign_name = this.campaign_name
      if(this.editable){
        data.update_campaign_name = false;
        if(this.currentCampaign.campaign_cost_per_aquisition!==this.f['campaign_cost_per_aquisition'].value || this.currentCampaign.campaign_cost_per_click!==this.f['campaign_cost_per_click'].value) {
          data.cost_changed = true
        }
    
        if(this.currentCampaign.campaign_name.slice(0, -5) !== this.campaign_name){
          data.campaign_name = this.campaign_name
          data.update_campaign_name = true;
        }
      }

      let campaignAction = this.editable ? "edit" : "add"
      this.httpService.post(`${this.CMS_API}campaign/${campaignAction}`, data).subscribe({
        next:res=>{
          if(!res.error){
            // Flag to track if at least one key has value
            let atLeastOneKeyHasValue = false;
            // Check if formArray exists and has controls
            if (this.CampaignConfigues && this.CampaignConfigues.controls && this.CampaignConfigues.controls.length > 0) {
              // Iterate through each control in the form array
              this.CampaignConfigues.controls.forEach(control => {
                const value = control.value;
                // Check if any key has a non-empty value
                if (Object.values(value).some(val => !!val)) {
                  atLeastOneKeyHasValue = true;
                  return; // Exit the loop if at least one key has value
                }
              });
           
            if(atLeastOneKeyHasValue){
              data.capaignid=this.editable?this.campaign_id:res.data; 
              this.httpService.post(`${this.CMS_API}campaign/conf/multipleadd`, data).subscribe({
                next:res=>{
                  if(!res.error){
                    // this.messageService.add({ severity: 'success', summary: 'Success', detail: res.message });
                    setTimeout(()=>{
                      if (window.history.length > 1) {
                        this.location.back();
                      } else {
                        this.router.navigate(['campaign/list'])
                      }
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
            this.messageService.add({ severity: 'success', summary: 'Success', detail: res.message });
            setTimeout(()=>{
               if (window.history.length > 1) {
                this.location.back();
              } else {
                this.router.navigate(['campaign/list'])
              }
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
    // else{
    //   console.log("Form Invalid", this.campaignForm)
    // }
    return false;
  }

  onCampaignConfSubmit(){
    this.Sidebarsubmitted = true;
    if(this.campaignConfForm.status!=='INVALID'){
      this.isValidForm = true;
      const data = {
        ...this.campaignConfForm.value
      };
      data.conf_is_optin_capping = data.conf_is_optin_capping =='Optin'? 1: 0
      
      this.httpService.post(`${this.CMS_API}campaign/conf/edit`, data).subscribe({
        next:res=>{
          this.configurationSidebarVisible=false;
          if(!res.error){
            this.messageService.add({ severity: 'success', summary: 'Success', detail: res.message });
            setTimeout(()=>{
              this.campaign_confs = this.campaign_confs.filter((campaign_conf:any) => {
                if(campaign_conf.id == this.campaignConfForm.value.conf_id){
                  campaign_conf.conf_value=this.campaignConfForm.value.conf_entity_value
                }
                return campaign_conf
            });
            },500)
          }
          else{
            this.messageService.add({ severity: 'error', summary: 'Failed', detail: res.message });
          }
        },
        error:err=>{
          this.configurationSidebarVisible=false;
          console.log(err)
        }
      });
    }
  }

  onChangeCpaCpc(ev:any, fieldName:string){
    fieldName == 'campaign_cost_per_aquisition' ? this.campaignForm.controls['campaign_cost_per_click'].setValue(0): this.campaignForm.controls['campaign_cost_per_aquisition'].setValue(0)
  }

  getPlanName(plan_name: string) {
    let name = plan_name.split('-');
    return name[2] || plan_name;
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

  get campaignSkipTimes(): FormArray{
    return this.campaignForm.get('campaign_skip_times') as FormArray
  }

  skipTimeFormGroup(values:any = {}): FormGroup{
    return this.frmbuilder.group({
      start_time: [values?.start_time||'', [Validators.required]],
      end_time: [values?.end_time || '', [Validators.required]],
    })
  }

  addTimes(values:any = {}) {
    if(values && values.length){
      values.forEach((element:any) => {
        this.campaignSkipTimes.push(this.skipTimeFormGroup(element))    
      });
    }else{
      this.campaignSkipTimes.push(this.skipTimeFormGroup())    
    }
    
  }

  removeTimes(index:any) {
    if(this.campaignSkipTimes.length > 1){
      this.campaignSkipTimes.removeAt(index);
    }
    
  }

  async onConfLevelChange(ev:any){
    this.entityLoading = true
    this.conf_entities = []
    let confLevel = ev.value
    this.httpService.get(`${this.CMS_API}${confLevel}/list?limit=ALL&s=null&status=1`).subscribe({
      next:res=>{
        if(!res.error){
          this.entityLoading = false
          this.conf_entities = res.data.list
        }
      },
      error:err=>{
        console.log(err)
      }
    })
  }

  nextPage(event: any, fieldName:any){
    this.lazyLoadEvent = event
    let limit = 100;
    let page = 1;
    let queryObject:any = {
      page,
      limit,
      campaign_telecom_id:this.f['campaign_telecom_id'].value,
      campaign_service_id:this.f['campaign_service_id'].value,
      campaign_plan_id:this.f['campaign_plan_id'].value,
      campaign_platform_id:this.f['campaign_platform_id'].value,
      campaign_id:this.campaign_id
    }

    let queryParams = new URLSearchParams(queryObject);

    this.httpService.get(`${this.CMS_API}campaign/conf/list?${queryParams}`).subscribe({
      next:res=>{
        if(!res.error){
          this.campaign_confs = res.data.list;
          this.totalRecords = res.data.pagination.total_records;
          if(fieldName){
            this.ValidationForCampaignConfigueOnDropdown(fieldName);
          }
        }
      },
      error:err=>{
        console.log(err);
      }
    })
  }

  get CampaignConfigues() : FormArray {
    return this.campaignForm.get("CampaignConfigues") as FormArray
  }

  addCampaignConfigue() {
    this.CampaignConfigues.controls.forEach(control => {
      if(control.value.conf_type == '' || control.value.conf_level_type == '' || control.value.conf_entity_value == '') {
        control.setErrors({required:true});  
      }
      control.markAsTouched();
    });
    this.CampaignConfigues.push(
      this.frmbuilder.group({
        conf_type: [''],
        conf_level_type: [''],
        conf_is_optin_capping:[''],
        conf_entity_value: ['',RxwebValidators.numeric({isFormat:true,allowDecimal:false,digitsInfo:"1"})]
      },{ validators: this.allOrNoneValidator()})
    );
  }

   allOrNoneValidator() {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      const parent = control.parent as FormArray;
      let currentIndex = parent?.controls.indexOf(control);
      const conf_type = control.get('conf_type')?.value;
      const conf_level_type = control.get('conf_level_type')?.value;
      const conf_entity_value = control.get('conf_entity_value')?.value;

      const isAnyFieldFilled = conf_type || conf_level_type || conf_entity_value;
      const isAllFieldsFilled = conf_type && conf_level_type && conf_entity_value;
      if(isAnyFieldFilled && !isAllFieldsFilled) {
        return { required: true };
      }

      if(isAllFieldsFilled) {
        let conf_entity_id = '';
        switch (conf_level_type) {
          case 'telcom': conf_entity_id = this.campaignForm.get('campaign_telecom_id')?.value;
            break;
          case 'service': conf_entity_id = this.campaignForm.get('campaign_service_id')?.value;
            break;
          case 'plan': conf_entity_id = this.campaignForm.get('campaign_plan_id')?.value;
            break;
          case 'platform': conf_entity_id = this.campaignForm.get('campaign_platform_id')?.value;
            break;
          case 'campaign':  conf_entity_id = this.editable?this.campaign_id : '';
            break;
          default: conf_entity_id ='';
            break;
        }
       const filteredObjects = this.findObjects(this.campaign_confs, 'type',conf_type, 'entityid', conf_entity_id);
       if(filteredObjects.length>0){
        return { duplicate: true };
       }
      }
      if(isAllFieldsFilled && this.f['CampaignConfigues'].value.length > 1) {
        let CampaignConfiguesValue= this.CampaignConfigues.value;
        const index = parent.controls.indexOf(control);
        const CampaignConfiguesObjects = this.CampaignConfiguesObjects(CampaignConfiguesValue, 'conf_type',conf_type, 'conf_level_type', conf_level_type,index);
        if(CampaignConfiguesObjects.length>0){
          return { exist: true };
        }
      }
      return null;
    };
  }

  findObjects(campaign_confs: any[], key1: string, value1: any, key2: string, value2: any): any[] {
    return campaign_confs.filter(item => item[key1] === value1 && item[key2] === value2);
  }

  CampaignConfiguesObjects(CampaignConfigues: any[], key1: string, value1: any, key2: string, value2: any,index : any): any[] {
    return CampaignConfigues.filter( (item, idx)=>idx != index && item[key1] === value1 && item[key2] === value2);
  }

  ValidationForCampaignConfigueOnDropdown(fieldName:any){
    for (let [key, value] of Object.entries(this.CampaignConfigues.value)) {
      if((value as any).conf_type!='' && (value as any).conf_level_type!='' && (value as any).conf_entity_value!=''){
        const filteredObjects = this.findObjects(this.campaign_confs, 'type',(value as any).conf_type, 'entityid', this.campaignForm.get(fieldName)?.value);
        const confTypeControl = this.CampaignConfigues.at((key as any)).get('conf_type');
        const confLealTypeControl = this.CampaignConfigues.at((key as any)).get('conf_level_type'); 
        confTypeControl ?? this.addRemoveValidationsOnChange(filteredObjects.length>0,confTypeControl,{duplicate:true})
        confLealTypeControl ?? this.addRemoveValidationsOnChange(filteredObjects.length>0, confLealTypeControl, {duplicate:true})
      }
    }
  }

  removeCampaignConfigue(i:number) {
    if(this.CampaignConfigues.length > 0) {
      this.CampaignConfigues.removeAt(i);
    }
  }

  async getConfigurationById(campaign_confs:any){
    this.configurationSidebarVisible=true;
    this.campaignConfForm.addControl('conf_id', new FormControl('',[]));
    if(campaign_confs.conf_is_optin_capping == 1 || campaign_confs.conf_is_optin_capping == 'Optin' ){
      campaign_confs.conf_is_optin_capping = 'Optin'
    }else {
      campaign_confs.conf_is_optin_capping = 'Billing'
    }
    this.campaignConfForm.patchValue({
      conf_type:campaign_confs.type,
      conf_level_type: campaign_confs.level_name,
      conf_entity_name:campaign_confs.entity_name,
      conf_entity_id: campaign_confs.entityid,
      conf_entity_value: campaign_confs.conf_value,
      conf_is_optin_capping: campaign_confs.conf_is_optin_capping,
      conf_id:campaign_confs.id
    });
  }

  getCampaignRedirectionData(service_id:any){
    this.campaign_redirections = this.campaignData.campaign_redirections.redirection.filter((ele:any)=> { return (ele.service == service_id)});
    this.post_capping_redirections = this.campaignData.campaign_redirections.post_capping.filter((ele:any)=> { return (ele.service == service_id)});
    this.blocking_redirections = this.campaignData.campaign_redirections.blocking.filter((ele:any)=> { return (ele.service == service_id)});
    this.not_found_redirection = this.campaignData.campaign_redirections.not_found.filter((ele:any)=> { return (ele.service == service_id)});
    this.campaign_redirections.push({name: 'Other', code: '30'});
  }

}

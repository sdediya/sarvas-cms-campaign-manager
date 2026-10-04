import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RxwebValidators } from '@rxweb/reactive-form-validators'
import { HttpService } from 'src/app/services/http/http.service';
import { environment } from 'src/environments/environment';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ClipboardService } from 'ngx-clipboard';
import { CrudService } from 'src/app/services/common/crud.service';

import * as Utils from 'src/app/utils/utils';
import { distinctUntilChanged, throttleTime } from 'rxjs';


@Component({
    selector: 'app-add-smart-url',
    templateUrl: './add-smart-url.component.html',
    styleUrls: ['./add-smart-url.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class AddSmartUrlComponent {

  read: boolean = false
  write: boolean = false
  delete: boolean = false
  entityLoading: boolean = false;
  loading: boolean = false;
  configurationSidebarVisible: boolean = false;
  CMS_API = environment.CMS_API;

  [key: string]: any
  smartUrlForm: any = FormGroup;
  submitted: boolean = false;
  isValidForm: boolean = false;
  Sidebarsubmitted: boolean = false;
  selected_report_tosend = false;

  campaignData: any = {};
  campaignDataList: any = [];
  allCampaignDataList: any = [];
  telecom_operators: any = [];
  default_telecom_operators: any = [];
  telecom_plans = [];
  advertising_platforms = [];
  services = [];
  campaign_flows: any = [];
  additional_text: any = [];
  isFlowReadonly: boolean = false
  default_language_readonly : boolean = false
  default_language_list:any = [];

  campaignFilterParams:any = {
    campaign_telecom_id: [],
    campaign_plan_id: '',
    campaign_platform_id: '',
    campaign_region_id: '',
    dafault_telecom_id: '',
  };
 
  language_list: any = [];
  selectedThemeImageFile: any = null;
  uploadStatus: any = "Uploading...";
  campaignImage: any = [];
  selectedThemeImage: string | ArrayBuffer | null = null;

  lazyLoadEvent: any;
  platform_callback_urls = [];
  campaign_regions = [];
  selected_campaign = [];
  terms_conditions = [];
  campaign_plan_id = [];
  campaign_name: any = '';
  existing_campaign_name: any = '';
  campaign_confs: any = []
  totalRecords: number = 0;
  languages: any ;
  planValidity:any = [
    {name: 'Daily', id: '1'},
    {name: 'Weekly', id: '7'},
    {name: 'Monthly', id: '30'} 
  ];

  // Edit
  editable: boolean = false;
  campaign_id: any;
  smart_url_id: any;

  currentCampaign: any = {
    smart_url_id: '',
    campaign_name: this.campaign_name, 
    campaign_region: '',
    campaign_telecom_id: '',
    campaign_plan_id: '',
    campaign_platform_id: '', 
    campaign_languages: '', 
    banner_image_urls: '',
    selected_campaign: '',
    dafault_telecom_id: '',
  }

  constructor(
    private frmbuilder: FormBuilder,
    private httpService: HttpService,
    private route: ActivatedRoute,
    private messageService: MessageService,
    private router: Router,
    private clipboardService: ClipboardService,
    private crudService: CrudService
  ) {
    let permissions = this.crudService.hasPermission('campaigns')
    this.read = permissions.read
    this.write = permissions.write
    this.delete = permissions.delete
    if (!this.write) {
      this.router.navigate(['no-access'])
    }

    this.route.queryParams
      .subscribe(params => {
        if (params['id']) {
          this.editable = true
          this.smart_url_id = params['id'];
        }
      }
      );

    this.smartUrlForm = frmbuilder.group({
      campaign_region: ['', [Validators.required]],
      campaign_telecom_id: ['', [Validators.required]],
      campaign_plan_id: ['', [Validators.required]],
      campaign_platform_id: ['', [Validators.required]],
      banner_image_urls: ['', [Validators.required]],
      selected_campaign: ['', [Validators.required]],
      dafault_telecom_id: ['', [Validators.required]],
      campaign_languages: ['', [Validators.required]],
      campaign_default_language: ['', [Validators.required]],
      terms_conditions: ['', []],
      additional_text: ['', []],
      theme: frmbuilder.array([])
    });
  }

  newTheme(value:any): FormGroup {
    return this.frmbuilder.group({
      language: [ value.language || '',[Validators.required]],
      additional_text: [ value.additional_text ||'',[]],
      terms_conditions: [ value.terms_conditions || '',[]],
    })
  }

  AddTheme(value = {}) {
    this.theme.push(this.newTheme(value));
  }

  get theme() : FormArray {
    return this.smartUrlForm.get("theme") as FormArray
  }

  ngOnInit() {
    this.getAllCampaignList();
    this.getLanguages();
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

  clearThemeImage(themeFileInput: HTMLInputElement) {
    this.smartUrlForm.get('banner_image_urls').reset();
    themeFileInput.value = '';
  }

  uploadBannerImage(ev: any, themeFileInput: HTMLInputElement) {
    // if(this.uploadStatus=="Uploaded")return false
    ev.target.innerText = this.uploadStatus
    const formData: FormData = new FormData();
    formData.append('file', this.selectedThemeImageFile);
    this.httpService.postWithUploadFile(`${this.CMS_API}campaign/theme/image_upload`, formData).subscribe({
      next: res => {
        if (!res.error) {
          this.uploadStatus = "Uploaded"
          this.selectedThemeImageFile = "";
          setTimeout(() => {
            ev.target.innerText = this.uploadStatus
          }, 500)
          this.campaignImage.push(res.data.file_path);
          this.selectedThemeImage = res.data.file_path;
          themeFileInput.value = '';

          this.smartUrlForm.patchValue({banner_image_urls:res.data.file_path})
        }
        else {
          this.messageService.add({ severity: 'error', summary: 'Failed', detail: res.message });
        }
      },
      error: err => {
        console.log(err)
      }
    })
    return true
  }

  onFileChange(event: any) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.selectedThemeImageFile = file;
      this.readFileContents(file);
      console.log("file", file);
    }
  }

  readFileContents(file: File): void {
  if (!file) return;

  const control = this.smartUrlForm.get('banner_image_urls');
  control?.setErrors(null); // reset previous errors

  const fileName = file.name.toLowerCase();

  // 1️⃣ Check for double extensions (e.g. .php.png)
  const allowedExtensions = ['png', 'jpg', 'jpeg', 'gif', 'webp'];
  const parts = fileName.split('.');
  if (parts.length < 2) {
    control?.setErrors({ invalidFileName: true });
    this.selectedThemeImage = null;
    return;
  }

  const lastExt = parts.pop(); // last extension
  const hasExtraExtension = parts.some(part =>
    ['php', 'js', 'html', 'exe', 'bat', 'cmd', 'sh','config'].includes(part)
  );

  if (!allowedExtensions.includes(lastExt!) || hasExtraExtension) {
    control?.setErrors({ invalidFileType: true });
    this.selectedThemeImage = null;
    return;
  }
  // 2️⃣ Check MIME type (browser check)
  if (!file.type.startsWith('image/')) {
    control?.setErrors({ invalidFileType: true });
    this.selectedThemeImage = null;
    return;
  }

  // 3️⃣ Optional: limit size
  const maxSize = 1 * 1024 * 1024;
  if (file.size > maxSize) {
    control?.setErrors({ fileTooLarge: true });
    this.selectedThemeImage = null;
    return;
  }

  // 4️⃣ Read file & check dimensions
  const reader = new FileReader();
  reader.onload = (e: any) => {
    const fileContents = e.target.result;
    const img = new Image();

    img.onload = () => {
      if (img.width !== 640 || img.height !== 480) {
        control?.setErrors({ invalidDimensions: true });
        this.selectedThemeImage = null;
      } else {
        control?.setErrors(null);
        this.selectedThemeImage = fileContents;
      }
    };

    img.src = fileContents;
  };

  reader.readAsDataURL(file);
}

  async onSubmit() {
    this.submitted = true;
    console.log(this.smartUrlForm);
    if(this.smartUrlForm.status =='INVALID') {
      return false;
    }

    let data = this.smartUrlForm.value;

    let campaignAction = this.editable ? "smart-url/edit" : "smart-url/add"
    this.httpService.post(`${this.CMS_API}campaign/${campaignAction}`, data).subscribe({
      next: res => {
        if (!res.error) {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: res.message });
          setTimeout(() => { this.router.navigate(['campaign/smart-url/list'])}, 1e3)
        }else {
          this.messageService.add({ severity: 'error', summary: 'Failed', detail: res.message });
        }
      },
      error: err => {
        console.log(err)
        this.messageService.add({ severity: 'error', summary: 'Failed', detail: "Something went wrong!" });
      }
    });
   /*  } */
    return false;
  }

  async dropdownOnChange(ev: any, fieldName: string) {
    let selectedId = ev.value
    let finalValues: any = [];

    if (fieldName == 'campaign_region') { 
      this.smartUrlForm.get('campaign_telecom_id').reset();
      this.smartUrlForm.get('campaign_plan_id').reset();
      this.smartUrlForm.get('campaign_platform_id').reset();
      this.smartUrlForm.get('selected_campaign').reset();

      this.campaignData.telecoms.map((tel: any) => selectedId == tel.region_id ? finalValues.push(tel) : '')
      this.telecom_operators = finalValues; 
      this.campaignFilterParams.campaign_region_id = selectedId;
    }

    if (fieldName == 'campaign_telecom_id') {
      this.smartUrlForm.get('campaign_plan_id').reset();
      this.smartUrlForm.get('campaign_platform_id').reset();
      this.smartUrlForm.get('selected_campaign').reset();
      this.campaignFilterParams.campaign_telecom_id = selectedId;

      let defaultTelecomOperators =  this.telecom_operators.filter((item: { id: string }) => selectedId.includes(item.id));
      this.default_telecom_operators = defaultTelecomOperators
      if (defaultTelecomOperators.length == 1) {
        this.nextPage(this.lazyLoadEvent,fieldName);
        this.smartUrlForm.get('dafault_telecom_id').setValue(this.default_telecom_operators[0].id);
      }
      else{
        this.smartUrlForm.get('dafault_telecom_id').setValue(null);
       } 
    }
    
    if (fieldName == 'campaign_plan_id') {
      this.smartUrlForm.get('campaign_platform_id').reset();
      this.smartUrlForm.get('selected_campaign').reset();
      this.campaignFilterParams.campaign_plan_id = selectedId;
    } 

    if (fieldName == 'campaign_platform_id') {
      this.smartUrlForm.get('selected_campaign').reset();
      this.campaignFilterParams.campaign_platform_id = selectedId;
    }

    if(fieldName == 'campaign_languages') {
      
      this.default_language_list = this.languages.filter((language:any)=>{ return selectedId.includes(language.name) ? language : null });
      this.theme.clear();
      selectedId.map((e:any)=> {
        this.AddTheme({language: e, additional_text: '', terms_conditions: ''})
      })
      
    }

    let   _ = this
    this.campaignDataList =  this.allCampaignDataList.filter((item: any) => {
      let region_condition = true
      if(_.campaignFilterParams.campaign_region_id)  {
        region_condition = _.campaignFilterParams.campaign_region_id == item.campaign_region_id;
      }
        let telecom_id = true
        if(_.campaignFilterParams.campaign_telecom_id.length) {
          telecom_id = _.campaignFilterParams.campaign_telecom_id.includes(item.campaign_telecom_id);
        } 
        return (
           region_condition && telecom_id 
        )
      });
      this.nextPage(this.lazyLoadEvent,fieldName);
  }

  
  getAllCampaignList(){
    this.httpService.get(`${this.CMS_API}campaign/list?limit=ALL&s=null&campaign_type=wap`).subscribe({
      next:res=>{
        if(!res.error){
          this.allCampaignDataList = res.data.list;
          this.campaignDataList = res.data.list;
          this.getSmartUrlData();
        }
        else{
          //this.messageService.add({ severity: 'error', summary: 'Failed', detail: res.message });
        }
      },
      error:err=>{
        console.log(err)
      }
    });
}

getPlanName(plan_name: string) {
  let name = plan_name.split('-');
  return name[2] || plan_name;
}

  addRemoveValidationsOnChange(condition: any, FormControl: FormControl | null, validations: any) {
    if (FormControl) {
      if (condition) {
        FormControl.setValidators(validations);
      } else {
        FormControl.clearValidators();
        FormControl.reset();
      }
      FormControl.updateValueAndValidity();
    }
  }

  async getCampaignName(region_id: any, telcom_id: any, plan_id: any, campaign_type: any) {
    let campaign_name = '';
    let selectedPlans: any = [];
    await this.campaignData.regions.map((reg: any) => {
      if (region_id == reg.id) {
        campaign_name += `${reg.isocode}`
      }
    })

    await this.campaignData.telecoms.map(async (tel: any) => {
      if (telcom_id == tel.id) {
        campaign_name += `-${tel.shortcode}`
        selectedPlans = tel.plans
      }
    })

    await selectedPlans.map((plan: any) => {
      if (plan_id == plan.id) {
        campaign_name += `-${this.getPlanName(plan.name)}`
      }
    })
    campaign_name += `-${campaign_type}`
    return campaign_name.toUpperCase();
  }

  // convenience getter for easy access to form fields
  get f() { return this.smartUrlForm.controls; }

  getSmartUrlData() {
    this.httpService.get(`${this.CMS_API}campaign/smarturl-data`).subscribe({
      next: res => {
        if (!res.error) {
          this.campaignData = res.data;
          this.campaign_regions = res.data.regions;
          this.advertising_platforms = res.data.ad_platforms;
          if (this.editable) {
            this.httpService.get(`${this.CMS_API}campaign/getSmartUrlById?smart_url_id=${this.smart_url_id}`).subscribe({
              next: res => {
                if (!res.error) {
                  this.currentCampaign = res.data;
                  let tempTelcomOperators: any = [];

                  if(res.data.smart_url_region_id)  {
                    this.campaignData.telecoms.map((tel: any) => {
                      if (tel.region_id == res.data.smart_url_region_id ) {
                        tempTelcomOperators.push(tel)
                      }
                    })
                  }
                  this.telecom_operators = tempTelcomOperators;
                  this.default_telecom_operators = tempTelcomOperators;
                  let tempCampaignDataList: any = [];
                  this.campaignDataList = this.allCampaignDataList.filter((campaign: any) => campaign.campaign_region_id == res.data.smart_url_region_id && campaign.campaign_platform_id == res.data.smart_url_platform_id && res.data.smart_url_plan_validity == campaign.plan_validity)
                  let languages:any = []
                  try {
                      languages = JSON.parse(res.data.smart_url_languages);
                  }catch(e:any){
                    console.error(e);
                  }
                   

                  if(languages && languages.length > 0) {
                    this.default_language_list = this.languages.filter((language:any)=>{ return languages.includes(language.name) ? language : null });
                  }

                  try {
                    let theme = JSON.parse(res.data.smart_url_terms_conditions)
                    theme.forEach((e:any)=> { this.AddTheme(e);})  
                  } catch (error) {
                    console.error(error);
                  }

                  
                  
                  // this.campaignDataList = tempCampaignDataList;
                  
                  let patchValue = {
                    campaign_region: res.data.smart_url_region_id,
                    campaign_telecom_id: res.data.smart_url_operator_id.split(","),
                    campaign_plan_id: res.data.smart_url_plan_validity.toString(),
                    campaign_platform_id: res.data.smart_url_platform_id,
                    banner_image_urls: res.data.smart_url_banner_image_url,
                    selected_campaign: res.data.smart_url_campaign_id.split(","),
                    terms_conditions: res.data.smart_url_terms_conditions,
                    additional_text: res.data.smart_url_additional_text,
                    dafault_telecom_id: res.data.smart_url_default_telcom,
                    smart_url_id: res.data.smart_url_uuid,
                    campaign_languages: languages,
                    campaign_default_language: res.data.smart_url_default_language
                  }
                  
                  this.selectedThemeImage = res.data.smart_url_banner_image_url;
                  this.smartUrlForm.addControl('smart_url_id', new FormControl('', []));
                  this.smartUrlForm.patchValue(patchValue);

                  this.nextPage(this.lazyLoadEvent,'');
                }
              },
              error: err => console.log(err)
            })
          }
        }
      },
      error: err => {
        console.log(err)
      }
    })
  } 

 /*  setPlatformURL(platformId: any) {
    let platformURLs: any = []
    this.campaignData.ad_platforms.map((platform: any) => {
      if (platform.id == platformId) {
        platformURLs = platform.s2s_url
      }
    })
    this.platform_callback_urls = platformURLs
  } */

  setTelecomAndPlan(regionId: any, telecomId: any, serviceId: any) {
    let telecoms: any = []
    let plans: any = []
    let services: any = []
    this.campaignData.telecoms.map((tel: any) => {
      if (tel.region_id == regionId) {
        telecoms.push(tel)

        telecomId == tel.id ? tel.tel_services.map((service: any) => {
          services.push(service)
        }) : ''

        tel.plans.map((plan: any) => {
          if (plan.telcom_id == telecomId && plan.service_id == serviceId) {
            let plan_id = plan.name.substring(plan.name.length - 4)
            let new_plan = { ...plan, name: `${this.getPlanName(plan.name)} (${plan_id}) (${plan.currency}${plan.amount})` }
            plans.push(new_plan)
          }
        })
      }
    })
    this.telecom_operators = telecoms
    this.services = services
    this.telecom_plans = plans

   // console.log('telecom_operators => ', this.telecom_operators);
  }

  setFlowsByTelcom(telcom_id: any) {
    let flows: any = []
    this.campaignData.telecoms.map((tel: any) => {
      telcom_id == tel.id ? tel.flows.map((flow: any) => {
        flows.push(flow)
      }) : ''
    })
    this.campaign_flows = flows
  }


  nextPage(event: any, fieldName: any) {
    this.lazyLoadEvent = event
    let limit = 100;
    let page = 1;
    let queryObject: any = {
      page,
      limit,
      campaign_telecom_id: this.f['campaign_telecom_id'].value,
      campaign_plan_id: this.f['campaign_plan_id'].value,
      campaign_platform_id: this.f['campaign_platform_id'].value,
      smart_url_id: this.smart_url_id
    }

    let queryParams = new URLSearchParams(queryObject);

    /* this.httpService.get(`${this.CMS_API}campaign/conf/list?${queryParams}`).subscribe({
      next: res => {
        if (!res.error) {
          this.campaign_confs = res.data.list;
          this.totalRecords = res.data.pagination.total_records;
          //  if(fieldName){
          //    this.ValidationForCampaignConfigueOnDropdown(fieldName);
          //  }
        }
      },
      error: err => {
        console.log(err);
      }
    }) */
  }



}

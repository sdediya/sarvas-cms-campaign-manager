import { Component, HostBinding, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpService } from 'src/app/services/http/http.service';
import { environment } from 'src/environments/environment';
import { ConfirmationService, MessageService } from 'primeng/api';
import * as Utils from 'src/app/utils/utils';
import { CrudService } from 'src/app/services/common/crud.service';
import { I18nServiceService } from 'src/app/services/i18n-service.service';
import { distinctUntilChanged, throttleTime } from 'rxjs';

@Component({
    selector: 'app-campaign-theme',
    templateUrl: './campaign-theme.component.html',
    styleUrls: ['./campaign-theme.component.css'],
    standalone: false
})
export class CampaignThemeComponent implements OnInit{
  read:boolean = false
  write:boolean = false
  delete:boolean = false

  CMS_API = environment.CMS_API;

  [key:string]:any
  campaignThemeForm: any = FormGroup;

  submitted : boolean = false;
  isValidForm : boolean = false;

  currentCampaign: any;

  campaignList : any = [];

  campaignImage: any = [];

  language_list: any = [];


  // Edit
  editable : boolean = false;
  campaign_id:any;
  selectedCampaignData:any=[]
  exitURL: boolean = true

  campaignThemeBgColors = [
    { name: 'Alice Blue', code: '#f0f8ff' },
    { name: 'Antique White', code: '#faebd7' },
    { name: 'Beige', code: '#f5f5dc' },
    { name: 'Honeydew', code: '#f0fff0' },
  ];
  themePreview : boolean = false;
  selectedThemeImage : string | ArrayBuffer | null = null;
  campaignThemes: any = [];
  currentTheme: any;

  bannerTitleText: string = "";
  titleText: string = "";

  selectedThemeImageFile : any = null;
  uploadStatus : any = "Uploading...";

  showSidebar: boolean = false;

  constructor(
      private frmbuilder:FormBuilder,
      private httpService:HttpService,
      private messageService: MessageService,
      private router: Router,
      private crudService: CrudService,
      public i18nService:I18nServiceService
  ){
    let permissions = this.crudService.hasPermission('campaigns')
    this.read = permissions.read
    this.write = permissions.write
    this.delete = permissions.delete
    if(!this.write){
      this.router.navigate(['no-access'])
    }
    this.campaignThemeForm = frmbuilder.group({
      theme_campaign_id: ['', [Validators.required]],
      theme_language: ['', [Validators.required]],
      // theme_name: ['', [Validators.required]],
      theme_title_text: [''],
      theme_banner_title_text: [''],
      theme_logo_title_text: [''],
      theme_image_urls: [''],
      theme_additional_text: [''],

      theme_enter_mobile_label_text: [''],
      theme_enter_otp_label_text: [''],
      theme_subscribe_button_text: [''],
      theme_subscribe_button_before_text: [''],
      theme_subscribe_button_after_text: [''],
        theme_subscribe_button_before_text_otp: [''],
      theme_subscribe_button_after_text_otp: [''],
      theme_exit_button_text: [''],
      theme_exit_button_url: ['', [Validators.pattern('^(https?:\\/\\/)?'+'((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+'((\\d{1,3}\\.){3}\\d{1,3}))'+'(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+'(\\?[;&a-z\\d%_.~+=-]*)?'+'(\\#[-a-z\\d_]*)?$')]],
      theme_resent_otp_text: [''],
      theme_validate_otp_text: [''],

      theme_page_background_color: [''],
      theme_subscribe_button_color: [''],
      theme_exit_button_color: [''],
      theme_page_text_color: [''],
      theme_terms_conditions: [''],
      theme_is_logo: [true],
      theme_operator_is_logo: [true],
      theme_exit_button: [true],
      theme_send_otp_button_text: [''],
      theme_verify_otp_button_text: [''],
      theme_powered_by_text: ['']
    });



    this.campaignThemeForm.valueChanges.subscribe((x:any) => {
      // console.log(x)
   })
   this.f['theme_title_text'].valueChanges.subscribe((value:any) =>{

    let titleTextObjects = {
      '<plan_name>': this.selectedCampaignData.plan_name,
      '<plan_validity>': this.selectedCampaignData.plan_validity,
      '<plan_amount>': this.selectedCampaignData.plan_amount,
      '<service_name>': this.selectedCampaignData.service_name,
      '<currency>': this.selectedCampaignData.region_currency_code
    }
    if(value) {
      this.titleText = Utils.default.replaceCumulative(value, Object.keys(titleTextObjects), Object.values(titleTextObjects));
    }

   })


  }


  ngOnInit(){
    this.getCampaignList();
    this.i18nService.setLanguage('english');

    this.f['theme_language'].valueChanges
    .pipe(
      distinctUntilChanged(),
      throttleTime(500)
    )
    .subscribe((e:any, p:any) => {
      console.log('language',e, p);
        this.onLanguageChange(e);
    })
  }
  ngAfterViewInit() {
    // const editPencil = document.querySelectorAll(".edit-pencil");

    // editPencil.forEach((ele:any)=> {
    //   ele.addEventListener("click", (e:any)=>{
    //     // First we get the pseudo-elements style
    //     console.log(e);
    //     const target = e.currentTarget || e.target
    //     const before = getComputedStyle(target, ":before")
    //     if (before) {
    //       // Then we parse out the dimensions
    //       const atop = Number(before.getPropertyValue("top").slice(0, -2))
    //       const aheight = Number(before.getPropertyValue("height").slice(0, -2))
    //       const aleft = Number(before.getPropertyValue("left").slice(0, -2))
    //       const awidth = Number(before.getPropertyValue("width").slice(0, -2))
    //       // And get the mouse position
    //       const ex = e.layerX
    //       const ey = e.layerY
    //       // Finally we do a bounds check (Is the mouse inside of the after element)
    //       if (ex > aleft && ex < aleft+awidth && ey > atop && ey < atop+aheight) {
    //         console.log("Button clicked")
    //         // console.log();
    //         let attributeName = target.getAttribute('data-fieldName');
    //         console.log(attributeName);
    //         this.showSidebar = true;
    //     }
    //     }
    //   })
    // })
  }



  getCampaignList(){
    this.httpService.get(`${this.CMS_API}campaign/theme/campaigns-list`).subscribe({
      next:res=>{
        if(!res.error){
          this.campaignList = res.data
          // console.log("Campaign List", this.campaignList)
        }
      },
      error:err=>{
        console.log(err)
      }
    })
  }

  uploadThemeImage(ev:any, themeFileInput:HTMLInputElement){
    // if(this.uploadStatus=="Uploaded")return false
    ev.target.innerText = this.uploadStatus
    const formData : FormData = new FormData();
    formData.append('file', this.selectedThemeImageFile);
    this.httpService.postWithUploadFile(`${this.CMS_API}campaign/theme/image_upload`, formData).subscribe({
      next:res=>{
        if(!res.error){
          this.uploadStatus = "Uploaded"
          this.selectedThemeImageFile = "";
          setTimeout(()=>{
            ev.target.innerText = this.uploadStatus
          },500)
          this.campaignImage.push(res.data.file_path);
          themeFileInput.value ='';

          // this.campaignThemeForm.patchValue({theme_image_urls:res.data.file_path})
        }
        else{
          this.messageService.add({ severity: 'error', summary: 'Failed', detail: res.message });
        }
      },
      error:err=>{
        this.messageService.add({ severity: 'error', summary: 'Failed', detail: err.error.message });
      }
    })
    return true
  }

  clearThemeImage(themeFileInput:HTMLInputElement){
    this.campaignThemeForm.get('theme_image_urls').reset();
    themeFileInput.value = '';
  }

  onFileChange(event:any) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.selectedThemeImageFile = file;
      this.readFileContents(file);
      console.log("file", file);
    }
  }

  readFileContents(file: File): void {
    if (!file) return;

    const control = this.campaignThemeForm.get('theme_image_urls');
    control?.setErrors(null);
    const fileName = file.name.toLowerCase();
    const allowedExtensions = ['png', 'jpg', 'jpeg', 'gif', 'webp'];
    const parts = fileName.split('.');
    if (parts.length < 2) {
      control?.setErrors({ invalidFileName: true });
      this.selectedThemeImage = null;
      return;
    }
    const lastExt = parts.pop();
    const hasExtraExtension = parts.some(part =>
      ['php', 'js', 'html', 'exe', 'bat', 'cmd', 'sh', 'config'].includes(part)
    );
    if (!allowedExtensions.includes(lastExt!) || hasExtraExtension) {
      control?.setErrors({ invalidFileType: true });
      this.selectedThemeImage = null;
      return;
    }
    if (!file.type.startsWith('image/')) {
      control?.setErrors({ invalidFileType: true });
      this.selectedThemeImage = null;
      return;
    }
    const maxSize = 1 * 1024 * 1024;
    if (file.size > maxSize) {
      control?.setErrors({ fileTooLarge: true });
      this.selectedThemeImage = null;
      return;
    }
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
  get f() { return this.campaignThemeForm.controls; }

  onSubmit(){
    this.submitted = true;
    if(this.campaignThemeForm.status!=='INVALID'){
      this.isValidForm = true;

      if(this.campaignImage.length) {
        this.campaignThemeForm.value.theme_image_urls = this.campaignImage.join(",");
      }
      var data = {
        ...this.campaignThemeForm.value
      };
      if(this.editable){
        data.theme_id = this.currentTheme.theme_id
        delete data.campaign_id
      }
      let campaignThemeAction = this.editable ? "update" : "create"
      this.httpService.postWithUploadFile(`${this.CMS_API}campaign/theme/${campaignThemeAction}`, data).subscribe({
        next:res=>{
          if(!res.error){
            this.messageService.add({ severity: 'success', summary: 'Success', detail: res.message });
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
    return false;
  }

  onCampaignChange(ev:any){
    let campaignId = ev.value
    // this.f['theme_language'].reset();
    this.resetCampaignFrom(true)
    if(campaignId){
      this.httpService.get(`${this.CMS_API}campaign/getCampaignById?campaign_id=${campaignId}`).subscribe({
        next:res=>{
          if(!res.error){

            //set Default language english


            res.data.plan_name = res.data.plan_name.split('-')[2] || ''

            this.selectedCampaignData = res.data;


            //language option
            let languages = res.data.tel_languages.split(',')
            this.language_list = languages.map((ele:string)=> { return {key: ele, value: ele}; });
            this.f['theme_language'].setValue(languages.length == 1 ? languages[0]: "");
            console.log(this.language_list);

            this.currentCampaign = res.data;
            this.campaignThemes = res.data.themes;
            if(languages.length == 1) {
              this.onLanguageChange("English")
            }



          }
          else{
            this.messageService.add({ severity: 'error', summary: 'Failed', detail: res.message });
          }
        },
        error:err=>{
          this.messageService.add({ severity: 'error', summary: 'Failed', detail: err.error.message });
        }
      })
    }
  }

  onLanguageChange(ev:any) {
    console.log(ev);
    if(ev) {
      this.resetCampaignFrom();
      this.i18nService.setLanguage(ev.toLowerCase());

      let currentTheme = this.campaignThemes.find((e:any) => e.theme_language == ev);

      this.themePreview = true;

      this.editable  = false;

      if(currentTheme) {
        if(currentTheme.theme_id != '') {
          this.editable = true;
        }

        this.currentTheme = currentTheme;
        currentTheme.theme_is_logo = !this.editable ? true : currentTheme.theme_is_logo
        currentTheme.theme_operator_is_logo = !this.editable ? true : currentTheme.theme_operator_is_logo
        currentTheme.theme_exit_button = !this.editable ? true : currentTheme.theme_exit_button

        if(currentTheme.theme_image_urls){
          this.campaignImage = currentTheme.theme_image_urls.split(',');
          this.selectedThemeImage = this.campaignImage[0];
        }

        currentTheme.theme_send_otp_button_text = currentTheme.theme_send_button_text
        currentTheme.theme_verify_otp_button_text = currentTheme.theme_verify_otp_button_text || currentTheme.theme_verify_button_text
console.log(currentTheme);
        this.campaignThemeForm.patchValue(currentTheme)
      }
    }


  }

  removeImages(index:number) {
    if(this.campaignImage.length > 0) {
      this.campaignImage.splice(index, 1);
    }

  }


  resetCampaignFrom(isCampaignReset = false) {
    if(isCampaignReset) {
      this.f['theme_language'].setValue("");
    }
      this.f['theme_title_text'].setValue("");;
      this.f['theme_banner_title_text'].setValue("");
      this.f['theme_logo_title_text'].setValue("");
      this.f['theme_image_urls'].setValue("");
      this.f['theme_additional_text'].setValue("");
      this.f['theme_enter_mobile_label_text'].setValue("");
      this.f['theme_enter_otp_label_text'].setValue("");
      this.f['theme_subscribe_button_text'].setValue("");
      this.f['theme_subscribe_button_before_text'].setValue("");
      this.f['theme_subscribe_button_after_text'].setValue("");
      this.f['theme_subscribe_button_before_text_otp'].setValue("");
      this.f['theme_subscribe_button_after_text_otp'].setValue("");
      this.f['theme_exit_button_text'].setValue("");
      this.f['theme_exit_button_url'].setValue("");
      this.f['theme_resent_otp_text'].setValue("");
      this.f['theme_validate_otp_text'].setValue("");

      this.f['theme_page_background_color'].setValue("");
      this.f['theme_subscribe_button_color'].setValue("");
      this.f['theme_exit_button_color'].setValue("");
      this.f['theme_page_text_color'].setValue("");
      this.f['theme_terms_conditions'].setValue("");
      this.f['theme_is_logo'].setValue("");
      this.f['theme_operator_is_logo'].setValue("");
      this.f['theme_exit_button'].setValue("");
      this.f['theme_send_otp_button_text'].setValue("");
      this.f['theme_verify_otp_button_text'].setValue("");
      this.f['theme_powered_by_text'].setValue("");
  }

  resetFormExcept(form: FormGroup, fieldsToExclude: string[]) {

    // form.value['theme']
    const formValue = form.value;

    console.log(fieldsToExclude);

    Object.keys(form.value).forEach(element => {
      console.log(element, form.value[element])
        if(!fieldsToExclude.includes(element)) {
          form.value[element] = ''
        }else {
          console.log(element, form.value[element])
        }
    });
    // fieldsToExclude.forEach((field) => {
    //   delete formValue[field];
    // });
    console.log(formValue);
    form.reset(formValue);
  }

  addConstants(value: any) {
    this.f['theme_title_text'].setValue( `${this.f['theme_title_text'].value || ''} ${value}`);
  }
}

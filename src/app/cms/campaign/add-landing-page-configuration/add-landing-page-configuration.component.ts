import { Component, HostBinding, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, FormArray, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpService } from 'src/app/services/http/http.service';
import { environment } from 'src/environments/environment';
import { ConfirmationService, MessageService } from '@openng/optimus-ui/api';
import * as Utils from 'src/app/utils/utils';
import { CrudService } from 'src/app/services/common/crud.service';
import { I18nServiceService } from 'src/app/services/i18n-service.service';
import { concatAll, distinctUntilChanged, throttleTime } from 'rxjs';
import { RxwebValidators } from '@rxweb/reactive-form-validators'

@Component({
    selector: 'app-add-landing-page-configuration',
    templateUrl: './add-landing-page-configuration.component.html',
    styleUrls: ['./add-landing-page-configuration.component.css'],
    standalone: false
})
export class AddLandingPageConfigurationComponent implements OnInit {
  read: boolean = false
  write: boolean = false
  delete: boolean = false

  CMS_API = environment.CMS_API;

  [key: string]: any
  campaignThemeForm: any = FormGroup;

  submitted: boolean = false;
  isValidForm: boolean = false;

  currentCampaign: any;

  campaignList: any = [];

  campaignImage: any = [];

  language_list: any = [];

  plans: any = [];


  // Edit
  editable: boolean = false;
  campaign_id: any;
  selectedCampaignData: any = []
  exitURL: boolean = true

  campaignThemeBgColors = [
    { name: 'Alice Blue', code: '#f0f8ff' },
    { name: 'Antique White', code: '#faebd7' },
    { name: 'Beige', code: '#f5f5dc' },
    { name: 'Honeydew', code: '#f0fff0' },
  ];
  themePreview: boolean = false;
  selectedThemeImage: string | ArrayBuffer | null = null;
  campaignThemes: any = [];
  currentTheme: any;

  bannerTitleText: string = "";
  titleText: string = "";

  selectedThemeImageFile: any = null;
  uploadStatus: any = "Uploading...";

  showSidebar: boolean = false;
  campaignData: any = {};
  regions = [];
  telecoms = [];
  services = [];
  matchedCampaignsLength: any = {};
  matchedCampaigns: any = {};
  skip_type: any = [
    { value: 'entire_day', name: "Entire Day" },
    { value: 'multiple_times', name: "Times In a Day" }
  ]
  campaign_redirections: { name: string; code: string }[] = [];
  post_capping_redirections = []
  blocking_redirections = []
  not_found_redirection = []
  ga_events: any = [
    { name: "Landing Page Subscribe Button", value: 'lp_subscribe' },
    { name: "OTP Page Subscribe Button", value: 'opt_subscribe' },
    { name: "Success Page", value: 'success_page' }
  ]

  constructor(
    private frmbuilder: FormBuilder,
    private httpService: HttpService,
    private messageService: MessageService,
    private router: Router,
    private crudService: CrudService,
    public i18nService: I18nServiceService,
    private route: ActivatedRoute,
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
          this.campaign_id = params['id'];
        }
      }
      );

    this.campaignThemeForm = frmbuilder.group({
      theme_region: ['', [Validators.required]],
      theme_telecom_id: ['', [Validators.required]],
      theme_service_id: ['', [Validators.required]],
      theme_campaign_id: ['', [Validators.required]],
      theme_language: [''],
      theme_image_urls: [''],
      default_campaign_id: [''],
      theme_page_background_color: [''],
      theme_is_logo: [true],
      theme_operator_is_logo: [true],
      languages: this.frmbuilder.array([]),
      campaign_c1: [''],
      campaign_dt: [''],
      campaign_wf: [''],
      campaign_tpid: [null],
      campaign_skip_type: [''],
      campaign_skip_times: this.frmbuilder.array([]),
      campaign_ga_tag: [''],
      campaign_gtm_id: [''],
    });



    this.campaignThemeForm.valueChanges.subscribe((x: any) => {
      // console.log(x)
    })
    // On Skip C1 change
    this.f['campaign_c1'].valueChanges.subscribe((value: any) => {
      this.f['campaign_skip_type'].reset();
      this.addRemoveValidationsOnChange(value, this.f['default_campaign_id'], [Validators.required], false)
      this.addRemoveValidationsOnChange(value, this.f['campaign_skip_type'], [Validators.required], true)
      this.dtWfRequired()
    });

    //Reset all skip time array
    this.f['campaign_skip_type'].valueChanges.subscribe((value: any) => {
      this.campaignSkipTimes.clear();

      this.addTimes(this.campaignThemeForm.campaign_skip_times);
      if (value == 'entire_day') {
        this.campaignSkipTimes.controls.forEach(e => {
          e.get('start_time')?.clearValidators()
          e.get('end_time')?.clearValidators()

          e.get('start_time')?.updateValueAndValidity()
          e.get('end_time')?.updateValueAndValidity()

        })
      }

    })


  }


  ngOnInit() {
    this.getConfigurationData();
    this.i18nService.setLanguage('english');


    this.f['theme_language'].valueChanges
      .pipe(
        distinctUntilChanged(),
        throttleTime(500)
      )
      .subscribe((e: any, p: any) => {
        console.log('language', e, p);
        this.onLanguageChange(e);
      })
  }
  ngAfterViewInit() {
  }



  getCampaignList() {
    this.httpService.get(`${this.CMS_API}campaign/theme/campaigns-list`).subscribe({
      next: res => {
        if (!res.error) {
          this.campaignList = res.data
          // console.log("Campaign List", this.campaignList)
        }
      },
      error: err => {
        console.log(err)
      }
    })
  }

  getConfigurationData() {
    this.httpService.get(`${this.CMS_API}campaign/landing_page_configue_data`).subscribe({
      next: res => {
        if (!res.error) {
          this.campaignData = res.data
          this.regions = res.data.regions
          if (this.editable) {
            this.httpService.get(`${this.CMS_API}campaign/getLandingPageConfigueById?id=${this.campaign_id}`).subscribe({
              next: res => {
                if (!res.error) {
                  this.patchFormData(res.data);
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

  async patchFormData(data: any) {

    this.campaignThemeForm.patchValue({
      theme_region: data.common_landing_campaigns_region_id || null
    });
    this.dropdownOnChange({ value: data.common_landing_campaigns_region_id }, 'theme_region');
    this.campaignThemeForm.patchValue({
      theme_telecom_id: data.common_landing_campaigns_telecom_id || null
    });
    this.dropdownOnChange({ value: data.common_landing_campaigns_telecom_id }, 'theme_telecom_id');
    this.campaignThemeForm.patchValue({
      theme_service_id: data.common_landing_campaigns_service_id || null
    });
    this.dropdownOnChange({ value: data.common_landing_campaigns_service_id }, 'theme_service_id');
    // 4. Patch campaigns (multi-select)
    const campaignIds = data.common_landing_campaigns_campaign_ids
      ? data.common_landing_campaigns_campaign_ids.split(',')
      : [];
    this.campaignThemeForm.patchValue({
      theme_campaign_id: campaignIds
    });

    // Trigger your onCampaignChange after patching
    if (campaignIds.length > 0) {
      this.onCampaignChange({ value: campaignIds });
    }

    setTimeout(() => {
      this.campaignThemeForm.patchValue({
        theme_is_logo: !!data.languages?.[0]?.common_landing_themes_is_logo,
        theme_operator_is_logo: !!data.languages?.[0]?.common_landing_themes_operator_is_logo,
        default_campaign_id: data?.common_landing_campaigns_default_campaign,
        campaign_ga_tag: data?.common_landing_campaigns_ga_tag,
        campaign_gtm_id: data?.common_landing_campaigns_gtm_id,
        campaign_c1: !!data?.common_landing_campaigns_c1,
        campaign_skip_type: data?.common_landing_campaigns_skip_type,
        campaign_dt: data?.common_landing_campaigns_df,
        campaign_wf: data?.common_landing_campaigns_wf,

      });
      // clear any existing skip times first
      this.campaignSkipTimes.clear();
      let skipTimesArr: any[] = [];
      try {
        if (data?.common_landing_campaigns_skip_times) {
          skipTimesArr = typeof data.common_landing_campaigns_skip_times === 'string'
            ? JSON.parse(data.common_landing_campaigns_skip_times)
            : data.common_landing_campaigns_skip_times;
        }
      } catch (e) {
        skipTimesArr = [];
      }

      // Add skip time rows if present
      if (Array.isArray(skipTimesArr) && skipTimesArr.length > 0) {
        // addTimes accepts an array of objects
        this.addTimes(skipTimesArr);
        // if entire_day, clear validators on time controls
        if (data.common_landing_campaigns_skip_type === 'entire_day') {
          this.campaignSkipTimes.controls.forEach(e => {
            e.get('start_time')?.clearValidators();
            e.get('end_time')?.clearValidators();
            e.get('start_time')?.updateValueAndValidity();
            e.get('end_time')?.updateValueAndValidity();
          });
        }
      }


    });

    // Patch nested languages array (FormArray)
    const languagesArray = this.campaignThemeForm.get('languages') as FormArray;
    languagesArray.clear(); // Clear existing controls

    if (data.languages && Array.isArray(data.languages)) {
      data.languages.forEach((lang: any) => {
        const planArray = this.frmbuilder.array(
          (typeof lang.common_landing_themes_plan_text === 'string'
            ? JSON.parse(lang.common_landing_themes_plan_text || '[]')
            : lang.common_landing_themes_plan_text || []
          ).map((plan: any) =>
            this.frmbuilder.group({
              campaign_id: [plan.campaign_id || ''],
              campaign_name: [plan.campaign_name || ''],
              text: [plan.text || ''],
              button_text: [plan.button_text || ''],
            })
          )
        );
        languagesArray.push(
          this.frmbuilder.group({
            id: lang.common_landing_themes_id,
            key: [lang.common_landing_themes_language ?? ''],
            value: [lang.common_landing_themes_language ?? ''],
            theme_additional_text_before: [lang.common_landing_themes_additional_text_before ?? ''],
            theme_title_text: [lang.common_landing_themes_title_text ?? ''],
            theme_additional_text_after: [lang.common_landing_themes_additional_text_after ?? ''],
            theme_subscribe_button_after_text: [lang.common_landing_themes_text_after_plans ?? ''],
            theme_terms_conditions: [lang.common_landing_themes_terms_conditions ?? ''],
            theme_powered_by_text: [lang.common_landing_themes_theme_powered_by_text ?? ''],
            plan_text: planArray
          })
        );
      });
    }
    console.log('languagesArray', languagesArray)
    // Patch campaign image list
    this.campaignImage[0] = data.languages?.[0]?.common_landing_themes_image_urls || '';
    this.selectedThemeImage = data.languages?.[0]?.common_landing_themes_image_urls || '';
  }

  dropdownOnChange(ev: any, fieldName: string) {
    const selectedId = ev.value;

    /*
      Event - onchange region
      set   - operator
      blank - service, campaign
    */
    if (fieldName === 'theme_region') {
      this.telecoms = [];
      this.services = [];
      this.campaignList = [];

      // Reset dependent fields
      this.campaignThemeForm.get('theme_telecom_id')?.reset();
      this.campaignThemeForm.get('theme_service_id')?.reset();
      this.campaignThemeForm.get('theme_campaign_id')?.reset();

      // Filter telecoms by region
      this.telecoms = this.campaignData.telecoms.filter(
        (tel: any) => tel.region_id === selectedId
      );
    }

    /*
      Event - onchange operator
      set   - services
      blank - campaigns
    */
    if (fieldName === 'theme_telecom_id') {
      this.services = [];
      this.campaignList = [];

      const selectedTelecom = this.campaignData.telecoms.find(
        (tel: any) => tel.id === selectedId
      );
      console.log('selectedTelecom', selectedTelecom)
      if (selectedTelecom) {
        this.services = selectedTelecom.tel_services || [];
      }

      // Reset dependent fields
      this.campaignThemeForm.get('theme_service_id')?.reset();
      this.campaignThemeForm.get('theme_campaign_id')?.reset();
    }

    /*
      Event - onchange service
      set   - campaigns
    */
    if (fieldName === 'theme_service_id') {
      const selectedServiceId = selectedId;
      const selectedTelecomId =
        this.campaignThemeForm.get('theme_telecom_id')?.value;

      this.campaignList = this.campaignData.campaigns.filter(
        (c: any) =>
          c.service_id === selectedServiceId &&
          c.telecom_id === selectedTelecomId
      );
      // Reset campaign dropdown
      this.campaignThemeForm.get('theme_campaign_id')?.reset();
    }
  }


  uploadThemeImage(ev: any, themeFileInput: HTMLInputElement) {
    // if(this.uploadStatus=="Uploaded")return false
    ev.target.innerText = this.uploadStatus
    const formData: FormData = new FormData();
    formData.append('file', this.selectedThemeImageFile);
    this.httpService.postWithUploadFile(`${this.CMS_API}campaign/theme/image_upload`, formData).subscribe({
      next: res => {
        if (!res.error) {
          this.uploadStatus = "Uploaded"
          this.selectedThemeImageFile = "";
          this.selectedThemeImage = res.data.file_path;
          this.campaignImage = [res.data.file_path];
          setTimeout(() => {
            ev.target.innerText = this.uploadStatus
          }, 500)
          themeFileInput.value = '';

          // this.campaignThemeForm.patchValue({theme_image_urls:res.data.file_path})
        }
        else {
          this.messageService.add({ severity: 'error', summary: 'Failed', detail: res.message });
        }
      },
      error: err => {
        this.messageService.add({ severity: 'error', summary: 'Failed', detail: err.error.message });
      }
    })
    return true
  }

  clearThemeImage(themeFileInput: HTMLInputElement) {
    this.campaignThemeForm.get('theme_image_urls').reset();
    themeFileInput.value = '';
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
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const fileContents = e.srcElement.result;
      const img: any = new Image();
      img.src = e.target.result;
      setTimeout(() => {
        if (img.width !== 640 || img.height !== 480) {
          this.campaignThemeForm.get('theme_image_urls').setErrors({ invalidDimensions: true })
        }
        else {
          this.campaignThemeForm.get('theme_image_urls').setErrors(null)
          this.selectedThemeImage = fileContents
        }
      }, 500)
    };

    reader.readAsDataURL(file);
  }

  // convenience getter for easy access to form fields
  get f() { return this.campaignThemeForm.controls; }

  get languages(): FormArray { return this.campaignThemeForm.get('languages') as FormArray; }
  get campaignSkipTimes(): FormArray {
    return this.campaignThemeForm.get('campaign_skip_times') as FormArray
  }
  // returns plan_text FormArray for a given language index
  getPlanTextControls(lang: AbstractControl): FormGroup[] {
    const formArray = lang.get('plan_text') as FormArray;
    return formArray ? formArray.controls as FormGroup[] : [];
  }
  initLanguages() {
    this.language_list.forEach((lang: any) => {
      this.languages.push(this.frmbuilder.group({
        key: [lang.key],
        value: [lang.value],
        theme_additional_text_before: [''],
        theme_title_text: [''],
        theme_additional_text_after: [''],
        theme_subscribe_button_after_text: [''],
        theme_terms_conditions: [''],
        theme_powered_by_text: ['']
      }));
    });
  }

  onSubmit() {
    this.submitted = true;
    if (this.campaignThemeForm.status !== 'INVALID') {
      this.isValidForm = true;

      if (this.campaignImage.length) {
        this.campaignThemeForm.value.theme_image_urls = this.campaignImage.join(",");
      }
      var data = {
        ...this.campaignThemeForm.value
      };
      if (this.campaign_id) {
        data.campaign_id = this.campaign_id
      }
      let campaignThemeAction = this.campaign_id ? "edit" : "create"
      this.httpService.postWithUploadFile(`${this.CMS_API}campaign/landing_page_configue_data/${campaignThemeAction}`, data).subscribe({
        next: res => {
          if (!res.error) {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: res.message });
            setTimeout(() => {
              this.router.navigate(['campaign/landing-page-configuration/list'])
            }, 1e3)
          }
          else {
            this.messageService.add({ severity: 'error', summary: 'Failed', detail: res.message });
          }
        },
        error: err => {
          console.log(err)
        }
      });
    }
    return false;
  }

  onCampaignChange(ev: any) {
    const selectedCampaignIds = ev.value; // array of selected campaign IDs
    const matchedCampaigns = this.campaignList.filter((c: any) => selectedCampaignIds.includes(c.id));
    this.matchedCampaignsLength = matchedCampaigns.length;
    this.matchedCampaigns = matchedCampaigns;
    console.log('this.editable', this.editable)
    // If only one campaign is selected, reset the form
    if (matchedCampaigns.length === 1 && !this.campaign_id) {
      this.resetCampaignFrom(true);
    }

    // Get selected telecom
    const telcomID = this.campaignThemeForm.get('theme_telecom_id')?.value;
    const selectedTelecom = this.campaignData.telecoms.find((tel: any) => tel.id === telcomID);
    this.selectedCampaignData = selectedTelecom;

    // Languages for telecom
    const languages = selectedTelecom?.languages?.split(',') || [];
    this.language_list = languages.map((l: any) => ({ key: l, value: l }));

    // Initialize languages FormArray if only one campaign
    if (matchedCampaigns.length === 1 && !this.campaign_id) {
      console.log('matchedCampaigns', matchedCampaigns)
      this.languages.clear();
      this.initLanguages();
    }

    // Set default language
    this.f['theme_language'].setValue(languages[0] || '');

    if (languages.length) {
      this.onLanguageChange(this.f['theme_language'].value);
    }

    // Map plans for selected campaigns
    this.plans = matchedCampaigns.map((c: any) => ({
      id: c.plan_id,
      name: c.plan_name,
      amount: c.plan_amount,
      validity: c.plan_validity,
      currency: matchedCampaigns[0]?.region_currency_code,
      cid: c.id,
      cname: c.name,
    }));

    // Update plan_text in each language FormGroup
    this.languages.controls.forEach((langGroup: AbstractControl) => {
      const langFormGroup = langGroup as FormGroup;
      let planTextArray = langFormGroup.get('plan_text') as FormArray;

      // If plan_text doesn't exist, create it
      if (!planTextArray) {
        langFormGroup.addControl('plan_text', this.frmbuilder.array([]));
        planTextArray = langFormGroup.get('plan_text') as FormArray;
      }

      // Add new campaigns only if they don't exist yet
      this.plans.forEach((plan: any) => {
        const exists = planTextArray.controls.find(
          (p: AbstractControl) => p.get('campaign_id')?.value === plan.cid
        );

        if (!exists) {
          planTextArray.push(
            this.frmbuilder.group({
              campaign_id: [plan.cid],
              campaign_name: [plan.cname],
              text: [''], // empty text for new campaign
              button_text: [''], // empty text for new campaign
            })
          );
        }
      });

      // Remove campaigns that are deselected
      for (let i = planTextArray.length - 1; i >= 0; i--) {
        const p = planTextArray.at(i);
        if (!selectedCampaignIds.includes(p.get('campaign_id')?.value)) {
          planTextArray.removeAt(i);
        }
      }
    });
  }


  onLanguageChange(ev: any) {
    console.log(ev);
    if (ev) {
      //  this.resetCampaignFrom();
      this.i18nService.setLanguage(ev.toLowerCase());

      let currentTheme = this.campaignThemes.find((e: any) => e.theme_language == ev);

      this.themePreview = true;

      this.editable = false;

      if (currentTheme) {
        if (currentTheme.theme_id != '') {
          this.editable = true;
        }

        this.currentTheme = currentTheme;
        currentTheme.theme_is_logo = !this.editable ? true : currentTheme.theme_is_logo
        currentTheme.theme_operator_is_logo = !this.editable ? true : currentTheme.theme_operator_is_logo
        currentTheme.theme_exit_button = !this.editable ? true : currentTheme.theme_exit_button

        this.currentTheme = currentTheme || {};
        if (currentTheme?.languages?.length) {
          currentTheme.languages.forEach((langData: any) => {
            const langGroup = this.languages.controls.find(g => g.get('key')?.value === langData.key);
            if (langGroup) langGroup.patchValue(langData);
          });
        }

        if (currentTheme.theme_image_urls) {
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

  removeImages(index: number) {
    if (this.campaignImage.length > 0) {
      this.campaignImage.splice(index, 1);
    }

  }


  resetCampaignFrom(isCampaignReset = false) {
    if (isCampaignReset) {
      this.f['theme_language'].setValue("");
    }
    this.f['theme_image_urls'].setValue("");

    this.f['theme_page_background_color'].setValue("");
    this.f['theme_is_logo'].setValue("");
    this.f['theme_operator_is_logo'].setValue("");
  }

  resetFormExcept(form: FormGroup, fieldsToExclude: string[]) {

    // form.value['theme']
    const formValue = form.value;

    console.log(fieldsToExclude);

    Object.keys(form.value).forEach(element => {
      console.log(element, form.value[element])
      if (!fieldsToExclude.includes(element)) {
        form.value[element] = ''
      } else {
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
    this.f['theme_title_text'].setValue(`${this.f['theme_title_text'].value || ''} ${value}`);
  }

  getPlanTextForCurrentLanguage(planIndex: number): string {
    const currentLang = this.f['theme_language'].value;
    const langGroup = this.languages.controls.find(lg => lg.get('key')?.value === currentLang) as FormGroup;
    if (!langGroup) return '';

    const planTextArray = langGroup.get('plan_text') as FormArray;
    if (!planTextArray || !planTextArray.at(planIndex)) return '';

    return planTextArray.at(planIndex).get('text')?.value || '';
  }

  removeTimes(index: any) {
    if (this.campaignSkipTimes.length > 1) {
      this.campaignSkipTimes.removeAt(index);
    }

  }
  addTimes(values: any = {}) {
    if (values && values.length) {
      values.forEach((element: any) => {
        this.campaignSkipTimes.push(this.skipTimeFormGroup(element))
      });
    } else {
      this.campaignSkipTimes.push(this.skipTimeFormGroup())
    }

  }
  skipTimeFormGroup(values: any = {}): FormGroup {
    return this.frmbuilder.group({
      start_time: [values?.start_time || '', [Validators.required]],
      end_time: [values?.end_time || '', [Validators.required]],
    })
  }

  addRemoveValidationsOnChange(condition: any, FormControl: FormControl | null, validations: any, is_reset: any) {
    if (FormControl) {
      if (condition) {
        FormControl.setValidators(validations);
      } else {
        FormControl.clearValidators();
        if (is_reset) {
          FormControl.reset();
        }
      }
      FormControl.updateValueAndValidity();
    }
  }

  dtWfRequired() {
    // If Skip C1 or C2 value exists then add validations (DT or WF is required)
    if (this.f['campaign_c1'].value) {
      this.f['campaign_dt'].setValidators([Validators.required, RxwebValidators.numeric({ isFormat: true, allowDecimal: false, digitsInfo: "1" })])
      this.f['campaign_wf'].setValidators([Validators.required, RxwebValidators.numeric({ isFormat: true, allowDecimal: false, digitsInfo: "1" })])
      this.f['campaign_skip_times'].setValidators([Validators.required])
      this.f['default_campaign_id'].setValidators([Validators.required])
    }
    // If Skip C1 or C2 value not exists then remove validations (DT or WF not required)
    else {
      this.f['campaign_dt'].setValidators(null)
      this.f['campaign_wf'].setValidators(null)
      this.f['campaign_skip_times'].setValidators(null)
      this.f['campaign_dt'].reset();
      this.f['campaign_wf'].reset();
      this.f['campaign_skip_times'].reset();
      this.f['default_campaign_id'].setValidators(null)
      this.campaignSkipTimes.clear()

    }
  }



  getPlanButtonTextForCurrentLanguage(planIndex: number): string {
    const currentLangKey = this.f['theme_language']?.value;
    const languagesArray = this.languages as FormArray;

    if (!currentLangKey || !languagesArray?.length) {
      return '';
    }

    // Find the matching language group
    const langGroup = languagesArray.controls.find(
      (ctrl) => ctrl.get('key')?.value === currentLangKey
    ) as FormGroup;

    if (!langGroup) {
      return '';
    }

    // Get plan_text array for that language
    const planArray = langGroup.get('plan_text') as FormArray;
    const buttonText = planArray?.at(planIndex)?.get('button_text')?.value;

    // Return trimmed value if valid, else empty string
    return buttonText && buttonText.trim() ? buttonText.trim() : '';
  }

  // Fetch translation safely, fallback to default text
  getTranslatedText(key: string, defaultText: string = '', variableData: any = null): string {
    if (this.i18nService && typeof this.i18nService.getTranslation === 'function') {
      const translated = this.i18nService.getTranslation(key, variableData);
      if (translated && translated !== key) { // if translation exists
        return translated;
      }
    }
    return defaultText; // fallback
  }

}

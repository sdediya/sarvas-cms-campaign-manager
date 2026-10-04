import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RxwebValidators } from '@rxweb/reactive-form-validators'
import { HttpService } from 'src/app/services/http/http.service';
import * as customValidator from 'src/app/utils/validators'
import { environment } from 'src/environments/environment';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CrudService } from 'src/app/services/common/crud.service';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
    selector: 'app-add-platform',
    templateUrl: './add-platform.component.html',
    styleUrls: ['./add-platform.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class AddPlatformComponent implements OnInit {
  read:boolean = false
	write:boolean = false
	delete:boolean = false

  confirmDialogStyle= {width: '40vw'}

  CMS_API = environment.CMS_API;

  [key:string]:any
  adPartnerForm: any = FormGroup;

  submitted : boolean = false;
  isValidForm : boolean = false;
  highlighted: boolean = false;

  // Edit
  editable : boolean = false;
  platform_id:any;
  currentPlatform:any={
    platform_id:'',
    platform_name:'',
    platform_type_service:'',
    platform_type_wap:''
  }
  s2sMethodList:any=[
    {name:'Post', value:'post'},
    {name:'Get', value:'get'}
  ]

  s2sParamsList:any = [
    {value:'{p5}', name: 'click_id'},
    {value:'{p7}', name:'p7'},
    {value:'{cpa}', name:'cpa'}
  ]
  iss2sUrlParamsEmpty: boolean = false

  oldS2sUrls : any = [] // to save old S2S URLs, then compare change
  changedS2sUrls :any = [] // to store changed s2s urls, then update to campaign cb urls
  isS2sChanged : boolean = false

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

      this.route.queryParams.subscribe(params => {        
        if(params['id']){
          this.editable = true
          this.platform_id = params['id'];
        }
      }
      );
      
      this.adPartnerForm = frmbuilder.group({
        platform_name: ['', [Validators.required]],
        platform_type_wap: [true, []],
        s2s_raw_url: [],
        platform_type_service: [false, []],
        platform_GCLID_report: [false, []],
        platform_api_username: [''],
        platform_api_password: [''],
        platform_s2s_url: this.frmbuilder.array([])
      });;      

      // If WAP selected AND Edit page, then remove form validations for 'platform_api_username' and 'platform_api_password'
      if(this.editable && this.currentPlatform.platform_type_wap){
        this.adPartnerForm.removeControl('platform_api_username');
        this.adPartnerForm.removeControl('platform_api_password');
      }

      this.f['s2s_raw_url'].valueChanges.pipe(
        debounceTime(300), 
        distinctUntilChanged()).subscribe((value: any) => {
        
        if(this.fvalidURL(value) && value)  {
          let url = new URL(value);
          
          if(url) {
            
            let s2sUrls:string[] = [];
            if(this.platform_s2s_url.value.length) {
              s2sUrls = this.platform_s2s_url.value.map((ele:any)=> {
                if(ele) {
                  let final_array = this.generateS2sUrl(ele);
                  let url = new URL(final_array.final_url)
                  return `${url.origin}${url.pathname}`;
                }
                return false
              });
            }
            let href = url.origin + url.pathname;
            let searchParams = new URLSearchParams(url.search);
            let parameterNames: string[] = [];
            url.searchParams.forEach((value, name) => {
              parameterNames.push(name);
            });
            if(parameterNames.length > 0){
              let paramsForms:any = [];
              searchParams.forEach((query, index) => {
                if(query && index) {
                  let queryObject:any = {params:query, values:index};
                  if(this.checkValue(query)){
                    let isExists = this.s2sParamsList.some((e:any) => e.value == query)
                    this.s2sParamsList.push({"value":query,"name":query});
                    queryObject.params = query
                  }
                  else{
                    
                    queryObject.params = query
                  }
                  paramsForms.push(this.newS2SParams(queryObject));
                }
              })
              let isExists = s2sUrls.indexOf(href)
              if(isExists > -1) {
                this.platform_s2s_url.removeAt(isExists);  
              }
              this.platform_s2s_url.push(this.frmbuilder.group({ s2s_request_method:['get',Validators.required], s2s_url:href,  s2s_url_params: this.frmbuilder.array(paramsForms), s2s_final_url:value }))
              this.highlighted = true;
            }
          }    
        }
      });


      this.f['platform_s2s_url'].valueChanges.subscribe((value:any)=> {
        if(value.length>0){
          let final_res : any = []
          let oldS2sIDs :any = []
          // If Only one s2s is available then, replace all 'old s2s url' with 'new single s2s url'
          if(value.length==1){
            for (let i = 0; i < this.oldS2sUrls.length; i++) {
              let finalUrl = this.getFinalS2SByUrlAndParams(value[0].s2s_url, value[0].s2s_url_params)
              if(!finalUrl.includes("undefined")){
                final_res.push({
                  oldS2sUrl:this.oldS2sUrls[i].s2s_final_url,
                  s2s_ref_id:this.oldS2sUrls[i].s2s_id,
                  newS2sUrl:finalUrl
                })
              }
            }
          }
          else{
            for (let i = 0; i < this.oldS2sUrls.length; i++) {
              oldS2sIDs.push(this.oldS2sUrls[i].s2s_id)
            }
            let checkForS2S = value.filter((newS2s:any)=>oldS2sIDs.indexOf(newS2s.s2s_id) > -1)
            if(checkForS2S.length > 0){
              for (let i = 0; i < this.oldS2sUrls.length; i++) {
                if(checkForS2S[i]){
                  let finalUrl = this.getFinalS2SByUrlAndParams(checkForS2S[i].s2s_url, checkForS2S[i].s2s_url_params)
                  if(!finalUrl.includes("undefined")){
                    if(this.oldS2sUrls[i].s2s_final_url!==finalUrl){
                      final_res.push({
                        oldS2sUrl:this.oldS2sUrls[i].s2s_final_url,
                        s2s_ref_id:this.oldS2sUrls[i].s2s_id,
                        newS2sUrl:finalUrl
                      })
                    }
                  }
                }
              }
            }
          }
          this.changedS2sUrls = final_res
        }
      })

      // this.f['platform_type_wap'].value ? this.addS2S() : this.f['platform_s2s_url'].controls = []

      // On Platform type Service change
      this.f['platform_type_service'].valueChanges.subscribe((value:any)=>{
        // this.isPlatformTypeValid();
        this.addRemoveValidationsOnChange(value, this.f['platform_api_username'], [Validators.required])
        this.addRemoveValidationsOnChange(value, this.f['platform_api_password'], [Validators.required])
      })
      // On Platform type WAP change
      this.f['platform_type_wap'].valueChanges.subscribe((value:any)=>{
        if(!value){
          this.platform_s2s_url.clear();
          this.platform_s2s_url.controls.forEach(e=> {
            e.get('s2s_url')?.clearValidators()
            e.get('s2s_url_params')?.clearValidators()
            e.get('s2s_url')?.updateValueAndValidity()
            e.get('s2s_url_params')?.updateValueAndValidity()
            
          })
        }
      })
  }


  ngOnInit(){
    if(this.editable){
      this.getPlatformById();
    }
  }

  getFinalS2SByUrlAndParams(s2s_url:any, paramsArr:any){
    let s2s_final_url = s2s_url.includes('?') ? `${s2s_url}` :  `${s2s_url}?`
    let url_query_params = new URLSearchParams(s2s_final_url.split('?')[1]);
    if(paramsArr.length==1){
      s2s_final_url += url_query_params.toString() !== '' ? `&${paramsArr[0].values}=${paramsArr[0].params}`:`${paramsArr[0].values}=${paramsArr[0].params}`
    }
    else{
      for (let i = 0; i < paramsArr.length; i++){
        s2s_final_url +=`&${paramsArr[i].values}=${paramsArr[i].params}`
      }
    }
    return s2s_final_url
  }

  addRemoveValidationsOnChange(condition:any,FormControl:FormControl, validations:any) {
    if(condition) {
      FormControl.setValidators(validations);
    }else {
      FormControl.clearValidators();
    }
    FormControl.updateValueAndValidity();
  }


  // convenience getter for easy access to form fields
  get f() { return this.adPartnerForm.controls; }

  get platform_s2s_url() : FormArray {
    return this.adPartnerForm.get("platform_s2s_url") as FormArray
  }
  s2s_url_params(index: number) : FormArray {
    return this.platform_s2s_url.at(index).get('s2s_url_params') as FormArray
  }
  newS2S(): FormGroup {
    return this.frmbuilder.group({
      s2s_request_method: ['get',Validators.required],
      s2s_url: ['', [Validators.required]],
      s2s_url_params: this.frmbuilder.array([])
    });
  }
  newS2SParams(values:any = {}): FormGroup {
    return this.frmbuilder.group({
        params: [values.params? values.params:'', Validators.required],
        values: [values.values? values.values:'', Validators.required]
      });
  }
  addS2S() {
    this.platform_s2s_url.push(this.newS2S());
    let lastIndex =  this.adPartnerForm.get('platform_s2s_url').length;
    this.s2s_url_params(lastIndex-1).push(this.newS2SParams());
  }

  addS2SUrlParams(controls:FormArray) {
    controls.push(this.newS2SParams());
  }

  removeS2S(i:number, ev:any, s2s_id:any) {
    this.confirmationService.confirm({
      target: ev.target as EventTarget,
      message: `Do you want to delete this record? If you update S2S URL, this will be applicable for all campaigns in which it is used.`,
      header: 'Delete Confirmation',
      icon: 'pi pi-info-circle',
      acceptButtonStyleClass:"p-button-danger p-button-text",
      rejectButtonStyleClass:"p-button-text p-button-text",
      acceptIcon:"none",
      rejectIcon:"none",
      accept: () => {
        this.platform_s2s_url.removeAt(i);
        this.deleteS2SById(s2s_id)
      },
      reject: () => {
        console.log("Reject")
      }
    });   
  }



  removeS2SParms(controls: FormArray,i:number ){  
    if(controls.length > 1) {
      controls.removeAt(i);
    }else {
      this.messageService.add({ severity: 'error', summary: 'Failed', detail: "Need atleast one parameters from s2s url"});
    }
    
  }

  deleteS2SById(s2s_id:any){
    this.httpService.post(`${this.CMS_API}platform/deletes2s`, {s2s_id}).subscribe({
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
        this.messageService.add({ severity: 'error', summary: 'Failed', detail: err.error.message });
      }
    });
  }

  getPlatformById(){
    this.httpService.get(`${this.CMS_API}platform/getPlatformById?platform_id=${this.platform_id}`).subscribe({
      next:res=>{
        if(!res.error){
          this.currentPlatform = res.data.platform
          this.adPartnerForm.addControl('platform_id', new FormControl('', []));
          this.adPartnerForm.patchValue(res.data.platform)
          if(res.data.platform_s2s_url.length!==0 && this.currentPlatform.platform_type_wap){
            this.f['platform_s2s_url'].controls = []

            res.data.platform_s2s_url.forEach((ele:any) => {
                if(ele.s2s_in_use){
                  this.oldS2sUrls.push(ele)
                }
              let params = JSON.parse(ele.s2s_params);
              let paramsForms = params.map((ele:any)=> {
                return this.newS2SParams(ele);
              })
              this.platform_s2s_url.push(this.frmbuilder.group({s2s_request_method:new FormControl(ele.s2s_request_method, Validators.required), s2s_url:new FormControl(ele.s2s_url,Validators.required), s2s_url_params: this.frmbuilder.array(paramsForms), s2s_id:ele.s2s_id}))
            });
          }
        }
      },
      error:err=>console.log(err)
    })
  }

  onSubmit(){
    this.submitted = true
    if(!this.f['platform_type_service'].value && !this.f['platform_type_wap'].value){
      this.f['platform_type_service'].setErrors({'incorrect': true});
      this.f['platform_type_wap'].setErrors({'incorrect': true});
    }
    else{
      this.f['platform_type_service'].setErrors(null)
      this.f['platform_type_wap'].setErrors(null)
    }

    if(this.platform_s2s_url.length > 0){
      this.platform_s2s_url.controls.forEach((element:any,index) => {
        const paramsFormArray = element.controls.s2s_url_params;
          if (paramsFormArray && paramsFormArray.length === 0) {
            this.iss2sUrlParamsEmpty = true;
          } else if(paramsFormArray.length>0){
            this.iss2sUrlParamsEmpty = false
          }   
          // To validate params with curly braces
          paramsFormArray.controls.forEach((ele_param:any, ele_index:any)=>{
            // Check if param has curly braces
            if(this.checkValue(ele_param.value.params)){
              // Check if curly braces param is in our dropdown list
              let isExists = this.s2sParamsList.some((e:any) => e.value == ele_param.value.params)
              if(!isExists){
                this.f['platform_s2s_url'].controls[index].controls.s2s_url_params.controls[ele_index].controls['params'].setErrors({'invalid': true})
              }
              else{
                this.f['platform_s2s_url'].controls[index].controls.s2s_url_params.controls[ele_index].controls['params'].setErrors(null)
              }
            }
            else{
              this.f['platform_s2s_url'].controls[index].controls.s2s_url_params.controls[ele_index].controls['params'].setErrors(null)
            }
          });
          
      });
      
    }
    if(this.platform_s2s_url.length == 0){
      this.messageService.add({ severity: 'error', summary: 'Failed', detail: 'At least one s2s url required.' });
      return false
    }
    if(this.iss2sUrlParamsEmpty == true){
      this.messageService.add({ severity: 'error', summary: 'Failed', detail: 'At least one s2s url params required.' });
    }
    if((this.f['platform_type_service'].value && this.adPartnerForm.status!=='INVALID') || ( this.f['platform_type_wap'].value && this.adPartnerForm.status!=='INVALID' && this.platform_s2s_url.length > 0 && this.iss2sUrlParamsEmpty != true )){
      this.isValidForm = true;
      if(this.adPartnerForm.value.platform_s2s_url.length!==0){
        this.adPartnerForm.value.platform_s2s_url = this.adPartnerForm.value.platform_s2s_url.map((ele:any)=>{
          return  this.generateS2sUrl(ele);
        });
      }
      let data = {
        ...this.adPartnerForm.value
      };
      if(this.changedS2sUrls.length>0){
        data.changedS2sUrls = this.changedS2sUrls
      }
      let adPartnerAction = this.editable ? "edit" : "add"
      this.httpService.post(`${this.CMS_API}platform/${adPartnerAction}`, data).subscribe({
        next:res=>{
          if(!res.error){
            this.messageService.add({ severity: 'success', summary: 'Success', detail: res.message });
            setTimeout(()=>{
              this.router.navigate(['masters/ad-partners'])
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

  generateS2sUrl (ele:any) {
    if(typeof ele.s2s_url_params === 'string') {
      ele.s2s_url_params = JSON.parse(ele.s2s_url_params);
    }
    let params = ele.s2s_url_params.map((e:any)=>{
      return `${e.values}=${e.params}`
    });
    ele.s2s_url_params = JSON.stringify(ele.s2s_url_params)
    if(ele.s2s_url.includes('?')) {
      let url_query_params = new URLSearchParams(ele.s2s_url.split('?')[1]); 
      ele.final_url = url_query_params.toString() !== '' ? `${ele.s2s_url}&${params.join('&')}`:`${ele.s2s_url}${params.join('&')}`  
    }else {
      ele.final_url = `${ele.s2s_url}?${params.join('&')}`
    }
    return ele; 
  }

  checkValue(value:string) {
    return /\{(.*?)\}/.test(value);
  }

  fvalidURL(str:string) {
    var pattern = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
    return !!pattern.test(str);
  }
}

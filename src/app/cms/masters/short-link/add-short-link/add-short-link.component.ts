  import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
  import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
  import { ActivatedRoute, Router } from '@angular/router';
  import { RxwebValidators } from '@rxweb/reactive-form-validators'
  import { HttpService } from 'src/app/services/http/http.service';
  import * as customValidator from 'src/app/utils/validators'
  import { environment } from 'src/environments/environment';
  import { ConfirmationService, MessageService } from 'primeng/api';
  import { CrudService } from 'src/app/services/common/crud.service';

  @Component({
    selector: 'app-add-short-link',
    templateUrl: './add-short-link.component.html',
    styleUrls: ['./add-short-link.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
  export class AddShortLinkComponent  implements OnInit{
   
    
   generateCode() {
  const type = this.shortlinkForm.get('codeType')?.value;
  const length = this.shortlinkForm.get('codeLength')?.value;

  const chars = type === 'numeric'
    ? '0123456789'
    : 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  this.shortlinkForm.get('code')?.setValue(result);
  this.shortlinkForm.get('shortlink_url')?.setValue(result);
}


    read:boolean = false
    write:boolean = false
    delete:boolean = false

    CMS_API = environment.CMS_API;

    [key:string]:any
    shortlinkForm: any = FormGroup;

    submitted : boolean = false;
    isValidForm : boolean = false;

    // Edit
    editable : boolean = false;
    shortlink_id:any;
    currentshortlink:any={
      shortlink_id:'',
      shortlink_name:'',
      shortlink_url:'',
      shortlink_redirect_url:''  }

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
            this.shortlink_id = params['id'];
          }
        }
        );
        this.shortlinkForm = frmbuilder.group({
          shortlink_name: ['', [Validators.required]],
          shortlink_url: ['', [Validators.required]],
          shortlink_redirect_url: ['', [Validators.required]] ,
          codeMode: ['manual'],          // ← Add this
  code: [''],                    // ← Add this
  codeLength: [6],              // ← Add this
  codeType: ['alphanumeric']    // ← Add this       

        });
    }

    ngOnInit(){
      if(this.editable){
        this.getshortlinkById();
      }
    }

    // convenience getter for easy access to form fields
    get f() { return this.shortlinkForm.controls; }

    getshortlinkById(){
      this.httpService.get(`${this.CMS_API}shortlink/getShortLinkById?shortlink_id=${this.shortlink_id}`).subscribe({
        next:res=>{
          if(!res.error){
            this.currentshortlink = res.data
            this.shortlinkForm.addControl('shortlink_id', new FormControl('', []));
            this.shortlinkForm.patchValue(res.data)
          }
        },
        error:err=>console.log(err)
      })
    }


    onSubmit(){
      this.submitted = true;
      console.log("this.shortlinkForm", this.shortlinkForm)
      if(this.shortlinkForm.status!=='INVALID'){
        this.isValidForm = true;
        const data = {
          ...this.shortlinkForm.value
        };
        let shortlinkAction = this.editable ? "edit" : "add"
        this.httpService.post(`${this.CMS_API}shortlink/${shortlinkAction}`, data).subscribe({
          next:res=>{
            if(!res.error){
              this.messageService.add({ severity: 'success', summary: 'Success', detail: res.message });
              setTimeout(()=>{
                this.router.navigate(['masters/short-link'])
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

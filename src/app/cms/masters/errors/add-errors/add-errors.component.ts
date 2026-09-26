import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpService } from 'src/app/services/http/http.service';
import { environment } from 'src/environments/environment';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CrudService } from 'src/app/services/common/crud.service';

@Component({
    selector: 'app-add-errors',
    templateUrl: './add-errors.component.html',
    styleUrls: ['./add-errors.component.css'],
    standalone: false
})
export class AddErrorsComponent implements OnInit{

  read:boolean = false
	write:boolean = false
	delete:boolean = false
  
  CMS_API = environment.CMS_API;
  
  [key:string]:any
  addErrorMasterForm: any = FormGroup;
  
  submitted : boolean = false;
  isValidForm : boolean = false;

  // Edit
  editable : boolean = false;
  error_id:any;
  currentError:any={
    error_id:'',
    error_msg:'',
    error_language:'',
    error_telcom_id:'',
    error_type:'',
    error_msg_severity:''
  }


  error_severities = [
    { name: 'Error', code: 'error' },
    { name: 'Success', code: 'success' },
  ];
  error_types = [
    { name: 'Blacklist', code: 'blacklist' },
    { name: 'Server Error', code: 'server_error' },
    { name: 'Not Found', code: 'not_found' },
    { name: 'Drop (Service API)', code: 'drop_service_api' },
  ];
  languages = []
  telcoms = []


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
          this.error_id = params['id'];
        }
      }
      );

      this.addErrorMasterForm = frmbuilder.group({
        error_msg_severity: ['', [Validators.required]],
        error_msg: !this.editable ? this.frmbuilder.array([]) : ['', [Validators.required]],
        error_language: [''],
        error_telcom_id: [''],
        error_type: ['', [Validators.required]]
      });
      if(!this.editable){
        this.addError()
      }

      // To keep only one error message for types other than 'drop'
      this.f['error_type'].valueChanges.subscribe((value:any)=>{
        if(value!=='drop_service_api'){
          this.f['error_msg'].clear();
          this.addError()
        }
      })

  }

  ngOnInit(){
    this.getPlanData();
    if(this.editable){
      this.getErrorById();
    }
  }

  

  getErrorById(){
    this.httpService.get(`${this.CMS_API}error_master/getErrorById?error_id=${this.error_id}`).subscribe({
      next:res=>{
        if(!res.error){
          this.currentError = res.data
          this.addErrorMasterForm.addControl('error_id', new FormControl('', []));
          this.addErrorMasterForm.patchValue(res.data)
        }
      },
      error:err=>console.log(err)
    })
  }

  getPlanData(){
    this.getLanguages();
    this.getTelcoms();
  }
  
  getLanguages(){
    this.httpService.get(`${this.CMS_API}language/list`).subscribe({
      next:res=>{
        if(!res.error){
          this.languages = res.data
        }
      }
    })
  }

  getTelcoms(){
    this.httpService.get(`${this.CMS_API}telcom/list?limit=ALL&s=null&status=1`).subscribe({
      next:res=>{
        if(!res.error){
          this.telcoms = res.data.list
        }
      }
    })
  }

  // convenience getter for easy access to form fields
  get f() { return this.addErrorMasterForm.controls; }

  get error_msg() : FormArray {
    return this.addErrorMasterForm.get("error_msg") as FormArray
  }

  newError(): FormGroup {
    return this.frmbuilder.group({
      error: ['', [Validators.required]],
    })
  }

  addError() {
    this.error_msg.push(this.newError());
  }

  removeError(controls: FormArray, i:number) {
    if(controls.length > 1) {
      this.error_msg.removeAt(i);
    }else {
      this.messageService.add({ severity: 'error', summary: 'Failed', detail: "Need atleast one custom response message"});
    }
  }

  onSubmit(){
    this.submitted = true;
    if(this.addErrorMasterForm.status!=='INVALID'){
      this.isValidForm = true;
      const data = {
        ...this.addErrorMasterForm.value
      };
      let errorAction = this.editable ? "edit" : "add"
      this.httpService.post(`${this.CMS_API}error_master/${errorAction}`, data).subscribe({
        next:res=>{
          if(!res.error){
            this.messageService.add({ severity: 'success', summary: 'Success', detail: res.message });
            setTimeout(()=>{
              this.router.navigate(['masters/custom-responses'])
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

}

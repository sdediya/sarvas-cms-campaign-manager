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
    selector: 'app-add-service',
    templateUrl: './add-service.component.html',
    styleUrls: ['./add-service.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class AddServiceComponent implements OnInit{

  read:boolean = false
	write:boolean = false
	delete:boolean = false

  CMS_API = environment.CMS_API;

  [key:string]:any
  serviceForm: any = FormGroup;

  submitted : boolean = false;
  isValidForm : boolean = false;

  // Edit
  editable : boolean = false;
  service_id:any;
  currentService:any={
    service_id:'',
    service_name:'',
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
          this.service_id = params['id'];
        }
      }
      );
      this.serviceForm = frmbuilder.group({
        service_name: ['', [Validators.required]]
      });
  }
    
  ngOnInit(){
    if(this.editable){
      this.getServiceById();
    }
  }

  // convenience getter for easy access to form fields
  get f() { return this.serviceForm.controls; }

  getServiceById(){
    this.httpService.get(`${this.CMS_API}service/getServiceById?service_id=${this.service_id}`).subscribe({
      next:res=>{
        if(!res.error){
          this.currentService = res.data
          this.serviceForm.addControl('service_id', new FormControl('', []));
          this.serviceForm.patchValue(res.data)
        }
      },
      error:err=>console.log(err)
    })
  }

  onSubmit(){
    this.submitted = true;
    if(this.serviceForm.status!=='INVALID'){
      this.isValidForm = true;
      const data = {
        ...this.serviceForm.value
      };
      let serviceAction = this.editable ? "edit" : "add"
      this.httpService.post(`${this.CMS_API}service/${serviceAction}`, data).subscribe({
        next:res=>{
          if(!res.error){
            this.messageService.add({ severity: 'success', summary: 'Success', detail: res.message });
            setTimeout(()=>{
              this.router.navigate(['masters/services'])
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

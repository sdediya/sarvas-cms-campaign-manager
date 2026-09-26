import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RxwebValidators } from '@rxweb/reactive-form-validators'
import { HttpService } from 'src/app/services/http/http.service';
import * as customValidator from 'src/app/utils/validators'
import { environment } from 'src/environments/environment';
import { ConfirmationService, MessageService } from 'primeng/api';
import jsonMenuData from '../../../../assets/menu.json';
import { CrudService } from 'src/app/services/common/crud.service';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.css']
})
export class AddUserComponent  implements OnInit{

  read:boolean = false
	write:boolean = false
	delete:boolean = false

  CMS_API = environment.CMS_API;
  [key:string]:any
  addUserForm: any = FormGroup;

  menuData:any = jsonMenuData.items;
  moduleData:any = {};
  rolesList:any = [];

  submitted : boolean = false;
  isValidForm : boolean = false;

  // Edit
  editable : boolean = false;
  user_id:any;
  currentUser:any={
    user_id:'',
    user_fname:'',
    user_lname:'',
    user_email:'',
    user_permissions:'',
    user_role:''
  }

  constructor(
    private frmbuilder:FormBuilder, 
    private httpService:HttpService,
    private route: ActivatedRoute,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private router: Router,
    private crudService: CrudService
){

  let permissions = this.crudService.hasPermission('user_management')
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
          this.user_id = params['id'];
        }
      }
      );
      this.addUserForm = frmbuilder.group({
        user_fname: ['', [Validators.required]],
        user_lname: ['', [Validators.required]],
        user_email: ['', [Validators.required, RxwebValidators.email()]],
        user_mobile: ['', [Validators.minLength(10), Validators.maxLength(10), RxwebValidators.digit()]],
        user_password: ['', [Validators.required, Validators.minLength(10)]],
        user_cpassword: ['', [Validators.required, RxwebValidators.compare({fieldName:'user_password' })]],
        user_role: ['', [Validators.required]],
        user_permissions:this.frmbuilder.array([])
      });
  }

  ngOnInit(){
    this.getUserRolesList();
    if(this.editable){
      this.getUserRoleById();
    }
    else{
      this.menuData.forEach((value:any)=>{
        this.user_permissions.push(this.addPermissions({
          "module_name":value.item_key,
          "module_label":value.item_key.replace('_', ' '),
          "read":false,
          "write":false,
          "delete":false
        }));
      })
    }
  }

  get user_permissions() : FormArray {
    return this.addUserForm.get("user_permissions") as FormArray
  }

  addPermissions(permissionsModuleData:any): FormGroup {
    return this.frmbuilder.group(permissionsModuleData)
 }

  // convenience getter for easy access to form fields
  get f() { return this.addUserForm.controls; }

  getUserRoleById(){
    this.httpService.get(`${this.CMS_API}role/getUserRoleById?user_id=${this.user_id}`).subscribe({
      next:res=>{
        if(!res.error){
          this.currentUser = res.data
          this.addUserForm.addControl('user_id', new FormControl('', []));
          this.addUserForm.patchValue(res.data)
        }
      },
      error:err=>console.log(err)
    })
  }

  getUserRolesList(){
    this.httpService.get(`${this.CMS_API}role/list?limit=ALL&s=null&status=1`).subscribe({
      next:res=>{
        if(!res.error){
          this.rolesList = res.data.list
        }
      },
      error:err=>console.log(err)
    })
  }


  onSubmit(){
    this.submitted = true;
    if(this.addUserForm.status!=='INVALID'){
      this.isValidForm = true;
      const data = {
        ...this.addUserForm.value
      };
      delete data.user_cpassword;
      // console.log("data", data)
      // return
      let userAction = this.editable ? "edit-user" : "add-user"
      this.httpService.post(`${this.CMS_API}cms_users/${userAction}`, data).subscribe({
        next:res=>{
          if(!res.error){
            this.messageService.add({ severity: 'success', summary: 'Success', detail: res.message });
            // setTimeout(()=>{
            //   this.router.navigate(['masters/roles'])
            // },1e3)
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
  
} 

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RxwebValidators } from '@rxweb/reactive-form-validators'
import { HttpService } from 'src/app/services/http/http.service';
import * as customValidator from 'src/app/utils/validators'
import { environment } from 'src/environments/environment';
import { ConfirmationService, MessageService } from '@openng/optimus-ui/api';
import jsonMenuData from '../../../../assets/menu.json';
import { CrudService } from 'src/app/services/common/crud.service';

@Component({
    selector: 'app-add-user',
    templateUrl: './add-user.component.html',
    styleUrls: ['./add-user.component.css'],
    standalone: false
})
export class AddUserComponent  implements OnInit{

  read:boolean = false
	write:boolean = false
	delete:boolean = false

  CMS_API = environment.CMS_API;
  [key:string]:any
  addUserForm: any = FormGroup;

  menuData:any = jsonMenuData.items;
  extraPermissions: any[] = [
    {
      item_key: 'customer_logs',
      info: 'Controls visibility of Customer Logs section and log download in Customer Care Interface.'
    },
    {
      item_key: 'customer_refund',
      info: 'Controls visibility of Customer Refund menu and access to the refund interface.'
    }
  ];
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
    user_permissions:[],
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

  getAllPermissionModules(): any[] {
    return [...this.menuData, ...this.extraPermissions];
  }

  ngOnInit(){
    this.getUserRolesList();
    if(this.editable){
      this.getUserById();
    }
    else{
      this.getAllPermissionModules().forEach((value:any)=>{
        this.user_permissions.push(this.addPermissions({
          "module_name":value.item_key,
          "module_label":value.item_key.replace('_', ' '),
          "module_info": value?.info && value?.info!=="" ? value.info : "",
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

  getUserById(){
    this.httpService.get(`${this.CMS_API}cms_users/getUserById?user_id=${this.user_id}`).subscribe({
      next:res=>{
        if(!res.error){
          this.currentUser = res.data.user
          this.addUserForm.addControl('user_id', new FormControl('', []));
          this.addUserForm.removeControl('user_password')
          this.addUserForm.removeControl('user_cpassword')
          this.addUserForm.patchValue(this.currentUser)

          if(this.currentUser.user_permissions){
            // Menu-wise Permissions
            this.getAllPermissionModules().forEach(async(value:any)=>{
              let module_permission = await this.syncUserPermissions(value.item_key)
              this.user_permissions.push(this.addPermissions({
                "module_id":module_permission.module_id,
                "module_name":value.item_key,
                "module_label":value.item_key.replace('_', ' '),
                "module_info": value?.info && value?.info!=="" ? value.info : "",
                "read":module_permission.read,
                "write":module_permission.write,
                "delete":module_permission.delete
              }));
            })

            // this.currentUser.user_permissions.forEach((value:any)=>{
            //   this.user_permissions.push(this.addPermissions({
            //     "module_id":value.module_id,
            //     "module_name":value.module_name,
            //     "module_label":value.module_name.replace('_', ' '),
            //     "read":value.module_read ==1 ? true : false,
            //     "write":value.module_write ==1 ? true : false,
            //     "delete":value.module_delete ==1 ? true : false
            //   }));
            // })
          }

        }
      },
      error:err=>{
        this.messageService.add({ severity: 'error', summary: 'Failed', detail: err.error.message});
      }
    })
  }

  syncUserPermissions(module:string){
    let permission : any = ['read','write','delete']
    let return_permissions = {module_id:'', read: false, write: false, delete: false};
    let all_permissions =  this.currentUser.user_permissions;
  
    let user_permission = all_permissions.find((ele:any)=> {
      return ele.module_name == module;
    });

    // If permission doesn't exist yet for extra permissions (existing user), default read to true
    if(user_permission === undefined && (module === 'customer_logs' || module === 'customer_refund')){
      return_permissions.read = true;
      return return_permissions;
    }
    
    if(permission.includes('read') && user_permission?.module_read == 1) {
      return_permissions.read = true;
    }
    if(permission.includes('write') && user_permission?.module_write == 1) {
      return_permissions.write = true;
    }
    if(permission.includes('delete') && user_permission?.module_delete == 1) {
      return_permissions.delete = true;
    }
    // If permission already exists ,then append module id
    if(user_permission?.module_id){
      return_permissions.module_id = user_permission.module_id;
    }
    return return_permissions;
  }

  getUserRolesList(){
    this.httpService.get(`${this.CMS_API}cms_users/role-list?limit=ALL&s=null&status=1`).subscribe({
      next:res=>{
        if(!res.error){
          this.rolesList = res.data.list
        }
      },
      error:err=>console.log(err)
    })
  }

  isPermissionDelete(ev:any, index:any){
      this.f['user_permissions'].controls[index].controls['read'].setValue(ev.checked)
      this.f['user_permissions'].controls[index].controls['write'].setValue(ev.checked)
  }

  isPermissionWrite(ev:any, index:any){
    this.f['user_permissions'].controls[index].controls['read'].setValue(ev.checked)
  }

  onSubmit(){
    this.submitted = true;
    console.log("this.addUserForm.status", this.addUserForm)
    if(this.addUserForm.status!=='INVALID'){
      this.isValidForm = true;
      const data = {
        ...this.addUserForm.value
      };
      delete data.user_cpassword;
      let userAction = this.editable ? "edit-user" : "add-user"
      this.httpService.post(`${this.CMS_API}cms_users/${userAction}`, data).subscribe({
        next:res=>{
          if(!res.error){
            this.messageService.add({ severity: 'success', summary: 'Success', detail: res.message });
            setTimeout(()=>{
              this.router.navigate(['users/user-list'])
            },1e3)
          }
          else{
            this.messageService.add({ severity: 'error', summary: 'Failed', detail: res.message });
          }
        },
        error:err=>{
          console.log(err)
          this.messageService.add({ severity: 'error', summary: 'Failed', detail: err.error.message});
        }
      });
    }
    return false;
  }
  
} 
